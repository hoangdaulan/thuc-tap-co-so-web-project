package vn.team05.webfastfood.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.team05.webfastfood.model.Order;
import vn.team05.webfastfood.model.User;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Các hàm của Lực giúp lấy đơn hàng kèm sắp xếp mới nhất
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    List<Order> findByStatusOrderByCreatedAtDesc(Integer status);
    List<Order> findAllByOrderByCreatedAtDesc();

    // Giữ lại hàm của đồng đội để không gây lỗi code của họ
    List<Order> findByUserId(Long userId);
}