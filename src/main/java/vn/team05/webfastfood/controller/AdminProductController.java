// package: vn.team05.webfastfood.controller
package vn.team05.webfastfood.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.team05.webfastfood.dto.CreateProductRequest;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.model.Product;
import vn.team05.webfastfood.service.ProductService;

import java.util.List;

/**
 * API quản lý sản phẩm cho Admin.
 * Base: /api/v1/admin/products
 *
 * Thay đổi: Loại bỏ toàn bộ logic xử lý file và mapping DTO ra khỏi Controller,
 * chuyển xuống ProductServiceImpl. Controller chỉ nhận Request → gọi Service →
 * trả Response.
 */
@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    /**
     * GET /api/v1/admin/products
     * Lấy tất cả sản phẩm active từ DB.
     */
    @GetMapping
    public ResponseEntity<ResponseData<List<Product>>> getAllProducts() {
        ResponseData<List<Product>> responseData = productService.getAllActiveProducts();
        return ResponseEntity.ok(responseData);
    }

    /**
     * POST /api/v1/admin/products
     * Nhận multipart/form-data gồm:
     * - title, description, price, categoryId, status (text fields)
     * - image (file)
     * Lưu ảnh vào thư mục static, lưu product vào DB.
     */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ResponseData<Product>> createProduct(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "status", defaultValue = "1") Integer status,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {

        CreateProductRequest request = new CreateProductRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setPrice(price);
        request.setCategoryId(categoryId);
        request.setStatus(status);

        ResponseData<Product> responseData = productService.createProduct(request, imageFile);
        return ResponseEntity.ok(responseData);
    }

    /**
     * DELETE /api/v1/admin/products/{id}
     * Xóa mềm sản phẩm (đặt status = 0).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseData<Product>> deleteProduct(@PathVariable Long id) {
        ResponseData<Product> responseData = productService.softDeleteProduct(id);
        return ResponseEntity.ok(responseData);
    }

    /**
     * PATCH /api/v1/admin/products/{id}/availability
     * Cập nhật trạng thái Còn món (1) / Hết món (2).
     */
    @PatchMapping("/{id}/availability")
    public ResponseEntity<ResponseData<Product>> updateAvailability(
            @PathVariable Long id,
            @RequestParam("status") Integer status) {
        ResponseData<Product> responseData = productService.updateProductAvailability(id, status);
        return ResponseEntity.ok(responseData);
    }
}
