package vn.team05.webfastfood.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipper_id")
    private User shipper;

    @Column(name = "note")
    private String note;

    @Column(name = "total_price")
    private Double totalPrice;

    @Column(name = "status")
    private Integer status = 0; // 0: Pending, 1: Confirmed, 2: Delivering, 3: Done, 4: Cancelled

    @Column(name = "payment_method")
    private String paymentMethod; // "cod" or "banking"

    @Column(name = "shipping_date")
    private String shippingDate;

    @Column(name = "delivery_type")
    private String deliveryType; // "delivery" or "pickup"

    // Gộp tên: dùng recipientName cho chuyên nghiệp
    @Column(name = "recipient_name")
    private String recipientName;

    @Column(name = "recipient_phone")
    private String recipientPhone;

    @Column(name = "delivery_address")
    private String deliveryAddress;

    @Column(name = "delivery_time")
    private String deliveryTime;

    @Column(name = "branch")
    private String branch;

    @Column(name = "shipper_name")
    private String shipperName;

    @Column(name = "shipper_phone")
    private String shipperPhone;

    @Column(name = "coupon_code")
    private String couponCode;

    @Column(name = "discount_amount")
    private Double discountAmount;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> items;
}
