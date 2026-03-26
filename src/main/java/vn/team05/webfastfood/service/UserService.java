package vn.team05.webfastfood.service;

import vn.team05.webfastfood.model.User;
import vn.team05.webfastfood.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllCustomers() {
        return userRepository.findAll();
    }

    public User saveUser(User user) {
        if (userRepository.existsByPhone(user.getPhone())) {
            throw new RuntimeException("Số điện thoại này đã được đăng ký!");
        }

        return userRepository.save(user);
    }

    public void deleteUser(Long id)
    {
        if(!userRepository.existsById(id))
        {
            throw new RuntimeException("Không tìm thấy khách hàng với ID: " + id);
        }
        userRepository.deleteById(id);
    }

    public List<User> filterUsers(String search, Boolean status, String startDate, String endDate) {
        return userRepository.findUsersByFilter(
                search,
                status,
                startDate != null ? LocalDateTime.parse(startDate) : null,
                endDate != null ? LocalDateTime.parse(endDate) : null
        );
    }
}