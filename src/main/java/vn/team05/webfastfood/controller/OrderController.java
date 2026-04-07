package vn.team05.webfastfood.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vn.team05.webfastfood.dto.OrderRequest;
import vn.team05.webfastfood.model.Order;
import vn.team05.webfastfood.model.User;
import vn.team05.webfastfood.repository.UserRepository;
import vn.team05.webfastfood.service.OrderService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public OrderController(OrderService orderService, UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Vui lòng đăng nhập để đặt hàng.");
            }

            // Authentication name thường lưu username (số điện thoại)
            String username = authentication.getName();
            User user = userRepository.findByPhone(username)
                    .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại."));

            Order createdOrder = orderService.createOrder(orderRequest, user);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Đặt hàng thành công!");
            response.put("orderId", createdOrder.getId());
            response.put("totalPrice", createdOrder.getTotalPrice());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
