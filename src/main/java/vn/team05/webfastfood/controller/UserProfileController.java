// package: vn.team05.webfastfood.controller
package vn.team05.webfastfood.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.service.UserService;

import java.util.Map;

/**
 * API quản lý hồ sơ cá nhân của khách hàng.
 * Base: /api/v1/profile
 *
 * Thay đổi: Loại bỏ toàn bộ logic trực tiếp với UserRepository và PasswordEncoder
 * ra khỏi Controller, chuyển xuống UserServiceImpl. Controller chỉ nhận Request → gọi Service → trả Response.
 */
@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserService userService;

    /**
     * GET /api/v1/profile
     * Lấy thông tin cá nhân của người dùng đang đăng nhập
     */
    @GetMapping
    public ResponseEntity<ResponseData<Map<String, String>>> getProfile(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401)
                    .body(new ResponseData<>(401, "Chưa đăng nhập"));
        }
        ResponseData<Map<String, String>> responseData = userService.getProfile(authentication.getName());
        return ResponseEntity.ok(responseData);
    }

    /**
     * PUT /api/v1/profile
     * Cập nhật thông tin cá nhân (tên, email, địa chỉ)
     * Body: { "fullName": ..., "email": ..., "address": ... }
     */
    @PutMapping
    public ResponseEntity<ResponseData<Map<String, String>>> updateProfile(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401)
                    .body(new ResponseData<>(401, "Chưa đăng nhập"));
        }
        ResponseData<Map<String, String>> responseData = userService.updateProfile(body, authentication.getName());
        return ResponseEntity.ok(responseData);
    }

    /**
     * PUT /api/v1/profile/change-password
     * Đổi mật khẩu
     * Body: { "currentPassword": ..., "newPassword": ... }
     */
    @PutMapping("/change-password")
    public ResponseEntity<ResponseData<Map<String, String>>> changePassword(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401)
                    .body(new ResponseData<>(401, "Chưa đăng nhập"));
        }
        ResponseData<Map<String, String>> responseData = userService.changePassword(body, authentication.getName());
        return ResponseEntity.ok(responseData);
    }
}
