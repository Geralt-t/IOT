import React, { useState, useEffect } from "react";
import ChartistGraph from "react-chartist";
import { Card, Container, Row, Col } from "react-bootstrap";
import mqtt from "mqtt"; // Import MQTT
import "./Dashboard.css"; // Import CSS for styling

function Dashboard() {
  const [temperatureData, setTemperatureData] = useState([]);
  const [humidityData, setHumidityData] = useState([]);
  const [lightData, setLightData] = useState([]);
  const [labels, setLabels] = useState([]);

  const [led1Status, setLed1Status] = useState(() => {
    return JSON.parse(localStorage.getItem("led1Status")) || false;
  }); // Quạt
  const [led2Status, setLed2Status] = useState(() => {
    return JSON.parse(localStorage.getItem("led2Status")) || false;
  }); // Điều hòa
  const [led3Status, setLed3Status] = useState(() => {
    return JSON.parse(localStorage.getItem("led3Status")) || false;
  }); // Đèn LED
  const [led1RealTimeStatus, setLed1RealTimeStatus] = useState(false);
  const [led2RealTimeStatus, setLed2RealTimeStatus] = useState(false);
  const [led3RealTimeStatus, setLed3RealTimeStatus] = useState(false);
  // Sử dụng ws:// để kết nối MQTT
  const client = mqtt.connect("ws://192.168.100.4:8080", {
    username: 'duy',
    password: '1234',
  });

  useEffect(() => {
    // Kết nối MQTT client và đăng ký các topic
    client.on("connect", () => {
      client.subscribe('data');
    });
  
    client.on("message", (topic, message) => {
    console.log(`Received message on ${topic}: ${message.toString()}`);

  // Phân tích cú pháp tin nhắn
  const messageContent = message.toString();
  const regex = /Led1:\s*(\w+),\s*Led2:\s*(\w+),\s*Led3:\s*(\w+)/;
  const match = messageContent.match(regex);
  
  if (match) {
    const Status1 = match[1] === "ON";
    const Status2 = match[2] === "ON";
    const Status3 = match[3] === "ON";
    setLed1RealTimeStatus(Status1);
    setLed2RealTimeStatus(Status2);
    setLed3RealTimeStatus(Status3);
  } 
});
    
    // Fetch dữ liệu mỗi 5 giây từ API
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3001/data");
        const data = await response.json();
  
        const tempData = [];
        const humData = [];
        const lightData = [];
        const timeLabels = [];
  
        data.forEach(item => {
          const temp = parseFloat(item.nhietdo.replace(",", "."));
          const hum = parseFloat(item.doam.replace(",", "."));
          const light = parseFloat(item.anh_sang.replace(",", "."));
          const time = new Date(item.received_at).toISOString().slice(11, 19); // Chỉ lấy phần giờ, phút, giây trong định dạng UTC
    
  
          tempData.push(temp);
          humData.push(hum);
          lightData.push(light);
          timeLabels.push(time);
        });
  
        // Lấy dữ liệu mới nhất cho các chỉ số
        setTemperatureData(tempData.slice(-10));
        setHumidityData(humData.slice(-10));
        setLightData(lightData.slice(-10));
        setLabels(timeLabels.slice(-10)); // Giữ lại 10 mốc thời gian gần nhất
  
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData(); // Gọi ngay khi component mount
    const interval = setInterval(fetchData, 2000);
  
    // Cleanup
    return () => {
      clearInterval(interval);
      client.end(); // Ngắt kết nối MQTT khi unmount component
    };
  }, []);
  
  const sendDeviceStatusToAPI = async (device, status) => {
    const timestamp = new Date().toISOString(); // Lấy thời gian hiện tại
    try {
      await fetch("http://localhost:5000/api/device-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ device, status, timestamp }),
      });
    } catch (error) {
      console.error("Error sending device status:", error);
    }
  };
  // Hàm thay đổi trạng thái thiết bị
  const handleDeviceToggle = async (device) => {
    const status = device === "led1" ? led1Status :
                   device === "led2" ? led2Status :
                   led3Status;
    const newStatus = !status;
  
    // Gọi API để điều khiển thiết bị
    try {
      await fetch("http://localhost:5000/api/control-device", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ device, status: newStatus }),
      });
  
      // Cập nhật trạng thái thiết bị trên Local Storage
      localStorage.setItem(`${device}Status`, JSON.stringify(newStatus));
  
      // Cập nhật trạng thái thiết bị trên giao diện
      if (device === "led1") {
        setLed1Status(newStatus);
        await sendDeviceStatusToAPI(device, newStatus ? "ON" : "OFF"); // Gửi trạng thái thiết bị
      } else if (device === "led2") {
        setLed2Status(newStatus);
        await sendDeviceStatusToAPI(device, newStatus ? "ON" : "OFF");
      } else if (device === "led3") {
        setLed3Status(newStatus);
        await sendDeviceStatusToAPI(device, newStatus ? "ON" : "OFF");
      }
    } catch (error) {
      console.error("Error controlling device:", error);
    }
  };
  
// Hàm để xác định màu sắc cho ô
const getTemperatureColor = (value) => {
  return value > 40 ? "rgba(255, 0, 0, 0.8)" : value > 15 ? "rgba(255, 192, 203, 0.8)" : "rgba(255, 255, 255, 0.8)"; // Đỏ đậm, đỏ nhạt và màu trắng
};
const getHumidityColor = (value) => {
  return value > 85 ? "rgba(0, 0, 255, 0.8)" : value > 35 ? "rgba(173, 216, 230, 0.8)" : "rgba(255, 255, 255, 0.8)"; // Xanh đậm, xanh nhạt và xanh lá
};
const getLightColor = (value) => {
  return value > 300 ? "rgba(255, 255, 0, 0.8)" : value > -1 ? "rgba(255, 255, 224, 0.8)" : "rgba(255, 255, 255, 0.8)"; // Vàng đậm, vàng nhạt và xanh lá
};
  return (
    <Container fluid>
      <Row>
        <Col lg="9">
          {/* Các chỉ số */}
          <Row>
            {/* Thông tin nhiệt độ */}
            <Col lg="4" sm="6">
            <Card className="card-stats" style={{ backgroundColor: getTemperatureColor(temperatureData[temperatureData.length - 1] || 0) }}>                <Card.Body>
                  <Row>
                    <Col xs="5">
                      <div className="icon-big text-center icon-warning">
                        <i className="fas fa-thermometer-half text-danger"></i>
                      </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Nhiệt độ (C)</p>
                        <Card.Title as="h4">{temperatureData[temperatureData.length - 1]}</Card.Title>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* Thông tin độ ẩm */}
            <Col lg="4" sm="6">
            <Card className="card-stats" style={{ backgroundColor: getHumidityColor(humidityData[humidityData.length-1] || 0) }}>
            <Card.Body>
                  <Row>
                    <Col xs="5">
                      <div className="icon-big text-center icon-warning">
                        <i className="fas fa-tint text-info"></i>
                      </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Độ ẩm (%)</p>
                        <Card.Title as="h4">{humidityData[humidityData.length-1]}%</Card.Title>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* Thông tin ánh sáng */}
            <Col lg="4" sm="6">
            <Card className="card-stats" style={{ backgroundColor: getLightColor(lightData[lightData.length-1] || 0) }}>
            <Card.Body>
                  <Row>
                    <Col xs="5">
                      <div className="icon-big text-center icon-warning">
                        <i className="fas fa-sun text-warning"></i>
                      </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Ánh sáng (lux)</p>
                        <Card.Title as="h4">{lightData[lightData.length-1]}</Card.Title>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Biểu đồ */}
          <Row>
            <Col md="12">
              <Card>
                <Card.Header>
                  <Card.Title as="h4">Real-time Chart</Card.Title>
                </Card.Header>
                <Card.Body>
                  <div className="ct-chart" id="chartHours">
                    <ChartistGraph
                      data={{
                        labels: labels,
                        series: [humidityData, temperatureData, lightData],
                      }}
                      type="Line"
                      options={{
                        low: 0,
                        high: 300,
                        showArea: false,
                        height: "245px",
                        axisX: {
                          showGrid: false,
                        },
                        lineSmooth: true,
                        showLine: true,
                        showPoint: true,
                        fullWidth: true,
                        chartPadding: {
                          right: 50,
                        },
                      }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
        {/* Các thiết bị */}
        <Col lg="3">
          <Row>
            {/* Quạt */}
            <Col sm="12">
              <Card className={`card-stats ${led1RealTimeStatus ? "device-on" : "device-off"}`}>
                <Card.Body>
                  <Row>
                    <Col xs="5">
                      <div className="icon-big text-center">
                        <img
                          src="https://icons.veryicon.com/png/o/education-technology/blue-technology-fire-fighting/forced-draft-fan.png"
                          alt="Fan"
                          className="fan-image"
                          style={{ width: "60px", height: "60px" }}
                        />
                      </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Quạt</p>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={led1Status}
                            onChange={() => handleDeviceToggle("led1")}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* Điều hòa */}
            <Col sm="12">
              <Card className={`card-stats ${led2RealTimeStatus ? "device-on" : "device-off"}`}>
                <Card.Body>
                  <Row>
                  <Col xs="5">
                      <div className="icon-big text-center">
                        <i className="fas fa-snowflake text-primary"></i>
                      </div>
                    </Col>
                    
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Điều hòa</p>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={led2Status}
                            onChange={() => handleDeviceToggle("led2")}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* Đèn LED */}
            <Col sm="12">
              <Card className={`card-stats ${led3RealTimeStatus ? "device-on" : "device-off"}`}>
                <Card.Body>
                  <Row>
                  <Col xs="5">
                      <div className="icon-big text-center">
                        <i className="fas fa-lightbulb text-primary"></i>
                      </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Đèn LED</p>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={led3Status}
                            onChange={() => handleDeviceToggle("led3")}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
