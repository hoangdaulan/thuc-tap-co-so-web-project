package vn.team05.webfastfood.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.team05.webfastfood.dto.request.PlaceOrderRequest;
import vn.team05.webfastfood.dto.response.OrderResponse;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.model.Order;
import vn.team05.webfastfood.model.OrderItem;
import vn.team05.webfastfood.model.Product;
import vn.team05.webfastfood.model.User;
import vn.team05.webfastfood.repository.OrderItemRepository;
import vn.team05.webfastfood.repository.OrderRepository;
import vn.team05.webfastfood.repository.ProductRepository;
import vn.team05.webfastfood.repository.UserRepository;
import vn.team05.webfastfood.service.OrderRealtimeService;
import vn.team05.webfastfood.service.OrderService;
import vn.team05.webfastfood.service.SupportChatService;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRealtimeService orderRealtimeService;
    private final SupportChatService supportChatService;

    @Override
    @Transactional
    public ResponseData<OrderResponse> placeOrder(PlaceOrderRequest request, String phone) {
        User customer = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Khong tim thay nguoi dung"));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Gio hang trong");
        }

        Order order = new Order();
        order.setCustomer(customer);
        order.setNote(request.getNote());
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "cod");
        order.setShippingDate(request.getShippingDate());
        order.setDeliveryType(request.getDeliveryType());
        order.setRecipientName(request.getRecipientName());
        order.setRecipientPhone(request.getRecipientPhone());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setDeliveryTime(request.getDeliveryTime());
        order.setBranch(request.getBranch());
        order.setStatus(0);

        Order savedOrder = orderRepository.save(order);

        double totalPrice = 0;
        List<OrderItem> items = new ArrayList<>();

        for (PlaceOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("San pham khong ton tai: " + itemReq.getProductId()));

            double itemPrice = product.getPrice() != null ? product.getPrice() : 0.0;
            if (product.getDiscount() != null && product.getDiscount() > 0) {
                itemPrice = itemPrice - (itemPrice * product.getDiscount() / 100.0);
            }

            if (product.getQuantity() != null) {
                if (product.getQuantity() < itemReq.getQuantity()) {
                    throw new RuntimeException("San pham " + product.getTitle() + " khong du so luong");
                }
                product.setQuantity(product.getQuantity() - itemReq.getQuantity());
                productRepository.save(product);
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setPrice(itemPrice);
            orderItem.setNote(itemReq.getNote());
            items.add(orderItemRepository.save(orderItem));

            totalPrice += itemPrice * itemReq.getQuantity();
        }

        if ("delivery".equals(request.getDeliveryType())) {
            totalPrice += 30000;
        }

        savedOrder.setTotalPrice(totalPrice);
        orderRepository.save(savedOrder);

        OrderResponse response = toOrderResponse(savedOrder, items);
        orderRealtimeService.publishNewOrder(response);
        return new ResponseData<>(HttpStatus.OK.value(), "Dat hang thanh cong", response);
    }

    @Override
    public ResponseData<List<OrderResponse>> getOrdersByPhone(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Khong tim thay nguoi dung"));
        List<OrderResponse> orders = orderRepository.findByCustomerOrderByCreatedAtDesc(user).stream()
                .map(o -> toOrderResponse(o, orderItemRepository.findByOrder(o)))
                .collect(Collectors.toList());
        return new ResponseData<>(HttpStatus.OK.value(), "Lay danh sach don hang thanh cong", orders);
    }

    @Override
    public ResponseData<List<OrderResponse>> getOrdersByShipperPhone(String phone) {
        User shipper = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Khong tim thay shipper"));
        if (!"SHIPPER".equalsIgnoreCase(shipper.getRole())) {
            throw new RuntimeException("Tai khoan nay khong phai shipper");
        }

        List<OrderResponse> orders = orderRepository.findByShipperOrderByCreatedAtDesc(shipper).stream()
                .map(o -> toOrderResponse(o, orderItemRepository.findByOrder(o)))
                .collect(Collectors.toList());
        return new ResponseData<>(HttpStatus.OK.value(), "Lay danh sach don hang cua shipper thanh cong", orders);
    }

    @Override
    public ResponseData<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> orders = orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(o -> toOrderResponse(o, orderItemRepository.findByOrder(o)))
                .collect(Collectors.toList());
        return new ResponseData<>(HttpStatus.OK.value(), "Lay tat ca don hang thanh cong", orders);
    }

    @Override
    public ResponseData<List<OrderResponse>> getOrdersByStatus(Integer status) {
        List<OrderResponse> orders = orderRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(o -> toOrderResponse(o, orderItemRepository.findByOrder(o)))
                .collect(Collectors.toList());
        return new ResponseData<>(HttpStatus.OK.value(), "Loc don hang theo trang thai thanh cong", orders);
    }

    @Override
    @Transactional
    public ResponseData<OrderResponse> updateOrderStatus(Long orderId, Integer newStatus, String shipperName, String shipperPhone, String employeePhone) {
        if (newStatus == null) {
            throw new RuntimeException("Thieu truong status");
        }
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay don hang: " + orderId));

        if (newStatus == 2 && "delivery".equals(order.getDeliveryType())) {
            User shipper = null;
            if (shipperPhone != null && !shipperPhone.isBlank()) {
                shipper = userRepository.findByPhone(shipperPhone)
                        .orElseThrow(() -> new RuntimeException("Khong tim thay shipper voi so dien thoai: " + shipperPhone));
                if (!"SHIPPER".equalsIgnoreCase(shipper.getRole())) {
                    throw new RuntimeException("Nguoi dung nay khong co vai tro shipper");
                }
            }

            order.setShipper(shipper);
            order.setShipperName(shipperName);
            order.setShipperPhone(shipperPhone);

            String message = String.format(
                    "Don hang #%d cua ban da duoc xac nhan va dang duoc giao cho shipper %s (SDT: %s).",
                    order.getId(),
                    shipperName != null ? shipperName : "",
                    shipperPhone != null ? shipperPhone : ""
            );
            supportChatService.sendMessageAsEmployee(employeePhone, order.getCustomer().getId(), message);
        }

        order.setStatus(newStatus);
        orderRepository.save(order);
        OrderResponse response = toOrderResponse(order, orderItemRepository.findByOrder(order));
        orderRealtimeService.publishOrderStatusUpdated(response);
        return new ResponseData<>(HttpStatus.OK.value(), "Cap nhat trang thai don hang thanh cong", response);
    }

    @Override
    @Transactional
    public ResponseData<OrderResponse> updateOrderStatusByShipper(Long orderId, Integer newStatus, String shipperPhone) {
        if (newStatus == null) {
            throw new RuntimeException("Thieu truong status");
        }
        if (newStatus != 3 && newStatus != 4 && newStatus != 5) {
            throw new RuntimeException("Shipper chi duoc chuyen don sang Hoan thanh, Giao that bai hoac Huy don");
        }

        User shipper = userRepository.findByPhone(shipperPhone)
                .orElseThrow(() -> new RuntimeException("Khong tim thay shipper"));
        if (!"SHIPPER".equalsIgnoreCase(shipper.getRole())) {
            throw new RuntimeException("Tai khoan nay khong phai shipper");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay don hang: " + orderId));
        if (order.getShipper() == null || !order.getShipper().getId().equals(shipper.getId())) {
            throw new RuntimeException("Ban khong duoc phan cong cho don hang nay");
        }
        if (order.getStatus() != 2) {
            throw new RuntimeException("Chi don dang giao moi duoc cap nhat tu phia shipper");
        }

        order.setStatus(newStatus);
        orderRepository.save(order);
        OrderResponse response = toOrderResponse(order, orderItemRepository.findByOrder(order));
        orderRealtimeService.publishOrderStatusUpdated(response);
        return new ResponseData<>(HttpStatus.OK.value(), "Shipper cap nhat trang thai don hang thanh cong", response);
    }

    @Override
    @Transactional
    public ResponseData<OrderResponse> cancelOrder(Long orderId, String phone) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay don hang"));
        if (!order.getCustomer().getPhone().equals(phone)) {
            throw new RuntimeException("Khong co quyen huy don hang nay");
        }
        if (order.getStatus() != 0) {
            throw new RuntimeException("Don hang da duoc xu ly, khong the huy");
        }
        order.setStatus(4);
        orderRepository.save(order);
        OrderResponse response = toOrderResponse(order, orderItemRepository.findByOrder(order));
        orderRealtimeService.publishOrderStatusUpdated(response);
        return new ResponseData<>(HttpStatus.OK.value(), "Huy don hang thanh cong", response);
    }

    private String getStatusText(Integer status) {
        if (status == null) return "Khong xac dinh";
        return switch (status) {
            case 0 -> "Cho xac nhan";
            case 1 -> "Da xac nhan";
            case 2 -> "Dang giao";
            case 3 -> "Hoan thanh";
            case 4 -> "Da huy";
            case 5 -> "Giao that bai";
            default -> "Khong xac dinh";
        };
    }

    private OrderResponse toOrderResponse(Order order, List<OrderItem> items) {
        OrderResponse res = new OrderResponse();
        res.setId(order.getId());
        res.setNote(order.getNote());
        res.setTotalPrice(order.getTotalPrice());
        res.setStatus(order.getStatus());
        res.setStatusText(getStatusText(order.getStatus()));
        res.setPaymentMethod(order.getPaymentMethod());
        res.setShippingDate(order.getShippingDate());
        res.setDeliveryType(order.getDeliveryType());
        res.setRecipientName(order.getRecipientName());
        res.setRecipientPhone(order.getRecipientPhone());
        res.setDeliveryAddress(order.getDeliveryAddress());
        res.setDeliveryTime(order.getDeliveryTime());
        res.setBranch(order.getBranch());
        String shipperName = order.getShipper() != null ? order.getShipper().getFullName() : order.getShipperName();
        String shipperPhone = order.getShipper() != null ? order.getShipper().getPhone() : order.getShipperPhone();
        res.setShipperName(shipperName);
        res.setShipperPhone(shipperPhone);
        res.setCreatedAt(order.getCreatedAt());

        List<OrderResponse.OrderItemResponse> itemResponses = new ArrayList<>();
        if (items != null) {
            for (OrderItem item : items) {
                OrderResponse.OrderItemResponse ir = new OrderResponse.OrderItemResponse();
                ir.setId(item.getId());
                ir.setQuantity(item.getQuantity());
                ir.setPrice(item.getPrice());
                ir.setNote(item.getNote());
                if (item.getProduct() != null) {
                    ir.setProductId(item.getProduct().getId());
                    ir.setProductTitle(item.getProduct().getTitle());
                    String img = item.getProduct().getImage();
                    if (img != null && !img.startsWith("http") && !img.startsWith("/")) {
                        img = "./assets/img/products/" + img;
                    }
                    ir.setProductImage(img);
                }
                itemResponses.add(ir);
            }
        }
        res.setItems(itemResponses);
        return res;
    }
}
