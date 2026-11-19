
import React, { useEffect, useState } from "react";
import axios from "axios";

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

        axios.get("https://crypto-currency-8935.onrender.com/api/orderbook/" + props.symbol)
            .then((response) => {

                const bidList = [];
                const askList = [];

                for (let i = 0; i < response.data.bids.length; i++) {

                    const bid = {
                        price: response.data.bids[i][0],
                        quantity: response.data.bids[i][1]
                    };

                    bidList.push(bid);

                }

                for (let i = 0; i < response.data.asks.length; i++) {

                    const ask = {
                        price: response.data.asks[i][0],
                        quantity: response.data.asks[i][1]
                    };

                    askList.push(ask);

                }

                setBids(bidList);
                setAsks(askList);
                setLoading(false);

                connectSocket();

            })
            .catch((error) => {

                console.log("Order Book API Error:", error);

                setError("Unable to load order book");
                setLoading(false);

            });

        function connectSocket() {

            socket = new WebSocket(
                "wss://stream.binance.com:9443/ws/" +
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

                for (let i = 0; i < message.bids.length; i++) {

                    const bid = {
                        price: message.bids[i][0],
                        quantity: message.bids[i][1]
                    };

                    bidList.push(bid);

                }

                for (let i = 0; i < message.asks.length; i++) {

                    const ask = {
                        price: message.asks[i][0],
                        quantity: message.asks[i][1]
                    };

                    askList.push(ask);

                }

                setBids(bidList);
                setAsks(askList);

            };

            socket.onclose = () => {

                console.log("Order Book WebSocket Disconnected");

                if (shouldReconnect) {

                    reconnectTimer = setTimeout(() => {
                        console.log("Reconnecting Order Book...");
                        connectSocket();
                    }, 3000);

                }

            };

            socket.onerror = () => {
                console.log("Order Book WebSocket Error");
                socket.close();
            };

        }

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
        <div>
            <h2>Order Book - {props.symbol}</h2>

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
                            <td>{bid.price}</td>
                            <td>{bid.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

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
                            <td>{ask.price}</td>
                            <td>{ask.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );

}

export default OrderBook;
