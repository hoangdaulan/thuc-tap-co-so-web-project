// package: vn.team05.webfastfood.service
package vn.team05.webfastfood.service;

import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Interface cho các thao tác liên quan đến người dùng.
 */
public interface UserService {

    ResponseData<List<User>> getAllCustomers();

    ResponseData<User> createCustomer(User user);

    ResponseData<String> deleteUser(Long id);

    ResponseData<List<User>> filterUsers(String search, Boolean status, String startDate, String endDate);

    ResponseData<Map<String, String>> getProfile(String phone);

    ResponseData<Map<String, String>> updateProfile(Map<String, String> body, String phone);

    ResponseData<Map<String, String>> changePassword(Map<String, String> body, String phone);

    ResponseData<User> updateUserRole(Long id, String role);
}
