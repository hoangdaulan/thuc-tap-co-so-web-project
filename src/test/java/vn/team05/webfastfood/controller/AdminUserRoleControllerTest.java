package vn.team05.webfastfood.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.exception.GlobalExceptionHandler;
import vn.team05.webfastfood.model.User;
import vn.team05.webfastfood.service.UserService;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AdminUserRoleController.class)
@Import(GlobalExceptionHandler.class)
class AdminUserRoleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    void updateRole_ReturnsUpdatedUser() throws Exception {
        User userEntity = new User();
        userEntity.setId(7L);
        userEntity.setFullName("Employee Demo");
        userEntity.setRole("EMPLOYEE");

        when(userService.updateUserRole(eq(7L), eq("EMPLOYEE")))
                .thenReturn(new ResponseData<>(200, "ok", userEntity));

        mockMvc.perform(put("/api/v1/admin/users/7/role")
                        .with(user("admin01").roles("ADMIN"))
                        .with(csrf())
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"role":"EMPLOYEE"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("EMPLOYEE"));
    }
}
