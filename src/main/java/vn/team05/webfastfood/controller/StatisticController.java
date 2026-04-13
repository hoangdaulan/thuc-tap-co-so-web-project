package vn.team05.webfastfood.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.team05.webfastfood.dto.StatisticDTO;
import vn.team05.webfastfood.dto.StatisticResponse;
import vn.team05.webfastfood.repository.OrderItemRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticController {
    private final OrderItemRepository orderItemRepository;

    @GetMapping
    public ResponseEntity<StatisticResponse> getStats(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime start = (startDate != null) ? startDate.atStartOfDay() : null;
        LocalDateTime end = (endDate != null) ? endDate.atTime(LocalTime.MAX) : null;

        List<StatisticDTO> list = orderItemRepository.getRevenueStatistics(categoryId, keyword, start, end);
        list.sort((a, b) -> Double.compare(b.getTotalRevenue(), a.getTotalRevenue()));

        StatisticResponse response = new StatisticResponse();
        response.setDetails(list);
        response.setTotalUniqueProducts(list.size());
        response.setTotalQuantity(list.stream().mapToLong(StatisticDTO::getTotalQuantitySold).sum());
        response.setTotalRevenue(list.stream().mapToDouble(StatisticDTO::getTotalRevenue).sum());

        return ResponseEntity.ok(response);
    }
}

