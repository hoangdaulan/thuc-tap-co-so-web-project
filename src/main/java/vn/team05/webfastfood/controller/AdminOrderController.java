// package: vn.team05.webfastfood.controller
package vn.team05.webfastfood.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.team05.webfastfood.dto.response.OrderResponse;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.service.OrderService;

import java.util.List;
import java.util.Map;

/**
 * API quản lý đơn hàng cho Admin/Nhân viên.
 * Base: /api/v1/admin/orders
 *
 * Thay đổi: Loại bỏ try/catch và logic validation ra khỏi Controller,
 * sử dụng @RequiredArgsConstructor, tất cả trả về ResponseData<T>.
 */
@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    /**
     * GET /api/v1/admin/orders
     * Lấy tất cả đơn hàng (có thể lọc theo status)
     */
    @GetMapping
    public ResponseEntity<ResponseData<List<OrderResponse>>> getAllOrders(
            @RequestParam(value = "status", required = false) Integer status) {
        ResponseData<List<OrderResponse>> responseData;
        if (status != null) {
            responseData = orderService.getOrdersByStatus(status);
        } else {
            responseData = orderService.getAllOrders();
        }
        return ResponseEntity.ok(responseData);
    }

    /**
     * PUT /api/v1/admin/orders/{id}/status
     * Cập nhật trạng thái đơn hàng
     * Body: { "status": 1 }
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ResponseData<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        Integer newStatus = body.get("status");
        ResponseData<OrderResponse> responseData = orderService.updateOrderStatus(id, newStatus);
        return ResponseEntity.ok(responseData);
    }
}
