package vn.team05.webfastfood.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.team05.webfastfood.dto.response.OrderResponse;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.service.OrderService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/shipper/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SHIPPER')")
public class ShipperOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ResponseData<List<OrderResponse>>> getMyAssignedOrders(
            org.springframework.security.core.Authentication authentication) {
        String shipperPhone = authentication != null ? authentication.getName() : null;
        ResponseData<List<OrderResponse>> responseData = orderService.getOrdersByShipperPhone(shipperPhone);
        return ResponseEntity.ok(responseData);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ResponseData<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            org.springframework.security.core.Authentication authentication) {
        Integer newStatus = body.get("status") != null ? Integer.parseInt(body.get("status").toString()) : null;
        String shipperPhone = authentication != null ? authentication.getName() : null;
        ResponseData<OrderResponse> responseData = orderService.updateOrderStatusByShipper(id, newStatus, shipperPhone);
        return ResponseEntity.ok(responseData);
    }
}
