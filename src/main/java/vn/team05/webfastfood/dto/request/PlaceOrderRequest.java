package vn.team05.webfastfood.dto.request;

import java.util.List;

public class PlaceOrderRequest {

    private String note;
    private String paymentMethod; // "cod" or "banking"
    private String shippingDate;
    private String deliveryType; // "delivery" or "pickup"
    private String recipientName;
    private String recipientPhone;
    private String deliveryAddress;
    private String deliveryTime; // e.g. "08:00", "Giao ngay khi xong"
    private String branch; // chi nhánh (nếu tự đến lấy)
    private List<OrderItemRequest> items;

    public static class OrderItemRequest {
        private Long productId;
        private Integer quantity;
        private String note;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
    }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getShippingDate() { return shippingDate; }
    public void setShippingDate(String shippingDate) { this.shippingDate = shippingDate; }

    public String getDeliveryType() { return deliveryType; }
    public void setDeliveryType(String deliveryType) { this.deliveryType = deliveryType; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getRecipientPhone() { return recipientPhone; }
    public void setRecipientPhone(String recipientPhone) { this.recipientPhone = recipientPhone; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public String getDeliveryTime() { return deliveryTime; }
    public void setDeliveryTime(String deliveryTime) { this.deliveryTime = deliveryTime; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }

    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }
}
