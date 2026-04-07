package vn.team05.webfastfood.service;

import org.springframework.stereotype.Service;
import vn.team05.webfastfood.dto.CreateProductRequest;
import vn.team05.webfastfood.model.Category;
import vn.team05.webfastfood.model.Product;
import vn.team05.webfastfood.repository.CategoryRepository;
import vn.team05.webfastfood.repository.ProductRepository;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository,
            CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    /**
     * Lấy tất cả sản phẩm đang active (status = 1).
     */
    public List<Product> getAllActiveProducts() {
        return productRepository.findByStatus(1);
    }

    /**
     * Lấy tất cả sản phẩm (bao gồm đã xóa mềm).
     */
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    /**
     * Tạo sản phẩm mới từ DTO và tên file ảnh đã được lưu.
     *
     * @param request   DTO chứa title, description, price, categoryId, status
     * @param imageName tên file ảnh đã được upload và lưu vào thư mục static
     * @return sản phẩm vừa được lưu vào DB
     */
    public Product createProduct(CreateProductRequest request, String imageName) {
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

        return productRepository.save(product);
    }

    /**
     * Xóa mềm sản phẩm (đặt status = 0).
     */
    public Product softDeleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));
        product.setStatus(0);
        return productRepository.save(product);
    }
}
