import React, { useMemo, useState, useEffect } from "react";
import axios from 'axios';
import { Card, Container, Row, Col, Table as BootstrapTable, FormControl, Form, Button } from "react-bootstrap";

function ActionHistory() {
  const [data1, setData1] = useState([]);
  const [filterColumn, setFilterColumn] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState(1);

  const [sortColumn, setSortColumn] = useState("thoi_gian"); // Cột sắp xếp mặc định
  const [sortOrder, setSortOrder] = useState("DESC"); // Thứ tự sắp xếp mặc định

  const columns1 = useMemo(
    () => [
      { Header: "ID", accessor: "id" },
      { Header: "Thiết bị", accessor: "thiet_bi" },
      { Header: "Trạng thái bật/tắt", accessor: "trang_thai" },
      { Header: "Thời gian", accessor: "thoi_gian" },
    ],
    []
  );

  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `http://localhost:5000/api/device-status?page=${pageIndex}&limit=${pageSize}&filterColumn=${filterColumn}&filterValue=${filterValue}&sortColumn=${sortColumn}&sortOrder=${sortOrder}`;
        const response = await axios.get(url);
        
        const formattedData = response.data.data.map((item) => ({
          id: item.id,
          thiet_bi: item.thiet_bi,
          trang_thai: item.trang_thai,
          thoi_gian: item.thoi_gian,
        }));
        
        setData1(formattedData);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu:", error);
      }
    };

    fetchData();
  }, [filterColumn, filterValue, pageIndex, pageSize, sortColumn, sortOrder]);

  const handleFilterValueChange = (e) => {
    const sanitizedValue = e.target.value.replace(/^\s+|\t/g, "");
    setFilterValue(sanitizedValue);
    setPageIndex(1); // Reset về trang đầu khi thay đổi bộ lọc
  };

  const handlePageChange = () => {
    if (inputPage > 0 && inputPage <= totalPages) {
      setPageIndex(inputPage);
    }
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageIndex(1); // Reset về trang đầu khi thay đổi pageSize
  };

  // Xử lý sự kiện khi người dùng bấm vào tiêu đề cột
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC"); // Đảo chiều sắp xếp nếu cột đã được chọn
    } else {
      setSortColumn(column);
      setSortOrder("ASC"); // Nếu chọn cột mới, mặc định sắp xếp tăng dần
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Card.Header>
              <Card.Title as="h4">Action History Data Table</Card.Title>
            </Card.Header>
            <Card.Body className="table-full-width table-responsive px-0">
              {/* Thanh tìm kiếm kết hợp */}
              <FormControl
                value={filterValue}
                onChange={handleFilterValueChange}
                placeholder="Tìm kiếm..."
                className="mb-3"
                style={{ width: "300px", display: "inline-block" }}
              />
              <Form.Control
                as="select"
                value={filterColumn}
                onChange={(e) => setFilterColumn(e.target.value)}
                style={{ width: "200px", display: "inline-block", marginLeft: "10px" }}
              >
                <option value="all">Tất cả</option>
                <option value="thiet_bi">Thiết bị</option>
                <option value="trang_thai">Trạng thái</option>
                <option value="thoi_gian">Thời gian</option>
              </Form.Control>

              <BootstrapTable className="table-hover table-striped mt-3">
                <thead>
                  <tr>
                    {columns1.map((column) => (
                      <th
                        key={column.accessor}
                        onClick={() => handleSort(column.accessor)} // Bấm vào tiêu đề cột để sắp xếp
                        style={{ cursor: "pointer" }}
                      >
                        {column.Header}
                        {sortColumn === column.accessor && (sortOrder === "ASC" ? " 🔼" : " 🔽")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data1.length > 0 ? (
                    data1.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.thiet_bi}</td>
                        <td>{item.trang_thai}</td>
                        <td>{item.thoi_gian}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns1.length} style={{ textAlign: "center" }}>
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </BootstrapTable>

              {/* Phân trang */}
              <div className="pagination">
                <button onClick={() => setPageIndex((prev) => Math.max(prev - 1, 1))} disabled={pageIndex === 1}>
                  {"<"}
                </button>

                {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                  const pageNum = pageIndex - 5 + i;
                  if (pageNum >= 1 && pageNum <= totalPages) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPageIndex(pageNum)}
                        className={pageIndex === pageNum ? "active" : ""}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}

                {totalPages > 10 && (
                  <>
                    <span>...</span>
                    <button onClick={() => setPageIndex(totalPages)}>{totalPages}</button>
                  </>
                )}

                <button onClick={() => setPageIndex((prev) => Math.min(prev + 1, totalPages))} disabled={pageIndex === totalPages}>
                  {">"}
                </button>

                {/* Hiển thị trang hiện tại và tổng số trang */}
                <span style={{ marginLeft: "10px" }}>
                  Trang {pageIndex} / {totalPages}
                </span>

                {/* Tùy chọn giới hạn số trang */}
                <Form.Control
                  as="select"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  style={{ width: "120px", display: "inline-block", marginLeft: "20px" }}
                >
                  <option value="5">5 mục</option>
                  <option value="10">10 mục</option>
                  <option value="20">20 mục</option>
                  <option value="50">50 mục</option>
                </Form.Control>
              </div>

              {/* Đi đến trang */}
              <Form inline className="mt-3">
                <Form.Control
                  type="number"
                  value={inputPage}
                  onChange={(e) => setInputPage(Number(e.target.value))}
                  placeholder="Nhập trang"
                  min="1"
                  max={totalPages}
                  style={{ width: "100px", marginRight: "10px" }}
                />
                <Button onClick={handlePageChange} style={{ backgroundColor: "black", color: "white", borderColor: "black" }}>
                  Đi đến trang
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ActionHistory;
