package vn.team05.webfastfood.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import vn.team05.webfastfood.model.Category;
import vn.team05.webfastfood.model.Product;
import vn.team05.webfastfood.service.ProductService;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AdminProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        Category category = new Category();
        category.setId(1L);
        category.setName("Món chính");

        sampleProduct = new Product();
        sampleProduct.setId(1L);
        sampleProduct.setTitle("Gà rán giòn");
        sampleProduct.setDescription("Gà rán giòn thơm ngon");
        sampleProduct.setPrice(45000.0);
        sampleProduct.setImage("ga-ran.jpg");
        sampleProduct.setCategory(category);
        sampleProduct.setStatus(1);
    }

    @Test
    void testGetAllProducts_ReturnsProductList() throws Exception {
        List<Product> products = Arrays.asList(sampleProduct);
        Mockito.when(productService.getAllActiveProducts()).thenReturn(products);

        mockMvc.perform(get("/api/v1/admin/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Gà rán giòn"))
                .andExpect(jsonPath("$[0].price").value(45000.0));
    }

    @Test
    void testGetAllProducts_ReturnsEmptyList() throws Exception {
        Mockito.when(productService.getAllActiveProducts()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/admin/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void testCreateProduct_WithImage_ReturnsCreatedProduct() throws Exception {
        Mockito.when(productService.createProduct(any(), anyString())).thenReturn(sampleProduct);

        MockMultipartFile imageFile = new MockMultipartFile(
                "image", "ga-ran.jpg", MediaType.IMAGE_JPEG_VALUE, "fake-image-bytes".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/admin/products")
                .file(imageFile)
                .param("title", "Gà rán giòn")
                .param("description", "Gà rán giòn thơm ngon")
                .param("price", "45000")
                .param("categoryId", "1")
                .param("status", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Gà rán giòn"));
    }

    @Test
    void testCreateProduct_WithoutImage_UsesDefaultImage() throws Exception {
        Mockito.when(productService.createProduct(any(), eq("blank-image.png"))).thenReturn(sampleProduct);

        mockMvc.perform(multipart("/api/v1/admin/products")
                .param("title", "Gà rán giòn")
                .param("description", "Gà rán giòn thơm ngon")
                .param("price", "45000")
                .param("categoryId", "1"))
                .andExpect(status().isOk());
    }

    @Test
    void testCreateProduct_InvalidCategory_ReturnsBadRequest() throws Exception {
        Mockito.when(productService.createProduct(any(), anyString()))
                .thenThrow(new RuntimeException("Không tìm thấy danh mục với ID: 99"));

        mockMvc.perform(multipart("/api/v1/admin/products")
                .param("title", "Test")
                .param("description", "Test desc")
                .param("price", "10000")
                .param("categoryId", "99"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testDeleteProduct_ValidId_ReturnsUpdatedProduct() throws Exception {
        Product deletedProduct = new Product();
        deletedProduct.setId(1L);
        deletedProduct.setStatus(0);

        Mockito.when(productService.softDeleteProduct(1L)).thenReturn(deletedProduct);

        mockMvc.perform(delete("/api/v1/admin/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(0));
    }

    @Test
    void testDeleteProduct_NotFound_ReturnsBadRequest() throws Exception {
        Mockito.when(productService.softDeleteProduct(999L))
                .thenThrow(new RuntimeException("Không tìm thấy sản phẩm với ID: 999"));

        mockMvc.perform(delete("/api/v1/admin/products/999"))
                .andExpect(status().isBadRequest());
    }
}
