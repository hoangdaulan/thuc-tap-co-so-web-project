package vn.team05.webfastfood.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import vn.team05.webfastfood.dto.response.ChatMessageResponse;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.exception.GlobalExceptionHandler;
import vn.team05.webfastfood.model.User;
import vn.team05.webfastfood.repository.UserRepository;
import vn.team05.webfastfood.service.ChatRealtimeService;
import vn.team05.webfastfood.service.SupportChatService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = SupportChatController.class)
@Import({GlobalExceptionHandler.class, ChatRealtimeService.class})
class SupportChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SupportChatService supportChatService;

    @MockBean
    private UserRepository userRepository;

    @Test
    void getMyMessages_ReturnsConversationHistory() throws Exception {
        ChatMessageResponse message = new ChatMessageResponse();
        message.setId(1L);
        message.setCustomerId(10L);
        message.setSenderRole("USER");
        message.setContent("Tôi cần tư vấn combo");
        message.setCreatedAt(LocalDateTime.now());

        when(supportChatService.getMyMessages(eq("0900000001")))
                .thenReturn(new ResponseData<>(200, "ok", List.of(message)));

        mockMvc.perform(get("/api/v1/chat/my/messages")
                        .with(user("0900000001").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].content").value("Tôi cần tư vấn combo"));
    }

    @Test
    void sendMyMessage_ReturnsSavedMessage() throws Exception {
        ChatMessageResponse message = new ChatMessageResponse();
        message.setId(2L);
        message.setCustomerId(10L);
        message.setSenderRole("USER");
        message.setContent("Cho tôi hỏi món nào bán chạy?");

        when(supportChatService.sendMessageAsUser(eq("0900000001"), eq("Cho tôi hỏi món nào bán chạy?")))
                .thenReturn(new ResponseData<>(200, "ok", message));

        mockMvc.perform(post("/api/v1/chat/my/messages")
                        .with(user("0900000001").roles("USER"))
                        .with(csrf())
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"content":"Cho tôi hỏi món nào bán chạy?"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.senderRole").value("USER"));
    }

    @Test
    void stream_ReturnsSseEmitter() throws Exception {
        User userEntity = new User();
        userEntity.setId(10L);
        userEntity.setPhone("0900000001");

        when(userRepository.findByPhone("0900000001")).thenReturn(Optional.of(userEntity));

        mockMvc.perform(get("/api/v1/chat/stream")
                        .with(user("0900000001").roles("USER")))
                .andExpect(status().isOk());
    }
}
