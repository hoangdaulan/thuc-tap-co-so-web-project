package vn.team05.webfastfood.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.team05.webfastfood.dto.OrderItemRequest;
import vn.team05.webfastfood.dto.OrderRequest;
import vn.team05.webfastfood.model.Order;
import vn.team05.webfastfood.model.OrderItem;
import vn.team05.webfastfood.model.Product;
import vn.team05.webfastfood.model.User;
import vn.team05.webfastfood.repository.OrderItemRepository;
import vn.team05.webfastfood.repository.OrderRepository;
import vn.team05.webfastfood.repository.ProductRepository;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Order createOrder(OrderRequest request, User user) {
        // Tạo hóa đơn
        Order order = new Order();
        order.setUser(user);
        order.setNote(request.getNote());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setShippingDate(request.getShippingDate());
        order.setCustomerName(request.getCustomerName());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setAddress(request.getAddress());
        order.setStatus(0); // 0: Pending

        // Lưu trước để có ID order -> lưu tiếp order items
        order = orderRepository.save(order);

        double totalPrice = 0.0;
        List<OrderItem> orderItems = new ArrayList<>();

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (OrderItemRequest itemReq : request.getItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại: " + itemReq.getProductId()));

                // Kiểm tra số lượng tồn (nếu bạn muốn chặn không cho mua khi kho hết, mở comment)
                // if (product.getQuantity() < itemReq.getQuantity()) {
                //      throw new RuntimeException("Sản phẩm " + product.getTitle() + " không đủ số lượng!");
                // }

                // Tính tiền dựa vào giá gốc, trừ đi discount (nếu có - discount là % hoặc giá trị, ở đây tạm tính theo price)
                double itemPrice = product.getPrice() != null ? product.getPrice() : 0.0;
                if (product.getDiscount() != null && product.getDiscount() > 0) {
                    itemPrice = itemPrice - (itemPrice * product.getDiscount() / 100.0);
                }

                // Trừ số lượng kho
                if (product.getQuantity() != null) {
                    product.setQuantity(Math.max(0, product.getQuantity() - itemReq.getQuantity()));
                    productRepository.save(product);
                }

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setProduct(product);
                orderItem.setQuantity(itemReq.getQuantity());
                orderItem.setPrice(itemPrice);
                orderItem.setNote(itemReq.getNote());

                orderItems.add(orderItem);

                totalPrice += itemPrice * itemReq.getQuantity();
            }
            orderItemRepository.saveAll(orderItems);
        }

        order.setTotalPrice(totalPrice);
        return orderRepository.save(order);
    }
}
