// package: vn.team05.webfastfood.controller
package vn.team05.webfastfood.controller;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.team05.webfastfood.dto.request.LoginRequest;
import vn.team05.webfastfood.dto.request.RegisterRequest;
import vn.team05.webfastfood.dto.response.AuthResponse;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.service.AuthService;

import java.util.Map;

/**
 * Controller xác thực (Đăng nhập / Đăng ký).
 * Thay đổi: Sử dụng @RequiredArgsConstructor, wrap ResponseEntity bên ngoài.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ResponseData<AuthResponse>> authenticateUser(
            @Valid @RequestBody LoginRequest loginRequest) {
        ResponseData<AuthResponse> responseData = authService.login(loginRequest);
        return ResponseEntity.status(responseData.getStatus()).body(responseData);
    }

    @PostMapping("/register")
    public ResponseEntity<ResponseData<Map<String, Object>>> registerUser(
            @Valid @RequestBody RegisterRequest signUpRequest) {
        ResponseData<Map<String, Object>> responseData = authService.register(signUpRequest);
        return ResponseEntity.status(responseData.getStatus()).body(responseData);
    }
}
