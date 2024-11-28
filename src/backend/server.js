const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());
const config = {
    user: 'sa',
    password: '12345678',
    server: 'localhost',
    database: 'mqtt',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

let pool;

async function initPool() {
    if (!pool) {
        pool = await sql.connect(config);
    }
}
app.get('/windspeed', async (req, res) => {
    try {
        await initPool();

        const query = `
            SELECT windspeed, received_at 
            FROM mqtt_data
            ORDER BY received_at DESC
        `;

        const result = await pool.request().query(query);
        
        res.json({
            data: result.recordset
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Có lỗi xảy ra trong quá trình truy xuất dữ liệu windspeed.');
    }
});
// Route để lấy dữ liệu từ bảng 'mqtt_data' với phân trang, sắp xếp và tìm kiếm
app.get('/data', async (req, res) => {
    const { page = 1, limit = 10, sortColumn = 'received_at', sortOrder = 'ASC', filterColumn, filterValue } = req.query;
    const offset = (page - 1) * limit;

    try {
        await initPool();

        // Tạo điều kiện tìm kiếm nếu có filterColumn và filterValue
        let filterQuery = '';
        if (filterValue) {
            if (filterColumn === 'all') {
                filterQuery = `
                    WHERE nhietdo LIKE '%${filterValue}%' 
                    OR doam LIKE '%${filterValue}%' 
                    OR anh_sang LIKE '%${filterValue}%' 
                    OR received_at LIKE '%${filterValue}%'
                `;
            } else {
                filterQuery = `WHERE ${filterColumn} LIKE '%${filterValue}%'`;
            }
        }

        const query = `
            SELECT * FROM mqtt_data 
            ${filterQuery}
            ORDER BY ${sortColumn} ${sortOrder === 'ASC' ? 'ASC' : 'DESC'} 
            OFFSET @offset ROWS 
            FETCH NEXT @limit ROWS ONLY
        `;

        
        const request = pool.request();
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, parseInt(limit));
        const result = await request.query(query);

        // Đếm tổng số bản ghi với điều kiện tìm kiếm (nếu có)
        const totalRecordsResult = await pool.query(`
            SELECT COUNT(*) AS totalRecords FROM mqtt_data ${filterQuery}
        `);
        const totalRecords = totalRecordsResult.recordset[0].totalRecords;
        const totalPages = Math.ceil(totalRecords / limit);

        res.json({
            data: result.recordset,
            currentPage: parseInt(page),
            totalPages,
            totalRecords,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Có lỗi xảy ra trong quá trình truy xuất dữ liệu.');
    }
});

// Đóng pool khi server ngừng
process.on('SIGINT', async () => {
    if (pool) {
        await pool.close();
        console.log('Connection pool closed.');
    }
    process.exit(0);
});

// Khởi chạy server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
