
import React from "react";

function CoinDetails(props) {

    if (props.coin === null) {

        return (
            <div className="coin-details">

                <h2>Coin Details</h2>

                <p>Select a coin to view details</p>

            </div>
        );

    }

    return (

        <div className="coin-details">

            <h2>Coin Details</h2>

            <p>
                Symbol: {props.coin.symbol}
            </p>

            <p>
                Price: ${props.coin.price}
            </p>

            <p>
                24h Change: {props.coin.change}%
            </p>

            <p>
                24h High: ${props.coin.high}
            </p>

            <p>
                24h Low: ${props.coin.low}
            </p>

            <p>
                24h Volume: {props.coin.volume}
            </p>

        </div>

    );

}

export default CoinDetails;
