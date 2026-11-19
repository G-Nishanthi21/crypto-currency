
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
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
            width: 800,
            height: 400
        });

        const candleSeries = chart.addSeries(CandlestickSeries);

        let socket;
        let reconnectTimer;
        let shouldReconnect = true;

        axios.get(
            "http://localhost:5000/api/klines/" +
            symbol +
            "?interval=" + interval + "&limit=200"
        )
            .then((response) => {

                const candleData = [];

                for (let i = 0; i < response.data.length; i++) {

                    const candle = {
                        time: response.data[i][0] / 1000,
                        open: Number(response.data[i][1]),
                        high: Number(response.data[i][2]),
                        low: Number(response.data[i][3]),
                        close: Number(response.data[i][4])
                    };

                    candleData.push(candle);

                }

                if (shouldReconnect) {

                    candleSeries.setData(candleData);

                    setLoading(false);

                    connectSocket();

                }

            })
            .catch((error) => {

                console.log("Klines API Error:", error);

                if (shouldReconnect) {
                    setError("Unable to load chart data");
                    setLoading(false);
                }

            });

        function connectSocket() {

            socket = new WebSocket(
                "wss://stream.binance.com:9443/ws/" +
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

            };

            socket.onclose = () => {

                console.log("Kline WebSocket Disconnected");

                if (shouldReconnect) {

                    reconnectTimer = setTimeout(() => {

                        console.log("Reconnecting Kline WebSocket...");

                        connectSocket();

                    }, 3000);

                }

            };

            socket.onerror = () => {
                console.log("Kline WebSocket Error");
                socket.close();
            };

        }

        return () => {

            shouldReconnect = false;

            clearTimeout(reconnectTimer);

            if (socket) {
                socket.close();
            }

            chart.remove();

        };

    }, [symbol, interval]);

    return (
        <div>

            <h2>{symbol} Candlestick Chart</h2>

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

            {loading && <p>Loading chart...</p>}

            {error !== "" && <p>{error}</p>}

            <div ref={chartRef}></div>

        </div>
    );

}

export default CryptoChart;
