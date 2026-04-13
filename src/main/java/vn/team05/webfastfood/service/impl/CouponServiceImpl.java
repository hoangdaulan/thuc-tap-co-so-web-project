package vn.team05.webfastfood.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import vn.team05.webfastfood.dto.request.CouponRequest;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.model.Coupon;
import vn.team05.webfastfood.repository.CouponRepository;
import vn.team05.webfastfood.service.CouponService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    @Override
    public ResponseData<List<Coupon>> getAllCoupons() {
        List<Coupon> coupons = couponRepository.findAll();
        return new ResponseData<>(HttpStatus.OK.value(), "Lấy danh sách thành công", coupons);
    }

    @Override
    public ResponseData<Coupon> createCoupon(CouponRequest request) {
        if (couponRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("Mã giảm giá đã tồn tại");
        }
        Coupon coupon = new Coupon();
        coupon.setCode(request.getCode());
        coupon.setDiscountPercentage(request.getDiscountPercentage());
        if (request.getDaysValid() != null && request.getDaysValid() > 0) {
            coupon.setExpirationDate(LocalDateTime.now().plusDays(request.getDaysValid()));
        }
        if (request.getIsActive() != null) {
            coupon.setIsActive(request.getIsActive());
        } else {
            coupon.setIsActive(true);
        }
        coupon = couponRepository.save(coupon);
        return new ResponseData<>(HttpStatus.OK.value(), "Tạo mã giảm giá thành công", coupon);
    }

    @Override
    public ResponseData<Coupon> updateCoupon(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá"));
        
        if (request.getCode() != null && !request.getCode().equals(coupon.getCode())) {
            if (couponRepository.findByCode(request.getCode()).isPresent()) {
                throw new RuntimeException("Mã giảm giá đã tồn tại");
            }
            coupon.setCode(request.getCode());
        }
        if (request.getDiscountPercentage() != null) {
            coupon.setDiscountPercentage(request.getDiscountPercentage());
        }
        if (request.getIsActive() != null) {
            coupon.setIsActive(request.getIsActive());
        }
        if (request.getDaysValid() != null) {
            if (request.getDaysValid() > 0) {
                coupon.setExpirationDate(LocalDateTime.now().plusDays(request.getDaysValid()));
            } else {
                coupon.setExpirationDate(null);
            }
        }
        coupon = couponRepository.save(coupon);
        return new ResponseData<>(HttpStatus.OK.value(), "Cập nhật mã giảm giá thành công", coupon);
    }

    @Override
    public ResponseData<Void> deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá"));
        couponRepository.delete(coupon);
        return new ResponseData<>(HttpStatus.OK.value(), "Xóa mã giảm giá thành công", null);
    }

    @Override
    public ResponseData<Coupon> validateCoupon(String code) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại"));

        if (!coupon.getIsActive()) {
            throw new RuntimeException("Mã giảm giá không còn hoạt động");
        }
        if (coupon.getExpirationDate() != null && coupon.getExpirationDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã giảm giá đã hết hạn");
        }
        
        return new ResponseData<>(HttpStatus.OK.value(), "Mã giảm giá hợp lệ", coupon);
    }
}
