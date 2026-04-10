// package: vn.team05.webfastfood.controller
package vn.team05.webfastfood.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vn.team05.webfastfood.dto.request.PlaceOrderRequest;
import vn.team05.webfastfood.dto.response.OrderResponse;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.service.OrderService;

import java.util.List;

/**
 * API đặt hàng cho khách hàng.
 * Base: /api/v1/orders
 *
 * Thay đổi: Loại bỏ try/catch, sử dụng @RequiredArgsConstructor,
 * tất cả trả về ResponseData<T>. Logic xác thực phone vẫn giữ ở Controller
 * vì nó liên quan đến Security context.
 */
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ResponseData<OrderResponse>> placeOrder(
            @RequestBody PlaceOrderRequest request,
            Authentication authentication) {
        String phone = resolveAuthenticatedPhone(authentication);
        if (phone == null || phone.isBlank()) {
            return ResponseEntity.status(401)
                    .body(new ResponseData<>(401, "Bạn cần đăng nhập để đặt hàng"));
        }
        ResponseData<OrderResponse> responseData = orderService.placeOrder(request, phone);
        return ResponseEntity.ok(responseData);
    }

    @GetMapping("/my")
    public ResponseEntity<ResponseData<List<OrderResponse>>> getMyOrders(Authentication authentication) {
        String phone = resolveAuthenticatedPhone(authentication);
        if (phone == null || phone.isBlank()) {
            return ResponseEntity.status(401)
                    .body(new ResponseData<>(401, "Bạn cần đăng nhập"));
        }
        ResponseData<List<OrderResponse>> responseData = orderService.getOrdersByPhone(phone);
        return ResponseEntity.ok(responseData);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ResponseData<OrderResponse>> cancelOrder(
            @PathVariable Long id,
            Authentication authentication) {
        String phone = resolveAuthenticatedPhone(authentication);
        if (phone == null || phone.isBlank()) {
            return ResponseEntity.status(401)
                    .body(new ResponseData<>(401, "Bạn cần đăng nhập"));
        }
        ResponseData<OrderResponse> responseData = orderService.cancelOrder(id, phone);
        return ResponseEntity.ok(responseData);
    }

    // ==================== Private helpers ====================

    /**
     * Resolve số điện thoại từ Authentication context.
     * Giữ ở Controller vì liên quan đến Spring Security context.
     */
    private String resolveAuthenticatedPhone(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }
        return authentication.getName();
    }
}