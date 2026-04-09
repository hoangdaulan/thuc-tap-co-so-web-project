package vn.team05.webfastfood.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import vn.team05.webfastfood.model.User;
import vn.team05.webfastfood.repository.UserRepository;

import java.util.Map;

/**
 * API quản lý hồ sơ cá nhân của khách hàng.
 * Base: /api/v1/profile
 */
@RestController
@RequestMapping("/api/v1/profile")
public class UserProfileController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * GET /api/v1/profile
     * Lấy thông tin cá nhân của người dùng đang đăng nhập
     */
    @GetMapping
    public ResponseEntity<?> getProfile(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body("Chưa đăng nhập");
        User user = userRepository.findByPhone(authentication.getName())
                .orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(Map.of(
                "fullname", user.getFullName() != null ? user.getFullName() : "",
                "phone", user.getPhone(),
                "email", user.getEmail() != null ? user.getEmail() : "",
                "address", user.getAddress() != null ? user.getAddress() : ""
        ));
    }

    /**
     * PUT /api/v1/profile
     * Cập nhật thông tin cá nhân (tên, email, địa chỉ)
     * Body: { "fullName": ..., "email": ..., "address": ... }
     */
    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body,
                                           Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body("Chưa đăng nhập");
        try {
            User user = userRepository.findByPhone(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            if (body.containsKey("fullName") && !body.get("fullName").isBlank()) {
                user.setFullName(body.get("fullName"));
            }
            if (body.containsKey("email")) {
                user.setEmail(body.get("email"));
            }
            if (body.containsKey("address")) {
                user.setAddress(body.get("address"));
            }
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Cập nhật thông tin thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * PUT /api/v1/profile/change-password
     * Đổi mật khẩu
     * Body: { "currentPassword": ..., "newPassword": ... }
     */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body,
                                            Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body("Chưa đăng nhập");
        try {
            String currentPassword = body.get("currentPassword");
            String newPassword = body.get("newPassword");

            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body("Thiếu thông tin mật khẩu");
            }
            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest().body("Mật khẩu mới phải có ít nhất 6 ký tự");
            }

            User user = userRepository.findByPhone(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ResponseEntity.badRequest().body("Mật khẩu hiện tại không đúng");
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
