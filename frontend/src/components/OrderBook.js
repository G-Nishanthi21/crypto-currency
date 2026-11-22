
import React, { useEffect, useState } from "react";

function OrderBook(props) {

    const [bids, setBids] = useState([]);
    const [asks, setAsks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        setLoading(true);
        setError("");

        let socket;
        let reconnectTimer;
        let shouldReconnect = true;

        async function getOrderBook() {

            try {

                const response = await fetch(
                    "https://crypto-currency-8935.onrender.com/api/orderbook/" + props.symbol
                );

                if (response.status !== 200) {
                    throw new Error("API request failed");
                }

                const data = await response.json();

                if (shouldReconnect) {

                    const bidList = [];
                    const askList = [];

                    data.bids.forEach((item) => {

                        bidList.push({
                            price: item[0],
                            quantity: item[1]
                        });

                    });

                    data.asks.forEach((item) => {

                        askList.push({
                            price: item[0],
                            quantity: item[1]
                        });

                    });

                    setBids(bidList);
                    setAsks(askList);
                    setLoading(false);

                    connectSocket();

                }

            } catch (error) {

                if (shouldReconnect) {
                    console.log("Order Book API Error:", error.message);
                    setError("Unable to load order book");
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
                props.symbol.toLowerCase() +
                "@depth10@100ms"
            );

            socket.onopen = () => {

                console.log("Order Book WebSocket Connected");

            };

            socket.onmessage = (event) => {

                const message = JSON.parse(event.data);

                const bidList = [];
                const askList = [];

                message.bids.forEach((item) => {

                    bidList.push({
                        price: item[0],
                        quantity: item[1]
                    });

                });

                message.asks.forEach((item) => {

                    askList.push({
                        price: item[0],
                        quantity: item[1]
                    });

                });

                setBids(bidList);
                setAsks(askList);

                console.log("Order Book Live Update:", props.symbol);

            };

            socket.onerror = (event) => {

                console.log("Order Book WebSocket Error:", event);

            };

            socket.onclose = (event) => {

                console.log(
                    "Order Book WebSocket Disconnected:",
                    event.code,
                    event.reason
                );

                if (shouldReconnect) {

                    reconnectTimer = setTimeout(() => {

                        console.log("Reconnecting Order Book...");

                        connectSocket();

                    }, 3000);

                }

            };

        }

        getOrderBook();

        return () => {

            shouldReconnect = false;

            clearTimeout(reconnectTimer);

            if (socket) {
                socket.close();
            }

        };

    }, [props.symbol]);

    if (loading) {
        return <p>Loading order book...</p>;
    }

    if (error !== "") {
        return <p>{error}</p>;
    }

    return (

        <div className="orderbook-container">

            <h2>Order Book - {props.symbol}</h2>

            <div className="orderbook-grid">

                <div className="bids-section">

                    <h3>Bids (Buy Orders)</h3>

                    <table border="1">

                        <thead>
                            <tr>
                                <th>Price</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>

                        <tbody>

                            {bids.map((bid, index) => (

                                <tr key={index}>

                                    <td style={{ color: "green" }}>
                                        {bid.price}
                                    </td>

                                    <td>{bid.quantity}</td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

                <div className="asks-section">

                    <h3>Asks (Sell Orders)</h3>

                    <table border="1">

                        <thead>
                            <tr>
                                <th>Price</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>

                        <tbody>

                            {asks.map((ask, index) => (

                                <tr key={index}>

                                    <td style={{ color: "red" }}>
                                        {ask.price}
                                    </td>

                                    <td>{ask.quantity}</td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    );

}

export default OrderBook;
