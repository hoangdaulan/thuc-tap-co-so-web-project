// package: vn.team05.webfastfood.service.impl
package vn.team05.webfastfood.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.model.User;
import vn.team05.webfastfood.repository.UserRepository;
import vn.team05.webfastfood.service.UserService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Triển khai logic nghiệp vụ cho người dùng.
 * Chuyển logic CRUD từ UserService (concrete) cũ vào đây,
 * đồng thời chuyển logic profile từ UserProfileController xuống tầng Service.
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ResponseData<List<User>> getAllCustomers() {
        List<User> customers = userRepository.findAll();
        return new ResponseData<>(HttpStatus.OK.value(), "Lấy danh sách khách hàng thành công", customers);
    }

    @Override
    public ResponseData<User> createCustomer(User user) {
        if (userRepository.existsByPhone(user.getPhone())) {
            throw new RuntimeException("Số điện thoại này đã được đăng ký!");
        }

        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setStatus(Boolean.TRUE);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(resolveRole(user.getRole()));

        User savedUser = userRepository.save(user);
        return new ResponseData<>(HttpStatus.OK.value(), "Tạo khách hàng thành công", savedUser);
    }

    @Override
    public ResponseData<String> deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy khách hàng với ID: " + id);
        }
        userRepository.deleteById(id);
        return new ResponseData<>(HttpStatus.OK.value(), "Xóa khách hàng thành công");
    }

    @Override
    public ResponseData<List<User>> filterUsers(String search, Boolean status, String startDate, String endDate) {
        List<User> users = userRepository.findUsersByFilter(
                search,
                status,
                startDate != null ? LocalDateTime.parse(startDate) : null,
                endDate != null ? LocalDateTime.parse(endDate) : null
        );
        return new ResponseData<>(HttpStatus.OK.value(), "Lọc khách hàng thành công", users);
    }

    @Override
    public ResponseData<Map<String, String>> getProfile(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Map<String, String> profile = Map.of(
                "fullname", user.getFullName() != null ? user.getFullName() : "",
                "phone", user.getPhone(),
                "email", user.getEmail() != null ? user.getEmail() : "",
                "address", user.getAddress() != null ? user.getAddress() : ""
        );
        return new ResponseData<>(HttpStatus.OK.value(), "Lấy thông tin cá nhân thành công", profile);
    }

    @Override
    public ResponseData<Map<String, String>> updateProfile(Map<String, String> body, String phone) {
        User user = userRepository.findByPhone(phone)
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
        return new ResponseData<>(HttpStatus.OK.value(), "Cập nhật thông tin thành công",
                Map.of("message", "Cập nhật thông tin thành công"));
    }

    @Override
    public ResponseData<Map<String, String>> changePassword(Map<String, String> body, String phone) {
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            throw new RuntimeException("Thiếu thông tin mật khẩu");
        }
        if (newPassword.length() < 6) {
            throw new RuntimeException("Mật khẩu mới phải có ít nhất 6 ký tự");
        }

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return new ResponseData<>(HttpStatus.OK.value(), "Đổi mật khẩu thành công",
                Map.of("message", "Đổi mật khẩu thành công"));
    }

    @Override
    public ResponseData<User> updateUserRole(Long id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));

        user.setRole(resolveRole(role));
        userRepository.save(user);
        return new ResponseData<>(HttpStatus.OK.value(), "Cập nhật vai trò thành công", user);
    }

    private String resolveRole(String role) {
        String normalizedRole = role == null || role.isBlank() ? "USER" : role.trim().toUpperCase();
        if (!normalizedRole.equals("USER") && !normalizedRole.equals("EMPLOYEE") && !normalizedRole.equals("ADMIN")) {
            throw new RuntimeException("Role không hợp lệ. Chỉ chấp nhận USER, EMPLOYEE hoặc ADMIN");
        }
        return normalizedRole;
    }
}
