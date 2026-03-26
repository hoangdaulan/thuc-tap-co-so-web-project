document.addEventListener("DOMContentLoaded", function () {
    // Logic xử lý form đăng ký
    const signupForm = document.getElementById("signupFormId");
    if (signupForm) {
        signupForm.addEventListener("submit", function (e) {
            e.preventDefault(); // Ngăn hành vi submit form mặc định

            const fullNameInput = signupForm.querySelector("#fullname");
            const phoneInput = signupForm.querySelector("#phone-signup");
            const passwordInput = signupForm.querySelector("#password-signup");
            const passwordConfirmInput = signupForm.querySelector("#password_confirmation");

            if (passwordInput.value !== passwordConfirmInput.value) {
                toast({ title: 'Error', message: 'Mật khẩu và Nhập lại mật khẩu không khớp!', type: 'error', duration: 3000 });
                return;
            }

            const registerData = {
                fullName: fullNameInput.value,
                phone: phoneInput.value,
                password: passwordInput.value
            };

            // Gọi API đăng ký bằng Fetch API
            fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(registerData)
            })
                .then(response => {
                    if (response.ok) {
                        toast({ title: 'Success', message: 'Đăng ký thành công !', type: 'success', duration: 3000 });
                        signupForm.reset();
                        // Đóng modal
                        const modal = document.querySelector(".modal.signup-login");
                        if (modal) {
                            modal.classList.remove("open");
                        }
                        // Tuỳ chọn: redirect hoặc cho phép user đăng nhập tiếp, ở đây ta có thể refresh hoặc đóng popup
                        window.location.reload();
                    } else if (response.status === 400) {
                        throw new Error("Số điện thoại đã tồn tại!");
                    } else {
                        throw new Error("Đăng ký thất bại!");
                    }
                })
                .catch(error => {
                    console.error("Lỗi đăng ký:", error);
                    toast({ title: 'Error', message: error.message, type: 'error', duration: 3000 });
                });
        });
    }

    // Logic xử lý form đăng nhập
    const loginForm = document.getElementById("loginFormId");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault(); // Ngăn hành vi submit form mặc định

            const usernameInput = loginForm.querySelector("#username");
            const passwordInput = loginForm.querySelector("#password");
            const messageSpan = loginForm.querySelector(".form-message-check-login");

            if (messageSpan) messageSpan.innerText = ""; // Xóa lỗi cũ

            const loginData = {
                username: usernameInput.value,
                password: passwordInput.value
            };

            // Gọi API đăng nhập bằng Fetch API
            fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData)
            })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else if (response.status === 401 || response.status === 403) {
                        throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác!");
                    } else {
                        throw new Error("Lỗi máy chủ! Vui lòng thử lại sau.");
                    }
                })
                .then(data => {
                    // Lưu JWT token vào localStorage nếu đăng nhập thành công
                    if (data && data.token) {
                        localStorage.setItem("jwtToken", data.token);
                        if (data.user) {
                            localStorage.setItem("currentuser", JSON.stringify(data.user));
                        }

                        // Có thể sử dụng hàm toast() nếu có trong hệ thống, ở đây dùng alert
                        toast({ title: 'Success', message: 'Đăng nhập thành công !', type: 'success', duration: 3000 });

                        // Đóng modal đăng nhập
                        const modal = document.querySelector(".modal.signup-login");
                        if (modal) {
                            modal.classList.remove("open");
                        }

                        // Tuỳ chọn: reload trang hoặc redirect
                        window.location.reload();
                    }
                })
                .catch(error => {
                    console.error("Lỗi đăng nhập:", error);
                    if (messageSpan) {
                        messageSpan.innerText = error.message;
                        messageSpan.style.color = "red";
                    } else {
                        toast({ title: 'Error', message: error.message, type: 'error', duration: 3000 });
                    }
                });
        });
    }
});