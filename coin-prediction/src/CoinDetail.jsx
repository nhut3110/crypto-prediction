import { useState, useEffect, useCallback } from "react";
import { Chart as ChartJS, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
import ccxt from "ccxt";
import { Avatar, Card, Col, Row, Space, Spin, Statistic } from "antd";
import ReactApexChart from "react-apexcharts";
import { w3cwebsocket as W3CWebSocket } from "websocket";

ChartJS.register(...registerables);

const CoinDetail = ({ coin }) => {
  const [predictionData, setPredictionData] = useState({
    labels: [],
    datasets: [],
  });
  const [coinMetadata, setCoinMetadata] = useState({});
  const [candleData, setCandleData] = useState({
    options: {},
    series: [{ data: [] }],
  });
  const [loading, setLoading] = useState(false);
  const [previousPrice, setPreviousPrice] = useState();

  const transformCandleData = (candle) => ({
    x: new Date(candle[0]),
    y: candle.slice(1, 5).map((value) => Number(value.toFixed(2))),
  });

  const fetchInitialCandleData = useCallback(async () => {
    setLoading(true);
    try {
      const exchange = new ccxt.binance({ rateLimit: 1200 });
      const since = new Date().getTime() - 2 * 24 * 60 * 60 * 1000; // 2 days back, change it if you want
      const candles = await exchange.fetchOHLCV(coin, "15m", since);

      const seriesData = candles.map((candle) => transformCandleData(candle));
      setCandleData({
        options: candleData.options,
        series: [{ data: seriesData }],
      });
    } catch (error) {
      console.error("Error fetching initial candle data:", error);
    }
    setLoading(false);
  }, [coin, candleData.options]);

  useEffect(() => {
    const ws = new W3CWebSocket(
      `wss://stream.binance.com:9443/ws/${coin.toLowerCase()}@kline_15m`
    );

    ws.onmessage = (message) => {
      const { k: candle } = JSON.parse(message.data);
      setCandleData((prevData) => {
        const series = prevData.series[0].data;
        const newCandle = transformCandleData([
          candle.t,
          candle.o,
          candle.h,
          candle.l,
          candle.c,
        ]);

        // Update the latest candle or add a new one
        if (
          series.length &&
          series[series.length - 1].x.getTime() === newCandle.x.getTime()
        ) {
          series[series.length - 1] = newCandle;
        } else {
          series.push(newCandle);
        }

        return {
          ...prevData,
          series: [{ data: series }],
        };
      });
    };

    return () => ws.close();
  }, [coin, fetchInitialCandleData]);

  useEffect(() => {
    setCandleData((prevData) => ({
      ...prevData,
      options: {
        ...prevData.options,
        xaxis: {
          ...prevData.options.xaxis,
          labels: {
            formatter: function (value) {
              return new Date(value).toLocaleString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
            },
          },
        },
      },
    }));
  }, [coin]);

  const fetchPredictions = useCallback(
    async (prices) => {
      const selectedCoin = coin.split("/")[0].toLowerCase();
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/predict/${selectedCoin}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prices }),
          }
        );
        const data = await response.json();
        return data.prediction;
      } catch (error) {
        console.error("Error fetching predictions:", error);
        return [];
      }
    },
    [coin]
  );

  const fetchPredictionData = useCallback(async () => {
    try {
      const exchange = new ccxt.binance();
      let allData = [];
      let since = new Date().getTime() - 180 * 86400000; // 180 days back

      while (since < new Date().getTime()) {
        const data = await exchange.fetchOHLCV(coin, "1d", since);
        if (data.length === 0) break;
        allData = allData.concat(data);
        since = data[data.length - 1][0] + 86400000;
      }

      if (allData.length > 0) {
        const recentPrices = allData.slice(-60).map((d) => d[1]);
        const predictions = await fetchPredictions(recentPrices);
        setPredictionData(processPredictionData(allData, predictions));
      }
    } catch (error) {
      console.error("Error fetching prediction data:", error);
    }
  }, [coin, fetchPredictions]);

  useEffect(() => {
    const client = new W3CWebSocket(
      `wss://stream.binance.com:9443/ws/${coin
        .split("/")
        .join("")
        .toLowerCase()}@ticker`
    );

    client.onmessage = (message) => {
      const data = JSON.parse(message.data);
      setCoinMetadata((prevMetadata) => {
        // Update previous price state
        setPreviousPrice(prevMetadata.price);
        return {
          price: parseFloat(data.c),
          change: parseFloat(data.p),
          volume: parseFloat(data.v),
          low: parseFloat(data.l),
          high: parseFloat(data.h),
          open: parseFloat(data.o),
        };
      });
    };

    return () => {
      client.close();
    };
  }, [coin]);

  useEffect(() => {
    fetchInitialCandleData();
    fetchPredictionData();
  }, [coin]);

  const getPriceChangeColor = (currentPrice, previousPrice) => {
    if (!previousPrice || currentPrice === previousPrice) return "black";
    return currentPrice > previousPrice ? "green" : "red";
  };

  const processPredictionData = (data, predictions) => {
    const labels = data.map((d) => new Date(d[0]).toLocaleDateString());
    const prices = data.map((d) => d[1]);
    const lastDate = new Date(labels[labels.length - 1]);

    for (let i = 1; i <= predictions.length; i++) {
      labels.push(
        new Date(lastDate.getTime() + i * 86400000).toLocaleDateString()
      );
    }

    return {
      labels,
      datasets: [
        {
          label: "Historical Price",
          data: prices,
          fill: true,
          backgroundColor: "rgba(0, 0, 255, 0.2)",
          borderColor: "blue",
        },
        {
          label: "Predicted Price",
          data: [...Array(prices.length).fill(null), ...predictions],
          fill: true,
          backgroundColor: "rgba(128,128,128,0.2)",
          borderColor: "rgba(128,128,128,0.6)",
        },
      ],
    };
  };

  const bnbLogo = "./assets/bnb.svg";
  const ethLogo = "./assets/ethereum.svg";

  return (
    <div>
      <Row gutter={16}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <Avatar src={coin === "BNB/USDT" ? bnbLogo : ethLogo} />
                {coin}
              </Space>
            }
          >
            <Row gutter={16}>
              {/* First row of stats */}
              <Col span={8}>
                <Statistic
                  title="Price"
                  valueStyle={{
                    color: getPriceChangeColor(
                      coinMetadata.price,
                      previousPrice
                    ),
                    fontWeight: "bold",
                  }}
                  value={`$${coinMetadata.price ?? "-"}`}
                  precision={2}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="24h Change"
                  value={`${coinMetadata.change ?? "-"}%`}
                  precision={2}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="24h Volume"
                  value={`$${coinMetadata.volume ?? "-"}`}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              {/* Second row of stats */}
              <Col span={8}>
                <Statistic title="Low" value={`$${coinMetadata.low ?? "-"}`} />
              </Col>
              <Col span={8}>
                <Statistic
                  title="High"
                  value={`$${coinMetadata.high ?? "-"}`}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Open"
                  value={`$${coinMetadata.open ?? "-"}`}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title={`${coin} Current Price Chart`}>
            {loading ? (
              <div
                style={{
                  width: "full",
                  height: "350px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Spin />
              </div>
            ) : (
              <ReactApexChart
                options={candleData.options}
                series={candleData.series}
                type="candlestick"
                height={350}
              />
            )}
          </Card>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Card title={`${coin} Predicted Price Chart`}>
            {predictionData.labels.length > 0 ? (
              <Line data={predictionData} />
            ) : (
              <div
                style={{
                  width: "full",
                  height: "400px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Spin />
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CoinDetail;
