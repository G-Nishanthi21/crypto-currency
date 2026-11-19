
import React, { useState } from "react";
import "./App.css";

import Navbar from "./components/Navbar";
import CoinTable from "./components/CoinTable";
import CoinDetails from "./components/CoinDetails";
import OrderBook from "./components/OrderBook";
import CryptoChart from "./components/CryptoChart";

function App() {

    const [selectedCoin, setSelectedCoin] = useState(null);

    return (
        <div className="app">

            <Navbar />

            <main className="dashboard-container">

                <div className="page-heading">
                    <div>
                        <h1>Crypto Dashboard</h1>
                        <p>Track cryptocurrency prices in real time</p>
                    </div>
                </div>

                <section className="dashboard-card coin-table-card">
                    <CoinTable setSelectedCoin={setSelectedCoin} />
                </section>

                <div className="details-grid">

                    <section className="dashboard-card">
                        <CoinDetails coin={selectedCoin} />
                    </section>

                    <section className="dashboard-card">
                        <OrderBook
                            symbol={selectedCoin === null ? "BTCUSDT" : selectedCoin.symbol}
                        />
                    </section>

                </div>

                <section className="dashboard-card chart-card">
                    <CryptoChart
                        symbol={selectedCoin === null ? "BTCUSDT" : selectedCoin.symbol}
                    />
                </section>

            </main>

        </div>
    );
}

export default App;
