function checkLogin() {
    let currentUser = JSON.parse(localStorage.getItem("currentuser"));
    if (currentUser == null || currentUser.userType == 0) {
        document.querySelector("body").innerHTML = `<div class="access-denied-section">
            <img class="access-denied-img" src="./assets/img/access-denied.webp" alt="">
        </div>`
    } else {
        document.getElementById("name-acc").innerHTML = currentUser.fullname;
    }
}

//do sidebar open and close
const menuIconButton = document.querySelector(".menu-icon-btn");
const sidebar = document.querySelector(".sidebar");
menuIconButton.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

// log out admin user
/*
let toogleMenu = document.querySelector(".profile");
let mune = document.querySelector(".profile-cropdown");
toogleMenu.onclick = function () {
    mune.classList.toggle("active");
};
*/

// tab for section
const sidebars = document.querySelectorAll(".sidebar-list-item.tab-content");
const sections = document.querySelectorAll(".section");

for (let i = 0; i < sidebars.length; i++) {
    sidebars[i].onclick = function () {
        document.querySelector(".sidebar-list-item.active").classList.remove("active");
        document.querySelector(".section.active").classList.remove("active");
        sidebars[i].classList.add("active");
        sections[i].classList.add("active");
    };
}

const closeBtn = document.querySelectorAll('.section');
console.log(closeBtn[0])
for (let i = 0; i < closeBtn.length; i++) {
    closeBtn[i].addEventListener('click', (e) => {
        sidebar.classList.add("open");
    })
}

// Get amount product
function getAmoumtProduct() {
    let products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")) : [];
    return products.length;
}

// Get amount user
function getAmoumtUser() {
    let accounts = localStorage.getItem("accounts") ? JSON.parse(localStorage.getItem("accounts")) : [];
    return accounts.filter(item => item.userType == 0).length;
}

// Get amount user
function getMoney() {
    let tongtien = 0;
    let orders = localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")) : [];
    orders.forEach(item => {
        tongtien += item.tongtien
    });
    return tongtien;
}

document.getElementById("amount-product").innerHTML = getAmoumtProduct();
document.getElementById("doanh-thu").innerHTML = vnd(getMoney());

// Doi sang dinh dang tien VND
function vnd(price) {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
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
    showProductArr(productShow);
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
    node.innerHTML = `<a href="#">${page}</a>`;
    if (currentPage == page) node.classList.add('active');
    node.addEventListener('click', function () {
        currentPage = page;
        displayList(productAll, perPage, currentPage);
        let t = document.querySelectorAll('.page-nav-item.active');
        for (let i = 0; i < t.length; i++) {
            t[i].classList.remove('active');
        }
        node.classList.add('active');
    })
    return node;
}

// Hiển thị danh sách sản phẩm từ mảng
function showProductArr(arr) {
    let productHtml = "";
    if (arr.length == 0) {
        productHtml = `<div class="no-result"><div class="no-result-i"><i class="fa-light fa-face-sad-cry"></i></div><div class="no-result-h">Không có sản phẩm để hiển thị</div></div>`;
    } else {
        arr.forEach(product => {
            // Xử lý ảnh: nếu image là tên file thì thêm path, nếu đã là URL thì giữ nguyên
            let imgSrc = product.image
                ? (product.image.startsWith('http') || product.image.startsWith('/')
                    ? product.image
                    : `./assets/img/products/${product.image}`)
                : './assets/img/blank-image.png';
            let categoryName = product.category ? product.category.name : '';
            let btnCtl = (product.status == null || product.status == 1) ?
                `<button class="btn-delete" onclick="deleteProductApi(${product.id})"><i class="fa-regular fa-trash"></i></button>` :
                `<button class="btn-delete" onclick="restoreProductApi(${product.id})"><i class="fa-regular fa-eye"></i></button>`;
            productHtml += `
            <div class="list">
                    <div class="list-left">
                    <img src="${imgSrc}" alt="">
                    <div class="list-info">
                        <h4>${product.title}</h4>
                        <p class="list-note">${product.description || ''}</p>
                        <span class="list-category">${categoryName}</span>
                    </div>
                </div>
                <div class="list-right">
                    <div class="list-price">
                    <span class="list-current-price">${vnd(product.price || 0)}</span>
                    </div>
                    <div class="list-control">
                    <div class="list-tool">
                        <button class="btn-edit" onclick="editProduct(${product.id})"><i class="fa-light fa-pen-to-square"></i></button>
                        ${btnCtl}
                    </div>
                </div>
                </div>
            </div>`;
        });
    }
    document.getElementById("show-product").innerHTML = productHtml;
}

// Cache danh sách sản phẩm lấy từ API
let allProductsCache = [];

// Load sản phẩm từ API backend
async function loadProductsFromApi() {
    try {
        const response = await fetch('/api/v1/admin/products');
        if (!response.ok) throw new Error('Không thể tải danh sách sản phẩm');
        let resData = await response.json();
        allProductsCache = resData.data || [];
        showProduct();
        // Cập nhật số lượng sản phẩm trên dashboard
        const amountProductEl = document.getElementById('amount-product');
        if (amountProductEl) amountProductEl.innerHTML = allProductsCache.length;
    } catch (error) {
        console.error('Lỗi tải sản phẩm:', error);
        document.getElementById('show-product').innerHTML = `<div class="no-result"><div class="no-result-i"><i class="fa-light fa-triangle-exclamation"></i></div><div class="no-result-h">Không thể tải sản phẩm từ server</div></div>`;
    }
}

function showProduct() {
    let selectOp = document.getElementById('the-loai').value;
    let valeSearchInput = document.getElementById('form-search-product').value;

    let result;
    if (selectOp == "Tất cả") {
        result = allProductsCache.filter((item) => item.status == 1 || item.status == null);
    } else if (selectOp == "Đã xóa") {
        result = allProductsCache.filter((item) => item.status == 0);
    } else {
        // Lọc theo tên category
        result = allProductsCache.filter((item) => item.category && item.category.name == selectOp);
    }

    result = valeSearchInput == "" ? result : result.filter(item => {
        return item.title.toString().toUpperCase().includes(valeSearchInput.toString().toUpperCase());
    });

    displayList(result, perPage, currentPage);
    setupPagination(result, perPage, currentPage);
}

function cancelSearchProduct() {
    document.getElementById('the-loai').value = "Tất cả";
    document.getElementById('form-search-product').value = "";
    loadProductsFromApi();
}


// Xóa mềm sản phẩm qua API
async function deleteProductApi(id) {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này?") == true) {
        try {
            const response = await fetch(`/api/v1/admin/products/${id}`, { method: 'DELETE' });
            if (response.ok) {
                toast({ title: 'Thành công', message: 'Xóa sản phẩm thành công!', type: 'success', duration: 3000 });
                await loadProductsFromApi();
            } else {
                toast({ title: 'Lỗi', message: 'Không thể xóa sản phẩm!', type: 'error', duration: 3000 });
            }
        } catch (error) {
            console.error('Lỗi xóa sản phẩm:', error);
        }
    }
}

// (legacy) giữ lại để không lỗi nếu còn reference cũ
function deleteProduct(id) { deleteProductApi(id); }
function changeStatusProduct(id) { loadProductsFromApi(); }

var indexCur;
function editProduct(id) {
    let products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")) : [];
    let index = products.findIndex(item => {
        return item.id == id;
    })
    indexCur = index;
    document.querySelectorAll(".add-product-e").forEach(item => {
        item.style.display = "none";
    })
    document.querySelectorAll(".edit-product-e").forEach(item => {
        item.style.display = "block";
    })
    document.querySelector(".add-product").classList.add("open");
    //
    document.querySelector(".upload-image-preview").src = products[index].img;
    document.getElementById("ten-mon").value = products[index].title;
    document.getElementById("gia-moi").value = products[index].price;
    document.getElementById("mo-ta").value = products[index].desc;
    document.getElementById("chon-mon").value = products[index].category;
}

function getPathImage(path) {
    let patharr = path.split("/");
    return "./assets/img/products/" + patharr[patharr.length - 1];
}

let btnUpdateProductIn = document.getElementById("update-product-button");
btnUpdateProductIn.addEventListener("click", (e) => {
    e.preventDefault();
    let products = JSON.parse(localStorage.getItem("products"));
    let idProduct = products[indexCur].id;
    let imgProduct = products[indexCur].img;
    let titleProduct = products[indexCur].title;
    let curProduct = products[indexCur].price;
    let descProduct = products[indexCur].desc;
    let categoryProduct = products[indexCur].category;
    let imgProductCur = getPathImage(document.querySelector(".upload-image-preview").src)
    let titleProductCur = document.getElementById("ten-mon").value;
    let curProductCur = document.getElementById("gia-moi").value;
    let descProductCur = document.getElementById("mo-ta").value;
    let categoryText = document.getElementById("chon-mon").value;

    if (imgProductCur != imgProduct || titleProductCur != titleProduct || curProductCur != curProduct || descProductCur != descProduct || categoryText != categoryProduct) {
        let productadd = {
            id: idProduct,
            title: titleProductCur,
            img: imgProductCur,
            category: categoryText,
            price: parseInt(curProductCur),
            desc: descProductCur,
            status: 1,
        };
        products.splice(indexCur, 1);
        products.splice(indexCur, 0, productadd);
        localStorage.setItem("products", JSON.stringify(products));
        toast({ title: "Success", message: "Sửa sản phẩm thành công!", type: "success", duration: 3000, });
        setDefaultValue();
        document.querySelector(".add-product").classList.remove("open");
        showProduct();
    } else {
        toast({ title: "Warning", message: "Sản phẩm của bạn không thay đổi!", type: "warning", duration: 3000, });
    }
});

let btnAddProductIn = document.getElementById("add-product-button");
btnAddProductIn.addEventListener("click", async (e) => {
    e.preventDefault();
    let tenMon = document.getElementById("ten-mon").value.trim();
    let price = document.getElementById("gia-moi").value;
    let moTa = document.getElementById("mo-ta").value.trim();
    let categoryId = document.getElementById("chon-mon").value;
    let imageFile = document.getElementById("up-hinh-anh").files[0];

    if (tenMon == "" || price == "" || moTa == "") {
        toast({ title: "Chú ý", message: "Vui lòng nhập đầy đủ thông tin món!", type: "warning", duration: 3000 });
        return;
    }
    if (isNaN(price) || parseFloat(price) < 0) {
        toast({ title: "Chú ý", message: "Giá phải là số hợp lệ!", type: "warning", duration: 3000 });
        return;
    }

    // Tạo FormData để gửi multipart/form-data
    const formData = new FormData();
    formData.append('title', tenMon);
    formData.append('description', moTa);
    formData.append('price', parseFloat(price));
    formData.append('categoryId', categoryId);
    formData.append('status', 1);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        // Disable nút để tránh double submit
        btnAddProductIn.disabled = true;
        btnAddProductIn.querySelector('span').textContent = 'Đang lưu...';

        const response = await fetch('/api/v1/admin/products', {
            method: 'POST',
            body: formData // KHÔNG set Content-Type, browser tự set với boundary
        });

        if (response.ok) {
            toast({ title: "Thành công", message: "Thêm sản phẩm thành công!", type: "success", duration: 3000 });
            document.querySelector(".add-product").classList.remove("open");
            setDefaultValue();
            await loadProductsFromApi();
        } else {
            const errMsg = await response.text();
            toast({ title: "Lỗi", message: "Thêm thất bại: " + errMsg, type: "error", duration: 4000 });
        }
    } catch (error) {
        console.error('Lỗi thêm sản phẩm:', error);
        toast({ title: "Lỗi", message: "Không thể kết nối đến server!", type: "error", duration: 3000 });
    } finally {
        btnAddProductIn.disabled = false;
        btnAddProductIn.querySelector('span').textContent = 'THÊM MÓN';
    }
});

document.querySelector(".modal-close.product-form").addEventListener("click", () => {
    setDefaultValue();
})

function setDefaultValue() {
    const preview = document.getElementById("product-image-preview") || document.querySelector(".upload-image-preview");
    if (preview) preview.src = "./assets/img/blank-image.png";
    document.getElementById("ten-mon").value = "";
    document.getElementById("gia-moi").value = "";
    document.getElementById("mo-ta").value = "";
    document.getElementById("chon-mon").value = "1";
    document.getElementById("up-hinh-anh").value = ""; // reset file input
}

// Open Popup Modal
let btnAddProduct = document.getElementById("btn-add-product");
btnAddProduct.addEventListener("click", () => {
    document.querySelectorAll(".add-product-e").forEach(item => {
        item.style.display = "block";
    })
    document.querySelectorAll(".edit-product-e").forEach(item => {
        item.style.display = "none";
    })
    document.querySelector(".add-product").classList.add("open");
});

// Close Popup Modal
let closePopup = document.querySelectorAll(".modal-close");
let modalPopup = document.querySelectorAll(".modal");

for (let i = 0; i < closePopup.length; i++) {
    closePopup[i].onclick = () => {
        modalPopup[i].classList.remove("open");
    };
}

// Preview ảnh ngay khi người dùng chọn file (dùng FileReader, không cần upload trước)
function previewProductImage(input) {
    const preview = document.getElementById("product-image-preview") || document.querySelector(".upload-image-preview");
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Giữ lại hàm cũ để tránh lỗi nếu còn reference
function uploadImage(el) { previewProductImage(el); }

// Đổi trạng thái đơn hàng qua API
async function changeStatus(id, newStatus) {
    try {
        let token = localStorage.getItem('jwtToken');
        const response = await fetch(`/api/v1/admin/orders/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({ status: newStatus })
        });
        if (response.ok) {
            toast({ title: 'Thành công', message: 'Cập nhật trạng thái thành công!', type: 'success', duration: 2000 });
            await loadOrdersFromApi();
        } else {
            let msg = await response.text();
            toast({ title: 'Lỗi', message: msg, type: 'error', duration: 3000 });
        }
    } catch (e) {
        toast({ title: 'Lỗi', message: 'Không thể kết nối server', type: 'error', duration: 3000 });
    }
}

// Cache danh sách đơn hàng từ API
let allOrdersCache = [];

// Tải đơn hàng từ API
async function loadOrdersFromApi() {
    try {
        let token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/v1/admin/orders', {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });
        if (!response.ok) throw new Error('Không thể tải đơn hàng');
        let resData = await response.json();
        allOrdersCache = resData.data || [];
        findOrder();
        await updateDashboardStats();
    } catch (error) {
        console.error('Lỗi tải đơn hàng:', error);
    }
}

// Format Date
function formatDate(date) {
    let fm = new Date(date);
    let yyyy = fm.getFullYear();
    let mm = fm.getMonth() + 1;
    let dd = fm.getDate();
    if (dd < 10) dd = "0" + dd;
    if (mm < 10) mm = "0" + mm;
    return dd + "/" + mm + "/" + yyyy;
}

// Show order
function showOrder(arr) {
    let orderHtml = "";
    if (!arr || arr.length == 0) {
        orderHtml = `<tr><td colspan="6">Không có dữ liệu</td></tr>`
    } else {
        arr.forEach((item) => {
            let statusText = item.statusText || 'Chờ xác nhận';
            let statusClass = '';
            if (item.status == 3) statusClass = 'status-complete';
            else if (item.status == 4) statusClass = 'status-cancelled';
            else statusClass = 'status-no-complete';
            let date = formatDate(item.createdAt || new Date());
            let recipientInfo = item.recipientPhone || item.user?.phone || '';
            orderHtml += `
            <tr>
            <td>${item.id}</td>
            <td>${recipientInfo}</td>
            <td>${date}</td>
            <td>${vnd(item.totalPrice || 0)}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td class="control">
                <button class="btn-detail" onclick="detailOrderAdmin(${item.id})"><i class="fa-regular fa-eye"></i> Chi tiết</button>
            </td>
            </tr>
            `;
        });
    }
    document.getElementById("showOrder").innerHTML = orderHtml;
}

// Xem chi tiết đơn hàng admin
async function detailOrderAdmin(id) {
    let token = localStorage.getItem('jwtToken');
    let order = allOrdersCache.find(o => o.id == id);
    if (!order) {
        try {
            let res = await fetch(`/api/v1/admin/orders?status=`, { headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
            if (res.ok) { let resData = await res.json(); allOrdersCache = resData.data || []; order = allOrdersCache.find(o => o.id == id); }
        } catch (e) { }
    }
    if (!order) return;
    document.querySelector(".modal.detail-order").classList.add("open");
    let spHtml = `<div class="modal-detail-left"><div class="order-item-group">`;
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            let imgSrc = item.productImage || './assets/img/blank-image.png';
            if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('/') && !imgSrc.startsWith('./')) {
                imgSrc = `./assets/img/products/${imgSrc}`;
            }
            spHtml += `<div class="order-product">
                <div class="order-product-left">
                    <img src="${imgSrc}" alt="">
                    <div class="order-product-info">
                        <h4>${item.productTitle}</h4>
                        <p class="order-product-note"><i class="fa-light fa-pen"></i> ${item.note || 'Không có ghi chú'}</p>
                        <p class="order-product-quantity">SL: ${item.quantity}<p>
                    </div>
                </div>
                <div class="order-product-right">
                    <div class="order-product-price">
                        <span class="order-product-current-price">${vnd(item.price)}</span>
                    </div>
                </div>
            </div>`;
        });
    }
    spHtml += `</div></div>`;
    spHtml += `<div class="modal-detail-right">
        <ul class="detail-order-group">
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> Ngày đặt hàng</span>
                <span class="detail-order-item-right">${formatDate(order.createdAt)}</span>
            </li>
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> Hình thức giao</span>
                <span class="detail-order-item-right">${order.deliveryType === 'pickup' ? 'Tự đến lấy' : 'Giao tận nơi'}</span>
            </li>
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> Người nhận</span>
                <span class="detail-order-item-right">${order.recipientName || ''}</span>
            </li>
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> Số điện thoại</span>
                <span class="detail-order-item-right">${order.recipientPhone || ''}</span>
            </li>
            <li class="detail-order-item tb">
                <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> Thời gian giao</span>
                <p class="detail-order-item-b">${order.deliveryTime ? order.deliveryTime + ' - ' : ''}${order.shippingDate ? formatDate(order.shippingDate) : ''}</p>
            </li>
            <li class="detail-order-item tb">
                <span class="detail-order-item-t"><i class="fa-light fa-location-dot"></i> Địa chỉ nhận</span>
                <p class="detail-order-item-b">${order.deliveryAddress || order.branch || ''}</p>
            </li>
            <li class="detail-order-item tb">
                <span class="detail-order-item-t"><i class="fa-light fa-note-sticky"></i> Ghi chú</span>
                <p class="detail-order-item-b">${order.note || ''}</p>
            </li>
        </ul>
    </div>`;
    document.querySelector(".modal-detail-order").innerHTML = spHtml;

    // Nút cập nhật trạng thái
    let statusOptions = [
        { value: 0, label: 'Chờ xác nhận' },
        { value: 1, label: 'Đã xác nhận' },
        { value: 2, label: 'Đang giao' },
        { value: 3, label: 'Hoàn thành' },
        { value: 4, label: 'Hủy' }
    ];
    let selectHtml = `<select id="order-status-select" class="order-status-select">`;
    statusOptions.forEach(opt => {
        selectHtml += `<option value="${opt.value}" ${order.status == opt.value ? 'selected' : ''}>${opt.label}</option>`;
    });
    selectHtml += `</select>`;
    document.querySelector(".modal-detail-bottom").innerHTML = `<div class="modal-detail-bottom-left">
        <div class="price-total">
            <span class="thanhtien">Thành tiền</span>
            <span class="price">${vnd(order.totalPrice || 0)}</span>
        </div>
    </div>
    <div class="modal-detail-bottom-right">
        ${selectHtml}
        <button class="modal-detail-btn btn-cap-nhat" onclick="changeStatus(${order.id}, parseInt(document.getElementById('order-status-select').value))">Cập nhật</button>
    </div>`;
}

// Find Order
function findOrder() {
    let orders = allOrdersCache.length > 0 ? allOrdersCache : [];
    let tinhTrang = document.getElementById("tinh-trang") ? parseInt(document.getElementById("tinh-trang").value) : -1;
    let ct = document.getElementById("form-search-order") ? document.getElementById("form-search-order").value : '';
    let timeStart = document.getElementById("time-start") ? document.getElementById("time-start").value : '';
    let timeEnd = document.getElementById("time-end") ? document.getElementById("time-end").value : '';

    if (timeEnd < timeStart && timeEnd != "" && timeStart != "") {
        alert("Lựa chọn thời gian sai !");
        return;
    }

    let result = (tinhTrang == -1 || tinhTrang == 5) ? orders : orders.filter(item => item.status == tinhTrang);
    result = ct == "" ? result : result.filter(item => {
        let phone = item.recipientPhone || '';
        return (phone.toLowerCase().includes(ct.toLowerCase()) || String(item.id).includes(ct));
    });

    if (timeStart != "" && timeEnd == "") {
        result = result.filter(item => new Date(item.createdAt) >= new Date(timeStart).setHours(0, 0, 0));
    } else if (timeStart == "" && timeEnd != "") {
        result = result.filter(item => new Date(item.createdAt) <= new Date(timeEnd).setHours(23, 59, 59));
    } else if (timeStart != "" && timeEnd != "") {
        result = result.filter(item => (
            new Date(item.createdAt) >= new Date(timeStart).setHours(0, 0, 0) &&
            new Date(item.createdAt) <= new Date(timeEnd).setHours(23, 59, 59)
        ));
    }
    showOrder(result);
}

function cancelSearchOrder() {
    if (document.getElementById("tinh-trang")) document.getElementById("tinh-trang").value = 5;
    if (document.getElementById("form-search-order")) document.getElementById("form-search-order").value = "";
    if (document.getElementById("time-start")) document.getElementById("time-start").value = "";
    if (document.getElementById("time-end")) document.getElementById("time-end").value = "";
    findOrder();
}

// Create Object Thong ke
function createObj() {
    let orders = localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")) : [];
    let products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")) : [];
    let orderDetails = localStorage.getItem("orderDetails") ? JSON.parse(localStorage.getItem("orderDetails")) : [];
    let result = [];
    orderDetails.forEach(item => {
        // Lấy thông tin sản phẩm
        let prod = products.find(product => { return product.id == item.id; });
        let obj = new Object();
        obj.id = item.id;
        obj.madon = item.madon;
        obj.price = item.price;
        obj.quantity = item.soluong;
        obj.category = prod.category;
        obj.title = prod.title;
        obj.img = prod.img;
        obj.time = (orders.find(order => order.id == item.madon)).thoigiandat;
        result.push(obj);
    });
    return result;
}

// Filter
function thongKe(mode) {
    let categoryTk = document.getElementById("the-loai-tk").value;
    let ct = document.getElementById("form-search-tk").value;
    let timeStart = document.getElementById("time-start-tk").value;
    let timeEnd = document.getElementById("time-end-tk").value;
    if (timeEnd < timeStart && timeEnd != "" && timeStart != "") {
        alert("Lựa chọn thời gian sai !");
        return;
    }
    let arrDetail = createObj();
    let result = categoryTk == "Tất cả" ? arrDetail : arrDetail.filter((item) => {
        return item.category == categoryTk;
    });

    result = ct == "" ? result : result.filter((item) => {
        return (item.title.toLowerCase().includes(ct.toLowerCase()));
    });

    if (timeStart != "" && timeEnd == "") {
        result = result.filter((item) => {
            return new Date(item.time) > new Date(timeStart).setHours(0, 0, 0);
        });
    } else if (timeStart == "" && timeEnd != "") {
        result = result.filter((item) => {
            return new Date(item.time) < new Date(timeEnd).setHours(23, 59, 59);
        });
    } else if (timeStart != "" && timeEnd != "") {
        result = result.filter((item) => {
            return (new Date(item.time) > new Date(timeStart).setHours(0, 0, 0) && new Date(item.time) < new Date(timeEnd).setHours(23, 59, 59)
            );
        });
    }
    showThongKe(result, mode);
}

// Show số lượng sp, số lượng đơn bán, doanh thu
function showOverview(arr) {
    document.getElementById("quantity-product").innerText = arr.length;
    document.getElementById("quantity-order").innerText = arr.reduce((sum, cur) => (sum + parseInt(cur.quantity)), 0);
    document.getElementById("quantity-sale").innerText = vnd(arr.reduce((sum, cur) => (sum + parseInt(cur.doanhthu)), 0));
}

function showThongKe(arr, mode) {
    let orderHtml = "";
    let mergeObj = mergeObjThongKe(arr);
    showOverview(mergeObj);

    switch (mode) {
        case 0:
            mergeObj = mergeObjThongKe(createObj());
            showOverview(mergeObj);
            document.getElementById("the-loai-tk").value = "Tất cả";
            document.getElementById("form-search-tk").value = "";
            document.getElementById("time-start-tk").value = "";
            document.getElementById("time-end-tk").value = "";
            break;
        case 1:
            mergeObj.sort((a, b) => parseInt(a.quantity) - parseInt(b.quantity))
            break;
        case 2:
            mergeObj.sort((a, b) => parseInt(b.quantity) - parseInt(a.quantity))
            break;
    }
    for (let i = 0; i < mergeObj.length; i++) {
        orderHtml += `
        <tr>
        <td>${i + 1}</td>
        <td><div class="prod-img-title"><img class="prd-img-tbl" src="${mergeObj[i].img}" alt=""><p>${mergeObj[i].title}</p></div></td>
        <td>${mergeObj[i].quantity}</td>
        <td>${vnd(mergeObj[i].doanhthu)}</td>
        <td><button class="btn-detail product-order-detail" data-id="${mergeObj[i].id}"><i class="fa-regular fa-eye"></i> Chi tiết</button></td>
        </tr>
        `;
    }
    document.getElementById("showTk").innerHTML = orderHtml;
    document.querySelectorAll(".product-order-detail").forEach(item => {
        let idProduct = item.getAttribute("data-id");
        item.addEventListener("click", () => {
            detailOrderProduct(arr, idProduct);
        })
    })
}

showThongKe(createObj())

function mergeObjThongKe(arr) {
    let result = [];
    arr.forEach(item => {
        let check = result.find(i => i.id == item.id) // Không tìm thấy gì trả về undefined

        if (check) {
            check.quantity = parseInt(check.quantity) + parseInt(item.quantity);
            check.doanhthu += parseInt(item.price) * parseInt(item.quantity);
        } else {
            const newItem = { ...item }
            newItem.doanhthu = newItem.price * newItem.quantity;
            result.push(newItem);
        }

    });
    return result;
}

function detailOrderProduct(arr, id) {
    let orderHtml = "";
    arr.forEach(item => {
        if (item.id == id) {
            orderHtml += `<tr>
            <td>${item.madon}</td>
            <td>${item.quantity}</td>
            <td>${vnd(item.price)}</td>
            <td>${formatDate(item.time)}</td>
            </tr>
            `;
        }
    });
    document.getElementById("show-product-order-detail").innerHTML = orderHtml
    document.querySelector(".modal.detail-order-product").classList.add("open")
}

// User
let addAccount = document.getElementById('signup-button');
let updateAccount = document.getElementById("btn-update-account")

document.querySelector(".modal.signup .modal-close").addEventListener("click", () => {
    signUpFormReset();
})

function openCreateAccount() {
    document.querySelector(".signup").classList.add("open");
    document.querySelectorAll(".edit-account-e").forEach(item => {
        item.style.display = "none"
    })
    document.querySelectorAll(".add-account-e").forEach(item => {
        item.style.display = "block"
    })
}

function signUpFormReset() {
    document.getElementById('fullname').value = ""
    document.getElementById('phone').value = ""
    document.getElementById('password').value = ""
    document.getElementById('email').value = ""
    document.getElementById('address').value = ""
    document.querySelector('.form-message-name').innerHTML = '';
    document.querySelector('.form-message-phone').innerHTML = '';
    document.querySelector('.form-message-password').innerHTML = '';
}

function showUserArr(arr) {
    let accountHtml = '';
    if (arr.length == 0) {
        accountHtml = `<td colspan="5">Không có dữ liệu</td>`
    } else {
        arr.forEach((account, index) => {
            let tinhtrang = account.status == 0 ? `<span class="status-no-complete">Bị khóa</span>` : `<span class="status-complete">Hoạt động</span>`;
            accountHtml += ` <tr>
            <td>${index + 1}</td>
            <td>${account.fullname}</td>
            <td>${account.phone}</td>
            <td>${account.address}</td>
            <td>${account.email}</td>
            <td>${formatDate(account.join)}</td>
            <td>${tinhtrang}</td>
            <td class="control control-table">
            <button class="btn-edit" id="edit-account" onclick='editAccount(${account.phone})' ><i class="fa-light fa-pen-to-square"></i></button>
            <button class="btn-delete" id="delete-account" onclick="deleteAcount(${index})"><i class="fa-regular fa-trash"></i></button>
            </td>
        </tr>`
        })
    }
    document.getElementById('show-user').innerHTML = accountHtml;
}

async function showUser() {
    try {
        const response = await fetch('/api/admin/khach-hang');
        const resData = await response.json();
        const data = resData.data || [];
        let accountHtml = '';
        if (data.length === 0) {
            accountHtml = `<tr><td colspan="6">Không có dữ liệu khách hàng</td></tr>`;
        } else {
            data.forEach((account, index) => {
                let tinhtrang = account.status === false ? `<span class="status-no-complete">Bị khóa</span>` : `<span class="status-complete">Hoạt động</span>`;
                accountHtml += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${account.fullName}</td>
                    <td>${account.phone}</td>
                    <td>${formatDate(account.createdAt)}</td>
                    <td>${account.address}</td>
                    <td>${account.email}</td>
                    <td>${tinhtrang}</td>
                    <td class="control control-table">
                        <button class="btn-edit" onclick="editAccount(${account.id})"><i class="fa-light fa-pen-to-square"></i></button>
                        <button class="btn-delete" onclick="deleteAccount(${account.id})"><i class="fa-regular fa-trash"></i></button>
                    </td>
                </tr>`;
            });
        }
        document.getElementById('show-user').innerHTML = accountHtml;
    } catch (error) { console.error("Lỗi API:", error); }
}

function cancelSearchUser() {
    document.getElementById("tinh-trang-user").value = 2;
    document.getElementById("form-search-user").value = "";
    document.getElementById("time-start-user").value = "";
    document.getElementById("time-end-user").value = "";

    showUser();
}


function deleteAcount(phone) {
    let accounts = JSON.parse(localStorage.getItem('accounts'));
    let index = accounts.findIndex(item => item.phone == phone);
    if (confirm("Bạn có chắc muốn xóa?")) {
        accounts.splice(index, 1)
    }
    localStorage.setItem("accounts", JSON.stringify(accounts));
    showUser();
}

let indexFlag;
function editAccount(phone) {
    document.querySelector(".signup").classList.add("open");
    document.querySelectorAll(".add-account-e").forEach(item => {
        item.style.display = "none"
    })
    document.querySelectorAll(".edit-account-e").forEach(item => {
        item.style.display = "block"
    })
    let accounts = JSON.parse(localStorage.getItem("accounts"));
    let index = accounts.findIndex(item => {
        return item.phone == phone
    })
    indexFlag = index;
    document.getElementById("fullname").value = accounts[index].fullname;
    document.getElementById("phone").value = accounts[index].phone;
    document.getElementById("password").value = accounts[index].password;
    document.getElementById("user-status").checked = accounts[index].status == 1 ? true : false;
}

updateAccount.addEventListener("click", (e) => {
    e.preventDefault();
    let accounts = JSON.parse(localStorage.getItem("accounts"));
    let fullname = document.getElementById("fullname").value;
    let phone = document.getElementById("phone").value;
    let password = document.getElementById("password").value;
    if (fullname == "" || phone == "" || password == "") {
        toast({ title: 'Chú ý', message: 'Vui lòng nhập đầy đủ thông tin !', type: 'warning', duration: 3000 });
    } else {
        accounts[indexFlag].fullname = document.getElementById("fullname").value;
        accounts[indexFlag].phone = document.getElementById("phone").value;
        accounts[indexFlag].password = document.getElementById("password").value;
        accounts[indexFlag].status = document.getElementById("user-status").checked ? true : false;
        localStorage.setItem("accounts", JSON.stringify(accounts));
        toast({ title: 'Thành công', message: 'Thay đổi thông tin thành công !', type: 'success', duration: 3000 });
        document.querySelector(".signup").classList.remove("open");
        signUpFormReset();
        showUser();
    }
})

// Them khach hang
const signupBtn = document.getElementById('signup-button');

if (signupBtn) {
    signupBtn.onclick = async function (e) {
        e.preventDefault();

        const nameVal = document.getElementById('fullname').value;
        const phoneVal = document.getElementById('phone').value;
        const passVal = document.getElementById('password').value;
        const emailVal = document.getElementById('email').value;
        const addressVal = document.getElementById('address').value;

        if (!nameVal || !phoneVal || !passVal) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        const userData = {
            fullName: nameVal,
            phone: phoneVal,
            password: passVal,
            email: emailVal,
            address: addressVal
        };

        try {
            const response = await fetch('/api/admin/khach-hang', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                alert("Thêm khách hàng thành công!");

                await showUser();
                await updateDashboardStats();

                document.querySelector(".signup").classList.remove("open");
                signUpFormReset();
            } else {
                const errorText = await response.text();
                alert("Lỗi: " + errorText);
            }
        } catch (error) {
            console.error("Lỗi kết nối API:", error);
        }
    };
}

document.getElementById("logout-acc").addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem("currentuser");
    window.location = "/";
})

// API lay danh sach khach hang
function loadCustomersFromApi() {
    fetch('/api/admin/khach-hang')
        .then(response => response.json())
        .then(resData => {
            let data = resData.data || [];
            let html = '';
            data.forEach((user, index) => {
                html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${user.fullName}</td>
                        <td>${user.phone}</td>
                        <td>${new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>${account.address}</td>
                        <td>${account.email}</td>
                        <td>
                            <span class="status ${user.status === true ? 'active' : 'locked'}">
                                ${user.status === true ? 'Hoạt động' : 'Bị khóa'}
                            </span>
                        </td>
                        <td>
                            <button onclick="editUser(${user.id})"><i class="fa-light fa-pen-to-square"></i></button>
                            <button onclick="deleteUser(${user.id})"><i class="fa-light fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
            document.getElementById('show-user').innerHTML = html;
        })
        .catch(error => console.error('Lỗi kết nối API:', error));
}

// Goi ham khi trang web vua load xong
document.addEventListener('DOMContentLoaded', loadCustomersFromApi);

async function updateDashboardStats() {
    try {
        let token = localStorage.getItem('jwtToken');
        // Lấy user count
        const userRes = await fetch('/api/admin/khach-hang');
        if (userRes.ok) {
            let resData = await userRes.json();
            const users = resData.data || [];
            const amountUserEl = document.getElementById("amount-user");
            if (amountUserEl) amountUserEl.innerHTML = users.length;
        }

        // Tính doanh thu từ API orders
        if (allOrdersCache.length > 0) {
            let doneOrders = allOrdersCache.filter(o => o.status == 3);
            let tongtien = doneOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
            if (document.getElementById("doanh-thu")) document.getElementById("doanh-thu").innerHTML = vnd(tongtien);
            // Số đơn hàng chờ xử lý
            let pendingCount = allOrdersCache.filter(o => o.status == 0).length;
            let pendingEl = document.getElementById("pending-orders");
            if (pendingEl) pendingEl.innerHTML = pendingCount;
        }

        // Số sản phẩm từ API
        const prodRes = await fetch('/api/v1/admin/products');
        if (prodRes.ok) {
            let resData = await prodRes.json();
            const prods = resData.data || [];
            if (document.getElementById("amount-product")) document.getElementById("amount-product").innerHTML = prods.filter(p => p.status == 1).length;
        }
    } catch (error) {
        console.error("Lỗi cập nhật số liệu Dashboard:", error);
    }
}

async function deleteAccount(id) {
    if (confirm("Bạn có chắc chắn muốn xóa vĩnh viễn người dùng này?")) {
        try {
            const response = await fetch(`/api/admin/khach-hang/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert("Đã xóa người dùng thành công!");
                // Gọi lại hàm load danh sách để cập nhật bảng mà không cần F5
                showUser();
            } else {
                const errorMsg = await response.text();
                alert("Xóa thất bại: " + errorMsg);
            }
        } catch (error) {
            console.error("Lỗi khi gọi API xóa:", error);
            alert("Không thể kết nối đến máy chủ!");
        }
    }
}

function renderUserTable(data) {
    let html = '';
    if (data.length === 0) {
        html = `<tr><td colspan="8">Không tìm thấy khách hàng nào phù hợp</td></tr>`;
    } else {
        data.forEach((user, index) => {
            let statusText = user.status === true ? "Hoạt động" : "Bị khóa";
            let statusClass = user.status === true ? "status-complete" : "status-no-complete";

            html += `
            <tr>
                <td>${index + 1}</td>
                <td>${user.fullName}</td>
                <td>${user.phone}</td>
                <td>${formatDate(user.createdAt)}</td>
                <td>${user.address || ''}</td>
                <td>${user.email || ''}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td class="control control-table">
                    <button class="btn-edit" onclick="editAccount(${user.id})"><i class="fa-light fa-pen-to-square"></i></button>
                    <button class="btn-delete" onclick="deleteAccount(${user.id})"><i class="fa-regular fa-trash"></i></button>
                </td>
            </tr>`;
        });
    }
    document.getElementById('show-user').innerHTML = html;
}

async function filterUser() {
    const search = document.getElementById("form-search-user").value;
    const status = document.getElementById("tinh-trang-user").value;
    const start = document.getElementById("time-start-user").value;
    const end = document.getElementById("time-end-user").value;

    let url = `/api/admin/khach-hang/filter?search=${encodeURIComponent(search)}`;

    if (status !== "2") url += `&status=${status}`;
    if (start) url += `&startDate=${start}T00:00:00`;
    if (end) url += `&endDate=${end}T23:59:59`;

    try {
        const response = await fetch(url);
        const resData = await response.json();
        const data = resData.data || [];
        renderUserTable(data);
    } catch (error) {
        console.error("Lỗi lọc khách hàng:", error);
    }
}

function setupUserFilters() {
    const searchInput = document.getElementById("form-search-user");
    const statusSelect = document.getElementById("tinh-trang-user");
    const dateStart = document.getElementById("time-start-user");
    const dateEnd = document.getElementById("time-end-user");
    const btnReset = document.querySelector(".btn-refresh-user");

    if (searchInput) searchInput.oninput = filterUser;
    if (statusSelect) statusSelect.onchange = filterUser;
    if (dateStart) dateStart.onchange = filterUser;
    if (dateEnd) dateEnd.onchange = filterUser;

    if (btnReset) {
        btnReset.onclick = () => {
            searchInput.value = "";
            statusSelect.value = "2";
            dateStart.value = "";
            dateEnd.value = "";
            showUser();
        };
    }
}

window.onload = function () {
    checkLogin();
    showUser();
    updateDashboardStats();
    setupUserFilters();
    loadProductsFromApi();
    loadOrdersFromApi(); // Load đơn hàng từ API backend
};
