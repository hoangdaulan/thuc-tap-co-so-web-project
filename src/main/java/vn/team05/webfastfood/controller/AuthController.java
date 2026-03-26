package vn.team05.webfastfood.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import vn.team05.webfastfood.dto.AuthResponse;
import vn.team05.webfastfood.dto.LoginRequest;
import vn.team05.webfastfood.dto.RegisterRequest;
import vn.team05.webfastfood.model.User;
import vn.team05.webfastfood.repository.UserRepository;
import vn.team05.webfastfood.security.JwtTokenProvider;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);

        User account = userRepository.findByPhone(loginRequest.getUsername()).orElse(null);
        if (account != null) {
            java.util.Map<String, Object> userData = new java.util.HashMap<>();
            userData.put("fullname", account.getFullName());
            userData.put("phone", account.getPhone());
            userData.put("address", account.getAddress() != null ? account.getAddress() : "");
            userData.put("email", account.getEmail() != null ? account.getEmail() : "");
            userData.put("status", account.getStatus() ? 1 : 0);
            userData.put("join", account.getCreatedAt());
            userData.put("cart", new java.util.ArrayList<>());
            userData.put("userType", "ADMIN".equalsIgnoreCase(account.getRole()) ? 1 : 0);

            return ResponseEntity.ok(new AuthResponse(jwt, userData));
        }

        return ResponseEntity.ok(new AuthResponse(jwt));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if(userRepository.existsByPhone(signUpRequest.getPhone())) {
            return new ResponseEntity<>("Số điện thoại đã tồn tại!", HttpStatus.BAD_REQUEST);
        }

        // Tạo tài khoản người dùng
        User user = new User();
        user.setFullName(signUpRequest.getFullName());
        user.setPhone(signUpRequest.getPhone());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setRole("USER");
        user.setStatus(true);

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully");
    }
}
