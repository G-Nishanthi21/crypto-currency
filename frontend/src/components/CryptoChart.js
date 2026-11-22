
import React, { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";

function CryptoChart(props) {

    const chartRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [interval, setInterval] = useState("1m");

    const symbol = props.symbol || "BTCUSDT";

    useEffect(() => {

        setLoading(true);
        setError("");

        const chart = createChart(chartRef.current, {
            width: chartRef.current.clientWidth,
            height: 400,
            layout: {
                background: {
                    color: "transparent"
                },
                textColor: "#64748B"
            },
            grid: {
                vertLines: {
                    color: "#E2E8F0"
                },
                horzLines: {
                    color: "#E2E8F0"
                }
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false
            }
        });

        const candleSeries = chart.addSeries(CandlestickSeries);

        let socket;
        let reconnectTimer;
        let shouldReconnect = true;

        async function getChartData() {

            try {

                const response = await fetch(
                    "https://crypto-currency-8935.onrender.com/api/klines/" +
                    symbol +
                    "?interval=" + interval + "&limit=200"
                );

                if (response.status !== 200) {
                    throw new Error("Klines API request failed");
                }

                const data = await response.json();

                if (shouldReconnect) {

                    const candleData = [];

                    data.forEach((item) => {

                        const candle = {
                            time: item[0] / 1000,
                            open: Number(item[1]),
                            high: Number(item[2]),
                            low: Number(item[3]),
                            close: Number(item[4])
                        };

                        candleData.push(candle);

                    });

                    candleSeries.setData(candleData);

                    setLoading(false);

                    connectSocket();

                }

            } catch (error) {

                if (shouldReconnect) {

                    console.log("Klines API Error:", error.message);

                    setError("Unable to load chart data");

                    setLoading(false);

                }

            }

        }

        function connectSocket() {

            if (shouldReconnect === false) {
                return;
            }

            socket = new WebSocket(
                "wss://data-stream.binance.vision:443/ws/" +
                symbol.toLowerCase() +
                "@kline_" + interval
            );

            socket.onopen = () => {

                console.log("Kline WebSocket Connected");

            };

            socket.onmessage = (event) => {

                const message = JSON.parse(event.data);

                const kline = message.k;

                const candle = {
                    time: kline.t / 1000,
                    open: Number(kline.o),
                    high: Number(kline.h),
                    low: Number(kline.l),
                    close: Number(kline.c)
                };

                candleSeries.update(candle);

                console.log(
                    "Chart Live Update:",
                    symbol,
                    candle.close
                );

            };

            socket.onerror = (event) => {

                console.log("Kline WebSocket Error:", event);

            };

            socket.onclose = (event) => {

                console.log(
                    "Kline WebSocket Disconnected:",
                    event.code,
                    event.reason
                );

                if (shouldReconnect) {

                    reconnectTimer = setTimeout(() => {

                        console.log("Reconnecting Kline WebSocket...");

                        connectSocket();

                    }, 3000);

                }

            };

        }

        getChartData();

        function resizeChart() {

            if (chartRef.current) {

                chart.applyOptions({
                    width: chartRef.current.clientWidth
                });

            }

        }

        window.addEventListener("resize", resizeChart);

        return () => {

            shouldReconnect = false;

            clearTimeout(reconnectTimer);

            window.removeEventListener("resize", resizeChart);

            if (socket) {
                socket.close();
            }

            chart.remove();

        };

    }, [symbol, interval]);

    return (

        <div className="crypto-chart-container">

            <h2>{symbol} Candlestick Chart</h2>

            <div className="chart-controls">

                <label>Select Interval: </label>

                <select
                    value={interval}
                    onChange={(event) => setInterval(event.target.value)}
                >

                    <option value="1m">1 Minute</option>

                    <option value="5m">5 Minutes</option>

                    <option value="1h">1 Hour</option>

                    <option value="1d">1 Day</option>

                </select>

            </div>

            {loading && <p>Loading chart...</p>}

            {error !== "" && <p>{error}</p>}

            <div
                ref={chartRef}
                style={{
                    width: "100%",
                    minHeight: "400px"
                }}
            ></div>

        </div>

    );

}

export default CryptoChart;
