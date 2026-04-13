package vn.team05.webfastfood.dto.request;

import lombok.Data;

@Data
public class CouponRequest {
    private String code;
    private Integer discountPercentage;
    private Integer daysValid; // Để tạo ngày hết hạn = now + daysValid, hoặc có thể dùng expirationDate trực tiếp ở dạng String/Long
    private Boolean isActive;
}
