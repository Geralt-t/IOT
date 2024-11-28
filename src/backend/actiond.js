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
const client = mqtt.connect("ws://172.20.10.3:8080", {
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
  const statusText = (status === "ON" || status === true) ? "ON" : "OFF";

  console.log('Received status:', status);
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
        VALUES (@device, @status, CONVERT(VARCHAR, GETDATE(), 120)); -- Định dạng YYYY-MM-DD HH:MI:SS
      `);

    res.status(200).send({
      message: 'Trạng thái đã được cập nhật thành công'
    });
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
    const {
      page = 1,
      limit = 10,
      sortColumn = 'id',
      sortOrder = 'ASC',
      filterColumn,
      filterValue
    } = req.query;

    const offset = (page - 1) * limit; // Calculate offset for pagination
    const pool = await sql.connect(config);

    // Construct the filter condition if filterColumn and filterValue are provided
    let filterQuery = '';
    if (filterValue) {
      if (filterColumn === 'all') {
        // Tìm kiếm qua nhiều cột nếu filterColumn là 'all'
        filterQuery = `
          WHERE thiet_bi LIKE '%${filterValue}%'
          OR trang_thai LIKE '%${filterValue}%'
          OR thoi_gian LIKE '%${filterValue}%'
        `;
      } else {
        // Kiểm tra và sanitize filterColumn
        const validColumns = ['id', 'thiet_bi', 'trang_thai', 'thoi_gian']; // danh sách các cột hợp lệ
        if (!validColumns.includes(filterColumn)) {
          return res.status(400).send({ error: 'Invalid filter column' });
        }
        filterQuery = `WHERE ${filterColumn} LIKE '%${filterValue}%'`;
      }
    }


    // Main query with pagination, sorting, and filtering
    const query = `
      SELECT * FROM DeviceStatus
      ${filterQuery}
      ORDER BY ${sortColumn} ${sortOrder === 'ASC' ? 'ASC' : 'DESC'}
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
    `;

    console.log("Executing query:", query);

    const request = pool.request();
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, parseInt(limit));
    if (filterValue) {
      request.input('filterValue', sql.VarChar, `%${filterValue}%`);
    }

    const result = await request.query(query);

    // Query to count the total records matching the filter
    const totalCountResult = await pool.request().query(`
      SELECT COUNT(*) AS total FROM DeviceStatus ${filterQuery}
    `);
    const totalCount = totalCountResult.recordset[0].total;
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).send({
      totalCount,
      totalPages,
      currentPage: parseInt(page),
      data: result.recordset
    });
  } catch (err) {
    console.error("Error fetching data:", err); // Log the detailed error
    res.status(500).send({ error: 'Lỗi khi lấy dữ liệu' });
  } finally {
    sql.close(); // Ensure the connection is closed after handling the request
  }
});


// Chạy server trên port 5000
app.listen(5000, () => {
  console.log('Server đang chạy trên port 5000');
});
