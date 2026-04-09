package vn.team05.webfastfood.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.team05.webfastfood.dto.request.PlaceOrderRequest;
import vn.team05.webfastfood.dto.response.OrderResponse;
import vn.team05.webfastfood.model.Order;
import vn.team05.webfastfood.model.OrderItem;
import vn.team05.webfastfood.model.Product;
import vn.team05.webfastfood.model.User;
import vn.team05.webfastfood.repository.OrderItemRepository;
import vn.team05.webfastfood.repository.OrderRepository;
import vn.team05.webfastfood.repository.ProductRepository;
import vn.team05.webfastfood.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    /**
     * Đặt hàng mới
     */
    @Transactional
    public OrderResponse placeOrder(PlaceOrderRequest request, String phone) {
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

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setPrice(product.getPrice());
            orderItem.setNote(itemReq.getNote());
            items.add(orderItemRepository.save(orderItem));

            totalPrice += product.getPrice() * itemReq.getQuantity();
        }

        // Thêm phí vận chuyển nếu giao tận nơi
        if ("delivery".equals(request.getDeliveryType())) {
            totalPrice += 30000;
        }

        savedOrder.setTotalPrice(totalPrice);
        orderRepository.save(savedOrder);

        return toOrderResponse(savedOrder, items);
    }

    /**
     * Lấy lịch sử đơn hàng của khách
     */
    public List<OrderResponse> getOrdersByPhone(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);
        return orders.stream()
                .map(o -> toOrderResponse(o, orderItemRepository.findByOrder(o)))
                .collect(Collectors.toList());
    }

    /**
     * Admin: lấy tất cả đơn hàng
     */
    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        return orders.stream()
                .map(o -> toOrderResponse(o, orderItemRepository.findByOrder(o)))
                .collect(Collectors.toList());
    }

    /**
     * Admin: lấy đơn hàng theo trạng thái
     */
    public List<OrderResponse> getOrdersByStatus(Integer status) {
        List<Order> orders = orderRepository.findByStatusOrderByCreatedAtDesc(status);
        return orders.stream()
                .map(o -> toOrderResponse(o, orderItemRepository.findByOrder(o)))
                .collect(Collectors.toList());
    }

    /**
     * Admin/Nhân viên: Cập nhật trạng thái đơn hàng
     */
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, Integer newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + orderId));
        order.setStatus(newStatus);
        orderRepository.save(order);
        return toOrderResponse(order, orderItemRepository.findByOrder(order));
    }

    /**
     * Khách hủy đơn (chỉ khi đơn còn ở trạng thái Pending=0)
     */
    @Transactional
    public OrderResponse cancelOrder(Long orderId, String phone) {
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
        return toOrderResponse(order, orderItemRepository.findByOrder(order));
    }

    // ---- Helper ----

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
