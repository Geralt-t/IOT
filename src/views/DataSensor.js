import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useTable, usePagination, useGlobalFilter, useSortBy } from "react-table";
import {
  Card,
  Container,
  Row,
  Col,
  Table as BootstrapTable,
  FormControl,
  Form,
  InputGroup,
} from "react-bootstrap";

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

function DataSensor() {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/data");
        const formattedData = response.data
          .map((item) => ({
            id: item.id,
            nhietdo: item.nhietdo + "°C",
            doam: item.doam + "%",
            anh_sang: item.anh_sang + " lux",
            time: item.received_at,
          }))
          .reverse();
        setData(formattedData);
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu:", error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const columns = useMemo(
    () => [
      { Header: "ID", accessor: "id" },
      { Header: "Nhiệt độ", accessor: "nhietdo" },
      { Header: "Độ ẩm", accessor: "doam" },
      { Header: "Ánh sáng", accessor: "anh_sang" },
      { Header: "Thời gian ", accessor: "time" },
    ],
    []
  );

  const [filterColumn, setFilterColumn] = useState("all");
  const [filterValue, setFilterValue] = useState("");

  const filteredData = useMemo(() => {
    if (!filterValue && !startDate && !endDate) return data;

    return data.filter((row) => {
      const rowTime = formatDate(row.time).toLowerCase();
      const lowerCaseFilterValue = filterValue.toLowerCase();

      // Check date range if filterColumn is "time"
      const rowDate = new Date(row.time).getTime();
      const startDateTime = startDate ? new Date(startDate).getTime() : null;
      const endDateTime = endDate ? new Date(endDate).getTime() : null;

      if (filterColumn === "all") {
        return (
          row.nhietdo.toLowerCase().includes(lowerCaseFilterValue) ||
          row.doam.toLowerCase().includes(lowerCaseFilterValue) ||
          row.anh_sang.toLowerCase().includes(lowerCaseFilterValue) ||
          rowTime.includes(lowerCaseFilterValue)
        );
      }

      if (filterColumn === "time") {
        const isWithinDateRange =
          (startDateTime === null || rowDate >= startDateTime) &&
          (endDateTime === null || rowDate <= endDateTime);
        return isWithinDateRange && rowTime.includes(lowerCaseFilterValue);
      }

      return row[filterColumn].toLowerCase().includes(lowerCaseFilterValue);
    });
  }, [filterValue, filterColumn, data, startDate, endDate]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data: filteredData,
      initialState: { pageIndex: 0 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

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
                <Row>
                  <Col md="4">
                    <Form.Group style={{ marginBottom: "1px" }}>
                      <Form.Control
                        as="select"
                        value={filterColumn}
                        onChange={(e) => {
                          setFilterColumn(e.target.value);
                          setFilterValue("");
                          setStartDate("");
                          setEndDate("");
                        }}
                        style={{ width: "200px", display: "inline-block", marginLeft: "10px", marginRight: "10px" }}
                      >
                        <option value="all">Tất cả</option>
                        <option value="nhietdo">Nhiệt độ</option>
                        <option value="doam">Độ ẩm</option>
                        <option value="anh_sang">Ánh sáng</option>
                        <option value="time">Thời gian đo</option>
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md="4">
                    <Form.Group style={{ marginBottom: "10px" }}>
                      <FormControl
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        placeholder="Tìm kiếm..."
                        style={{ width: "300px", display: "inline-block", marginLeft: "10px", marginRight: "10px" }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                {/* Hiển thị các trường tìm kiếm startDate và endDate khi filterColumn là "time" */}
                <Row>
                  {filterColumn === "time" && (
                    <>
                      <Col md="4">
                        <Form.Group style={{ marginBottom: "10px" }}>
                          <FormControl
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            placeholder="Ngày bắt đầu"
                            style={{ width: "200px", display: "inline-block", marginRight: "30px" }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md="4">
                        <Form.Group style={{ marginBottom: "10px" }}>
                          <FormControl
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            placeholder="Ngày kết thúc"
                            style={{ width: "200px", display: "inline-block",marginLeft: "20px" ,marginRight: "10px" }}
                          />
                        </Form.Group>
                      </Col>
                    </>
                  )}
                </Row>
              </Row>


              <BootstrapTable {...getTableProps()} className="table-hover table-striped">
                <thead>
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps(column.getSortByToggleProps())}
                          className={
                            column.isSorted ? (column.isSortedDesc ? "sort-desc" : "sort-asc") : ""
                          }
                        >
                          {column.render("Header")}
                          <span>
                            {column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}
                          </span>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {page.map((row) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map((cell) => (
                          <td {...cell.getCellProps()}>
                            {cell.column.id === "time" ? formatDate(cell.value) : cell.render("Cell")}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </BootstrapTable>

              <div className="pagination">
                <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                  {"<<"}
                </button>
                <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                  {"<"}
                </button>
                <button onClick={() => nextPage()} disabled={!canNextPage}>
                  {">"}
                </button>
                <button onClick={() => gotoPage(pageOptions.length - 1)} disabled={!canNextPage}>
                  {">>"}
                </button>
                <span>
                  Trang{" "}
                  <strong>
                    {pageIndex + 1} của {pageOptions.length}
                  </strong>{" "}
                </span>
                <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
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

export default DataSensor;
