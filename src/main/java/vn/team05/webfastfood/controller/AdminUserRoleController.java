package vn.team05.webfastfood.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.team05.webfastfood.dto.request.UpdateUserRoleRequest;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.model.User;
import vn.team05.webfastfood.service.UserService;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserRoleController {

    private final UserService userService;

    @PutMapping("/{id}/role")
    public ResponseEntity<ResponseData<User>> updateUserRole(
            @PathVariable Long id,
            @RequestBody UpdateUserRoleRequest request) {
        return ResponseEntity.ok(userService.updateUserRole(id, request.getRole()));
    }
}
