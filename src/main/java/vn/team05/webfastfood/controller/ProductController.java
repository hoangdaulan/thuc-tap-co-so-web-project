// package: vn.team05.webfastfood.controller
package vn.team05.webfastfood.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.team05.webfastfood.dto.ProductResponseDTO;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.service.ProductService;

import java.util.List;

/**
 * API sản phẩm cho trang chủ (public).
 * Base: /api/v1/products
 *
 * Thay đổi: Loại bỏ logic mapping Product → ProductResponseDTO ra khỏi Controller,
 * chuyển xuống ProductServiceImpl. Trả về ResponseData<T>.
 */
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /**
     * GET /api/v1/products
     * Lấy danh sách tất cả sản phẩm đang active (status = 1) để hiển thị lên trang chủ
     */
    @GetMapping
    public ResponseEntity<ResponseData<List<ProductResponseDTO>>> getAllProducts() {
        ResponseData<List<ProductResponseDTO>> responseData = productService.getAllActiveProductDTOs();
        return ResponseEntity.ok(responseData);
    }

    /**
     * GET /api/v1/products/count
     * Lấy tổng số sản phẩm trong hệ thống
     */
    @GetMapping("/count")
    public ResponseEntity<ResponseData<Long>> getProductCount() {
        long count = productService.countAllProducts();
        return ResponseEntity.ok(new ResponseData<>(200, "Tổng số sản phẩm", count));
    }
}
