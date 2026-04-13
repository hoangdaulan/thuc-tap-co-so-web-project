// package: vn.team05.webfastfood.service.impl
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

/**
 * Triển khai logic nghiệp vụ cho đơn hàng.
 * Chuyển toàn bộ logic từ OrderService (concrete) cũ vào đây,
 * đồng thời bọc kết quả bằng ResponseData<T>.
 */
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
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Giỏ hàng trống");
        }

        Order order = new Order();
        order.setUser(user);
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
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại: " + itemReq.getProductId()));

            if (product.getStatus() != 1) {
                throw new RuntimeException("Một số sản phẩm đã hết món, vui lòng kiểm tra lại giỏ hàng.");
            }

            // Logic tính giá có chiết khấu
            double itemPrice = product.getPrice() != null ? product.getPrice() : 0.0;
            if (product.getDiscount() != null && product.getDiscount() > 0) {
                itemPrice = itemPrice - (itemPrice * product.getDiscount() / 100.0);
            }

            // Trừ số lượng kho
            if (product.getQuantity() != null) {
                if (product.getQuantity() < itemReq.getQuantity()) {
                    throw new RuntimeException("Sản phẩm " + product.getTitle() + " không đủ số lượng!");
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

        // Phí vận chuyển
        if ("delivery".equals(request.getDeliveryType())) {
            totalPrice += 30000;
        }

        savedOrder.setTotalPrice(totalPrice);
        orderRepository.save(savedOrder);

        OrderResponse response = toOrderResponse(savedOrder, items);
        orderRealtimeService.publishNewOrder(response);
        return new ResponseData<>(HttpStatus.OK.value(), "Đặt hàng thành công", response);
    }

    @Override
    public ResponseData<List<OrderResponse>> getOrdersByPhone(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        List<OrderResponse> orders = orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(o -> toOrderResponse(o, orderItemRepository.findByOrder(o)))
                .collect(Collectors.toList());
        return new ResponseData<>(HttpStatus.OK.value(), "Lấy danh sách đơn hàng thành công", orders);
    }

    @Override
    public ResponseData<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> orders = orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(o -> toOrderResponse(o, orderItemRepository.findByOrder(o)))
                .collect(Collectors.toList());
        return new ResponseData<>(HttpStatus.OK.value(), "Lấy tất cả đơn hàng thành công", orders);
    }

    @Override
    public ResponseData<List<OrderResponse>> getOrdersByStatus(Integer status) {
        List<OrderResponse> orders = orderRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(o -> toOrderResponse(o, orderItemRepository.findByOrder(o)))
                .collect(Collectors.toList());
        return new ResponseData<>(HttpStatus.OK.value(), "Lọc đơn hàng theo trạng thái thành công", orders);
    }

    @Override
    @Transactional
    public ResponseData<OrderResponse> updateOrderStatus(Long orderId, Integer newStatus, String shipperName, String shipperPhone, String employeePhone) {
        if (newStatus == null) {
            throw new RuntimeException("Thiếu trường 'status'");
        }
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + orderId));

        if (newStatus == 2 && "delivery".equals(order.getDeliveryType())) {
            order.setShipperName(shipperName);
            order.setShipperPhone(shipperPhone);

            String message = String.format("Đơn hàng #%d của bạn đã được xác nhận và đang được giao cho shipper %s (SĐT: %s).", order.getId(), shipperName != null ? shipperName : "", shipperPhone != null ? shipperPhone : "");
            supportChatService.sendMessageAsEmployee(employeePhone, order.getUser().getId(), message);
        }

        order.setStatus(newStatus);
        orderRepository.save(order);
        OrderResponse response = toOrderResponse(order, orderItemRepository.findByOrder(order));
        orderRealtimeService.publishOrderStatusUpdated(response);
        return new ResponseData<>(HttpStatus.OK.value(), "Cập nhật trạng thái đơn hàng thành công", response);
    }

    @Override
    @Transactional
    public ResponseData<OrderResponse> cancelOrder(Long orderId, String phone) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        if (!order.getUser().getPhone().equals(phone)) {
            throw new RuntimeException("Không có quyền hủy đơn hàng này");
        }
        if (order.getStatus() != 0) {
            throw new RuntimeException("Đơn hàng đã được xử lý, không thể hủy");
        }
        order.setStatus(4); // Cancelled
        orderRepository.save(order);
        OrderResponse response = toOrderResponse(order, orderItemRepository.findByOrder(order));
        orderRealtimeService.publishOrderStatusUpdated(response);
        return new ResponseData<>(HttpStatus.OK.value(), "Hủy đơn hàng thành công", response);
    }

    // ==================== Private helpers ====================

    private String getStatusText(Integer status) {
        if (status == null) return "Không xác định";
        return switch (status) {
            case 0 -> "Chờ xác nhận";
            case 1 -> "Đã xác nhận";
            case 2 -> "Đang giao";
            case 3 -> "Hoàn thành";
            case 4 -> "Đã hủy";
            default -> "Không xác định";
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
        res.setShipperName(order.getShipperName());
        res.setShipperPhone(order.getShipperPhone());
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
