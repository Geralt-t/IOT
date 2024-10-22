const express = require('express');
const sql = require('mssql');
const cors = require('cors'); // Import cors

const app = express();

// Sử dụng CORS
app.use(cors()); // Cho phép tất cả các origin, có thể tùy chỉnh nếu cần

// Cấu hình kết nối với SQL Server
const config = {
    user: 'sa',
    password: '12345678',
    server: 'localhost',
    database: 'mqtt',
    options: {
        encrypt: true, // Đối với SQL Azure, bạn cần phải bật mã hóa.
        trustServerCertificate: true // Thêm dòng này để bỏ qua kiểm tra chứng chỉ tự ký
    }
};

// Route để lấy dữ liệu từ bảng 'mqtt_data'
app.get('/data', async (req, res) => {
    try {
        // Kết nối với SQL Server
        await sql.connect(config);
        const result = await sql.query`SELECT * FROM mqtt_data`; // Query bảng 'mqtt_data'
        res.json(result.recordset); // Trả dữ liệu dưới dạng JSON
        
    } catch (err) {
        console.error(err);
        res.status(500).send('Có lỗi xảy ra trong quá trình truy xuất dữ liệu.');
    } finally {
        await sql.close(); // Đóng kết nối sau khi xử lý xong
    }
});

// Khởi chạy server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});