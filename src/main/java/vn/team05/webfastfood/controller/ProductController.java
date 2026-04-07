package vn.team05.webfastfood.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.team05.webfastfood.dto.ProductResponseDTO;
import vn.team05.webfastfood.model.Product;
import vn.team05.webfastfood.service.ProductService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * GET /api/v1/products
     * Lấy danh sách tất cả sản phẩm đang active (status = 1) để hiển thị lên trang chủ
     */
    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts() {
        List<Product> products = productService.getAllActiveProducts();
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
        
        return ResponseEntity.ok(result);
    }
}
