package vn.team05.webfastfood.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.team05.webfastfood.dto.CreateProductRequest;
import vn.team05.webfastfood.model.Product;
import vn.team05.webfastfood.service.ProductService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/products")
public class AdminProductController {

    private final ProductService productService;

    // Thư mục lưu ảnh — tương đối so với thư mục chạy ứng dụng
    // Spring Boot serve static từ src/main/resources/static nên ta lưu vào đây
    private static final String UPLOAD_DIR = "src/main/resources/static/assets/img/products/";

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * GET /api/v1/admin/products
     * Lấy tất cả sản phẩm active từ DB.
     */
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllActiveProducts());
    }

    /**
     * POST /api/v1/admin/products
     * Nhận multipart/form-data gồm:
     * - title, description, price, categoryId, status (text fields)
     * - image (file)
     * Lưu ảnh vào thư mục static, lưu product vào DB.
     */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createProduct(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "status", defaultValue = "1") Integer status,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        try {
            String imageName = "blank-image.png"; // ảnh mặc định nếu không upload

            if (imageFile != null && !imageFile.isEmpty()) {
                // Tạo tên file duy nhất để tránh trùng lặp
                String originalFilename = StringUtils.cleanPath(imageFile.getOriginalFilename());
                String extension = "";
                int dotIndex = originalFilename.lastIndexOf('.');
                if (dotIndex >= 0) {
                    extension = originalFilename.substring(dotIndex); // .jpg, .png, ...
                }
                imageName = UUID.randomUUID().toString() + extension;

                // Tạo thư mục nếu chưa tồn tại
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                // Lưu file vào thư mục
                Path filePath = uploadPath.resolve(imageName);
                Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            }

            // Tạo DTO và gọi service
            CreateProductRequest request = new CreateProductRequest();
            request.setTitle(title);
            request.setDescription(description);
            request.setPrice(price);
            request.setCategoryId(categoryId);
            request.setStatus(status);

            Product savedProduct = productService.createProduct(request, imageName);
            return ResponseEntity.ok(savedProduct);

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body("Lỗi khi lưu ảnh: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * DELETE /api/v1/admin/products/{id}
     * Xóa mềm sản phẩm (đặt status = 0).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            Product updated = productService.softDeleteProduct(id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
