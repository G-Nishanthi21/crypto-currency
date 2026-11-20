
import React from "react";
import "../styles/Navbar.css"

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <span className="brand-icon">₿</span>
                <h2>CryptoView</h2>
            </div>

            <div className="navbar-right">
                <span className="live-dot"></span>
                <span>Live Market</span>
            </div>

        </nav>
    );
}

export default Navbar;
