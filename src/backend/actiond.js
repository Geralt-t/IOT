const express = require('express');
const sql = require('mssql');
const mqtt = require("mqtt"); // Sử dụng require thay vì import
const cors = require('cors'); // Nhập gói cors

const app = express();
app.use(express.json());
app.use(cors()); // Thêm middleware CORS

// Cấu hình kết nối SQL Server
const config = {
  user: 'sa',
  password: '12345678',
  server: 'localhost', // hoặc IP của server
  database: 'mqtt',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Khởi tạo kết nối MQTT
const client = mqtt.connect("ws://192.168.100.4:8080", {
  username: 'duy',
  password: '1234',
});

client.on('connect', () => {
  console.log('MQTT Connected');
});

// API điều khiển thiết bị và gửi lệnh MQTT
app.post("/api/control-device", (req, res) => {
  const { device, status } = req.body; // Nhận tên thiết bị và trạng thái

  // Gửi lệnh MQTT cho thiết bị
  client.publish(`${device}/control`, status ? "ON" : "OFF");

  res.status(200).json({ message: `${device} turned ${status ? "ON" : "OFF"}` });
});

// API lưu trạng thái thiết bị vào cơ sở dữ liệu
app.post('/api/device-status', async (req, res) => {
  const { device, status } = req.body;
  const statusText = status ? "ON" : "OFF";
  
  try {
    console.log("Connecting to SQL Server...");
    const pool = await sql.connect(config);
    console.log("Connected to SQL Server");

    console.log(`Inserting device status: Device=${device}, Status=${statusText}`);
    const result = await pool.request()
      .input('device', sql.VarChar, device)
      .input('status', sql.VarChar, statusText)
      .query(`
        INSERT INTO DeviceStatus (thiet_bi, trang_thai, thoi_gian)
        VALUES (@device, @status, GETDATE())
      `);

    res.status(200).send({ message: 'Trạng thái đã được cập nhật thành công' });
  } catch (err) {
    console.error("Error inserting device status:", err);
    res.status(500).send({ error: 'Cập nhật trạng thái thất bại' });
  } finally {
    await sql.close(); // Đảm bảo đóng kết nối sau khi hoàn tất
  }
});

// API lấy trạng thái thiết bị từ cơ sở dữ liệu
app.get('/api/device-status', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM DeviceStatus');
    res.status(200).send(result.recordset); // Trả về dữ liệu dưới dạng JSON
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Lỗi khi lấy dữ liệu' });
  } finally {
    sql.close(); // Đảm bảo đóng kết nối sau khi hoàn tất
  }
});

// Chạy server trên port 5000
app.listen(5000, () => {
  console.log('Server đang chạy trên port 5000');
});
