const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
const port = 3000;

// Cấu hình Middleware
app.use(cors());
app.use(express.json());

// Cấu hình kết nối SQL Server
// Lưu ý: Cần đổi mật khẩu, user, và server cho đúng với máy tính của bạn
const dbConfig = {
    user: 'sa',             // Thay bằng username SQL của bạn
    password: 'your_password', // Thay bằng mật khẩu SQL của bạn
    server: 'localhost',    // Tên server hoặc địa chỉ IP
    database: 'ChatAppDB',  // Tên Database đã tạo bằng file database.sql
    options: {
        encrypt: false, // Bật thành true nếu dùng Azure SQL
        trustServerCertificate: true // Tin tưởng Chứng chỉ cục bộ (Cho môi trường Dev)
    }
};

// Khởi tạo kết nối db
let pool;
async function connectToDb() {
    try {
        pool = await sql.connect(dbConfig);
        console.log("✅ Đã kết nối tới SQL Server thành công!");
    } catch (err) {
        console.error("❌ Lỗi kết nối CSDL:", err);
    }
}
connectToDb();

// API 1: Lấy danh sách tin nhắn
app.get('/api/messages', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM Messages ORDER BY Timestamp ASC');
        // Map data để khớp với interface frontend đang dùng
        const messages = result.recordset.map(msg => ({
            id: msg.MessageId,
            sender: msg.Sender,
            content: msg.Content,
            timestamp: msg.Timestamp,
            edited: msg.Edited === 1 || msg.Edited === true
        }));
        res.json(messages);
    } catch (err) {
        res.status(500).send("Lỗi truy xuất hệ thống");
    }
});

// API 2: Gửi tin nhắn mới
app.post('/api/messages', async (req, res) => {
    try {
        const { sender, content } = req.body;
        const result = await pool.request()
            .input('Sender', sql.NVarChar, sender)
            .input('Content', sql.NVarChar, content)
            .query('INSERT INTO Messages (Sender, Content) OUTPUT INSERTED.* VALUES (@Sender, @Content)');

        const newMsg = result.recordset[0];
        res.json({
            id: newMsg.MessageId,
            sender: newMsg.Sender,
            content: newMsg.Content,
            timestamp: newMsg.Timestamp,
            edited: false
        });
    } catch (err) {
        res.status(500).send("Lỗi lưu tin nhắn");
    }
});

// API 3: Sửa tin nhắn
app.put('/api/messages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        await pool.request()
            .input('Id', sql.Int, id)
            .input('Content', sql.NVarChar, content)
            .query('UPDATE Messages SET Content = @Content, Edited = 1 WHERE MessageId = @Id');

        res.json({ success: true });
    } catch (err) {
        res.status(500).send("Lỗi sửa tin nhắn");
    }
});

// API 4: Xóa toàn bộ tin nhắn
app.delete('/api/messages', async (req, res) => {
    try {
        await pool.request().query('DELETE FROM Messages'); // Có thể dùng TRUNCATE TABLE Messages nếu ID cần reset về 1
        res.json({ success: true });
    } catch (err) {
        res.status(500).send("Lỗi xóa hội thoại");
    }
});

app.listen(port, () => {
    console.log(`🚀 Backend Server đang chạy tại: http://localhost:${port}`);
});
