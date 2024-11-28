import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Card,
  Container,
  Row,
  Col,
  Table as BootstrapTable,
  FormControl,
  Form,
  Button,
} from "react-bootstrap";

function DataSensor() {
  const [data, setData] = useState([]);
  const [filterColumn, setFilterColumn] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState("received_at");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [inputPage, setInputPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchUrl = `http://localhost:3001/data?page=${pageIndex}&limit=${pageSize}&sortColumn=${sortColumn}&sortOrder=${sortOrder}&filterColumn=${filterColumn}&filterValue=${filterValue}`;

        const response = await axios.get(fetchUrl);

        const formattedData = response.data.data.map((item) => ({
          id: item.id,
          nhietdo: item.nhietdo + "°C",
          doam: item.doam + "%",
          anh_sang: item.anh_sang + " lux",
          received_at: item.received_at,
        }));

        setData(formattedData);
        setTotalRecords(response.data.totalRecords);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [pageIndex, pageSize, sortColumn, sortOrder, filterValue, filterColumn]);

  const columns = useMemo(
    () => [
      { Header: "ID", accessor: "id" },
      { Header: "Nhiệt độ", accessor: "nhietdo" },
      { Header: "Độ ẩm", accessor: "doam" },
      { Header: "Ánh sáng", accessor: "anh_sang" },
      { Header: "Thời gian", accessor: "received_at" },
    ],
    []
  );

  const handleFilterValueChange = (e) => {
    const sanitizedValue = e.target.value.replace(/^\s+|\t/g, "");
    setFilterValue(sanitizedValue);
    setPageIndex(1);
  };

  const handlePageChange = () => {
    if (inputPage > 0 && inputPage <= totalPages) {
      setPageIndex(inputPage);
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder((prevOrder) => (prevOrder === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortColumn(column);
      setSortOrder("ASC");
    }
    setPageIndex(1); // Reset to first page when sorting changes
  };

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="card-plain table-plain-bg">
            <Card.Header>
              <Card.Title as="h4">Temperature, Humidity And Light Table</Card.Title>
              <p className="card-category">Temperature, Humidity And Light Data</p>
            </Card.Header>
            <Card.Body className="table-full-width table-responsive px-0">
              <Row>
                <Col md="4">
                  <Form.Group style={{ marginBottom: "1px" }}>
                    <Form.Control
                      as="select"
                      value={filterColumn}
                      onChange={(e) => {
                        setFilterColumn(e.target.value);
                        setFilterValue("");
                        setPageIndex(1);
                      }}
                      style={{
                        width: "200px",
                        display: "inline-block",
                        marginLeft: "10px",
                        marginRight: "10px",
                      }}
                    >
                      <option value="all">Tất cả</option>
                      <option value="nhietdo">Nhiệt độ</option>
                      <option value="doam">Độ ẩm</option>
                      <option value="anh_sang">Ánh sáng</option>
                      <option value="received_at">Thời gian đo</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md="4">
                  <Form.Group style={{ marginBottom: "10px" }}>
                    <FormControl
                      value={filterValue}
                      onChange={handleFilterValueChange}
                      placeholder="Tìm kiếm..."
                      style={{
                        width: "300px",
                        display: "inline-block",
                        marginLeft: "10px",
                        marginRight: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                
              </Row>

              <BootstrapTable className="table-hover table-striped">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.accessor}
                        onClick={() => handleSort(column.accessor)}
                        style={{ cursor: "pointer" }}
                      >
                        {column.Header}{" "}
                        {sortColumn === column.accessor && (sortOrder === "ASC" ? "▲" : "▼")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 ? (
                    data.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.nhietdo}</td>
                        <td>{item.doam}</td>
                        <td>{item.anh_sang}</td>
                        <td>{item.received_at}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} style={{ textAlign: "center" }}>
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </BootstrapTable>

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
              </div>

              {/* Hiển thị tổng số trang và trang hiện tại */}
              <div className="pagination-info">
                <p>
                  Trang {pageIndex} / {totalPages}
                </p>
              </div>

              <Form inline className="mt-3">
  <Col md="4">
    <Form.Control
      as="select"
      value={pageSize}
      onChange={(e) => {
        setPageSize(Number(e.target.value));
        setPageIndex(1); // Reset to first page when page size changes
      }}
      style={{
        width: "120px",
        display: "inline-block",
        marginRight: "10px",
      }}
    >
      <option value={10}>10</option>
      <option value={20}>20</option>
      <option value={50}>50</option>
      <option value={100}>100</option>
    </Form.Control>
  </Col>
  
  <Col md="4">
    <Form.Control
      type="number"
      value={inputPage}
      onChange={(e) => setInputPage(Number(e.target.value))}
      placeholder="Nhập trang"
      min="1"
      max={totalPages}
      style={{ width: "100px", marginRight: "10px" }}
    />
  </Col>
  
  <Col md="4">
    <Button
      onClick={handlePageChange}
      style={{ backgroundColor: "black", color: "white", borderColor: "black" }}
    >
      Đi đến trang
    </Button>
  </Col>
</Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default DataSensor;
