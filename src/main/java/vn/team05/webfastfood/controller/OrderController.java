package vn.team05.webfastfood.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vn.team05.webfastfood.dto.request.PlaceOrderRequest;
import vn.team05.webfastfood.dto.response.OrderResponse;
import vn.team05.webfastfood.service.OrderService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor // Tự tạo Constructor cho orderService (Lombok)
public class OrderController {

    private final OrderService orderService;

    private String resolveAuthenticatedPhone(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }
        return authentication.getName();
    }

    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody PlaceOrderRequest request, Authentication authentication) {
        try {
            String phone = resolveAuthenticatedPhone(authentication);
            if (phone == null || phone.isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Bạn cần đăng nhập để đặt hàng");
            }
            // Gọi Service xử lý (logic tìm User nên nằm trong Service)
            OrderResponse response = orderService.placeOrder(request, phone);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyOrders(Authentication authentication) {
        try {
            String phone = resolveAuthenticatedPhone(authentication);
            if (phone == null || phone.isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Bạn cần đăng nhập");
            }
            List<OrderResponse> orders = orderService.getOrdersByPhone(phone);
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id, Authentication authentication) {
        try {
            String phone = resolveAuthenticatedPhone(authentication);
            if (phone == null || phone.isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Bạn cần đăng nhập");
            }
            OrderResponse response = orderService.cancelOrder(id, phone);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}