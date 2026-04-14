// package: vn.team05.webfastfood.controller
package vn.team05.webfastfood.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import vn.team05.webfastfood.dto.response.OrderResponse;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.service.OrderService;
import vn.team05.webfastfood.service.OrderRealtimeService;

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
@PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
public class AdminOrderController {

    private final OrderService orderService;
    private final OrderRealtimeService orderRealtimeService;

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
     * GET /api/v1/admin/orders/stream
     * Subscribe realtime events khi co don hang moi/cap nhat trang thai.
     */
    @GetMapping(value = "/stream", produces = "text/event-stream")
    public SseEmitter streamOrders() {
        return orderRealtimeService.subscribe();
    }

    /**
     * PUT /api/v1/admin/orders/{id}/status
     * Cập nhật trạng thái đơn hàng
     * Body: { "status": 1 }
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ResponseData<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            org.springframework.security.core.Authentication authentication) {
        Integer newStatus = body.get("status") != null ? Integer.parseInt(body.get("status").toString()) : null;
        String shipperName = body.get("shipperName") != null ? body.get("shipperName").toString() : null;
        String shipperPhone = body.get("shipperPhone") != null ? body.get("shipperPhone").toString() : null;
        String employeePhone = authentication != null ? authentication.getName() : null;
        ResponseData<OrderResponse> responseData = orderService.updateOrderStatus(id, newStatus, shipperName, shipperPhone, employeePhone);
        return ResponseEntity.ok(responseData);
    }
}
