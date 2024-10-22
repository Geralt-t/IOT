import React, { useMemo, useState, useEffect } from "react";
import { useTable, usePagination, useSortBy } from "react-table";
import {
  Card,
  Container,
  Row,
  Col,
  Table as BootstrapTable,
  FormControl,
  Form,
} from "react-bootstrap";

function ActionHistory() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data1, setData1] = useState([]); // Khởi tạo state để chứa dữ liệu
  const [filterColumn, setFilterColumn] = useState("all");
  const [filterValue, setFilterValue] = useState("");

  // Hàm để định dạng ngày tháng năm giờ phút giây
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "UTC",
    };
    return new Intl.DateTimeFormat("sv-SE", options).format(new Date(dateString));
  };

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
        const response = await fetch("http://localhost:5000/api/device-status");
        const result = await response.json();
        setData1(result.reverse()); // Đảo ngược mảng dữ liệu để hiển thị dữ liệu mới nhất lên đầu
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };
    fetchData();
  }, []);

  // Lọc dữ liệu dựa trên cột được chọn và giá trị nhập vào
  const filteredData = useMemo(() => {
    if (!filterValue && !startDate && !endDate) return data1;
    
    return data1.filter((row) => {
      // Nếu có startDate và endDate, kiểm tra khoảng thời gian
      if (startDate && endDate) {
        const rowTime = new Date(row.thoi_gian);
        const startTime = new Date(startDate);
        const endTime = new Date(endDate);
        if (rowTime < startTime || rowTime > endTime) return false;
      }
      
      // Lọc theo cột hoặc toàn bộ khi có giá trị filterValue
      if (filterValue) {
        if (filterColumn === "all") {
          return Object.keys(row).some((key) =>
            String(row[key]).toLowerCase().includes(filterValue.toLowerCase())
          );
        } else if (filterColumn === "thoi_gian") {
          const dateFormatted = formatDate(row.thoi_gian).toLowerCase();
          return dateFormatted.includes(filterValue.toLowerCase());
        } else {
          const cellValue = String(row[filterColumn]).toLowerCase();
          return cellValue.includes(filterValue.toLowerCase());
        }
      }
      
      return true;
    });
  }, [filterValue, filterColumn, data1, startDate, endDate]);
  
  const {
    getTableProps: getTableProps1,
    getTableBodyProps: getTableBodyProps1,
    headerGroups: headerGroups1,
    prepareRow: prepareRow1,
    page: page1,
    canPreviousPage: canPreviousPage1,
    canNextPage: canNextPage1,
    pageOptions: pageOptions1,
    gotoPage: gotoPage1,
    nextPage: nextPage1,
    previousPage: previousPage1,
    setPageSize: setPageSize1,
    state: { pageIndex: pageIndex1, pageSize: pageSize1 },
  } = useTable(
    {
      columns: columns1,
      data: filteredData,
      initialState: { pageIndex: 0 },
    },
    useSortBy,
    usePagination
  );

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
                onChange={(e) => setFilterValue(e.target.value)}
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
              
              {/* Chỉ hiển thị các trường datetime khi chọn "Thời gian" */}
              {filterColumn === "thoi_gian" && (
                <>
                  <FormControl
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mb-3"
                    style={{ width: "200px", display: "inline-block", marginRight: "10px" }}
                  />
                  <FormControl
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mb-3"
                    style={{ width: "200px", display: "inline-block" }}
                  />
                </>
              )}

              <BootstrapTable {...getTableProps1()} className="table-hover table-striped mt-3">
                <thead>
                  {headerGroups1.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                          {column.render("Header")}
                          <span>
                            {column.isSorted
                              ? column.isSortedDesc
                                ? " 🔽"
                                : " 🔼"
                              : ""}
                          </span>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps1()}>
                  {page1.map((row) => {
                    prepareRow1(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map((cell) => (
                          <td {...cell.getCellProps()}>
                            {cell.column.id === "thoi_gian"
                              ? formatDate(cell.value)
                              : cell.render("Cell")}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </BootstrapTable>

              {/* Phân trang */}
              <div className="pagination">
                <button onClick={() => gotoPage1(0)} disabled={!canPreviousPage1}>
                  {"<<"}
                </button>
                <button onClick={() => previousPage1()} disabled={!canPreviousPage1}>
                  {"<"}
                </button>
                <button onClick={() => nextPage1()} disabled={!canNextPage1}>
                  {">"}
                </button>
                <button onClick={() => gotoPage1(pageOptions1.length - 1)} disabled={!canNextPage1}>
                  {">>"}
                </button>
                <span>
                  Trang{" "}
                  <strong>
                    {pageIndex1 + 1} của {pageOptions1.length}
                  </strong>{" "}
                </span>
                <select
                  value={pageSize1}
                  onChange={(e) => setPageSize1(Number(e.target.value))}
                >
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      Hiển thị {pageSize}
                    </option>
                  ))}
                </select>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ActionHistory;
