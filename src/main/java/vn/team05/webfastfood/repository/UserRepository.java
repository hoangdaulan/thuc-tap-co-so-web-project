package vn.team05.webfastfood.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.team05.webfastfood.model.User; // Import đúng class User của bạn

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByPhone(String username);
    Boolean existsByPhone(String phone);
}