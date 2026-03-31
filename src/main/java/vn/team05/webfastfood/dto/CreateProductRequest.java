package vn.team05.webfastfood.dto;

/**
 * DTO nhận dữ liệu tạo sản phẩm mới từ admin form.
 * Ảnh được xử lý riêng dưới dạng MultipartFile trong Controller.
 */
public class CreateProductRequest {

    private String title;
    private String description;
    private Double price;
    private Long categoryId;
    private Integer status = 1; // mặc định Active

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
}
