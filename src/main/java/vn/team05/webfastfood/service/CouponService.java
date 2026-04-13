package vn.team05.webfastfood.service;

import vn.team05.webfastfood.dto.request.CouponRequest;
import vn.team05.webfastfood.dto.response.ResponseData;
import vn.team05.webfastfood.model.Coupon;

import java.util.List;

public interface CouponService {
    ResponseData<List<Coupon>> getAllCoupons();
    ResponseData<Coupon> createCoupon(CouponRequest request);
    ResponseData<Coupon> updateCoupon(Long id, CouponRequest request);
    ResponseData<Void> deleteCoupon(Long id);
    ResponseData<Coupon> validateCoupon(String code);
}
