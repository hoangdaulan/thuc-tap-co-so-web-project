// package: vn.team05.webfastfood.service
package vn.team05.webfastfood.service;

import org.springframework.web.multipart.MultipartFile;
import vn.team05.webfastfood.dto.CreateProductRequest;
import vn.team05.webfastfood.dto.ProductResponseDTO;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.model.Product;

import java.util.List;

/**
 * Interface cho các thao tác liên quan đến sản phẩm.
 */
public interface ProductService {

    ResponseData<List<ProductResponseDTO>> getAllActiveProductDTOs();

    ResponseData<List<Product>> getAllActiveProducts();

    ResponseData<Product> createProduct(CreateProductRequest request, MultipartFile imageFile);

    ResponseData<Product> softDeleteProduct(Long id);

    ResponseData<Product> updateProductAvailability(Long id, Integer status);
}
