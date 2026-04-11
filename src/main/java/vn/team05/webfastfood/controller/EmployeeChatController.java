package vn.team05.webfastfood.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import vn.team05.webfastfood.dto.request.ChatMessageRequest;
import vn.team05.webfastfood.dto.response.ChatConversationResponse;
import vn.team05.webfastfood.dto.response.ChatMessageResponse;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.service.ChatRealtimeService;
import vn.team05.webfastfood.service.SupportChatService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/employee/chats")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('EMPLOYEE','ADMIN')")
public class EmployeeChatController {

    private final SupportChatService supportChatService;
    private final ChatRealtimeService chatRealtimeService;

    @GetMapping("/conversations")
    public ResponseEntity<ResponseData<List<ChatConversationResponse>>> getConversations() {
        return ResponseEntity.ok(supportChatService.getAllConversations());
    }

    @GetMapping("/{customerId}/messages")
    public ResponseEntity<ResponseData<List<ChatMessageResponse>>> getConversationMessages(@PathVariable Long customerId) {
        return ResponseEntity.ok(supportChatService.getConversationMessages(customerId));
    }

    @PostMapping("/{customerId}/messages")
    public ResponseEntity<ResponseData<ChatMessageResponse>> sendMessage(
            @PathVariable Long customerId,
            @RequestBody ChatMessageRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                supportChatService.sendMessageAsEmployee(authentication.getName(), customerId, request.getContent())
        );
    }

    @GetMapping(value = "/stream", produces = "text/event-stream")
    public SseEmitter stream() {
        return chatRealtimeService.subscribeEmployee();
    }
}
