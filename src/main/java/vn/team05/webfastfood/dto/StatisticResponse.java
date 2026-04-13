package vn.team05.webfastfood.dto;

import java.util.List;

public class StatisticResponse {
    private int totalUniqueProducts;
    private long totalQuantity;
    private double totalRevenue;
    private List<StatisticDTO> details;

    public int getTotalUniqueProducts() {
        return totalUniqueProducts;
    }

    public void setTotalUniqueProducts(int totalUniqueProducts) {
        this.totalUniqueProducts = totalUniqueProducts;
    }

    public long getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(long totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public List<StatisticDTO> getDetails() {
        return details;
    }

    public void setDetails(List<StatisticDTO> details) {
        this.details = details;
    }
}

