package vn.team05.webfastfood.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.team05.webfastfood.dto.response.ChatConversationResponse;
import vn.team05.webfastfood.dto.response.ChatMessageResponse;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.model.ChatMessage;
import vn.team05.webfastfood.model.User;
import vn.team05.webfastfood.repository.ChatMessageRepository;
import vn.team05.webfastfood.repository.UserRepository;
import vn.team05.webfastfood.service.ChatRealtimeService;
import vn.team05.webfastfood.service.SupportChatService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupportChatServiceImpl implements SupportChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ChatRealtimeService chatRealtimeService;

    @Override
    public ResponseData<List<ChatMessageResponse>> getMyMessages(String phone) {
        User customer = getUserByPhone(phone);
        List<ChatMessageResponse> messages = chatMessageRepository.findByCustomerIdOrderByCreatedAtAsc(customer.getId())
                .stream()
                .map(this::toMessageResponse)
                .toList();
        return new ResponseData<>(HttpStatus.OK.value(), "Lấy lịch sử hỗ trợ thành công", messages);
    }

    @Override
    @Transactional
    public ResponseData<ChatMessageResponse> sendMessageAsUser(String phone, String content) {
        User customer = getUserByPhone(phone);
        validateContent(content);

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setCustomer(customer);
        chatMessage.setSender(customer);
        chatMessage.setContent(content.trim());

        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
        ChatMessageResponse response = toMessageResponse(savedMessage);
        chatRealtimeService.publishMessage(response);
        return new ResponseData<>(HttpStatus.OK.value(), "Gửi tin nhắn hỗ trợ thành công", response);
    }

    @Override
    public ResponseData<List<ChatConversationResponse>> getAllConversations() {
        List<ChatConversationResponse> conversations = chatMessageRepository.findLatestMessagesForEachConversation()
                .stream()
                .map(this::toConversationResponse)
                .toList();
        return new ResponseData<>(HttpStatus.OK.value(), "Lấy danh sách cuộc trò chuyện thành công", conversations);
    }

    @Override
    public ResponseData<List<ChatMessageResponse>> getConversationMessages(Long customerId) {
        List<ChatMessageResponse> messages = chatMessageRepository.findByCustomerIdOrderByCreatedAtAsc(customerId)
                .stream()
                .map(this::toMessageResponse)
                .toList();
        return new ResponseData<>(HttpStatus.OK.value(), "Lấy tin nhắn cuộc trò chuyện thành công", messages);
    }

    @Override
    @Transactional
    public ResponseData<ChatMessageResponse> sendMessageAsEmployee(String employeePhone, Long customerId, String content) {
        User employee = getUserByPhone(employeePhone);
        String role = normalizeRole(employee.getRole());
        if (!"EMPLOYEE".equals(role) && !"ADMIN".equals(role)) {
            throw new RuntimeException("Tài khoản này không có quyền trả lời hỗ trợ");
        }

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        validateContent(content);

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setCustomer(customer);
        chatMessage.setSender(employee);
        chatMessage.setContent(content.trim());

        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
        ChatMessageResponse response = toMessageResponse(savedMessage);
        chatRealtimeService.publishMessage(response);
        return new ResponseData<>(HttpStatus.OK.value(), "Phản hồi khách hàng thành công", response);
    }

    private User getUserByPhone(String phone) {
        return userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    private void validateContent(String content) {
        if (content == null || content.isBlank()) {
            throw new RuntimeException("Nội dung tin nhắn không được để trống");
        }
        if (content.trim().length() > 1000) {
            throw new RuntimeException("Tin nhắn hỗ trợ tối đa 1000 ký tự");
        }
    }

    private ChatMessageResponse toMessageResponse(ChatMessage message) {
        ChatMessageResponse response = new ChatMessageResponse();
        response.setId(message.getId());
        response.setCustomerId(message.getCustomer().getId());
        response.setCustomerName(message.getCustomer().getFullName());
        response.setCustomerPhone(message.getCustomer().getPhone());
        response.setSenderId(message.getSender().getId());
        response.setSenderName(message.getSender().getFullName());
        response.setSenderPhone(message.getSender().getPhone());
        response.setSenderRole(normalizeRole(message.getSender().getRole()));
        response.setContent(message.getContent());
        response.setCreatedAt(message.getCreatedAt());
        return response;
    }

    private ChatConversationResponse toConversationResponse(ChatMessage message) {
        ChatConversationResponse response = new ChatConversationResponse();
        response.setCustomerId(message.getCustomer().getId());
        response.setCustomerName(message.getCustomer().getFullName());
        response.setCustomerPhone(message.getCustomer().getPhone());
        response.setLastMessage(message.getContent());
        response.setLastSenderRole(normalizeRole(message.getSender().getRole()));
        response.setLastMessageAt(message.getCreatedAt());
        return response;
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "USER";
        }
        return role.trim().toUpperCase();
    }
}
