package vn.team05.webfastfood.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.team05.webfastfood.dto.response.OrderResponse;
import vn.team05.webfastfood.service.OrderService;

import java.util.List;
import java.util.Map;

/**
 * API quản lý đơn hàng cho Admin/Nhân viên.
 * Base: /api/v1/admin/orders
 */
@RestController
@RequestMapping("/api/v1/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * GET /api/v1/admin/orders
     * Lấy tất cả đơn hàng (có thể lọc theo status)
     */
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders(
            @RequestParam(value = "status", required = false) Integer status) {
        if (status != null) {
            return ResponseEntity.ok(orderService.getOrdersByStatus(status));
        }
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    /**
     * PUT /api/v1/admin/orders/{id}/status
     * Cập nhật trạng thái đơn hàng
     * Body: { "status": 1 }
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id,
                                               @RequestBody Map<String, Integer> body) {
        try {
            Integer newStatus = body.get("status");
            if (newStatus == null) {
                return ResponseEntity.badRequest().body("Thiếu trường 'status'");
            }
            OrderResponse response = orderService.updateOrderStatus(id, newStatus);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
