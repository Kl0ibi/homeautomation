import React, { useState } from "react";
import "./App.css";
import Menu from "./components/menu/menu";
import FlowDiagram from "./components/flow_diagram/flow_diagram";
import GarageControler from "./components/garage/garage";
import SolarPVChart from "./components/solar_chart/solar_chart";


const App = () => {
  const [currentPage, setCurrentPage] = useState("liveData");

  const switchPage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="app-container">
      <Menu onSwitchPage={switchPage} />
      {currentPage === "liveData" && <FlowDiagram />}
      {currentPage === "historicalData" && <SolarPVChart/>}
      {currentPage === "garageOpener" && <GarageControler/>}
    </div>
  );
};

export default App;
