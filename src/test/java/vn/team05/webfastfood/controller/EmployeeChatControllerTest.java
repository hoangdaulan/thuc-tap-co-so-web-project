package vn.team05.webfastfood.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import vn.team05.webfastfood.dto.response.ChatConversationResponse;
import vn.team05.webfastfood.dto.response.ChatMessageResponse;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.exception.GlobalExceptionHandler;
import vn.team05.webfastfood.service.ChatRealtimeService;
import vn.team05.webfastfood.service.SupportChatService;

import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = EmployeeChatController.class)
@Import({GlobalExceptionHandler.class, ChatRealtimeService.class})
class EmployeeChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SupportChatService supportChatService;

    @Test
    void getConversations_ReturnsConversationList() throws Exception {
        ChatConversationResponse conversation = new ChatConversationResponse();
        conversation.setCustomerId(3L);
        conversation.setCustomerName("Nguyen Van A");
        conversation.setLastMessage("Em cần tư vấn thêm");

        when(supportChatService.getAllConversations())
                .thenReturn(new ResponseData<>(200, "ok", List.of(conversation)));

        mockMvc.perform(get("/api/v1/employee/chats/conversations")
                        .with(user("employee01").roles("EMPLOYEE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].customerName").value("Nguyen Van A"));
    }

    @Test
    void sendMessage_ReturnsEmployeeReply() throws Exception {
        ChatMessageResponse message = new ChatMessageResponse();
        message.setId(5L);
        message.setCustomerId(3L);
        message.setSenderRole("EMPLOYEE");
        message.setContent("Bên em gợi ý combo 2 người nhé");

        when(supportChatService.sendMessageAsEmployee(eq("employee01"), eq(3L), eq("Bên em gợi ý combo 2 người nhé")))
                .thenReturn(new ResponseData<>(200, "ok", message));

        mockMvc.perform(post("/api/v1/employee/chats/3/messages")
                        .with(user("employee01").roles("EMPLOYEE"))
                        .with(csrf())
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"content":"Bên em gợi ý combo 2 người nhé"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.senderRole").value("EMPLOYEE"));
    }
}
