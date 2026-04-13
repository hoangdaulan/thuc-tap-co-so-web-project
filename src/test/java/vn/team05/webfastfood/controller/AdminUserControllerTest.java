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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AdminUserController.class)
@Import(GlobalExceptionHandler.class)
class AdminUserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    void updateCustomer_ReturnsUpdatedUser() throws Exception {
        User updatedUser = new User();
        updatedUser.setId(15L);
        updatedUser.setFullName("Nguyen Van A");
        updatedUser.setPhone("0912345678");
        updatedUser.setRole("USER");
        updatedUser.setStatus(Boolean.TRUE);

        when(userService.updateUser(eq(15L), any(User.class)))
                .thenReturn(new ResponseData<>(200, "ok", updatedUser));

        mockMvc.perform(put("/api/admin/khach-hang/15")
                        .with(user("admin01").roles("ADMIN"))
                        .with(csrf())
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName":"Nguyen Van A",
                                  "phone":"0912345678",
                                  "email":"a@example.com",
                                  "address":"Ha Noi",
                                  "status":true,
                                  "role":"USER"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(15))
                .andExpect(jsonPath("$.data.fullName").value("Nguyen Van A"))
                .andExpect(jsonPath("$.data.role").value("USER"));
    }
}
