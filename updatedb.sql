INSERT INTO dbo.categories (name, slug, created_at, updated_at)
VALUES 
(N'Món chính', 'mon-chinh', GETDATE(), GETDATE()),
(N'Món ăn vặt', 'mon-an-vat', GETDATE(), GETDATE()),
(N'Món tráng miệng', 'mon-trang-mieng', GETDATE(), GETDATE()),
(N'Nước uống', 'nuoc-uong', GETDATE(), GETDATE());