package vn.team05.webfastfood.controller;

import vn.team05.webfastfood.model.User;
import vn.team05.webfastfood.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/admin/khach-hang")
public class AdminUserController {
    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getKhachHang() {
        // API này sẽ trả về danh sách JSON để hiển thị lên bảng trong ảnh của bạn
        return userService.getAllCustomers();
    }
}