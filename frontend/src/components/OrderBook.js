
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

        fetch("https://crypto-currency-8935.onrender.com/api/orderbook/" + props.symbol)
            .then((response) => {

                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error("API request failed");
                }

            })
            .then((data) => {

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

            })
            .catch((error) => {

                console.log("Order Book API Error:", error.message);

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

                    {bids.map((bid, index) => {

                        return (

                            <tr key={index}>

                                <td>{bid.price}</td>
                                <td>{bid.quantity}</td>

                            </tr>

                        );

                    })}

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

                    {asks.map((ask, index) => {

                        return (

                            <tr key={index}>

                                <td>{ask.price}</td>
                                <td>{ask.quantity}</td>

                            </tr>

                        );

                    })}

                </tbody>

            </table>

        </div>

    );

}

export default OrderBook;
