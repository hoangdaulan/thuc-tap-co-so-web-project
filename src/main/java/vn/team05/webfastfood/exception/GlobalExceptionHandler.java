// package: vn.team05.webfastfood.exception
package vn.team05.webfastfood.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import vn.team05.webfastfood.dto.response.ResponseData;

import java.util.HashMap;
import java.util.Map;

/**
 * Global Exception Handler cho toàn bộ ứng dụng.
 * Thay đổi: Thêm handler cho RuntimeException vì các Controller không còn try/catch,
 * tất cả RuntimeException từ Service sẽ được bắt tại đây.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ResponseData<Void>> handleBadCredentials(BadCredentialsException ignored) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ResponseData<>(HttpStatus.UNAUTHORIZED.value(), "Tên đăng nhập hoặc mật khẩu không chính xác!"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseData<Map<String, String>>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        String message = fieldErrors.values().stream().findFirst().orElse("Dữ liệu không hợp lệ");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseData<>(HttpStatus.BAD_REQUEST.value(), message, fieldErrors));
    }

    /**
     * Bắt tất cả RuntimeException từ tầng Service.
     * Trước đây các Controller tự try/catch và trả về ResponseEntity.badRequest(),
     * giờ chuyển về đây để xử lý tập trung.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ResponseData<Void>> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseData<>(HttpStatus.BAD_REQUEST.value(), ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseData<Void>> handleGenericException(Exception ignored) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseData<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Lỗi máy chủ, vui lòng thử lại sau."));
    }
}
