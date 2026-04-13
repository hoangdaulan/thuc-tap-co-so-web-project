// package: vn.team05.webfastfood.service.impl
package vn.team05.webfastfood.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import vn.team05.webfastfood.dto.CreateProductRequest;
import vn.team05.webfastfood.dto.ProductResponseDTO;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.model.Category;
import vn.team05.webfastfood.model.Product;
import vn.team05.webfastfood.repository.CategoryRepository;
import vn.team05.webfastfood.repository.ProductRepository;
import vn.team05.webfastfood.service.ProductService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Triển khai logic nghiệp vụ cho sản phẩm.
 * Chuyển logic mapping DTO từ ProductController và logic upload ảnh từ AdminProductController vào đây.
 */
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    // Thư mục lưu ảnh — tương đối so với thư mục chạy ứng dụng
    private static final String UPLOAD_DIR = "src/main/resources/static/assets/img/products/";

    @Override
    public ResponseData<List<ProductResponseDTO>> getAllActiveProductDTOs() {
        List<Product> products = productRepository.findByStatus(1);
        List<ProductResponseDTO> result = products.stream().map(product -> {
            ProductResponseDTO dto = new ProductResponseDTO();
            dto.setId(product.getId());
            dto.setTitle(product.getTitle());
            dto.setDescription(product.getDescription());
            dto.setPrice(product.getPrice());
            dto.setImage(product.getImage());
            dto.setStatus(product.getStatus());
            dto.setDiscount(product.getDiscount());

            if (product.getCategory() != null) {
                dto.setCategoryId(product.getCategory().getId());
                dto.setCategoryName(product.getCategory().getName());
            }
            return dto;
        }).collect(Collectors.toList());

        return new ResponseData<>(HttpStatus.OK.value(), "Lấy danh sách sản phẩm thành công", result);
    }

    @Override
    public ResponseData<List<Product>> getAllActiveProducts() {
        List<Product> products = productRepository.findByStatus(1);
        return new ResponseData<>(HttpStatus.OK.value(), "Lấy danh sách sản phẩm thành công", products);
    }

    @Override
    public ResponseData<Product> createProduct(CreateProductRequest request, MultipartFile imageFile) {
        String imageName = "blank-image.png"; // ảnh mặc định nếu không upload

        if (imageFile != null && !imageFile.isEmpty()) {
            imageName = saveImageFile(imageFile);
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy danh mục với ID: " + request.getCategoryId()));

        Product product = new Product();
        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImage(imageName);
        product.setCategory(category);
        product.setStatus(request.getStatus() != null ? request.getStatus() : 1);

        Product savedProduct = productRepository.save(product);
        return new ResponseData<>(HttpStatus.OK.value(), "Tạo sản phẩm thành công", savedProduct);
    }

    @Override
    public ResponseData<Product> softDeleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));
        product.setStatus(0);
        Product updated = productRepository.save(product);
        return new ResponseData<>(HttpStatus.OK.value(), "Xóa sản phẩm thành công", updated);
    }

    @Override
    public long countAllProducts() {
        return productRepository.count();
    }

    // ==================== Private helpers ====================

    /**
     * Lưu file ảnh vào thư mục static và trả về tên file đã lưu.
     * Logic này được chuyển từ AdminProductController xuống Service.
     */
    private String saveImageFile(MultipartFile imageFile) {
        try {
            String originalFilename = StringUtils.cleanPath(imageFile.getOriginalFilename());
            String extension = "";
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex >= 0) {
                extension = originalFilename.substring(dotIndex); // .jpg, .png, ...
            }
            String imageName = UUID.randomUUID().toString() + extension;

            // Tạo thư mục nếu chưa tồn tại
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Lưu file vào thư mục
            Path filePath = uploadPath.resolve(imageName);
            Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return imageName;
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi lưu ảnh: " + e.getMessage(), e);
        }
    }
}
