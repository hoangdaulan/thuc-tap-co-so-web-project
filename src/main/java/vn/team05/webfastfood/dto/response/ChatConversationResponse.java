package vn.team05.webfastfood.dto.response;

import java.time.LocalDateTime;

public class ChatConversationResponse {
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private String lastMessage;
    private String lastSenderRole;
    private LocalDateTime lastMessageAt;

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public String getLastSenderRole() {
        return lastSenderRole;
    }

    public void setLastSenderRole(String lastSenderRole) {
        this.lastSenderRole = lastSenderRole;
    }

    public LocalDateTime getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(LocalDateTime lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }
}
