import React, { useState } from "react";
import "./menu.css";
import menu_img from "../../img/menu.png";

const Menu = ({ onSwitchPage }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handlePageSwitch = (page) => {
    onSwitchPage(page);
    setMenuOpen(false); // Close the menu after selecting
  };

  return (
    <div className="menu-container">
      <button className="menu-button" onClick={toggleMenu}>
        <img src={menu_img} alt="Menu" className="menu-icon" />
      </button>
      {menuOpen && (
        <div className="menu-dropdown">
          <button onClick={() => handlePageSwitch("liveData")}>Live</button>
          <button onClick={() => handlePageSwitch("pvChart")}>PV-Chart</button>
          <button onClick={() => handlePageSwitch("gridChart")}>Netz-Chart</button>
          <button onClick={() => handlePageSwitch("energyChart")}>Energie-Chart</button>
        </div>
      )}
    </div>
  );
};

export default Menu;
