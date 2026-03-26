//Khoi tao danh sach san pham
function createProduct() {
    if (localStorage.getItem('products') == null) {
        let products = [
        {
            id: 1,
            status: 1,
            title: 'Combo Gà Rán',
            img: './assets/img/products/combo-ga-ran-1-nguoi.jpg',
            category: 'Combo 1 Người',
            price: 60000,
            desc: '1 miếng gà rán giòn, 1 khoai tây chiên, 1 nước ngọt'
        },
        {
            id: 2,
            status: 1,
            title: 'Combo Burger Gà Giòn',
            img: './assets/img/products/combo-burger-ga-gion.jpg',
            category: 'Combo 1 Người',
            price: 50000,
            desc: '1 burger gà giòn, 1 nước ngọt'
        },
        {
            id: 3,
            status: 1,
            title: 'Combo Cơm Gà Giòn',
            img: './assets/img/products/combo-com-ga-gion.jpg',
            category: 'Combo 1 Người',
            price: 50000,
            desc: '1 cơm gà giòn, 1 nước ngọt'
        },
        {
            id: 4,
            status: 1,
            title: 'Combo Mì Ý',
            img: './assets/img/products/combo-mi-y.jpg',
            category: 'Combo 1 Người',
            price: 50000,
            desc: '1 mì Ý , 1 nước ngọt'
        },
        {
            id: 5,
            status: 1,
            title: 'Combo Cơm Gà Viên',
            img: './assets/img/products/combo-com-ga-vien.jpg',
            category: 'Combo 1 Người',
            price: 50000,
            desc: '1 cơm gà viên, 1 nước ngọt'
        },
        {
            id: 6,
            status: 1,
            title: 'Combo 2 Người Hoàn Hảo',
            img: './assets/img/products/combo-2-nguoi-hoan-hao.jpg',
            category: 'Combo Nhóm',
            price: 135000,
            desc: '2 miếng gà giòn, 1 burger gà giòn, 2 nước ngọt'
        },
        {
            id: 7,
            status: 1,
            title: 'Combo 2 Người No Nê',
            img: './assets/img/products/combo-2-nguoi-no-ne.jpg',
            category: 'Combo Nhóm',
            price: 179000,
            desc: '4 miếng gà giòn, 1 khoai tây chiên, 2 nước ngọt'
        },
        {
            id: 8,
            status: 1,
            title: 'Combo 2 Người Tròn Vị',
            img: './assets/img/products/combo-2-nguoi-tron-vi.jpg',
            category: 'Combo Nhóm',
            price: 160000,
            desc: '3 miếng gà giòn, 1 mì ý xúc xích, 2 nước ngọt'
        },
        {
            id: 9,
            status: 1,
            title: 'Combo 5 Người Hội Tụ',
            img: './assets/img/products/combo-5-nguoi-hoi-tu.jpg',
            category: 'Combo Nhóm',
            price: 300000,
            desc: '6 miếng gà giòn, 1 mì ý xúc xích, 1 khoai tây chiên, 5 nước ngọt'
        },
        {
            id: 10,
            status: 1,
            title: 'Combo Bạn Bè Cuối Tuần',
            img: './assets/img/products/combo-ban-be-cuoi-tuan.jpg',
            category: 'Combo Nhóm',
            price: 400000,
            desc: '6 miếng gà giòn, 2 mì ý xúc xích, 2 khoai tây chiên, 1 salad, 4 bánh trứng, 4 nước ngọt'
        },
        {
            id: 11,
            status: 1,
            title: '1 Miếng Gà Rán',
            img: './assets/img/products/1-mieng-ga-ran.jpg',
            category: 'Gà Rán - Gà Quay',
            price: 35000,
            desc: '1 Miếng Gà Giòn Cay/Gà Truyền Thống/Gà Giòn Không Cay'
        },
        {
            id: 12,
            status: 1,
            title: '2 Miếng Gà Rán',
            img: './assets/img/products/2-mieng-ga-ran.jpg',
            category: 'Gà Rán - Gà Quay',
            price: 68000,
            desc: '2 Miếng Gà Giòn Cay/Gà Truyền Thống/Gà Giòn Không Cay'
        },
        {
            id: 13,
            status: 1,
            title: '3 Miếng Gà Rán',
            img: './assets/img/products/3-mieng-ga-ran.jpg',
            category: 'Gà Rán - Gà Quay',
            price: 99000,
            desc: '3 Miếng Gà Giòn Cay/Gà Truyền Thống/Gà Giòn Không Cay'
        },
        {
            id: 14,
            status: 1,
            title: '1 Miếng Gà Quay Tiêu',
            img: './assets/img/products/1-mieng-ga-quay-tieu.jpg',
            category: 'Gà Rán - Gà Quay',
            price: 42000,
            desc: '1 Miếng Gà Quay Tiêu'
        },
        {
            id: 15,
            status: 1,
            title: '3 Miếng Gà Tender',
            img: './assets/img/products/3-mieng-ga-tender.jpg',
            category: 'Gà Rán - Gà Quay',
            price: 42000,
            desc: '3 Miếng Gà Tender'
        },
        {
            id: 16,
            status: 1,
            title: 'Gà Viên',
            img: './assets/img/products/ga-vien.jpg',
            category: 'Gà Rán - Gà Quay',
            price: 45000,
            desc: 'Gà Viên'
        },
        {
            id: 17,
            status: 1,
            title: 'Burger Gà Giòn',
            img: './assets/img/products/burger-ga-gion.jpg',
            category: 'Burger - Cơm - Mì Ý',
            price: 40000,
            desc: '1 Burger Gà Giòn'
        },
        {
            id: 18,
            status: 1,
            title: 'Burger Tôm',
            img: './assets/img/products/burger-tom.jpg',
            category: 'Burger - Cơm - Mì Ý',
            price: 45000,
            desc: '1 Burger tôm'
        },
        {
            id: 19,
            status: 1,
            title: 'Cơm Gà Viên',
            img: './assets/img/products/com-ga-vien.jpg',
            category: 'Burger - Cơm - Mì Ý',
            price: 40000,
            desc: '1 Cơm Gà Viên'
        },
        {
            id: 20,
            status: 1,
            title: 'Cơm Phi-lê Gà Quay',
            img: './assets/img/products/com-phile-ga-quay.jpg',
            category: 'Burger - Cơm - Mì Ý',
            price: 45000,
            desc: '1 Cơm Phi-lê Gà Quay'
        },
        {
            id: 21,
            status: 1,
            title: 'Cơm Gà Rán',
            img: './assets/img/products/com-ga-ran.jpg',
            category: 'Burger - Cơm - Mì Ý',
            price: 45000,
            desc: '1 Cơm Gà Rán'
        },
        {
            id: 22,
            status: 1,
            title: 'Mì Ý Xúc Xích',
            img: './assets/img/products/mi-y-xuc-xich.jpg',
            category: 'Burger - Cơm - Mì Ý',
            price: 35000,
            desc: '1 Mì Ý Xúc Xích'
        },
        {
            id: 23,
            status: 1,
            title: 'Khoai Tây Chiên',
            img: './assets/img/products/khoai-tay-chien.jpg',
            category: 'Thức Ăn Nhẹ',
            price: 29000,
            desc: '1 Khoai Tây Chiên'
        },
        {
            id: 24,
            status: 1,
            title: '3 Cá Thanh',
            img: './assets/img/products/3-ca-thanh.jpg',
            category: 'Thức Ăn Nhẹ',
            price: 35000,
            desc: '3 Cá Thanh'
        },
        {
            id: 25,
            status: 1,
            title: '4 Phô Mai Viên',
            img: './assets/img/products/4-pho-mai-vien.jpg',
            category: 'Thức Ăn Nhẹ',
            price: 39000,
            desc: '4 Phô Mai Viên'
        },
        {
            id: 26,
            status: 1,
            title: 'Gà Viên Popcorn',
            img: './assets/img/products/ga-vien.jpg',
            category: 'Thức Ăn Nhẹ',
            price: 45000,
            desc: 'Gà Viên Popcorn'
        },
        {
            id: 27,
            status: 1,
            title: 'Canh Rong Biển',
            img: './assets/img/products/canh-rong-bien.jpg',
            category: 'Thức Ăn Nhẹ',
            price: 20000,
            desc: '1 Canh Rong Biển'
        },
        {
            id: 28,
            status: 1,
            title: 'Pepsi',
            img: './assets/img/products/pepsi.jpg',
            category: 'Thức Uống & Tráng Miệng',
            price: 19000,
            desc: 'Nước ngọt có ga mát lạnh, phù hợp dùng kèm các món gà rán và burger.'
        },
        {
            id: 29,
            status: 1,
            title: '7Up',
            img: './assets/img/products/7up.jpg',
            category: 'Thức Uống & Tráng Miệng',
            price: 19000,
            desc: 'Nước giải khát vị chanh mát lạnh, giúp cân bằng vị khi ăn các món chiên.'
        },
        {
            id: 30,
            status: 1,
            title: 'Kem Ốc Quế',
            img: './assets/img/products/kem-oc-que.jpg',
            category: 'Thức Uống & Tráng Miệng',
            price: 15000,
            desc: 'Kem mát lạnh trong vỏ ốc quế giòn, là món tráng miệng đơn giản và được yêu thích.'
        }
        ]
        localStorage.setItem('products', JSON.stringify(products));
    }
}

// Create admin account 
function createAdminAccount() {
    let accounts = localStorage.getItem("accounts");
    if (!accounts) {
        accounts = [];
        accounts.push({
            fullname: "Trần Nhật Sinh",
            phone: "0123456789",
            password: "123456",
            address: '',
            email: '',
            status: 1,
            join: new Date(),
            cart: [],
            userType: 1
        })
        localStorage.setItem('accounts', JSON.stringify(accounts));
    }
}

window.onload = createProduct();
window.onload = createAdminAccount();