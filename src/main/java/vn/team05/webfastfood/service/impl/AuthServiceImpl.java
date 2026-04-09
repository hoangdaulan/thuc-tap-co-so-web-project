package vn.team05.webfastfood.service.impl;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.team05.webfastfood.dto.request.LoginRequest;
import vn.team05.webfastfood.dto.request.RegisterRequest;
import vn.team05.webfastfood.dto.response.AuthResponse;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.model.User;
import vn.team05.webfastfood.repository.UserRepository;
import vn.team05.webfastfood.security.JwtTokenProvider;
import vn.team05.webfastfood.service.AuthService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Override
    public ResponseData<AuthResponse> login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User account = userRepository.findByPhone(loginRequest.getUsername()).orElse(null);
        AuthResponse authResponse = (account != null)
                ? new AuthResponse(jwt, buildUserData(account))
                : new AuthResponse(jwt);

        return new ResponseData<>(HttpStatus.OK.value(), "Đăng nhập thành công", authResponse);
    }

    @Override
    public ResponseData<Map<String, Object>> register(RegisterRequest signUpRequest) {
        if (userRepository.existsByPhone(signUpRequest.getPhone())) {
            return new ResponseData<>(HttpStatus.BAD_REQUEST.value(), "Số điện thoại đã tồn tại!");
        }

        User user = new User();
        user.setFullName(signUpRequest.getFullName());
        user.setPhone(signUpRequest.getPhone());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setRole("USER");
        user.setStatus(true);

        userRepository.save(user);

        Map<String, Object> registerData = new HashMap<>();
        registerData.put("phone", user.getPhone());
        registerData.put("fullName", user.getFullName());

        return new ResponseData<>(HttpStatus.CREATED.value(), "Đăng ký thành công", registerData);
    }

    private Map<String, Object> buildUserData(User account) {
        Map<String, Object> userData = new HashMap<>();
        userData.put("fullname", account.getFullName());
        userData.put("phone", account.getPhone());
        userData.put("address", account.getAddress() != null ? account.getAddress() : "");
        userData.put("email", account.getEmail() != null ? account.getEmail() : "");
        userData.put("status", Boolean.TRUE.equals(account.getStatus()) ? 1 : 0);
        userData.put("join", account.getCreatedAt());
        userData.put("cart", new ArrayList<>());
        userData.put("userType", "ADMIN".equalsIgnoreCase(account.getRole()) ? 1 : 0);
        return userData;
    }
}

