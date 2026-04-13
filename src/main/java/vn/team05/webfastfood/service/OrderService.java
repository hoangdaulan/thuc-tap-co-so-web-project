// package: vn.team05.webfastfood.service
package vn.team05.webfastfood.service;

import vn.team05.webfastfood.dto.request.PlaceOrderRequest;
import vn.team05.webfastfood.dto.response.OrderResponse;
import vn.team05.webfastfood.dto.response.ResponseData;

import java.util.List;

/**
 * Interface cho các thao tác liên quan đến đơn hàng.
 */
public interface OrderService {

    ResponseData<OrderResponse> placeOrder(PlaceOrderRequest request, String phone);

    ResponseData<List<OrderResponse>> getOrdersByPhone(String phone);

    ResponseData<List<OrderResponse>> getOrdersByShipperPhone(String phone);

    ResponseData<List<OrderResponse>> getAllOrders();

    ResponseData<List<OrderResponse>> getOrdersByStatus(Integer status);

    ResponseData<OrderResponse> updateOrderStatus(Long orderId, Integer newStatus, String shipperName, String shipperPhone, String employeePhone);

    ResponseData<OrderResponse> updateOrderStatusByShipper(Long orderId, Integer newStatus, String shipperPhone);

    ResponseData<OrderResponse> cancelOrder(Long orderId, String phone);
}
