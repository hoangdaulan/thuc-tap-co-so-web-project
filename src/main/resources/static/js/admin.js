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


// Set amount-product from backend in updateDashboardStats()


// Đổi sang định dạng tiền VND
// Ensure dashboard stats are updated on page load
document.addEventListener('DOMContentLoaded', () => {
    updateDashboardStats();
});
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
let allUsersCache = [];
let dashboardStatsDebounceTimer = null;
const DASHBOARD_STATS_DEBOUNCE_MS = 120;

function scheduleDashboardStatsUpdate() {
    if (dashboardStatsDebounceTimer) {
        clearTimeout(dashboardStatsDebounceTimer);
    }
    dashboardStatsDebounceTimer = setTimeout(() => {
        dashboardStatsDebounceTimer = null;
        updateDashboardStats();
    }, DASHBOARD_STATS_DEBOUNCE_MS);
}

// Load sản phẩm từ API backend
async function loadProductsFromApi() {
    try {
        const response = await fetch('/api/v1/admin/products');
        if (!response.ok) throw new Error('Không thể tải danh sách sản phẩm');
        let resData = await response.json();
        allProductsCache = resData.data || [];
        showProduct();
        scheduleDashboardStatsUpdate();
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

let shipperAutocompleteState = {
    typedName: '',
    typedPhone: '',
    selectedId: null
};

function getAvailableShippers() {
    return allUsersCache.filter(user =>
        normalizeUserRole(user.role) === 'SHIPPER' && Boolean(user.status)
    );
}

function findShipperById(id) {
    return getAvailableShippers().find(user => user.id === id) || null;
}

function getMatchingShippers(keyword) {
    const normalizedKeyword = (keyword || '').trim().toLowerCase();
    const shippers = getAvailableShippers();
    if (!normalizedKeyword) {
        return shippers.slice(0, 8);
    }

    return shippers
        .filter(user => (user.fullName || '').toLowerCase().includes(normalizedKeyword))
        .slice(0, 8);
}

function applyShipperToInputs(shipper) {
    const nameInput = document.getElementById('shipper-name-input');
    const phoneInput = document.getElementById('shipper-phone-input');
    if (!nameInput || !phoneInput || !shipper) return;

    nameInput.value = shipper.fullName || '';
    phoneInput.value = shipper.phone || '';
}

function restoreShipperInputState() {
    const selectedShipper = shipperAutocompleteState.selectedId
        ? findShipperById(shipperAutocompleteState.selectedId)
        : null;

    if (selectedShipper) {
        applyShipperToInputs(selectedShipper);
        return;
    }

    const nameInput = document.getElementById('shipper-name-input');
    const phoneInput = document.getElementById('shipper-phone-input');
    if (nameInput) nameInput.value = shipperAutocompleteState.typedName || '';
    if (phoneInput) phoneInput.value = shipperAutocompleteState.typedPhone || '';
}

function hideShipperSuggestions() {
    const container = document.getElementById('shipper-suggestions');
    if (container) {
        container.innerHTML = '';
        container.classList.remove('open');
    }
}

function previewShipperSuggestion(shipperId) {
    const shipper = findShipperById(shipperId);
    if (shipper) {
        applyShipperToInputs(shipper);
    }
}

function selectShipperSuggestion(shipperId) {
    const shipper = findShipperById(shipperId);
    if (!shipper) return;

    shipperAutocompleteState.selectedId = shipper.id;
    shipperAutocompleteState.typedName = shipper.fullName || '';
    shipperAutocompleteState.typedPhone = shipper.phone || '';
    applyShipperToInputs(shipper);
    hideShipperSuggestions();
}

function renderShipperSuggestions(keyword) {
    const container = document.getElementById('shipper-suggestions');
    if (!container) return;

    const suggestions = getMatchingShippers(keyword);
    if (!suggestions.length) {
        container.innerHTML = `<div class="shipper-suggestion-empty">KhĂ´ng tĂ¬m tháº¥y shipper phĂ¹ há»£p</div>`;
        container.classList.add('open');
        return;
    }

    container.innerHTML = suggestions.map(shipper => `
        <button type="button"
            class="shipper-suggestion-item"
            data-shipper-id="${shipper.id}"
            onmouseenter="previewShipperSuggestion(${shipper.id})"
            onclick="selectShipperSuggestion(${shipper.id})">
            <span class="shipper-suggestion-name">${shipper.fullName || 'ChÆ°a cĂ³ tĂªn'}</span>
            <span class="shipper-suggestion-phone">${shipper.phone || ''}</span>
        </button>
    `).join('');
    container.classList.add('open');
}

function initializeShipperAutocomplete(order) {
    const nameInput = document.getElementById('shipper-name-input');
    const phoneInput = document.getElementById('shipper-phone-input');
    if (!nameInput || !phoneInput) return;

    let autocompleteRoot = document.getElementById('shipper-autocomplete');
    let suggestionBox = document.getElementById('shipper-suggestions');

    if (!autocompleteRoot) {
        const currentRow = nameInput.parentElement;
        autocompleteRoot = document.createElement('div');
        autocompleteRoot.id = 'shipper-autocomplete';
        autocompleteRoot.className = 'shipper-autocomplete';
        currentRow.parentNode.insertBefore(autocompleteRoot, currentRow);
        autocompleteRoot.appendChild(currentRow);
        currentRow.classList.add('shipper-autocomplete-row');
    }

    nameInput.classList.add('shipper-input');
    phoneInput.classList.add('shipper-input');
    phoneInput.setAttribute('readonly', 'readonly');

    if (!suggestionBox) {
        suggestionBox = document.createElement('div');
        suggestionBox.id = 'shipper-suggestions';
        suggestionBox.className = 'shipper-suggestions';
        autocompleteRoot.appendChild(suggestionBox);
    }

    shipperAutocompleteState = {
        typedName: order?.shipperName || '',
        typedPhone: order?.shipperPhone || '',
        selectedId: null
    };

    const matchedShipper = getAvailableShippers().find(user =>
        (order?.shipperPhone && user.phone === order.shipperPhone)
        || (order?.shipperName && user.fullName === order.shipperName)
    );
    if (matchedShipper) {
        shipperAutocompleteState.selectedId = matchedShipper.id;
        shipperAutocompleteState.typedName = matchedShipper.fullName || '';
        shipperAutocompleteState.typedPhone = matchedShipper.phone || '';
    }

    restoreShipperInputState();

    nameInput.addEventListener('input', () => {
        shipperAutocompleteState.selectedId = null;
        shipperAutocompleteState.typedName = nameInput.value.trim();
        shipperAutocompleteState.typedPhone = '';
        phoneInput.value = '';
        renderShipperSuggestions(nameInput.value);
    });

    nameInput.addEventListener('focus', () => {
        renderShipperSuggestions(nameInput.value);
    });

    suggestionBox.addEventListener('mouseleave', () => {
        restoreShipperInputState();
    });

    document.addEventListener('click', function handleOutsideClick(event) {
        const autocompleteRoot = document.getElementById('shipper-autocomplete');
        if (!autocompleteRoot) {
            document.removeEventListener('click', handleOutsideClick);
            return;
        }
        if (!autocompleteRoot.contains(event.target)) {
            hideShipperSuggestions();
            restoreShipperInputState();
            document.removeEventListener('click', handleOutsideClick);
        }
    });
}

// Đổi trạng thái đơn hàng qua API
async function changeStatus(id, newStatus) {
    try {
        let shipperName = document.getElementById('shipper-name-input') ? document.getElementById('shipper-name-input').value : null;
        let shipperPhone = document.getElementById('shipper-phone-input') ? document.getElementById('shipper-phone-input').value : null;
        
        if (newStatus === 2) {
            let isDelivery = document.getElementById('shipper-name-input') != null;
            if (isDelivery && (!shipperName || !shipperPhone)) {
                toast({ title: 'Cảnh báo', message: 'Vui lòng nhập đầy đủ Tên và Số điện thoại Shipper', type: 'warning', duration: 3000 });
                return;
            }
        }

        let token = localStorage.getItem('jwtToken');
        const response = await fetch(`/api/v1/admin/orders/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({ status: newStatus, shipperName: shipperName, shipperPhone: shipperPhone })
        });
        if (response.ok) {
            toast({ title: 'Thành công', message: 'Cập nhật trạng thái thành công!', type: 'success', duration: 2000 });
            document.querySelector('.modal.detail-order').classList.remove('open');
            const resData = await response.json();
            const updatedOrder = resData.data;
            if (updatedOrder) {
                upsertOrderInCache(updatedOrder);
                findOrder();
                scheduleDashboardStatsUpdate();
            } else {
                await loadOrdersFromApi();
            }
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
let orderRealtimeSource = null;
let realtimeRetryTimer = null;
let realtimeRetryDelayMs = 1500;

function upsertOrderInCache(order) {
    if (!order || !order.id) return;
    const index = allOrdersCache.findIndex(item => item.id === order.id);
    if (index >= 0) {
        allOrdersCache[index] = order;
    } else {
        allOrdersCache.unshift(order);
    }
    allOrdersCache.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function handleRealtimeOrderEvent(rawPayload, eventName) {
    if (!rawPayload) return;
    let order;
    try {
        order = JSON.parse(rawPayload);
    } catch (e) {
        console.warn('Không parse được dữ liệu realtime:', e);
        return;
    }

    upsertOrderInCache(order);
    findOrder();
    scheduleDashboardStatsUpdate();

    if (eventName === 'NEW_ORDER') {
        toast({ title: 'Đơn hàng mới', message: `Mã đơn #${order.id} vừa được tạo`, type: 'success', duration: 3500 });
    }
}

function scheduleRealtimeReconnect() {
    if (realtimeRetryTimer) return;
    realtimeRetryTimer = setTimeout(() => {
        realtimeRetryTimer = null;
        initOrderRealtime();
    }, realtimeRetryDelayMs);
    realtimeRetryDelayMs = Math.min(realtimeRetryDelayMs * 2, 15000);
}

function initOrderRealtime() {
    if (orderRealtimeSource) {
        orderRealtimeSource.close();
    }

    let token = localStorage.getItem('jwtToken');
    orderRealtimeSource = new EventSource(`/api/v1/admin/orders/stream${token ? '?token=' + encodeURIComponent(token) : ''}`);

    orderRealtimeSource.onopen = function () {
        realtimeRetryDelayMs = 1500;
    };

    orderRealtimeSource.addEventListener('NEW_ORDER', function (event) {
        handleRealtimeOrderEvent(event.data, 'NEW_ORDER');
    });

    orderRealtimeSource.addEventListener('ORDER_STATUS_UPDATED', function (event) {
        handleRealtimeOrderEvent(event.data, 'ORDER_STATUS_UPDATED');
    });

    // Fallback khi server không set event name.
    orderRealtimeSource.onmessage = function (event) {
        handleRealtimeOrderEvent(event.data, 'UNKNOWN');
    };

    orderRealtimeSource.onerror = function () {
        if (orderRealtimeSource) {
            orderRealtimeSource.close();
        }
        scheduleRealtimeReconnect();
    };
}

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
        scheduleDashboardStatsUpdate();
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
            ${order.deliveryType === 'delivery' ? `
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-motorcycle"></i> Tên Shipper</span>
                <span class="detail-order-item-right">${order.shipperName || 'N/A'}</span>
            </li>
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> SĐT Shipper</span>
                <span class="detail-order-item-right">${order.shipperPhone || 'N/A'}</span>
            </li>
            ` : ''}
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

    // Nút cập nhật trạng thái
    let bottomHtml = `<div class="modal-detail-bottom-left">
        <div class="price-total">
            <span class="thanhtien">Thành tiền</span>
            <span class="price">${vnd(order.totalPrice || 0)}</span>
        </div>
    </div>
    <div class="modal-detail-bottom-right" style="display:flex; flex-direction:column; align-items:flex-end; gap: 10px;">`;

    if (order.status == 0 || order.status == 1) { // Chỉ hiển thị thao tác nếu đơn chưa giao xong
        if (order.deliveryType === 'delivery') {
            bottomHtml += `
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <input type="text" id="shipper-name-input" placeholder="Tên Shipper" class="form-control" style="width: 150px; padding: 5px;">
                <input type="text" id="shipper-phone-input" placeholder="SĐT Shipper" class="form-control" style="width: 150px; padding: 5px;">
            </div>`;
        }
        bottomHtml += `
        <div style="display: flex; gap: 10px;">
            <button class="modal-detail-btn btn-cap-nhat" style="background-color: #f44336;" onclick="changeStatus(${order.id}, 4)">Hủy đơn</button>
            <button class="modal-detail-btn btn-cap-nhat" onclick="changeStatus(${order.id}, 2)">Xác nhận đơn</button>
        </div>`;
    } else {
         bottomHtml += `<span class="status-complete">Đơn hàng đã được xử lý</span>`;
    }
    bottomHtml += `</div>`;

    document.querySelector(".modal-detail-order").innerHTML = spHtml;
    document.querySelector(".modal-detail-bottom").innerHTML = bottomHtml;
    if ((order.status == 0 || order.status == 1) && order.deliveryType === 'delivery') {
        initializeShipperAutocomplete(order);
    }
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

// Thống kê backend (API)
async function thongKe(sortType = 2) {
    const categorySelect = document.getElementById("the-loai-tk");
    const keywordInput = document.getElementById("form-search-tk");
    const startDateInput = document.getElementById("time-start-tk");
    const endDateInput = document.getElementById("time-end-tk");

    let categoryId = categorySelect && categorySelect.value !== "Tất cả" ? categorySelect.selectedIndex : null;
    let keyword = keywordInput ? keywordInput.value.trim() : "";
    let startDate = startDateInput ? startDateInput.value : "";
    let endDate = endDateInput ? endDateInput.value : "";

    let url = '/api/statistics?';
    if (categoryId && categoryId !== 0) url += `categoryId=${categoryId}&`;
    if (keyword) url += `keyword=${encodeURIComponent(keyword)}&`;
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        document.getElementById("quantity-product").innerText = data.totalUniqueProducts;
        document.getElementById("quantity-order").innerText = data.totalQuantity;
        document.getElementById("quantity-sale").innerText = vnd(data.totalRevenue);
        let details = data.details || [];
        if (sortType === 1) {
            details.sort((a, b) => a.totalRevenue - b.totalRevenue);
        } else {
            details.sort((a, b) => b.totalRevenue - a.totalRevenue);
        }
        let html = '';
        details.forEach((item, idx) => {
            html += `<tr>
                <td>${idx + 1}</td>
                <td>${item.productName}</td>
                <td>${item.totalQuantitySold}</td>
                <td>${vnd(item.totalRevenue)}</td>
                <td></td>
            </tr>`;
        });
        document.getElementById("showTk").innerHTML = html;
    } catch (e) {
        document.getElementById("showTk").innerHTML = '<tr><td colspan="5">Không thể tải dữ liệu thống kê</td></tr>';
        document.getElementById("quantity-product").innerText = 0;
        document.getElementById("quantity-order").innerText = 0;
        document.getElementById("quantity-sale").innerText = vnd(0);
    }
}

// Gắn lại sự kiện onchange/oninput cho filter thống kê
if (document.getElementById("the-loai-tk")) document.getElementById("the-loai-tk").onchange = () => thongKe();
if (document.getElementById("form-search-tk")) document.getElementById("form-search-tk").oninput = () => thongKe();
if (document.getElementById("time-start-tk")) document.getElementById("time-start-tk").onchange = () => thongKe();
if (document.getElementById("time-end-tk")) document.getElementById("time-end-tk").onchange = () => thongKe();

// Gắn lại cho các nút sort
const btnSortAsc = document.querySelector('button[onclick="thongKe(1)"]');
const btnSortDesc = document.querySelector('button[onclick="thongKe(2)"]');
const btnReset = document.querySelector('button[onclick="thongKe(0)"]');
if (btnSortAsc) btnSortAsc.onclick = () => thongKe(1);
if (btnSortDesc) btnSortDesc.onclick = () => thongKe(2);
if (btnReset) btnReset.onclick = () => thongKe(0);

// Gọi thống kê khi load trang
window.addEventListener('DOMContentLoaded', () => { thongKe(); });


// User
let addAccount = document.getElementById('signup-button');
let updateAccount = document.getElementById("btn-update-account")
const ACCOUNT_MODE = {
    CUSTOMER: 'USER',
    EMPLOYEE: 'EMPLOYEE'
};
let currentAccountMode = ACCOUNT_MODE.CUSTOMER;
let editingAccountId = null;

function normalizeUserRole(role) {
    return (role || 'USER').toUpperCase();
}

document.querySelector(".modal.signup .modal-close").addEventListener("click", () => {
    signUpFormReset();
})


async function showUser() {
    try {
        const response = await fetch('/api/admin/khach-hang');
        const resData = await response.json();
        const data = resData.data || [];
        allUsersCache = data;
        applyAccountFilters();
        scheduleDashboardStatsUpdate();
    } catch (error) { console.error("Lỗi API:", error); }
}

function cancelSearchUser() {
    document.getElementById("tinh-trang-customer").value = 2;
    document.getElementById("form-search-customer").value = "";
    document.getElementById("time-start-customer").value = "";
    document.getElementById("time-end-customer").value = "";
    applyCustomerFilters();
}



document.getElementById("logout-acc").addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem("currentuser");
    window.location = "/";
})

// API lay danh sach khach hang
function loadCustomersFromApi() {
    showUser();
}

// Note: user data is loaded in window.onload via showUser().

async function updateDashboardStats() {
    try {
        // Fetch statistics from backend
        const response = await fetch('/api/statistics');
        if (!response.ok) throw new Error('Không thể tải số liệu thống kê');
        const data = await response.json();

        // Update total users (if available)
        const userCount = await fetch('api/admin/khach-hang/count');
        if (userCount.ok) {
            const responseData = await userCount.json();
            let count = responseData.data;
            const amountUserEl = document.getElementById("amount-user");
            if (amountUserEl) amountUserEl.innerHTML = count;
        }


        // Update total products (if available)
        const resCount = await fetch('/api/v1/products/count');
        if (resCount.ok) {
            const responseData = await resCount.json();
            let count = 0;
            count = responseData.data;
            const amountProductEl = document.getElementById("amount-product");
            if (amountProductEl) amountProductEl.innerHTML = count;
        }

        // Update total revenue
        const doanhThuEl = document.getElementById("doanh-thu");
        if (doanhThuEl && typeof data.totalRevenue !== 'undefined') doanhThuEl.innerHTML = vnd(data.totalRevenue);
    } catch (error) {
        console.error("Lỗi cập nhật số liệu Dashboard:", error);
        const doanhThuEl = document.getElementById("doanh-thu");
        if (doanhThuEl) doanhThuEl.innerHTML = vnd(0);
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
                allUsersCache = allUsersCache.filter(user => user.id !== id);
                applyAccountFilters();
                scheduleDashboardStatsUpdate();
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


function getRoleLabel(role) {
    return normalizeUserRole(role) === 'SHIPPER' ? 'Shipper' : 'Nhân viên';
}


function filterAccounts(data, { keyword = '', status = '2', start = '', end = '', role = 'ALL' } = {}) {
    let filtered = [...data];

    if (keyword) {
        const normalizedKeyword = keyword.toLowerCase();
        filtered = filtered.filter(user =>
            (user.fullName || '').toLowerCase().includes(normalizedKeyword)
            || (user.phone || '').toLowerCase().includes(normalizedKeyword)
            || (user.email || '').toLowerCase().includes(normalizedKeyword)
        );
    }

    if (status !== "2") {
        const expectedStatus = status === "1";
        filtered = filtered.filter(user => Boolean(user.status) === expectedStatus);
    }

    if (role !== 'ALL') {
        filtered = filtered.filter(user => normalizeUserRole(user.role) === role);
    }

    if (start) {
        const startDate = new Date(`${start}T00:00:00`);
        filtered = filtered.filter(user => new Date(user.createdAt) >= startDate);
    }
    if (end) {
        const endDate = new Date(`${end}T23:59:59`);
        filtered = filtered.filter(user => new Date(user.createdAt) <= endDate);
    }

    return filtered;
}

function applyCustomerFilters() {
    const filtered = filterAccounts(
        allUsersCache.filter(user => normalizeUserRole(user.role) === 'USER'),
        {
            keyword: document.getElementById("form-search-customer")?.value || '',
            status: document.getElementById("tinh-trang-customer")?.value || '2',
            start: document.getElementById("time-start-customer")?.value || '',
            end: document.getElementById("time-end-customer")?.value || ''
        }
    );
    renderUserTable(filtered);
}

function applyEmployeeFilters() {
    const filtered = filterAccounts(
        allUsersCache.filter(user => ['EMPLOYEE', 'SHIPPER'].includes(normalizeUserRole(user.role))),
        {
            keyword: document.getElementById("form-search-employee")?.value || '',
            status: document.getElementById("tinh-trang-employee")?.value || '2',
            start: document.getElementById("time-start-employee")?.value || '',
            end: document.getElementById("time-end-employee")?.value || '',
            role: document.getElementById("role-employee")?.value || 'ALL'
        }
    );
    renderEmployeeTable(filtered);
}

function applyAccountFilters() {
    applyCustomerFilters();
    applyEmployeeFilters();
}

function searchCustomer() {
    applyCustomerFilters();
}

function searchEmployee() {
    applyEmployeeFilters();
}

function cancelSearchCustomer() {
    cancelSearchUser();
}

function cancelSearchEmployee() {
    document.getElementById("tinh-trang-employee").value = "2";
    document.getElementById("role-employee").value = "ALL";
    document.getElementById("form-search-employee").value = "";
    document.getElementById("time-start-employee").value = "";
    document.getElementById("time-end-employee").value = "";
    applyEmployeeFilters();
}

function setupUserFilters() {
    const customerSearch = document.getElementById("form-search-customer");
    const customerStatus = document.getElementById("tinh-trang-customer");
    const customerStart = document.getElementById("time-start-customer");
    const customerEnd = document.getElementById("time-end-customer");
    const employeeSearch = document.getElementById("form-search-employee");
    const employeeStatus = document.getElementById("tinh-trang-employee");
    const employeeRole = document.getElementById("role-employee");
    const employeeStart = document.getElementById("time-start-employee");
    const employeeEnd = document.getElementById("time-end-employee");

    if (customerSearch) customerSearch.oninput = applyCustomerFilters;
    if (customerStatus) customerStatus.onchange = applyCustomerFilters;
    if (customerStart) customerStart.onchange = applyCustomerFilters;
    if (customerEnd) customerEnd.onchange = applyCustomerFilters;

    if (employeeSearch) employeeSearch.oninput = applyEmployeeFilters;
    if (employeeStatus) employeeStatus.onchange = applyEmployeeFilters;
    if (employeeRole) employeeRole.onchange = applyEmployeeFilters;
    if (employeeStart) employeeStart.onchange = applyEmployeeFilters;
    if (employeeEnd) employeeEnd.onchange = applyEmployeeFilters;
}

function resetAccountMessages() {
    document.querySelector('.form-message-name').innerHTML = '';
    document.querySelector('.form-message-phone').innerHTML = '';
    document.querySelector('.form-message-password').innerHTML = '';
}

function signUpFormReset() {
    document.getElementById('fullname').value = "";
    document.getElementById('phone').value = "";
    document.getElementById('password').value = "";
    document.getElementById('email').value = "";
    document.getElementById('address').value = "";
    document.getElementById('user-status').checked = true;
    if (document.getElementById('account-role')) {
        document.getElementById('account-role').value = 'EMPLOYEE';
    }
    const roleGroup = document.getElementById('account-role-group');
    if (roleGroup) {
        roleGroup.style.display = 'none';
    }
    editingAccountId = null;
    currentAccountMode = ACCOUNT_MODE.CUSTOMER;
    resetAccountMessages();
}

function getAccountRoleForSubmit() {
    return currentAccountMode === ACCOUNT_MODE.EMPLOYEE
        ? document.getElementById('account-role').value
        : 'USER';
}

function configureAccountModal({ mode = ACCOUNT_MODE.CUSTOMER, isEdit = false, user = null } = {}) {
    currentAccountMode = mode === ACCOUNT_MODE.EMPLOYEE ? ACCOUNT_MODE.EMPLOYEE : ACCOUNT_MODE.CUSTOMER;
    editingAccountId = isEdit ? user?.id ?? null : null;

    const title = document.getElementById('account-modal-title');
    const editTitle = document.querySelector('.modal-container-title.edit-account-e');
    const roleGroup = document.getElementById('account-role-group');
    const passwordInput = document.getElementById('password');
    const passwordLabel = document.querySelector("label[for='password']");

    document.querySelector(".signup").classList.add("open");
    document.querySelectorAll(".edit-account-e").forEach(item => {
        item.style.display = isEdit ? "block" : "none";
    });
    document.querySelectorAll(".add-account-e").forEach(item => {
        item.style.display = isEdit ? "none" : "block";
    });

    if (title) {
        title.textContent = isEdit
            ? (currentAccountMode === ACCOUNT_MODE.EMPLOYEE ? 'CHỈNH SỬA NHÂN VIÊN' : 'CHỈNH SỬA KHÁCH HÀNG')
            : (currentAccountMode === ACCOUNT_MODE.EMPLOYEE ? 'THÊM NHÂN VIÊN MỚI' : 'THÊM KHÁCH HÀNG MỚI');
    }
    if (editTitle) {
        editTitle.textContent = currentAccountMode === ACCOUNT_MODE.EMPLOYEE ? 'CHỈNH SỬA NHÂN VIÊN' : 'CHỈNH SỬA KHÁCH HÀNG';
    }
    if (roleGroup) {
        roleGroup.style.display = currentAccountMode === ACCOUNT_MODE.EMPLOYEE ? 'block' : 'none';
    }
    if (passwordLabel) {
        passwordLabel.textContent = isEdit ? 'Mật khẩu mới' : 'Mật khẩu';
    }
    if (passwordInput) {
        passwordInput.placeholder = isEdit ? 'Để trống nếu không đổi mật khẩu' : 'Nhập mật khẩu';
    }

    if (user) {
        document.getElementById('fullname').value = user.fullName || "";
        document.getElementById('phone').value = user.phone || "";
        document.getElementById('password').value = "";
        document.getElementById('email').value = user.email || "";
        document.getElementById('address').value = user.address || "";
        document.getElementById('user-status').checked = Boolean(user.status);
        if (document.getElementById('account-role')) {
            const normalizedRole = normalizeUserRole(user.role);
            document.getElementById('account-role').value = normalizedRole === 'SHIPPER' ? 'SHIPPER' : 'EMPLOYEE';
        }
    }
}

function openCreateAccount(mode = 'USER') {
    signUpFormReset();
    configureAccountModal({
        mode: mode === ACCOUNT_MODE.EMPLOYEE ? ACCOUNT_MODE.EMPLOYEE : ACCOUNT_MODE.CUSTOMER,
        isEdit: false
    });
}

function editAccount(id, mode = 'USER') {
    const user = allUsersCache.find(item => item.id === id);
    if (!user) {
        toast({ title: 'Lỗi', message: 'Không tìm thấy tài khoản cần chỉnh sửa', type: 'error', duration: 2500 });
        return;
    }
    signUpFormReset();
    configureAccountModal({
        mode: mode === ACCOUNT_MODE.EMPLOYEE ? ACCOUNT_MODE.EMPLOYEE : ACCOUNT_MODE.CUSTOMER,
        isEdit: true,
        user
    });
}

function getAccountFormData(requirePassword) {
    const fullName = document.getElementById('fullname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();

    if (!fullName || !phone || (requirePassword && !password)) {
        toast({ title: 'Chú ý', message: 'Vui lòng nhập đầy đủ thông tin bắt buộc', type: 'warning', duration: 2500 });
        return null;
    }

    const payload = {
        fullName,
        phone,
        email,
        address,
        role: getAccountRoleForSubmit()
    };

    if (requirePassword || password) {
        payload.password = password;
    }

    return payload;
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
                    <button class="btn-edit" onclick="editAccount(${user.id}, 'USER')"><i class="fa-light fa-pen-to-square"></i></button>
                    <button class="btn-delete" onclick="deleteAccount(${user.id})"><i class="fa-regular fa-trash"></i></button>
                </td>
            </tr>`;
        });
    }
    document.getElementById('show-customer').innerHTML = html;
}

function renderEmployeeTable(data) {
    let html = '';
    if (data.length === 0) {
        html = `<tr><td colspan="9">Không tìm thấy nhân viên nào phù hợp</td></tr>`;
    } else {
        data.forEach((user, index) => {
            let statusText = user.status === true ? "Hoạt động" : "Bị khóa";
            let statusClass = user.status === true ? "status-complete" : "status-no-complete";

            html += `
            <tr>
                <td>${index + 1}</td>
                <td>${user.fullName}</td>
                <td>${getRoleLabel(user.role)}</td>
                <td>${user.phone}</td>
                <td>${formatDate(user.createdAt)}</td>
                <td>${user.address || ''}</td>
                <td>${user.email || ''}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td class="control control-table">
                    <button class="btn-edit" onclick="editAccount(${user.id}, 'EMPLOYEE')"><i class="fa-light fa-pen-to-square"></i></button>
                    <button class="btn-delete" onclick="deleteAccount(${user.id})"><i class="fa-regular fa-trash"></i></button>
                </td>
            </tr>`;
        });
    }
    document.getElementById('show-employee').innerHTML = html;
}

function bindAccountModalActions() {
    const signupButton = document.getElementById('signup-button');
    const updateButton = document.getElementById('btn-update-account');
    if (!signupButton || !updateButton) return;

    const newSignupButton = signupButton.cloneNode(true);
    signupButton.parentNode.replaceChild(newSignupButton, signupButton);
    addAccount = newSignupButton;

    const newUpdateButton = updateButton.cloneNode(true);
    updateButton.parentNode.replaceChild(newUpdateButton, updateButton);
    updateAccount = newUpdateButton;

    addAccount.onclick = async function (e) {
        e.preventDefault();
        const payload = getAccountFormData(true);
        if (!payload) return;

        try {
            const response = await fetch('/api/admin/khach-hang', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const responseData = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(responseData.message || 'Không thể tạo tài khoản');
            }

            await showUser();
            document.querySelector(".signup").classList.remove("open");
            signUpFormReset();
            toast({
                title: 'Thành công',
                message: currentAccountMode === ACCOUNT_MODE.EMPLOYEE ? 'Thêm nhân viên thành công' : 'Thêm khách hàng thành công',
                type: 'success',
                duration: 2500
            });
        } catch (error) {
            toast({ title: 'Lỗi', message: error.message, type: 'error', duration: 3000 });
        }
    };

    updateAccount.onclick = async function (e) {
        e.preventDefault();
        if (!editingAccountId) {
            toast({ title: 'Thông báo', message: 'Không tìm thấy tài khoản cần cập nhật', type: 'warning', duration: 2500 });
            return;
        }

        const payload = getAccountFormData(false);
        if (!payload) return;
        payload.status = document.getElementById('user-status').checked;

        try {
            const response = await fetch(`/api/admin/khach-hang/${editingAccountId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const responseData = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(responseData.message || 'Không thể cập nhật tài khoản');
            }

            allUsersCache = allUsersCache.map(user => user.id === responseData.data.id ? responseData.data : user);
            applyAccountFilters();
            scheduleDashboardStatsUpdate();
            document.querySelector(".signup").classList.remove("open");
            signUpFormReset();
            toast({
                title: 'Thành công',
                message: currentAccountMode === ACCOUNT_MODE.EMPLOYEE ? 'Đã cập nhật tài khoản nhân viên' : 'Đã cập nhật tài khoản khách hàng',
                type: 'success',
                duration: 2500
            });
        } catch (error) {
            toast({ title: 'Lỗi', message: error.message, type: 'error', duration: 3000 });
        }
    };
}

window.onload = function () {
    checkLogin();
    showUser();
    scheduleDashboardStatsUpdate();
    setupUserFilters();
    bindAccountModalActions();
    loadProductsFromApi();
    loadOrdersFromApi(); // Load đơn hàng từ API backend
    initOrderRealtime();
};

window.addEventListener('beforeunload', function () {
    if (orderRealtimeSource) {
        orderRealtimeSource.close();
    }
});

