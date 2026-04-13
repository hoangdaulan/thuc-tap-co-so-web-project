package vn.team05.webfastfood.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.team05.webfastfood.dto.StatisticDTO;
import vn.team05.webfastfood.model.Order;
import vn.team05.webfastfood.model.OrderItem;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrder(Order order);

    @Query("SELECT new vn.team05.webfastfood.dto.StatisticDTO(p.id, p.title, SUM(oi.quantity), SUM(oi.quantity * oi.price)) " +
           "FROM OrderItem oi JOIN oi.product p JOIN oi.order o " +
           "WHERE o.status = 3 " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:keyword IS NULL OR p.title LIKE CONCAT('%', :keyword, '%')) " +
           "AND (:startDate IS NULL OR o.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR o.createdAt <= :endDate) " +
           "GROUP BY p.id, p.title")
    List<StatisticDTO> getRevenueStatistics(
        @Param("categoryId") Long categoryId,
        @Param("keyword") String keyword,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}
