
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Crypto Dashboard Backend is Running");
});

app.get("/api/coins", async (req, res) => {

    try {

        const response = await fetch(
            "https://api.binance.com/api/v3/ticker/24hr"
        );

        if (response.status !== 200) {
            return res.status(500).json({
                message: "Binance API request failed"
            });
        }

        const allCoins = await response.json();

        const symbols = [
            "BTCUSDT",
            "ETHUSDT",
            "BNBUSDT",
            "SOLUSDT",
            "XRPUSDT",
            "ADAUSDT",
            "DOGEUSDT",
            "TRXUSDT",
            "AVAXUSDT",
            "LINKUSDT"
        ];

        const topCoins = [];

        symbols.forEach((symbol) => {

            allCoins.forEach((item) => {

                if (symbol === item.symbol) {

                    const coin = {
                        symbol: item.symbol,
                        price: item.lastPrice,
                        change: item.priceChangePercent,
                        high: item.highPrice,
                        low: item.lowPrice,
                        volume: item.volume
                    };

                    topCoins.push(coin);

                }

            });

        });

        res.json(topCoins);

    } catch (error) {

        console.log("Binance API Error:", error.message);

        return res.status(500).json({
            message: "Unable to fetch coin data"
        });

    }

});

app.get("/api/orderbook/:symbol", async (req, res) => {

    try {

        const symbol = req.params.symbol;

        const response = await fetch(
            "https://api.binance.com/api/v3/depth?symbol=" + symbol + "&limit=10"
        );

        if (response.status !== 200) {
            return res.status(500).json({
                message: "Order Book API request failed"
            });
        }

        const data = await response.json();

        res.json(data);

    } catch (error) {

        console.log("Order Book Error:", error.message);

        return res.status(500).json({
            message: "Unable to fetch order book"
        });

    }

});

app.get("/api/klines/:symbol", async (req, res) => {

    try {

        const symbol = req.params.symbol;
        const interval = req.query.interval || "1m";
        const limit = req.query.limit || 200;

        const response = await fetch(
            "https://api.binance.com/api/v3/klines?symbol=" +
            symbol +
            "&interval=" +
            interval +
            "&limit=" +
            limit
        );

        if (response.status !== 200) {
            return res.status(500).json({
                message: "Klines API request failed"
            });
        }

        const data = await response.json();

        res.json(data);

    } catch (error) {

        console.log("Klines API Error:", error.message);

        return res.status(500).json({
            message: "Unable to fetch candle data"
        });

    }

});

const PORT = 5000;

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});
