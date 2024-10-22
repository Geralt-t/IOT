import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';

const MQTTComponent = () => {
    const [data, setData] = useState(null);
    
    useEffect(() => {
        const client = mqtt.connect('mqtt://172.20.10.3:1884', {
            username: 'duy',
            password: '1234',
        });

        client.on('connect', () => {
            console.log('Connected to MQTT broker');
            client.subscribe('data', (err) => {
                if (!err) {
                    console.log('Subscribed to topic: data');
                }
            });
        });

        client.on('message', (topic, message) => {
            const receivedData = message.toString();
            console.log('Received message:', receivedData);
            setData(receivedData);  // Cập nhật state với dữ liệu nhận được
        });

        // Dọn dẹp khi component unmount
        return () => {
            client.end();
        };
    }, []);

    return (
        <div>
            <h1>Real-time Data from IoT Sensor</h1>
            <div>
                {data ? <p>Data: {data}</p> : <p>No data received yet.</p>}
            </div>
        </div>
    );
};

export default MQTTComponent;
