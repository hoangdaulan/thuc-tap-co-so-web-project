// Thong tin cac don hang da mua - Xu ly khi nhan nut dat hang
async function xulyDathang(product) {
    let diachinhan = "";
    let deliveryType = "delivery";
    let giaotannoi = document.querySelector("#giaotannoi");
    let tudenlay = document.querySelector("#tudenlay");
    let giaongay = document.querySelector("#giaongay");
    let giaovaogio = document.querySelector("#deliverytime");
    let currentUser = JSON.parse(localStorage.getItem('currentuser'));

    // 1. Hình thức giao & Địa chỉ nhận hàng
    if(giaotannoi.classList.contains("active")) {
        diachinhan = document.querySelector("#diachinhan").value;
        deliveryType = "delivery";
    } else if(tudenlay.classList.contains("active")){
        deliveryType = "pickup";
        let chinhanh1 = document.querySelector("#chinhanh-1");
        let chinhanh2 = document.querySelector("#chinhanh-2");
        diachinhan = chinhanh1.checked ? "273 An Dương Vương, Phường 3, Quận 5" : "04 Tôn Đức Thắng, Phường Bến Nghé, Quận 1";
    }

    // 2. Thời gian nhận hàng
    let thoigiangiao = giaongay.checked ? "Giao ngay khi xong" : document.querySelector(".choise-time").value;

    let tennguoinhan = document.querySelector("#tennguoinhan").value;
    let sdtnhan = document.querySelector("#sdtnhan").value;
    let ghichu = document.querySelector(".note-order").value;
    let shippingDate = document.querySelector(".pick-date.active").getAttribute("data-date");

    if(tennguoinhan == "" || sdtnhan == "" || diachinhan == "") {
        toast({ title: 'Chú ý', message: 'Vui lòng nhập đầy đủ thông tin !', type: 'warning', duration: 4000 });
        return;
    }

    // 3. Xây dựng danh sách items đồng bộ với DTO trong Java
    let items = [];
    if(product == undefined || product == null) {
        currentUser.cart.forEach(item => {
            items.push({
                productId: parseInt(item.id),
                quantity: parseInt(item.soluong),
                note: item.note || ""
            });
        });
    } else {
        items.push({
            productId: parseInt(product.id),
            quantity: parseInt(product.soluong),
            note: product.note || ""
        });
    }

    // 4. RequestBody khớp 100% với PlaceOrderRequest.java
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
        if (!token) {
            toast({ title: 'Lỗi', message: 'Vui lòng đăng nhập để đặt hàng!', type: 'error', duration: 3000 });
            return;
        }

        let response = await fetch('/api/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            if (product == undefined || product == null) {
                currentUser.cart = [];
                localStorage.setItem('currentuser', JSON.stringify(currentUser));
            }
            toast({ title: 'Thành công', message: 'Đặt hàng thành công !', type: 'success', duration: 2000 });
            setTimeout(() => { window.location = "/"; }, 2000);
        } else {
            let errMsg = await response.text();
            toast({ title: 'Lỗi', message: errMsg || 'Đặt hàng thất bại!', type: 'error', duration: 3500 });
        }
    } catch (error) {
        console.error('Lỗi API:', error);
        // Nếu API sập thì mới dùng LocalStorage (tùy bạn có muốn giữ fallback này không)
        toast({ title: 'Lỗi', message: 'Không thể kết nối đến máy chủ!', type: 'error', duration: 3500 });
    }
}