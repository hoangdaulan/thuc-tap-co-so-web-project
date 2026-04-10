const PHIVANCHUYEN = 30000;
let priceFinal = document.getElementById("checkout-cart-price-final");
// Trang thanh toan
function thanhtoanpage(option,product) {
    // Xu ly ngay nhan hang
    let today = new Date();
    let ngaymai = new Date();
    let ngaykia = new Date();
    ngaymai.setDate(today.getDate() + 1);
    ngaykia.setDate(today.getDate() + 2);
    let dateorderhtml = `<a href="javascript:;" class="pick-date active" data-date="${today.toISOString()}">
        <span class="text">Hôm nay</span>
        <span class="date">${today.getDate()}/${today.getMonth() + 1}</span>
        </a>
        <a href="javascript:;" class="pick-date" data-date="${ngaymai.toISOString()}">
            <span class="text">Ngày mai</span>
            <span class="date">${ngaymai.getDate()}/${ngaymai.getMonth() + 1}</span>
        </a>

        <a href="javascript:;" class="pick-date" data-date="${ngaykia.toISOString()}">
            <span class="text">Ngày kia</span>
            <span class="date">${ngaykia.getDate()}/${ngaykia.getMonth() + 1}</span>
    </a>`
    document.querySelector('.date-order').innerHTML = dateorderhtml;
    let pickdate = document.getElementsByClassName('pick-date')
    for(let i = 0; i < pickdate.length; i++) {
        pickdate[i].onclick = function () {
            document.querySelector(".pick-date.active").classList.remove("active");
            this.classList.add('active');
        }
    }

    // Điền thông tin người dùng vào form
    let currentUser = localStorage.getItem('currentuser') ? JSON.parse(localStorage.getItem('currentuser')) : null;
    if (currentUser) {
        let tennguoinhan = document.querySelector("#tennguoinhan");
        let sdtnhan = document.querySelector("#sdtnhan");
        let diachinhan = document.querySelector("#diachinhan");
        if (tennguoinhan && !tennguoinhan.value) tennguoinhan.value = currentUser.fullname || '';
        if (sdtnhan && !sdtnhan.value) sdtnhan.value = currentUser.phone || '';
        if (diachinhan && !diachinhan.value) diachinhan.value = currentUser.address || '';
    }

    let totalBillOrder = document.querySelector('.total-bill-order');
    let totalBillOrderHtml;
    // Xu ly don hang
    switch (option) {
        case 1: // Truong hop thanh toan san pham trong gio
            // Hien thi don hang
            showProductCart();
            // Tinh tien
            totalBillOrderHtml = `<div class="priceFlx">
            <div class="text">
                Tiền hàng 
                <span class="count">${getAmountCart()} món</span>
            </div>
            <div class="price-detail">
                <span id="checkout-cart-total">${vnd(getCartTotal())}</span>
            </div>
        </div>
        <div class="priceFlx chk-ship">
            <div class="text">Phí vận chuyển</div>
            <div class="price-detail chk-free-ship">
                <span>${vnd(PHIVANCHUYEN)}</span>
            </div>
        </div>`;
            // Tong tien
            priceFinal.innerText = vnd(getCartTotal() + PHIVANCHUYEN);
            break;
        case 2: // Truong hop mua ngay
            // Hien thi san pham
            showProductBuyNow(product);
            // Tinh tien
            totalBillOrderHtml = `<div class="priceFlx">
                <div class="text">
                    Tiền hàng 
                    <span class="count">${product.soluong} món</span>
                </div>
                <div class="price-detail">
                    <span id="checkout-cart-total">${vnd(product.soluong * product.price)}</span>
                </div>
            </div>
            <div class="priceFlx chk-ship">
                <div class="text">Phí vận chuyển</div>
                <div class="price-detail chk-free-ship">
                    <span>${vnd(PHIVANCHUYEN)}</span>
                </div>
            </div>`
            // Tong tien
            priceFinal.innerText = vnd((product.soluong * product.price) + PHIVANCHUYEN);
            break;
    }

    // Tinh tien
    totalBillOrder.innerHTML = totalBillOrderHtml;

    // Xu ly hinh thuc giao hang
    let giaotannoi = document.querySelector('#giaotannoi');
    let tudenlay = document.querySelector('#tudenlay');
    let tudenlayGroup = document.querySelector('#tudenlay-group');
    let chkShip = document.querySelectorAll(".chk-ship");
    
    tudenlay.addEventListener('click', () => {
        giaotannoi.classList.remove("active");
        tudenlay.classList.add("active");
        chkShip.forEach(item => {
            item.style.display = "none";
        });
        tudenlayGroup.style.display = "block";
        switch (option) {
            case 1:
                priceFinal.innerText = vnd(getCartTotal());
                break;
            case 2:
                priceFinal.innerText = vnd((product.soluong * product.price));
                break;
        }
    })

    giaotannoi.addEventListener('click', () => {
        tudenlay.classList.remove("active");
        giaotannoi.classList.add("active");
        tudenlayGroup.style.display = "none";
        chkShip.forEach(item => {
            item.style.display = "flex";
        });
        switch (option) {
            case 1:
                priceFinal.innerText = vnd(getCartTotal() + PHIVANCHUYEN);
                break;
            case 2:
                priceFinal.innerText = vnd((product.soluong * product.price) + PHIVANCHUYEN);
                break;
        }
    })

    // Su kien khu nhan nut dat hang
    document.querySelector(".complete-checkout-btn").onclick = () => {
        switch (option) {
            case 1:
                xulyDathang();
                break;
            case 2:
                xulyDathang(product);
                break;
        }
    }
}

// Hien thi hang trong gio
function showProductCart() {
    let currentuser = JSON.parse(localStorage.getItem('currentuser'));
    let listOrder = document.getElementById("list-order-checkout");
    let listOrderHtml = '';
    currentuser.cart.forEach(item => {
        let product = getProduct(item);
        listOrderHtml += `<div class="food-total">
        <div class="count">${product.soluong}x</div>
        <div class="info-food">
            <div class="name-food">${product.title}</div>
        </div>
    </div>`
    })
    listOrder.innerHTML = listOrderHtml;
}

// Hien thi hang mua ngay
function showProductBuyNow(product) {
    let listOrder = document.getElementById("list-order-checkout");
    let listOrderHtml = `<div class="food-total">
        <div class="count">${product.soluong}x</div>
        <div class="info-food">
            <div class="name-food">${product.title}</div>
        </div>
    </div>`;
    listOrder.innerHTML = listOrderHtml;
}

//Open Page Checkout
let nutthanhtoan = document.querySelector('.thanh-toan')
let checkoutpage = document.querySelector('.checkout-page');
nutthanhtoan.addEventListener('click', () => {
    checkoutpage.classList.add('active');
    thanhtoanpage(1);
    closeCart();
    body.style.overflow = "hidden"
})

// Đặt hàng ngay
function dathangngay() {
    let productInfo = document.getElementById("product-detail-content");
    let datHangNgayBtn = productInfo.querySelector(".button-dathangngay");
    datHangNgayBtn.onclick = () => {
        if(localStorage.getItem('currentuser')) {
            let productId = datHangNgayBtn.getAttribute("data-product");
            let soluong = parseInt(productInfo.querySelector(".buttons_added .input-qty").value);
            let notevalue = productInfo.querySelector("#popup-detail-note").value;
            let ghichu = notevalue == "" ? "Không có ghi chú" : notevalue;
            let products = JSON.parse(localStorage.getItem('products'));
            let a = products.find(item => item.id == productId);
            a.soluong = parseInt(soluong);
            a.note = ghichu;
            checkoutpage.classList.add('active');
            thanhtoanpage(2,a);
            closeCart();
            body.style.overflow = "hidden"
        } else {
            toast({ title: 'Warning', message: 'Chưa đăng nhập tài khoản !', type: 'warning', duration: 3000 });
        }
    }
}

// Close Page Checkout
function closecheckout() {
    checkoutpage.classList.remove('active');
    body.style.overflow = "auto"
}

// Thong tin cac don hang da mua - Xu ly khi nhan nut dat hang
async function xulyDathang(product) {
    let diachinhan = "";
    let hinhthucgiao = "";
    let thoigiangiao = "";
    let deliveryType = "delivery";
    let giaotannoi = document.querySelector("#giaotannoi");
    let tudenlay = document.querySelector("#tudenlay");
    let giaongay = document.querySelector("#giaongay");
    let giaovaogio = document.querySelector("#deliverytime");
    let currentUser = JSON.parse(localStorage.getItem('currentuser'));
    
    // Hinh thuc giao & Dia chi nhan hang
    if(giaotannoi.classList.contains("active")) {
        diachinhan = document.querySelector("#diachinhan").value;
        hinhthucgiao = "Giao tận nơi";
        deliveryType = "delivery";
    }
    if(tudenlay.classList.contains("active")){
        deliveryType = "pickup";
        let chinhanh1 = document.querySelector("#chinhanh-1");
        let chinhanh2 = document.querySelector("#chinhanh-2");
        if(chinhanh1.checked) {
            diachinhan = "273 An Dương Vương, Phường 3, Quận 5";
        }
        if(chinhanh2.checked) {
            diachinhan = "04 Tôn Đức Thắng, Phường Bến Nghé, Quận 1";
        }
        hinhthucgiao = "Tự đến lấy";
    }

    // Thoi gian nhan hang
    if(giaongay.checked) {
        thoigiangiao = "Giao ngay khi xong";
    }

    if(giaovaogio.checked) {
        thoigiangiao = document.querySelector(".choise-time").value;
    }

    let tennguoinhan = document.querySelector("#tennguoinhan").value;
    let sdtnhan = document.querySelector("#sdtnhan").value;
    let ghichu = document.querySelector(".note-order").value;
    let shippingDate = document.querySelector(".pick-date.active").getAttribute("data-date");

    if(tennguoinhan == "" || sdtnhan == "" || diachinhan == "") {
        toast({ title: 'Chú ý', message: 'Vui lòng nhập đầy đủ thông tin !', type: 'warning', duration: 4000 });
        return;
    }

    // Xây dựng danh sách items
    let items = [];
    if(product == undefined) {
        // Đặt từ giỏ hàng
        currentUser.cart.forEach(item => {
            items.push({
                productId: parseInt(item.id),
                quantity: parseInt(item.soluong),
                note: item.note || ""
            });
        });
    } else {
        // Đặt ngay 1 sản phẩm
        items.push({
            productId: parseInt(product.id),
            quantity: parseInt(product.soluong),
            note: product.note || ""
        });
    }

    let requestBody = {
        note: ghichu,
        paymentMethod: "cod",
        shippingDate: shippingDate,
        deliveryType: deliveryType,
        recipientName: tennguoinhan,
        recipientPhone: sdtnhan,
        deliveryAddress: diachinhan,
        deliveryTime: thoigiangiao,
        items: items
    };

    try {
        let token = localStorage.getItem('jwtToken');
        let response = await fetch('/api/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            // Xóa giỏ hàng nếu đặt từ giỏ
            if (product == undefined || product == null) {
                currentUser.cart = [];
                localStorage.setItem('currentuser', JSON.stringify(currentUser));
            }
            toast({ title: 'Thành công', message: 'Đặt hàng thành công !', type: 'success', duration: 2000 });
            setTimeout(() => {
                window.location = "/";
            }, 2000);
        } else {
            let errMsg = await response.text();
            toast({
                title: 'Lỗi',
                message: errMsg || 'Đặt hàng thất bại, vui lòng đăng nhập lại và thử lại.',
                type: 'error',
                duration: 3500
            });
        }
    } catch (error) {
        console.error('Lỗi đặt hàng API:', error);
        // Chỉ fallback khi lỗi mạng hoặc backend không truy cập được.
        xulyDathangLocal(product, currentUser, items, requestBody);
    }
}

// Fallback: lưu đơn hàng vào localStorage nếu API không hoạt động
function xulyDathangLocal(product, currentUser, apiItems, requestBody) {
    let orderDetails = localStorage.getItem("orderDetails") ? JSON.parse(localStorage.getItem("orderDetails")) : [];
    let order = localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")) : [];
    let madon = createId(order);
    let tongtien = 0;

    if(product == undefined) {
        currentUser.cart.forEach(item => {
            let localItem = {
                ...item,
                madon: madon,
                price: getpriceProduct(item.id)
            };
            tongtien += localItem.price * localItem.soluong;
            orderDetails.push(localItem);
        });
    } else {
        let localItem = {
            ...product,
            madon: madon,
            price: getpriceProduct(product.id)
        };
        tongtien += localItem.price * localItem.soluong;
        orderDetails.push(localItem);
    }

    let donhang = {
        id: madon,
        khachhang: currentUser.phone,
        hinhthucgiao: requestBody.deliveryType === 'delivery' ? 'Giao tận nơi' : 'Tự đến lấy',
        ngaygiaohang: requestBody.shippingDate,
        thoigiangiao: requestBody.deliveryTime,
        ghichu: requestBody.note,
        tenguoinhan: requestBody.recipientName,
        sdtnhan: requestBody.recipientPhone,
        diachinhan: requestBody.deliveryAddress,
        thoigiandat: new Date(),
        tongtien: tongtien + (requestBody.deliveryType === 'delivery' ? 30000 : 0),
        trangthai: 0
    };

    order.unshift(donhang);
    if(product == undefined || product == null) {
        currentUser.cart = [];
    }

    localStorage.setItem("order", JSON.stringify(order));
    localStorage.setItem("currentuser", JSON.stringify(currentUser));
    localStorage.setItem("orderDetails", JSON.stringify(orderDetails));
    toast({ title: 'Thành công', message: 'Đặt hàng thành công !', type: 'success', duration: 2000 });
    setTimeout(() => {
        window.location = "/";
    }, 2000);
}

function getpriceProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    let sp = products.find(item => {
        return item.id == id;
    })
    return sp ? sp.price : 0;
}