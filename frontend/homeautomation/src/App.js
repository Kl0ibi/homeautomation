import React, { useState } from "react";
import "./App.css";
import Menu from "./components/menu/menu";
import FlowDiagram from "./components/flow_diagram/flow_diagram";
import SolarPVChart from "./components/solar_chart/solar_chart";
import GridChart from "./components/grid_chart/grid_chart";
import EnergyChart from "./components/energy_chart/energy_chart";


const App = () => {
  const [currentPage, setCurrentPage] = useState("liveData");

  const switchPage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="app-container">
      <Menu onSwitchPage={switchPage} />
      {currentPage === "liveData" && <FlowDiagram />}
      {currentPage === "pvChart" && <SolarPVChart/>}
      {currentPage === "gridChart" && <GridChart/>}
      {currentPage === "energyChart" && <EnergyChart/>}
    </div>
  );
};

export default App;
