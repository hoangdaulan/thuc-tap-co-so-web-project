// package: vn.team05.webfastfood.controller
package vn.team05.webfastfood.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.model.User;
import vn.team05.webfastfood.service.UserService;

import java.time.LocalDateTime;
import java.util.List;

/**
 * API quản lý khách hàng cho Admin.
 * Base: /api/admin/khach-hang
 *
 * Thay đổi: Loại bỏ logic thiết lập timestamp/role/status ra khỏi Controller,
 * chuyển xuống UserServiceImpl. Tất cả trả về ResponseData<T>.
 */
@RestController
@RequestMapping("/api/admin/khach-hang")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ResponseData<List<User>>> getKhachHang() {
        ResponseData<List<User>> responseData = userService.getAllCustomers();
        return ResponseEntity.ok(responseData);
    }

    @PostMapping
    public ResponseEntity<ResponseData<User>> createCustomer(@RequestBody User user) {
        ResponseData<User> responseData = userService.createCustomer(user);
        return ResponseEntity.ok(responseData);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseData<User>> updateCustomer(@PathVariable Long id, @RequestBody User user) {
        ResponseData<User> responseData = userService.updateUser(id, user);
        return ResponseEntity.ok(responseData);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseData<String>> deleteCustomer(@PathVariable Long id) {
        ResponseData<String> responseData = userService.deleteUser(id);
        return ResponseEntity.ok(responseData);
    }

    @GetMapping("/filter")
    public ResponseEntity<ResponseData<List<User>>> filterUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        ResponseData<List<User>> responseData = userService.filterUsers(
                search, status,
                startDate != null ? startDate.toString() : null,
                endDate != null ? endDate.toString() : null
        );
        return ResponseEntity.ok(responseData);
    }
}
