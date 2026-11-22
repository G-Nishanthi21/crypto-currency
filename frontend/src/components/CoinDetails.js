import React from "react";

function CoinDetails(props) {

    if (props.coin === null) {

        return (
            <div className="coin-details">
                <h2>Coin Details</h2>
                <p>Select a cryptocurrency to view details</p>
            </div>
        );

    }

    return (

        <div className="coin-details">

            <h2>Coin Details</h2>

            <h3>{props.coin.symbol}</h3>

            <p>
                <strong>Price:</strong> ${props.coin.price}
            </p>

            <p>
                <strong>24h Change:</strong>

                <span
                    style={{
                        color: Number(props.coin.change) >= 0
                            ? "green"
                            : "red"
                    }}
                >
                    {" "}{props.coin.change}%
                </span>

            </p>

            <p>
                <strong>24h High:</strong> ${props.coin.high}
            </p>

            <p>
                <strong>24h Low:</strong> ${props.coin.low}
            </p>

            <p>
                <strong>24h Volume:</strong> {props.coin.volume}
            </p>

        </div>

    );

}

export default CoinDetails;