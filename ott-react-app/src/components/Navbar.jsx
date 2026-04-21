import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <div className="nav-left">
        <div className="brand-wrap">
          <img src="/h-logo.png" alt="HFLIX" className="brand-logo" />
          <span className="brand-text">HFLIX</span>
        </div>

        <nav className="nav-links">
          <Link to="/home">Home</Link>
          <Link to="/movies">Movies</Link>
          <Link to="/series">TV Shows</Link>
          <Link to="/player">Live TV</Link>
        </nav>
      </div>

      <div className="nav-right">
        <button className="nav-icon">??</button>
        <button className="nav-icon">??</button>
        <button className="subscribe-btn">Subscribe</button>
      </div>
    </header>
  );
}

export default Navbar;
