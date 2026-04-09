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

-- Nâng quyền 1 tài khoản đã đăng ký thành ADMIN (đổi số điện thoại bên dưới)
DECLARE @AdminPhone NVARCHAR(20) = N'0900000000';

IF EXISTS (SELECT 1 FROM dbo.users WHERE phone = @AdminPhone)
BEGIN
    UPDATE dbo.users
    SET role = 'ADMIN',
        status = 1,
        updated_at = GETDATE()
    WHERE phone = @AdminPhone;

    PRINT N'Đã nâng quyền ADMIN cho tài khoản: ' + @AdminPhone;
END
ELSE
BEGIN
    PRINT N'Không tìm thấy tài khoản với số điện thoại: ' + @AdminPhone + N'. Hãy đăng ký tài khoản trước.';
END;

SELECT id, full_name, phone, role, status
FROM dbo.users
WHERE phone = @AdminPhone;
