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
                .then(async response => {
                    const payload = await response.json().catch(() => ({}));
                    if (!response.ok) {
                        throw new Error(payload.message || "Đăng ký thất bại!");
                    }

                    toast({ title: 'Success', message: payload.message || 'Đăng ký thành công !', type: 'success', duration: 3000 });
                    signupForm.reset();

                    // Đóng modal
                    const modal = document.querySelector(".modal.signup-login");
                    if (modal) {
                        modal.classList.remove("open");
                    }

                    // Tuỳ chọn: reload hoặc cho phép người dùng đăng nhập tiếp
                    window.location.reload();
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
                .then(async response => {
                    const payload = await response.json().catch(() => ({}));
                    if (!response.ok) {
                        throw new Error(payload.message || "Lỗi máy chủ! Vui lòng thử lại sau.");
                    }
                    return payload;
                })
                .then(payload => {
                    const authData = payload && payload.data ? payload.data : null;

                    // Lưu JWT token vào localStorage nếu đăng nhập thành công
                    if (authData && authData.token) {
                        localStorage.setItem("jwtToken", authData.token);
                        if (authData.user) {
                            localStorage.setItem("currentuser", JSON.stringify(authData.user));
                        }

                        toast({ title: 'Success', message: payload.message || 'Đăng nhập thành công !', type: 'success', duration: 3000 });

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