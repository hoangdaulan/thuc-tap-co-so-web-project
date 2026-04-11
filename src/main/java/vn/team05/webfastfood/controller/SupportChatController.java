package vn.team05.webfastfood.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import vn.team05.webfastfood.dto.request.ChatMessageRequest;
import vn.team05.webfastfood.dto.response.ChatMessageResponse;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.model.User;
import vn.team05.webfastfood.repository.UserRepository;
import vn.team05.webfastfood.service.ChatRealtimeService;
import vn.team05.webfastfood.service.SupportChatService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class SupportChatController {

    private final SupportChatService supportChatService;
    private final ChatRealtimeService chatRealtimeService;
    private final UserRepository userRepository;

    @GetMapping("/my/messages")
    public ResponseEntity<ResponseData<List<ChatMessageResponse>>> getMyMessages(Authentication authentication) {
        ResponseData<List<ChatMessageResponse>> responseData = supportChatService.getMyMessages(authentication.getName());
        return ResponseEntity.ok(responseData);
    }

    @PostMapping("/my/messages")
    public ResponseEntity<ResponseData<ChatMessageResponse>> sendMyMessage(
            @RequestBody ChatMessageRequest request,
            Authentication authentication) {
        ResponseData<ChatMessageResponse> responseData =
                supportChatService.sendMessageAsUser(authentication.getName(), request.getContent());
        return ResponseEntity.ok(responseData);
    }

    @GetMapping(value = "/stream", produces = "text/event-stream")
    public SseEmitter stream(Authentication authentication) {
        User customer = userRepository.findByPhone(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return chatRealtimeService.subscribeCustomer(customer.getId());
    }
}
