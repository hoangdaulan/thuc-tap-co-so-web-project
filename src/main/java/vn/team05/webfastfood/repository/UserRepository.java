package vn.team05.webfastfood.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.team05.webfastfood.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByPhone(String username);
    Boolean existsByPhone(String phone);

    @Query("SELECT u FROM User u WHERE " +
            "(:search IS NULL OR u.fullName LIKE %:search% OR u.email LIKE %:search% OR u.phone LIKE %:search%) AND " +
            "(:status IS NULL OR u.status = :status) AND " +
            "(:startDate IS NULL OR u.createdAt >= :startDate) AND " +
            "(:endDate IS NULL OR u.createdAt <= :endDate) " +
            "ORDER BY u.createdAt DESC")
    List<User> findUsersByFilter(
            @Param("search") String search,
            @Param("status") Boolean status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}