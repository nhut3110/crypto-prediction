import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { List, Card, Avatar, Typography } from "antd";
import { w3cwebsocket as W3CWebSocket } from "websocket";

const Dashboard = () => {
  const [coinsData, setCoinsData] = useState({
    "BNB/USDT": {
      title: "BNB/USDT",
      logo: "./assets/bnb.svg",
      price: 0,
      previousPrice: null,
      marketCap: 0,
      volume: 0,
      change: 0,
      link: "/bnb",
    },
    "ETH/USDT": {
      title: "ETH/USDT",
      logo: "./assets/ethereum.svg",
      price: 0,
      previousPrice: null,
      marketCap: 0,
      volume: 0,
      change: 0,
      link: "/eth",
    },
  });

  useEffect(() => {
    const bnbClient = new W3CWebSocket(
      "wss://stream.binance.com:9443/ws/bnbusdt@ticker"
    );
    const ethClient = new W3CWebSocket(
      "wss://stream.binance.com:9443/ws/ethusdt@ticker"
    );

    const updateData = (coin, data) => {
      setCoinsData((prevData) => ({
        ...prevData,
        [coin]: {
          ...prevData[coin],
          previousPrice: prevData[coin].price,
          price: parseFloat(data.c),
          volume: parseFloat(data.q),
          change: parseFloat(data.p),
        },
      }));
    };

    bnbClient.onmessage = (message) => {
      const data = JSON.parse(message.data);
      updateData("BNB/USDT", data);
    };

    ethClient.onmessage = (message) => {
      const data = JSON.parse(message.data);
      updateData("ETH/USDT", data);
    };

    return () => {
      bnbClient.close();
      ethClient.close();
    };
  }, []);

  const renderChange = (change) => {
    const color = change > 0 ? "green" : "red";
    return (
      <span style={{ color: color }}>
        {change.toFixed(2)}% {change > 0 ? "🔼" : "🔽"}
      </span>
    );
  };

  const getPriceColor = (price, previousPrice) => {
    if (!previousPrice) return "black"; // No change if no previous price
    return price > previousPrice ? "green" : "red";
  };

  const coinItems = Object.values(coinsData);

  return (
    <List
      grid={{ gutter: 16, column: 4 }}
      dataSource={coinItems}
      renderItem={(item) => (
        <List.Item>
          <Card
            bordered
            title={
              <Link to={item.link}>
                <Avatar src={item.logo} /> {item.title}
              </Link>
            }
          >
            <Typography.Title
              level={4}
              style={{ color: getPriceColor(item.price, item.previousPrice) }}
            >
              Price: ${item.price.toFixed(2)}
            </Typography.Title>
            <p>Market Cap: N/A</p>
            <p>Volume: {item.volume.toFixed(0)}</p>
            <p>Change: {renderChange(item.change)}</p>
          </Card>
        </List.Item>
      )}
    />
  );
};

export default Dashboard;
