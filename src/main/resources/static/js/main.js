// Doi sang dinh dang tien VND
function vnd(price) {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

// Close popup 
const body = document.querySelector("body");
let modalContainer = document.querySelectorAll('.modal');
let modalBox = document.querySelectorAll('.mdl-cnt');
let formLogSign = document.querySelector('.forms');

// Click vùng ngoài sẽ tắt Popup
modalContainer.forEach(item => {
    item.addEventListener('click', closeModal);
});

modalBox.forEach(item => {
    item.addEventListener('click', function (event) {
        event.stopPropagation();
    })
});

function closeModal() {
    modalContainer.forEach(item => {
        item.classList.remove('open');
    });
    console.log(modalContainer)
    body.style.overflow = "auto";
}

function increasingNumber(e) {
    let qty = e.parentNode.querySelector('.input-qty');
    if (parseInt(qty.value) < qty.max) {
        qty.value = parseInt(qty.value) + 1;
    } else {
        qty.value = qty.max;
    }
}

function decreasingNumber(e) {
    let qty = e.parentNode.querySelector('.input-qty');
    if (qty.value > qty.min) {
        qty.value = parseInt(qty.value) - 1;
    } else {
        qty.value = qty.min;
    }
}

//Xem chi tiet san pham
function detailProduct(index) {
    let modal = document.querySelector('.modal.product-detail');
    let products = JSON.parse(localStorage.getItem('products'));
    event.preventDefault();
    let infoProduct = products.find(sp => {
        return sp.id === index;
    })
    let modalHtml = `<div class="modal-header">
    <img class="product-image" src="${infoProduct.img}" alt="">
    </div>
    <div class="modal-body">
        <h2 class="product-title">${infoProduct.title}</h2>
        <div class="product-control">
            <div class="priceBox">
                <span class="current-price">${vnd(infoProduct.price)}</span>
            </div>
            <div class="buttons_added">
                <input class="minus is-form" type="button" value="-" onclick="decreasingNumber(this)">
                <input class="input-qty" max="100" min="1" name="" type="number" value="1">
                <input class="plus is-form" type="button" value="+" onclick="increasingNumber(this)">
            </div>
        </div>
        <p class="product-description">${infoProduct.desc}</p>
    </div>
    <div class="notebox">
            <p class="notebox-title">Ghi chú</p>
            <textarea class="text-note" id="popup-detail-note" placeholder="Nhập thông tin cần lưu ý..."></textarea>
    </div>
    <div class="modal-footer">
        <div class="price-total">
            <span class="thanhtien">Thành tiền</span>
            <span class="price">${vnd(infoProduct.price)}</span>
        </div>
        <div class="modal-footer-control">
            <button class="button-dathangngay" data-product="${infoProduct.id}">Đặt hàng ngay</button>
            <button class="button-dat" id="add-cart" onclick="animationCart()"><i class="fa-light fa-basket-shopping"></i></button>
        </div>
    </div>`;
    document.querySelector('#product-detail-content').innerHTML = modalHtml;
    modal.classList.add('open');
    body.style.overflow = "hidden";
    //Cap nhat gia tien khi tang so luong san pham
    let tgbtn = document.querySelectorAll('.is-form');
    let qty = document.querySelector('.product-control .input-qty');
    let priceText = document.querySelector('.price');
    tgbtn.forEach(element => {
        element.addEventListener('click', () => {
            let price = infoProduct.price * parseInt(qty.value);
            priceText.innerHTML = vnd(price);
        });
    });
    // Them san pham vao gio hang
    let productbtn = document.querySelector('.button-dat');
    productbtn.addEventListener('click', (e) => {
        if (localStorage.getItem('currentuser')) {
            addCart(infoProduct.id);
        } else {
            toast({ title: 'Warning', message: 'Chưa đăng nhập tài khoản !', type: 'warning', duration: 3000 });
        }

    })
    // Mua ngay san pham
    dathangngay();
}

function animationCart() {
    document.querySelector(".count-product-cart").style.animation = "slidein ease 1s"
    setTimeout(() => {
        document.querySelector(".count-product-cart").style.animation = "none"
    }, 1000)
}

// Them SP vao gio hang
function addCart(index) {
    let currentuser = localStorage.getItem('currentuser') ? JSON.parse(localStorage.getItem('currentuser')) : [];
    let soluong = document.querySelector('.input-qty').value;
    let popupDetailNote = document.querySelector('#popup-detail-note').value;
    let note = popupDetailNote == "" ? "Không có ghi chú" : popupDetailNote;
    let productcart = {
        id: index,
        soluong: parseInt(soluong),
        note: note
    }
    let vitri = currentuser.cart.findIndex(item => item.id == productcart.id);
    if (vitri == -1) {
        currentuser.cart.push(productcart);
    } else {
        currentuser.cart[vitri].soluong = parseInt(currentuser.cart[vitri].soluong) + parseInt(productcart.soluong);
    }
    localStorage.setItem('currentuser', JSON.stringify(currentuser));
    updateAmount();
    closeModal();
    // toast({ title: 'Success', message: 'Thêm thành công sản phẩm vào giỏ hàng', type: 'success', duration: 3000 });
}

//Show gio hang
function showCart() {
    if (localStorage.getItem('currentuser') != null) {
        let currentuser = JSON.parse(localStorage.getItem('currentuser'));
        if (currentuser.cart.length != 0) {
            document.querySelector('.gio-hang-trong').style.display = 'none';
            document.querySelector('button.thanh-toan').classList.remove('disabled');
            let productcarthtml = '';
            currentuser.cart.forEach(item => {
                let product = getProduct(item);
                productcarthtml += `<li class="cart-item" data-id="${product.id}">
                <div class="cart-item-info">
                    <p class="cart-item-title">
                        ${product.title}
                    </p>
                    <span class="cart-item-price price" data-price="${product.price}">
                    ${vnd(parseInt(product.price))}
                    </span>
                </div>
                <p class="product-note"><i class="fa-light fa-pencil"></i><span>${product.note}</span></p>
                <div class="cart-item-control">
                    <button class="cart-item-delete" onclick="deleteCartItem(${product.id},this)">Xóa</button>
                    <div class="buttons_added">
                        <input class="minus is-form" type="button" value="-" onclick="decreasingNumber(this)">
                        <input class="input-qty" max="100" min="1" name="" type="number" value="${product.soluong}">
                        <input class="plus is-form" type="button" value="+" onclick="increasingNumber(this)">
                    </div>
                </div>
            </li>`
            });
            document.querySelector('.cart-list').innerHTML = productcarthtml;
            updateCartTotal();
            saveAmountCart();
        } else {
            document.querySelector('.gio-hang-trong').style.display = 'flex'
        }
    }
    let modalCart = document.querySelector('.modal-cart');
    let containerCart = document.querySelector('.cart-container');
    let themmon = document.querySelector('.them-mon');
    modalCart.onclick = function () {
        closeCart();
    }
    themmon.onclick = function () {
        closeCart();
    }
    containerCart.addEventListener('click', (e) => {
        e.stopPropagation();
    })
}

// Delete cart item
function deleteCartItem(id, el) {
    let cartParent = el.parentNode.parentNode;
    cartParent.remove();
    let currentUser = JSON.parse(localStorage.getItem('currentuser'));
    let vitri = currentUser.cart.findIndex(item => item.id = id)
    currentUser.cart.splice(vitri, 1);

    // Nếu trống thì hiển thị giỏ hàng trống
    if (currentUser.cart.length == 0) {
        document.querySelector('.gio-hang-trong').style.display = 'flex';
        document.querySelector('button.thanh-toan').classList.add('disabled');
    }
    localStorage.setItem('currentuser', JSON.stringify(currentUser));
    updateCartTotal();
}

//Update cart total
function updateCartTotal() {
    document.querySelector('.text-price').innerText = vnd(getCartTotal());
}

// Lay tong tien don hang
function getCartTotal() {
    let currentUser = JSON.parse(localStorage.getItem('currentuser'));
    let tongtien = 0;
    if (currentUser != null) {
        currentUser.cart.forEach(item => {
            let product = getProduct(item);
            tongtien += (parseInt(product.soluong) * parseInt(product.price));
        });
    }
    return tongtien;
}

// Get Product 
function getProduct(item) {
    let products = JSON.parse(localStorage.getItem('products'));
    let infoProductCart = products.find(sp => item.id == sp.id)
    let product = {
        ...infoProductCart,
        ...item
    }
    return product;
}

document.addEventListener('DOMContentLoaded', updateAmount);
document.addEventListener('DOMContentLoaded', updateCartTotal);

// Lay so luong hang

function getAmountCart() {
    let currentuser = JSON.parse(localStorage.getItem('currentuser'))
    let amount = 0;
    currentuser.cart.forEach(element => {
        amount += parseInt(element.soluong);
    });
    return amount;
}

//Update Amount Cart 
function updateAmount() {
    if (localStorage.getItem('currentuser') != null) {
        let amount = getAmountCart();
        document.querySelector('.count-product-cart').innerText = amount;
    }
}

// Save Cart Info
function saveAmountCart() {
    let cartAmountbtn = document.querySelectorAll(".cart-item-control .is-form");
    let listProduct = document.querySelectorAll('.cart-item');
    let currentUser = JSON.parse(localStorage.getItem('currentuser'));
    cartAmountbtn.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            let id = listProduct[parseInt(index / 2)].getAttribute("data-id");
            let productId = currentUser.cart.find(item => {
                return item.id == id;
            });
            productId.soluong = parseInt(listProduct[parseInt(index / 2)].querySelector(".input-qty").value);
            localStorage.setItem('currentuser', JSON.stringify(currentUser));
            updateCartTotal();
        })
    });
}

// Open & Close Cart
function openCart() {
    showCart();
    document.querySelector('.modal-cart').classList.add('open');
    body.style.overflow = "hidden";
}

function closeCart() {
    document.querySelector('.modal-cart').classList.remove('open');
    body.style.overflow = "auto";
    updateAmount();
}

// Open Search Advanced
document.querySelector(".filter-btn").addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector(".advanced-search").classList.toggle("open");
    document.getElementById("home-service").scrollIntoView();
})

document.querySelector(".form-search-input").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("home-service").scrollIntoView();
})

function closeSearchAdvanced() {
    document.querySelector(".advanced-search").classList.toggle("open");
}

//Open Search Mobile 
function openSearchMb() {
    document.querySelector(".header-middle-left").style.display = "none";
    document.querySelector(".header-middle-center").style.display = "block";
    document.querySelector(".header-middle-right-item.close").style.display = "block";
    let liItem = document.querySelectorAll(".header-middle-right-item.open");
    for (let i = 0; i < liItem.length; i++) {
        liItem[i].style.setProperty("display", "none", "important")
    }
}

//Close Search Mobile 
function closeSearchMb() {
    document.querySelector(".header-middle-left").style.display = "block";
    document.querySelector(".header-middle-center").style.display = "none";
    document.querySelector(".header-middle-right-item.close").style.display = "none";
    let liItem = document.querySelectorAll(".header-middle-right-item.open");
    for (let i = 0; i < liItem.length; i++) {
        liItem[i].style.setProperty("display", "block", "important")
    }
}

//Signup && Login Form

// Chuyen doi qua lai SignUp & Login 
let signup = document.querySelector('.signup-link');
let login = document.querySelector('.login-link');
let container = document.querySelector('.signup-login .modal-container');
login.addEventListener('click', () => {
    container.classList.add('active');
})

signup.addEventListener('click', () => {
    container.classList.remove('active');
})

let signupbtn = document.getElementById('signup');
let loginbtn = document.getElementById('login');
let formsg = document.querySelector('.modal.signup-login')
signupbtn.addEventListener('click', () => {
    formsg.classList.add('open');
    container.classList.remove('active');
    body.style.overflow = "hidden";
})

loginbtn.addEventListener('click', () => {
    document.querySelector('.form-message-check-login').innerHTML = '';
    formsg.classList.add('open');
    container.classList.add('active');
    body.style.overflow = "hidden";
})

// Dang nhap & Dang ky

// Chức năng đăng ký
let signupButton = document.getElementById('signup-button');
let loginButton = document.getElementById('login-button');
/* Old local storage registration removed to prevent conflict with fetch API in login.js
signupButton.addEventListener('click', () => {
    event.preventDefault();
    let fullNameUser = document.getElementById('fullname').value;
    let phoneUser = document.getElementById('phone-signup').value;
    let passwordUser = document.getElementById('password-signup').value;
    let passwordConfirmation = document.getElementById('password_confirmation').value;
    let checkSignup = document.getElementById('checkbox-signup').checked;
    // Check validate
    if (fullNameUser.length == 0) {
        document.querySelector('.form-message-name').innerHTML = 'Vui lòng nhập họ vâ tên';
        document.getElementById('fullname').focus();
    } else if (fullNameUser.length < 3) {
        document.getElementById('fullname').value = '';
        document.querySelector('.form-message-name').innerHTML = 'Vui lòng nhập họ và tên lớn hơn 3 kí tự';
    } else {
        document.querySelector('.form-message-name').innerHTML = '';
    }
    if (phoneUser.length == 0) {
        document.querySelector('.form-message-phone').innerHTML = 'Vui lòng nhập vào số điện thoại';
    } else if (phoneUser.length != 10) {
        document.querySelector('.form-message-phone').innerHTML = 'Vui lòng nhập vào số điện thoại 10 số';
        document.getElementById('phone-signup').value = '';
    } else {
        document.querySelector('.form-message-phone').innerHTML = '';
    }
    if (passwordUser.length == 0) {
        document.querySelector('.form-message-password').innerHTML = 'Vui lòng nhập mật khẩu';
    } else if (passwordUser.length < 6) {
        document.querySelector('.form-message-password').innerHTML = 'Vui lòng nhập mật khẩu lớn hơn 6 kí tự';
        document.getElementById('password-signup').value = '';
    } else {
        document.querySelector('.form-message-password').innerHTML = '';
    }
    if (passwordConfirmation.length == 0) {
        document.querySelector('.form-message-password-confi').innerHTML = 'Vui lòng nhập lại mật khẩu';
    } else if (passwordConfirmation !== passwordUser) {
        document.querySelector('.form-message-password-confi').innerHTML = 'Mật khẩu không khớp';
        document.getElementById('password_confirmation').value = '';
    } else {
        document.querySelector('.form-message-password-confi').innerHTML = '';
    }
    if (checkSignup != true) {
        document.querySelector('.form-message-checkbox').innerHTML = 'Vui lòng check đăng ký';
    } else {
        document.querySelector('.form-message-checkbox').innerHTML = '';
    }

    if (fullNameUser && phoneUser && passwordUser && passwordConfirmation && checkSignup) {
        if (passwordConfirmation == passwordUser) {
            let user = {
                fullname: fullNameUser,
                phone: phoneUser,
                password: passwordUser,
                address: '',
                email: '',
                status: 1,
                join: new Date(),
                cart: [],
                userType: 0
            }
            let accounts = localStorage.getItem('accounts') ? JSON.parse(localStorage.getItem('accounts')) : [];
            let checkloop = accounts.some(account => {
                return account.phone == user.phone;
            })
            if (!checkloop) {
                accounts.push(user);
                localStorage.setItem('accounts', JSON.stringify(accounts));
                localStorage.setItem('currentuser', JSON.stringify(user));
                toast({ title: 'Thành công', message: 'Tạo thành công tài khoản !', type: 'success', duration: 3000 });
                closeModal();
                kiemtradangnhap();
                updateAmount();
            } else {
                toast({ title: 'Thất bại', message: 'Tài khoản đã tồn tại !', type: 'error', duration: 3000 });
            }
        } else {
            toast({ title: 'Thất bại', message: 'Sai mật khẩu !', type: 'error', duration: 3000 });
        }
    }
}
)
*/

// Dang nhap
// Removed old local storage login function to avoid conflict with new Fetch API login in index.html

// Kiểm tra xem có tài khoản đăng nhập không ?
function kiemtradangnhap() {
    let currentUser = localStorage.getItem('currentuser');
    if (currentUser != null) {
        let user = JSON.parse(currentUser);
        document.querySelector('.auth-container').innerHTML = `<span class="text-dndk">Tài khoản</span>
            <span class="text-tk">${user.fullname} <i class="fa-sharp fa-solid fa-caret-down"></span>`
        document.querySelector('.header-middle-right-menu').innerHTML = `<li><a href="javascript:;" onclick="myAccount()"><i class="fa-light fa-circle-user"></i> Tài khoản của tôi</a></li>
            <li><a href="javascript:;" onclick="orderHistory()"><i class="fa-regular fa-bags-shopping"></i> Đơn hàng đã mua</a></li>
            <li class="border"><a id="logout" href="javascript:;"><i class="fa-light fa-right-from-bracket"></i> Thoát tài khoản</a></li>`
        document.querySelector('#logout').addEventListener('click', logOut)
    }
}

function logOut() {
    // Xóa user và jwtToken khỏi localStorage
    localStorage.removeItem('currentuser');
    localStorage.removeItem('jwtToken');
    window.location = "/";
}

function checkAdmin() {
    let user = JSON.parse(localStorage.getItem('currentuser'));
    if (user && user.userType > 0) {
        let node = document.createElement(`li`);
        node.innerHTML = `<a href="./admin.html"><i class="fa-light fa-gear"></i> Quản lý cửa hàng</a>`
        document.querySelector('.header-middle-right-menu').prepend(node);
    }
}

document.addEventListener('DOMContentLoaded', kiemtradangnhap);
document.addEventListener('DOMContentLoaded', checkAdmin);

// Chuyển đổi trang chủ và trang thông tin tài khoản
function myAccount() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('trangchu').classList.add('hide');
    document.getElementById('order-history').classList.remove('open');
    document.getElementById('account-user').classList.add('open');
    userInfo();
}

// Chuyển đổi trang chủ và trang xem lịch sử đặt hàng 
function orderHistory() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('account-user').classList.remove('open');
    document.getElementById('trangchu').classList.add('hide');
    document.getElementById('order-history').classList.add('open');
    renderOrderProduct();
}

function emailIsValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function userInfo() {
    let user = JSON.parse(localStorage.getItem('currentuser'));
    document.getElementById('infoname').value = user.fullname;
    document.getElementById('infophone').value = user.phone;
    document.getElementById('infoemail').value = user.email;
    document.getElementById('infoaddress').value = user.address;
    if (user.email == undefined) {
        infoemail.value = '';
    }
    if (user.address == undefined) {
        infoaddress.value = '';
    }
}

// Thay doi thong tin
async function changeInformation() {
    let user = JSON.parse(localStorage.getItem('currentuser'));
    let infoname = document.getElementById('infoname');
    let infoemail = document.getElementById('infoemail');
    let infoaddress = document.getElementById('infoaddress');

    if (infoemail.value.length > 0 && !emailIsValid(infoemail.value)) {
        document.querySelector('.inforemail-error').innerHTML = 'Vui lòng nhập lại email!';
        infoemail.value = '';
        return;
    }

    let token = localStorage.getItem('jwtToken');
    try {
        let res = await fetch('/api/v1/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({
                fullName: infoname.value,
                email: infoemail.value,
                address: infoaddress.value
            })
        });
        if (res.ok) {
            // Cập nhật localStorage
            user.fullname = infoname.value;
            user.email = infoemail.value;
            user.address = infoaddress.value;
            localStorage.setItem('currentuser', JSON.stringify(user));
            kiemtradangnhap();
            toast({ title: 'Success', message: 'Cập nhật thông tin thành công !', type: 'success', duration: 3000 });
        } else {
            let msg = await res.text();
            toast({ title: 'Lỗi', message: msg || 'Cập nhật thất bại', type: 'error', duration: 3000 });
        }
    } catch (e) {
        // Fallback: lưu localStorage
        user.fullname = infoname.value;
        if (infoemail.value.length > 0) user.email = infoemail.value;
        if (infoaddress.value.length > 0) user.address = infoaddress.value;
        localStorage.setItem('currentuser', JSON.stringify(user));
        kiemtradangnhap();
        toast({ title: 'Success', message: 'Cập nhật thông tin thành công !', type: 'success', duration: 3000 });
    }
}

// Đổi mật khẩu 
async function changePassword() {
    let passwordCur = document.getElementById('password-cur-info');
    let passwordAfter = document.getElementById('password-after-info');
    let passwordConfirm = document.getElementById('password-comfirm-info');
    let check = true;
    if (passwordCur.value.length == 0) {
        document.querySelector('.password-cur-info-error').innerHTML = 'Vui lòng nhập mật khẩu hiện tại';
        check = false;
    } else {
        document.querySelector('.password-cur-info-error').innerHTML = '';
    }
    if (passwordAfter.value.length == 0) {
        document.querySelector('.password-after-info-error').innerHTML = 'Vui lòn nhập mật khẩu mới';
        check = false;
    } else {
        document.querySelector('.password-after-info-error').innerHTML = '';
    }
    if (passwordConfirm.value.length == 0) {
        document.querySelector('.password-after-comfirm-error').innerHTML = 'Vui lòng nhập mật khẩu xác nhận';
        check = false;
    } else {
        document.querySelector('.password-after-comfirm-error').innerHTML = '';
    }

    if (!check) return;

    if (passwordAfter.value !== passwordConfirm.value) {
        document.querySelector('.password-after-comfirm-error').innerHTML = 'Mật khẩu bạn nhập không trùng khớp';
        return;
    }
    if (passwordAfter.value.length < 6) {
        document.querySelector('.password-after-info-error').innerHTML = 'Vui lòng nhập mật khẩu mới có số ký tự lớn hơn bằng 6';
        return;
    }

    let token = localStorage.getItem('jwtToken');
    try {
        let res = await fetch('/api/v1/profile/change-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({
                currentPassword: passwordCur.value,
                newPassword: passwordAfter.value
            })
        });
        if (res.ok) {
            toast({ title: 'Success', message: 'Đổi mật khẩu thành công !', type: 'success', duration: 3000 });
            passwordCur.value = '';
            passwordAfter.value = '';
            passwordConfirm.value = '';
        } else {
            let msg = await res.text();
            document.querySelector('.password-cur-info-error').innerHTML = msg || 'Đổi mật khẩu thất bại';
        }
    } catch (e) {
        toast({ title: 'Lỗi', message: 'Không thể kết nối server', type: 'error', duration: 3000 });
    }
}

function getProductInfo(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find(item => {
        return item.id == id;
    })
}

// Quan ly don hang
async function renderOrderProduct() {
    let token = localStorage.getItem('jwtToken');
    let orderHistorySection = document.querySelector(".order-history-section");
    orderHistorySection.innerHTML = '<div class="loading-spinner"><i class="fa-light fa-spinner fa-spin"></i> Đang tải đơn hàng...</div>';

    try {
        // Thử gọi API trước
        let response = await fetch('/api/v1/orders/my', {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });

        if (response.ok) {
            let resData = await response.json();
            let orders = resData.data || [];
            renderOrdersFromApi(orders);
            return;
        }
    } catch (e) {
        console.warn('Không thể load đơn hàng từ API, dùng localStorage:', e);
    }

    // Fallback: dùng localStorage
    let currentUser = JSON.parse(localStorage.getItem('currentuser'));
    let order = localStorage.getItem('order') ? JSON.parse(localStorage.getItem('order')) : [];
    let orderHtml = "";
    let arrDonHang = [];
    for (let i = 0; i < order.length; i++) {
        if (order[i].khachhang === currentUser.phone) {
            arrDonHang.push(order[i]);
        }
    }
    if (arrDonHang.length == 0) {
        orderHtml = `<div class="empty-order-section"><img src="./assets/img/empty-order.jpg" alt="" class="empty-order-img"><p>Chưa có đơn hàng nào</p></div>`;
    } else {
        arrDonHang.forEach(item => {
            let productHtml = `<div class="order-history-group">`;
            let chiTietDon = getOrderDetails(item.id);
            chiTietDon.forEach(sp => {
                let infosp = getProductInfo(sp.id);
                productHtml += `<div class="order-history">
                    <div class="order-history-left">
                        <img src="${infosp.img}" alt="">
                        <div class="order-history-info">
                            <h4>${infosp.title}!</h4>
                            <p class="order-history-note"><i class="fa-light fa-pen"></i> ${sp.note}</p>
                            <p class="order-history-quantity">x${sp.soluong}</p>
                        </div>
                    </div>
                    <div class="order-history-right">
                        <div class="order-history-price">
                            <span class="order-history-current-price">${vnd(sp.price)}</span>
                        </div>                         
                    </div>
                </div>`;
            });
            let textCompl = item.trangthai == 1 ? "Đã xử lý" : "Đang xử lý";
            let classCompl = item.trangthai == 1 ? "complete" : "no-complete"
            productHtml += `<div class="order-history-control">
                <div class="order-history-status">
                    <span class="order-history-status-sp ${classCompl}">${textCompl}</span>
                    <button id="order-history-detail" onclick="detailOrder('${item.id}')"><i class="fa-regular fa-eye"></i> Xem chi tiết</button>
                </div>
                <div class="order-history-total">
                    <span class="order-history-total-desc">Tổng tiền: </span>
                    <span class="order-history-toltal-price">${vnd(item.tongtien)}</span>
                </div>
            </div>`
            productHtml += `</div>`;
            orderHtml += productHtml;
        });
    }
    document.querySelector(".order-history-section").innerHTML = orderHtml;
}

function renderOrdersFromApi(orders) {
    let orderHtml = "";
    if (!orders || orders.length == 0) {
        orderHtml = `<div class="empty-order-section"><img src="./assets/img/empty-order.jpg" alt="" class="empty-order-img"><p>Chưa có đơn hàng nào</p></div>`;
    } else {
        orders.forEach(order => {
            let statusClass = '';
            if (order.status == 3) statusClass = 'complete';
            else if (order.status == 4 || order.status == 5) statusClass = 'cancelled';
            else statusClass = 'no-complete';

            let canCancel = order.status == 0;
            let productHtml = `<div class="order-history-group">`;
            
            if (order.items && order.items.length > 0) {
                order.items.forEach(item => {
                    let imgSrc = item.productImage || './assets/img/blank-image.png';
                    if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('/') && !imgSrc.startsWith('./')) {
                        imgSrc = `./assets/img/products/${imgSrc}`;
                    }
                    productHtml += `<div class="order-history">
                        <div class="order-history-left">
                            <img src="${imgSrc}" alt="">
                            <div class="order-history-info">
                                <h4>${item.productTitle || 'Sản phẩm'}</h4>
                                <p class="order-history-note"><i class="fa-light fa-pen"></i> ${item.note || 'Không có ghi chú'}</p>
                                <p class="order-history-quantity">x${item.quantity}</p>
                            </div>
                        </div>
                        <div class="order-history-right">
                            <div class="order-history-price">
                                <span class="order-history-current-price">${vnd(item.price * item.quantity)}</span>
                            </div>
                        </div>
                    </div>`;
                });
            }

            productHtml += `<div class="order-history-control">
                <div class="order-history-status">
                    <span class="order-history-status-sp ${statusClass}">${order.statusText || 'Chờ xử lý'}</span>
                    <button onclick="detailOrderApi(${order.id})"><i class="fa-regular fa-eye"></i> Xem chi tiết</button>
                    ${canCancel ? `<button class="btn-cancel-order" onclick="cancelOrderApi(${order.id})"><i class="fa-regular fa-xmark"></i> Hủy đơn</button>` : ''}
                </div>
                <div class="order-history-total">
                    <span class="order-history-total-desc">Tổng tiền: </span>
                    <span class="order-history-toltal-price">${vnd(order.totalPrice || 0)}</span>
                </div>
            </div>`;
            productHtml += `</div>`;
            orderHtml += productHtml;
        });
    }
    document.querySelector(".order-history-section").innerHTML = orderHtml;
}

// Hủy đơn hàng qua API
async function cancelOrderApi(orderId) {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    let token = localStorage.getItem('jwtToken');
    try {
        let res = await fetch(`/api/v1/orders/${orderId}/cancel`, {
            method: 'PUT',
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });
        if (res.ok) {
            toast({ title: 'Thành công', message: 'Đã hủy đơn hàng', type: 'success', duration: 3000 });
            renderOrderProduct();
        } else {
            let msg = await res.text();
            toast({ title: 'Lỗi', message: msg, type: 'error', duration: 3000 });
        }
    } catch (e) {
        toast({ title: 'Lỗi', message: 'Không thể kết nối server', type: 'error', duration: 3000 });
    }
}

// Xem chi tiết đơn hàng qua API
async function detailOrderApi(orderId) {
    let token = localStorage.getItem('jwtToken');
    try {
        // Lấy từ danh sách orders đã có trong DOM hoặc fetch lại
        let res = await fetch('/api/v1/orders/my', {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });
        if (res.ok) {
            let resData = await res.json();
            let orders = resData.data || [];
            let order = orders.find(o => o.id == orderId);
            if (order) {
                showDetailOrderModal(order);
            }
        }
    } catch (e) {
        console.error('Lỗi xem chi tiết:', e);
    }
}

function showDetailOrderModal(order) {
    document.querySelector(".modal.detail-order").classList.add("open");
    body.style.overflow = "hidden";
    let deliveryInfo = order.deliveryType === 'pickup' 
        ? `Chi nhánh: ${order.branch || order.deliveryAddress || ''}` 
        : order.deliveryAddress || '';
    let detailOrderHtml = `<ul class="detail-order-group">
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> Ngày đặt hàng</span>
            <span class="detail-order-item-right">${formatDate(order.createdAt)}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> Hình thức giao</span>
            <span class="detail-order-item-right">${order.deliveryType === 'pickup' ? 'Tự đến lấy' : 'Giao tận nơi'}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> Ngày nhận hàng</span>
            <span class="detail-order-item-right">${order.deliveryTime ? order.deliveryTime + ' - ' : ''}${order.shippingDate ? formatDate(order.shippingDate) : ''}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-location-dot"></i> Địa điểm nhận</span>
            <span class="detail-order-item-right">${deliveryInfo}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> Người nhận</span>
            <span class="detail-order-item-right">${order.recipientName || ''}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> Số điện thoại nhận</span>
            <span class="detail-order-item-right">${order.recipientPhone || ''}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-tag"></i> Trạng thái</span>
            <span class="detail-order-item-right">${order.statusText || ''}</span>
        </li>
    </ul>`
    document.querySelector(".detail-order-content").innerHTML = detailOrderHtml;
}

// Get Order Details
function getOrderDetails(madon) {
    let orderDetails = localStorage.getItem("orderDetails") ? JSON.parse(localStorage.getItem("orderDetails")) : [];
    let ctDon = [];
    orderDetails.forEach(item => {
        if (item.madon == madon) {
            ctDon.push(item);
        }
    });
    return ctDon;
}

// Format Date
function formatDate(date) {
    let fm = new Date(date);
    let yyyy = fm.getFullYear();
    let mm = fm.getMonth() + 1;
    let dd = fm.getDate();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    return dd + '/' + mm + '/' + yyyy;
}

// Xem chi tiet don hang
function detailOrder(id) {
    let order = JSON.parse(localStorage.getItem("order"));
    let detail = order.find(item => {
        return item.id == id;
    })
    document.querySelector(".modal.detail-order").classList.add("open");
    let detailOrderHtml = `<ul class="detail-order-group">
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> Ngày đặt hàng</span>
            <span class="detail-order-item-right">${formatDate(detail.thoigiandat)}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> Hình thức giao</span>
            <span class="detail-order-item-right">${detail.hinhthucgiao}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> Ngày nhận hàng</span>
            <span class="detail-order-item-right">${(detail.thoigiangiao == "" ? "" : (detail.thoigiangiao + " - ")) + formatDate(detail.ngaygiaohang)}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-location-dot"></i> Địa điểm nhận</span>
            <span class="detail-order-item-right">${detail.diachinhan}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> Người nhận</span>
            <span class="detail-order-item-right">${detail.tenguoinhan}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> Số điện thoại nhận</span>
            <span class="detail-order-item-right">${detail.sdtnhan}</span>
        </li>
    </ul>`
    document.querySelector(".detail-order-content").innerHTML = detailOrderHtml;
}

// Create id order 
function createId(arr) {
    let id = arr.length + 1;
    let check = arr.find(item => item.id == "DH" + id)
    while (check != null) {
        id++;
        check = arr.find(item => item.id == "DH" + id)
    }
    return "DH" + id;
}

// Back to top
window.onscroll = () => {
    let backtopTop = document.querySelector(".back-to-top")
    if (document.documentElement.scrollTop > 100) {
        backtopTop.classList.add("active");
    } else {
        backtopTop.classList.remove("active");
    }
}

// Auto hide header on scroll
const headerNav = document.querySelector(".header-bottom");
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
    if (lastScrollY < window.scrollY) {
        headerNav.classList.add("hide")
    } else {
        headerNav.classList.remove("hide")
    }
    lastScrollY = window.scrollY;
})

// Page
function renderProducts(showProduct) {
    let productHtml = '';
    if (showProduct.length == 0) {
        document.getElementById("home-title").style.display = "none";
        productHtml = `<div class="no-result"><div class="no-result-h">Tìm kiếm không có kết quả</div><div class="no-result-p">Xin lỗi, chúng tôi không thể tìm được kết quả hợp với tìm kiếm của bạn</div><div class="no-result-i"><i class="fa-light fa-face-sad-cry"></i></div></div>`;
    } else {
        document.getElementById("home-title").style.display = "block";
        showProduct.forEach((product) => {
            productHtml += `<div class="col-product">
            <article class="card-product" >
                <div class="card-header">
                    <a href="#" class="card-image-link" onclick="detailProduct(${product.id})">
                    <img class="card-image" src="${product.img}" alt="${product.title}">
                    </a>
                </div>
                <div class="food-info">
                    <div class="card-content">
                        <div class="card-title">
                            <a href="#" class="card-title-link" onclick="detailProduct(${product.id})">${product.title}</a>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="product-price">
                            <span class="current-price">${vnd(product.price)}</span>
                        </div>
                    <div class="product-buy">
                        <button onclick="detailProduct(${product.id})" class="card-button order-item"><i class="fa-regular fa-cart-shopping-fast"></i> Đặt món</button>
                    </div> 
                </div>
                </div>
            </article>
        </div>`;
        });
    }
    document.getElementById('home-products').innerHTML = productHtml;
}

// Find Product
var productAll = [];
if (localStorage.getItem('products') != null) {
    productAll = JSON.parse(localStorage.getItem('products')).filter(item => item.status == 1);
}
function searchProducts(mode) {
    let valeSearchInput = document.querySelector('.form-search-input').value;
    let valueCategory = document.getElementById("advanced-search-category-select").value;
    let minPrice = document.getElementById("min-price").value;
    let maxPrice = document.getElementById("max-price").value;
    if (parseInt(minPrice) > parseInt(maxPrice) && minPrice != "" && maxPrice != "") {
        alert("Giá đã nhập sai !");
    }

    let result = valueCategory == "Tất cả" ? productAll : productAll.filter((item) => {
        return item.category == valueCategory;
    });

    result = valeSearchInput == "" ? result : result.filter(item => {
        return item.title.toString().toUpperCase().includes(valeSearchInput.toString().toUpperCase());
    })

    if (minPrice == "" && maxPrice != "") {
        result = result.filter((item) => item.price <= maxPrice);
    } else if (minPrice != "" && maxPrice == "") {
        result = result.filter((item) => item.price >= minPrice);
    } else if (minPrice != "" && maxPrice != "") {
        result = result.filter((item) => item.price <= maxPrice && item.price >= minPrice);
    }

    document.getElementById("home-service").scrollIntoView();
    switch (mode) {
        case 0:
            result = JSON.parse(localStorage.getItem('products'));;
            document.querySelector('.form-search-input').value = "";
            document.getElementById("advanced-search-category-select").value = "Tất cả";
            document.getElementById("min-price").value = "";
            document.getElementById("max-price").value = "";
            break;
        case 1:
            result.sort((a, b) => a.price - b.price)
            break;
        case 2:
            result.sort((a, b) => b.price - a.price)
            break;
    }
    showHomeProduct(result)
}

// Phân trang 
let perPage = 12;
let currentPage = 1;
let totalPage = 0;
let perProducts = [];

function displayList(productAll, perPage, currentPage) {
    let start = (currentPage - 1) * perPage;
    let end = (currentPage - 1) * perPage + perPage;
    let productShow = productAll.slice(start, end);
    renderProducts(productShow);
}

async function showHomeProduct(products) {
    // Nếu không truyền mảng sản phẩm, mặc định sẽ Fetch móc thẳng từ API ra
    if (!products) {
        try {
            let response = await fetch('http://localhost:8080/api/v1/products');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            let resData = await response.json();
            let apiData = resData.data || [];
            
            products = apiData.map(p => {
                return {
                    id: p.id,
                    status: p.status,
                    title: p.title,
                    img: p.image && (p.image.includes('http') || p.image.includes('assets')) ? p.image : `./assets/img/products/${p.image}`,
                    category: p.categoryName || '',
                    price: p.price,
                    desc: p.description || ''
                };
            });
            
            // Lưu đè lại vào localstorage để các hàm khác (giỏ hàng, mua hàng...) dùng
            localStorage.setItem('products', JSON.stringify(products));
        } catch (error) {
            console.error("Lỗi khi fetch data từ API:", error);
            products = JSON.parse(localStorage.getItem('products')) || [];
        }
        
        // Cập nhật lại mảng danh sách cho chức năng tìm kiếm
        productAll = products.filter(item => item.status == 1);
    }
    
    let activeProducts = products.filter(item => item.status == 1);
    displayList(activeProducts, perPage, currentPage);
    setupPagination(activeProducts, perPage, currentPage);
}

window.onload = () => {
    showHomeProduct();
}

function setupPagination(productAll, perPage) {
    document.querySelector('.page-nav-list').innerHTML = '';
    let page_count = Math.ceil(productAll.length / perPage);
    for (let i = 1; i <= page_count; i++) {
        let li = paginationChange(i, productAll, currentPage);
        document.querySelector('.page-nav-list').appendChild(li);
    }
}

function paginationChange(page, productAll, currentPage) {
    let node = document.createElement(`li`);
    node.classList.add('page-nav-item');
    node.innerHTML = `<a href="javascript:;">${page}</a>`;
    if (currentPage == page) node.classList.add('active');
    node.addEventListener('click', function () {
        currentPage = page;
        displayList(productAll, perPage, currentPage);
        let t = document.querySelectorAll('.page-nav-item.active');
        for (let i = 0; i < t.length; i++) {
            t[i].classList.remove('active');
        }
        node.classList.add('active');
        document.getElementById("home-service").scrollIntoView();
    })
    return node;
}

// Hiển thị chuyên mục
function showCategory(category) {
    document.getElementById('trangchu').classList.remove('hide');
    document.getElementById('account-user').classList.remove('open');
    document.getElementById('order-history').classList.remove('open');
    let productSearch = productAll.filter(value => {
        return value.category.toString().toUpperCase().includes(category.toUpperCase());
    })
    let currentPageSeach = 1;
    displayList(productSearch, perPage, currentPageSeach);
    setupPagination(productSearch, perPage, currentPageSeach);
    document.getElementById("home-title").scrollIntoView();
}


