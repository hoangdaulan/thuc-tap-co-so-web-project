package vn.team05.webfastfood.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vn.team05.webfastfood.dto.request.PlaceOrderRequest;
import vn.team05.webfastfood.dto.response.OrderResponse;
import vn.team05.webfastfood.service.OrderService;

import java.util.List;

/**
 * API đặt hàng và quản lý đơn hàng cho khách hàng.
 * Base: /api/v1/orders
 */
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * POST /api/v1/orders
     * Đặt hàng mới (yêu cầu đăng nhập)
     */
    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody PlaceOrderRequest request,
                                         Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Bạn cần đăng nhập để đặt hàng");
            }
            String phone = authentication.getName();
            OrderResponse response = orderService.placeOrder(request, phone);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * GET /api/v1/orders/my
     * Lấy lịch sử đơn hàng của khách đang đăng nhập
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyOrders(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Bạn cần đăng nhập");
            }
            String phone = authentication.getName();
            List<OrderResponse> orders = orderService.getOrdersByPhone(phone);
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * PUT /api/v1/orders/{id}/cancel
     * Khách hủy đơn hàng (chỉ khi đơn đang chờ xác nhận)
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Bạn cần đăng nhập");
            }
            String phone = authentication.getName();
            OrderResponse response = orderService.cancelOrder(id, phone);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
