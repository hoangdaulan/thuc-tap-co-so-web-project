package vn.team05.webfastfood.service;

import vn.team05.webfastfood.dto.response.ChatConversationResponse;
import vn.team05.webfastfood.dto.response.ChatMessageResponse;
import vn.team05.webfastfood.dto.response.ResponseData;

import java.util.List;

public interface SupportChatService {

    ResponseData<List<ChatMessageResponse>> getMyMessages(String phone);

    ResponseData<ChatMessageResponse> sendMessageAsUser(String phone, String content);

    ResponseData<List<ChatConversationResponse>> getAllConversations();

    ResponseData<List<ChatMessageResponse>> getConversationMessages(Long customerId);

    ResponseData<ChatMessageResponse> sendMessageAsEmployee(String employeePhone, Long customerId, String content);
}
