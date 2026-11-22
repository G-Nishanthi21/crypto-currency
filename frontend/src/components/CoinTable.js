
import React, { useEffect, useState } from "react";

function CoinTable(props) {

    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        let socket;
        let reconnectTimer;
        let shouldReconnect = true;

        async function getCoins() {

            try {

                const response = await fetch(
                    "https://crypto-currency-8935.onrender.com/api/coins"
                );

                if (response.status !== 200) {
                    throw new Error("API request failed");
                }

                const data = await response.json();

                if (shouldReconnect) {

                    setCoins(data);
                    setLoading(false);

                    connectSocket();

                }

            } catch (error) {

                if (shouldReconnect) {
                    setError("Unable to load coin data");
                    setLoading(false);
                }

            }

        }

        function connectSocket() {

            if (shouldReconnect === false) {
                return;
            }

            socket = new WebSocket(
                "wss://data-stream.binance.vision:443/stream?streams=btcusdt@ticker/ethusdt@ticker/bnbusdt@ticker/solusdt@ticker/xrpusdt@ticker/adausdt@ticker/dogeusdt@ticker/trxusdt@ticker/avaxusdt@ticker/linkusdt"
            );

            socket.onopen = () => {

                console.log("WebSocket Connected");

            };

            socket.onmessage = (event) => {

                const message = JSON.parse(event.data);
                const ticker = message.data;

                console.log("Live Update:", ticker.s, ticker.c);

                setCoins(function (oldCoins) {

                    const updatedCoins = [];

                    oldCoins.forEach((item) => {

                        if (item.symbol === ticker.s) {

                            const coin = {
                                symbol: ticker.s,
                                price: ticker.c,
                                change: ticker.P,
                                high: ticker.h,
                                low: ticker.l,
                                volume: ticker.v
                            };

                            updatedCoins.push(coin);

                        } else {

                            updatedCoins.push(item);

                        }

                    });

                    return updatedCoins;

                });

            };

            socket.onerror = (event) => {

                console.log("WebSocket Error:", event);

            };

            socket.onclose = (event) => {

                console.log(
                    "WebSocket Disconnected:",
                    event.code,
                    event.reason
                );

                if (shouldReconnect) {

                    reconnectTimer = setTimeout(() => {

                        console.log("Trying to reconnect...");

                        connectSocket();

                    }, 3000);

                }

            };

        }

        getCoins();

        return () => {

            shouldReconnect = false;

            clearTimeout(reconnectTimer);

            if (socket) {
                socket.close();
            }

        };

    }, []);

    if (loading) {
        return <p>Loading coins...</p>;
    }

    if (error !== "") {
        return <p>{error}</p>;
    }

    return (
        <div>

            <h2>Cryptocurrencies</h2>

            <table border="1">

                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Price</th>
                        <th>24h Change</th>
                        <th>24h High</th>
                        <th>24h Low</th>
                        <th>24h Volume</th>
                    </tr>
                </thead>

                <tbody>

                    {coins.map((coin, index) => (

                        <tr
                            key={index}
                            onClick={() => props.setSelectedCoin(coin)}
                        >

                            <td>{coin.symbol}</td>

                            <td>${coin.price}</td>

                            <td style={{
                                color: Number(coin.change) >= 0 ? "green" : "red"
                            }}>
                                {coin.change}%
                            </td>

                            <td>${coin.high}</td>

                            <td>${coin.low}</td>

                            <td>{coin.volume}</td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );

}

export default CoinTable;
