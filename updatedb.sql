-- Cho phép chèn giá trị vào cột Identity (nếu có)
SET IDENTITY_INSERT dbo.categories ON;

INSERT INTO dbo.categories (id, name, slug, created_at, updated_at)
VALUES 
(1, N'Combo 1 người', 'combo-1-nguoi', GETDATE(), GETDATE()),
(2, N'Combo nhóm', 'combo-nhom', GETDATE(), GETDATE()),
(3, N'Gà rán - gà quay', 'ga-ran-ga-quay', GETDATE(), GETDATE()),
(4, N'Burger - Cơm - Mì ý', 'burger-com-mi-y', GETDATE(), GETDATE()),
(5, N'Thức ăn nhẹ', 'thuc-an-nhe', GETDATE(), GETDATE()),
(6, N'Thức uống & tráng miệng', 'thuc-uong-trang-mieng', GETDATE(), GETDATE());

-- Tắt chế độ chèn Identity sau khi xong
SET IDENTITY_INSERT dbo.categories OFF;