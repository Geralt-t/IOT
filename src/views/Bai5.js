import React, { useState, useEffect } from "react";
import ChartistGraph from "react-chartist";
import { Card, Container, Row, Col } from "react-bootstrap";
import mqtt from "mqtt";
import './bai5.css'; // Import the CSS file

function Bai5() {
  const [windSpeed, setWindSpeed] = useState(0);
  const [chartData, setChartData] = useState({
    labels: [],
    series: [[]],
  });
  const [isWarningActive, setWarningActive] = useState(false);

  // Lấy dữ liệu windspeed từ API
  useEffect(() => {
    const fetchWindSpeedData = async () => {
      try {
        const response = await fetch('http://localhost:3001/windspeed'); // Địa chỉ API
        const data = await response.json();
        
        if (data && data.data && data.data.length > 0) {
          const latestWindSpeed = data.data[0].windspeed;  // Lấy windspeed mới nhất
          setWindSpeed(latestWindSpeed);

          setChartData((prevData) => {
            const updatedSeries = [...prevData.series[0], latestWindSpeed];
            const updatedLabels = [...prevData.labels, new Date().toLocaleTimeString()];
            return {
              labels: updatedLabels.slice(-6),
              series: [updatedSeries.slice(-6)],
            };
          });
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu windspeed:', error);
      }
    };

    fetchWindSpeedData();
    const interval = setInterval(fetchWindSpeedData, 2000);

    return () => clearInterval(interval);
  }, []);

  // Kết nối MQTT
  useEffect(() => {
    const client = mqtt.connect("ws://172.20.10.3:8080");

    client.on("connect", () => {
      client.subscribe("wind/speed");
      client.subscribe("wind/warning");
    });

    client.on("message", (topic, message) => {
      if (topic === "wind/speed") {
        const speed = parseFloat(message.toString());
        setWindSpeed(speed);

        setChartData((prevData) => {
          const updatedSeries = [...prevData.series[0], speed];
          const updatedLabels = [...prevData.labels, new Date().toLocaleTimeString()];
          return {
            labels: updatedLabels.slice(-6),
            series: [updatedSeries.slice(-6)],
          };
        });
      } else if (topic === "wind/warning") {
        const warning = message.toString() === "ON";
        setWarningActive(warning);
      }
    });

    return () => client.end();
  }, []);

  // Logic to decide if light should be on (windSpeed > 60)
  const isLightOn = windSpeed > 60;

  return (
    <Container>
      <Row>
        {/* Cột trái cho Wind Speed */}
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Wind Speed</Card.Title>
              <h3>{windSpeed} m/s</h3>
            </Card.Body>
          </Card>
        </Col>

        {/* Cột giữa cho Biểu đồ */}
        <Col md={6}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Wind Speed Chart</Card.Title>
              <ChartistGraph
                data={chartData}
                type="Line"
                options={{
                  low: 0,
                  showArea: true,
                  height: "300px", 
                  axisX: {
                    showGrid: true,
                    labelInterpolationFnc: (value, index) => {
                      // Đảm bảo giá trị là một chuỗi có thể chuyển thành Date hợp lệ
                      const dateValue = new Date(value);
                      return isNaN(dateValue) ? value : dateValue.toLocaleTimeString();  // Kiểm tra nếu là ngày hợp lệ
                    }
                  },
                  axisY: {
                    onlyInteger: true,
                    offset: 20,
                    scaleMinSpace: 15,
                    ticks: [0, 20, 40, 60, 80, 100], // Các mốc từ 0 đến 100
                  }
                }}
              />

            </Card.Body>
          </Card>
        </Col>

        {/* Cột phải cho Warning Light */}
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Warning Light</Card.Title>
              <div
                className={`warning-light ${isLightOn ? 'blink' : ''}`}
                style={{
                  backgroundColor: isLightOn ? "yellow" : "gray", // Đèn sáng màu vàng khi isLightOn = true
                }}
              ></div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Bai5;
