package vn.team05.webfastfood.controller;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;
import vn.team05.webfastfood.dto.request.LoginRequest;
import vn.team05.webfastfood.dto.request.RegisterRequest;
import vn.team05.webfastfood.dto.response.AuthResponse;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.service.AuthService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseData<AuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return authService.login(loginRequest);
    }

    @PostMapping("/register")
    public ResponseData<Map<String, Object>> registerUser(
            @Valid @RequestBody RegisterRequest signUpRequest,
            HttpServletResponse httpServletResponse
    ) {
        ResponseData<Map<String, Object>> responseData = authService.register(signUpRequest);
        httpServletResponse.setStatus(responseData.getStatus());
        return responseData;
    }
}
