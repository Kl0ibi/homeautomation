import React, { useState, useEffect } from "react";
import "./App.css";
import battery_img from "./img/battery.png";
import inverter_img from "./img/inverter.png";
import pv_img from "./img/pv.png";
import house_img from "./img/house.png";
import grid_img from "./img/grid.png";
import car_img from "./img/car.png";
import smartload_img from "./img/smartload.png";

const App = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://192.168.8.90:8000/values");
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000); // Fetch data every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getAnimationStyle = (value) => {
    if (value > 0) return { animationDirection: "normal" };
    if (value < 0) return { animationDirection: "reverse" };
    return { animation: "none" };
  };

  if (!data) {
    return <div>Loading...</div>;
  }

  const { inverter, energy_meter, battery } = data;
  const { pv_dc_w, inv_ac_w, total_pv_energy_wh, daily_pv_energy_wh } = inverter;
  const { p_grid_w, p_load_w } = energy_meter;
  const { battery_power_w, battery_soc } = battery;

  return (
    <div className="app-container">
      <svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg" className="diagram">
        {/* Pipelines */}
        <path d="M100 40 C 100 65, 100 65, 100 90" className="pipeline" />
        {/* Animation Lines */}
        <path
          d="M100 40 C 100 65, 100 65, 100 90"
          className="pipeline-animation"
          style={{ stroke: "yellow", ...getAnimationStyle(pv_dc_w) }}
        />
        {/* Other animations dynamically controlled based on values */}
        {/* Add more pipelines as needed */}

        {/* Images */}
        <image href={pv_img} x="70" y="-8" width="60" height="80" alt="PV Panel" />
        <image href={inverter_img} x="85" y="76" width="30" height="50" alt="Inverter" />
        <image href={battery_img} x="-25" y="50" width="100" alt="Battery" />
        <image href={house_img} x="130" y="60" width="80" alt="House" />
        <image href={grid_img} x="72" y="145" height="55" alt="Grid" />

        {/* Arcs */}
        <path
          d={createArcPath(battery_soc, 0, 100, -90, 270, 19, 25, 100)}
          fill="none"
          stroke="green"
          strokeWidth="2"
        />

        {/* Texts */}
        <text x="10" y="105" fill="green" fontWeight="bold" fontSize="15">
          {battery_soc}%
        </text>
        <text x="2" y="170" fill="green" fontWeight="bold" fontSize="13">
          {battery_power_w}W
        </text>
        <text x="80" y="10" fill="yellow" fontWeight="bold" fontSize="13">
          {pv_dc_w}W
        </text>
        <text x="120" y="135" fill="orange" fontWeight="bold" fontSize="13">
          {p_load_w}W
        </text>
        <text x="80" y="215" fill="gray" fontWeight="bold" fontSize="13">
          {p_grid_w}W
        </text>
      </svg>
    </div>
  );
};

export default App;
