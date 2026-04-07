package vn.team05.webfastfood.service;

import vn.team05.webfastfood.dto.request.LoginRequest;
import vn.team05.webfastfood.dto.request.RegisterRequest;
import vn.team05.webfastfood.dto.response.AuthResponse;
import vn.team05.webfastfood.dto.response.ResponseData;

import java.util.Map;

public interface AuthService {
    ResponseData<AuthResponse> login(LoginRequest loginRequest);

    ResponseData<Map<String, Object>> register(RegisterRequest signUpRequest);
}

