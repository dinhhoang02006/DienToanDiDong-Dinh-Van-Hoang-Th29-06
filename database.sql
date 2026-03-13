-- Script tạo Cơ sở dữ liệu cho phần mềm Chat Online
CREATE DATABASE ChatAppDB;
GO

USE ChatAppDB;
GO

-- Tạo bảng lưu trữ Người dùng (Nếu cần mở rộng sau này)
CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    UserType VARCHAR(20) NOT NULL CHECK (UserType IN ('host', 'client')),
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- Tạo bảng lưu trữ Tin nhắn
CREATE TABLE Messages (
    MessageId INT IDENTITY(1,1) PRIMARY KEY,
    Sender NVARCHAR(50) NOT NULL, -- 'host' hoặc 'client'
    Content NVARCHAR(MAX) NOT NULL,
    Timestamp DATETIME DEFAULT GETDATE(),
    Edited BIT DEFAULT 0 -- 0: false, 1: true
);
GO

-- Chèn dữ liệu mẫu (Giả thiết)
INSERT INTO Messages (Sender, Content, Timestamp, Edited)
VALUES 
('host', N'Xin chào, tôi là Host. Tôi có thể giúp gì cho bạn?', GETDATE(), 0),
('client', N'Chào admin, phần mềm hoạt động rất tốt.', DATEADD(minute, 1, GETDATE()), 0);
GO


