import React, { useState, useEffect } from "react";
import "./flow_diagram.css";
import battery_img from "../../img/byd.png";
import inverter_img from "../../img/gen24.png";
import pv1_img from "../../img/pv1.png";
import pv2_img from "../../img/pv2.png";
import house_img from "../../img/house.png";
import grid_img from "../../img/fronius_sm.png";
import smartload_img from "../../img/smartload.png";
import { Tooltip as ReactTooltip } from "react-tooltip";

const FlowDiagram = () => {
  const [data, setData] = useState(null);
; const [energy_data, setEnergyData] = useState(null);
  const [time, setTime] = useState(new Date());

    useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8000/live_proxy.php");
        const json = await response.json();
        
        // Set the data from the combined response
        setData(json.values);
        setEnergyData(json.energy);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Fetch data every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);


  const getAnimationStyle = (value) => {
    if (value > 0) return { animationDirection: "normal", visibility: "visible" };
    if (value < 0) return { animationDirection: "reverse", visibility: "visible" };
    return { visibility: "hidden" };
  };

  if (!data) {
    return <div className="loading">Loading...</div>;
  }

  const {
    inverter: {pv1_power, pv2_power, inv_ac_w, pv1_voltage, pv1_current, pv2_voltage, pv2_current, daily_inv_energy_wh, total_pv_energy_wh, total_inv_energy_wh },
    energy_meter: { p_grid_w, p_load_w, freq_hz, L1, L2, L3, energy_real_cons_wh, energy_real_prod_wh },
    battery: { battery_power_w, battery_soc, battery_working_mode,  total_charged_energy_wh, total_discharged_energy_wh },
    smartload : { boiler_temp, sl_power, sl_status, sl_temp},
  } = data;

  const {
    prod_energy_pv1_wh, prod_energy_pv2_wh, cons_energy_wh, fed_energy_to_grid_wh, cons_energy_from_grid_wh, charged_energy_wh, discharged_energy_wh, heated_energy_wh
  } = energy_data;

  const createArcPath = (
    value,
    minValue,
    maxValue,
    startAngle,
    endAngle,
    radius = 50,
    cx = 100,
    cy = 100
  ) => {
    const clampedValue = Math.min(Math.max(value, minValue), maxValue);
    const valuePercentage = (clampedValue - minValue) / (maxValue - minValue);
    const angleRange = endAngle - startAngle;
    const valueAngle = startAngle + valuePercentage * angleRange;
    const startRadians = (startAngle - 90) * (Math.PI / 180);
    const endRadians = (valueAngle - 90) * (Math.PI / 180);
    const x1 = cx + radius * Math.cos(startRadians);
    const y1 = cy + radius * Math.sin(startRadians);
    const x2 = cx + radius * Math.cos(endRadians);
    const y2 = cy + radius * Math.sin(endRadians);
    const isFullCircle = Math.abs(valueAngle - startAngle) >= 360;
    if (isFullCircle) {
      return `
        M ${cx - radius},${cy}
        A ${radius},${radius} 0 1,1 ${cx + radius},${cy}
        A ${radius},${radius} 0 1,1 ${cx - radius},${cy}
        `;
    }
    const largeArcFlag = Math.abs(valueAngle - startAngle) > 180 ? 1 : 0;
    return `M ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2}`;
  };


const createPiePath = (
  maxValue,
  value1,
  value2,
  startAngle = 0,
  radius = 50,
  cx = 100,
  cy = 100,
  id = 1,
) => {
  const angle1 = (value1 / maxValue) * 360;
  const angle2 = (value2 / maxValue) * 360;

  // Function to calculate arc points
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180);
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const drawArc = (start, angle) => {
    const end = polarToCartesian(cx, cy, radius, start + angle);
    const largeArcFlag = angle > 180 ? 1 : 0;
    return `A ${radius},${radius} 0 ${largeArcFlag},1 ${end.x},${end.y}`;
  };

  // Start points
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle + angle1);

return {
[`pie_path1_${id}`]: `M ${end.x},${end.y} ${drawArc(startAngle + angle1, angle2)}`,
[`pie_path2_${id}`]: `M ${start.x},${start.y} ${drawArc(startAngle, angle1)}`
};
};


const createPercentageBarPath = (
  maxValue,
  value1,
  value2,
  width = 100, // Total width of the bar
  height = 10, // Bar height
  cx = 100, // Center X position
  cy = 100, // Center Y position
  id = 1
) => {
  const totalWidth = width;
  const value1Width = (value1 / maxValue) * totalWidth;
  
  const startX = cx - totalWidth / 2; // Start position (centered)
  const midX = startX + value1Width; // Split position
  const endX = startX + totalWidth; // End position
  
  return {
    [`bar_path1_${id}`]: `M ${startX},${cy} H ${midX}`, // Value1 segment
    [`bar_path2_${id}`]: `M ${midX},${cy} H ${endX}`, // Value2 segment
    [`split_line_${id}`]: `M ${midX},${cy - height / 2} V ${cy + height / 2}` // Vertical split
  };
};

const createArcValueWithUnit = (value, unit, color, x, y, header = null) => {
    const avgCharWidth = 1;
    const unitCharWidth = 0.5;
    const headerOffset = header ? ((header.length * avgCharWidth) - 4) : 0;
    const UnitOffset = unit ? ((10 / unit.length * unitCharWidth)) : 0;
    return (
        <>
            {header && <text x={x - headerOffset} y={y - 8} className="text-label-sub1" style={{ fill: color }}>{header}</text>}
            <text x={x} y={y} className="text-label-sub1" style={{ fill: color, }}>{value}</text>
            <text x={x + UnitOffset} y={y + 5} className="text-label-sub2" style={{ fill: color }}>{unit}</text>
        </>
    );
};
    const getAutarkyColor = (autarky) => {
        if (autarky <= 30) return "#FF4D4D"; // Rot (niedrige Autarkie)
        if (autarky <= 60) return "#FFA500"; // Orange (mittlere Autarkie)
        if (autarky <= 90) return "#F2C94C"; // Gelb (hohe Autarkie)
        return "#2ECC71"; // Grün (nahezu autark)
    };

    const sum_pv_power = pv1_power + pv2_power;

    const self_suff_energy_wh = cons_energy_wh - cons_energy_from_grid_wh;
    const {pie_path1_1, pie_path2_1} = createPiePath(cons_energy_wh, cons_energy_from_grid_wh, self_suff_energy_wh, 0, 12, -54, 20, 1);

    const autarky = cons_energy_wh > 0 ? ((100 / cons_energy_wh) * self_suff_energy_wh).toFixed(2) : 0.00;
    const prod_energy_sum_wh = prod_energy_pv1_wh + prod_energy_pv2_wh;
    const self_cons_energy_wh = (prod_energy_sum_wh - fed_energy_to_grid_wh) > 0 ? (prod_energy_sum_wh - fed_energy_to_grid_wh) : 0;
    const { pie_path1_2, pie_path2_2 } = createPiePath(prod_energy_sum_wh, fed_energy_to_grid_wh, self_cons_energy_wh, 0, 12, 54, 20, 2);

    const energy_battery_sum = charged_energy_wh + discharged_energy_wh;
    const { pie_path1_3, pie_path2_3 } = createPiePath(energy_battery_sum, charged_energy_wh, discharged_energy_wh, 0, 12, -54, 20, 3);
    const {bar_path1_1, bar_path2_1, split_line_1} = createPercentageBarPath(prod_energy_sum_wh, prod_energy_pv1_wh, prod_energy_pv2_wh, 24, 5, 54, 20, 1); 

  return (
    <div className="live-container">
      <div className="top-section">
        <div className="clock">
            <h2>{time.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</h2>
            <p>{time.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}</p>
        </div>
      </div>

      {/* Middle Section: Stats */}
        <div className="stats-main">
        <div className="stats-container">
            <svg viewBox="-100 0 200 40" xmlns="http://www.w3.org/2000/svg" className="stats">

                <text x="-82" y="38" className="text-label-sub3" style={{ fill: "#32CD32" }}>Erzeugung</text>
                {createArcValueWithUnit((self_suff_energy_wh / 1000).toFixed(2), "kWh", "#32CD32", -82, 20)}
                <text x="-68" y="5" className="text-label-sub1" style={{ fill: "#FFA500" }}>Verbrauch</text>
                <circle cx="-54" cy="20" r="12" strokeWidth="1.5" className="arc-circle"/>
                <path d={pie_path1_1} fill="none" stroke="#32CD32" strokeWidth="1.5"/>
                <path d={pie_path2_1} fill="none" stroke="#C0392B" strokeWidth="1.5"/>
                {createArcValueWithUnit((cons_energy_wh / 1000).toFixed(2), "kWh", "#FFA500", -61, 20)}
                {createArcValueWithUnit((cons_energy_from_grid_wh / 1000).toFixed(2), "kWh", "#C0392B", -37, 20)}
                <text x="-53" y="38" className="text-label-sub3" style={{ fill: "#C0392B" }}>Netzbezug</text>

                <circle cx="0" cy="20" r="12" strokeWidth="1.5" className="arc-circle"/>
                <text x="-11" y="5" className="text-label-sub1" style={{ fill: "#CCCCCC" }}>Autarkie</text>

                <path
                    d={createArcPath(autarky, 0, 100, 0, 360, 12, 0, 20)}
                    fill="none"
                    stroke={getAutarkyColor(autarky)}
                    strokeWidth="1.5"
                />
                {createArcValueWithUnit(autarky, "%", getAutarkyColor(autarky), -7, 20)}
                <text x="-11" y="5" className="text-label-sub1" style={{ fill: "#CCCCCC" }}>Autarkie</text>

                {createArcValueWithUnit((self_cons_energy_wh / 1000).toFixed(2), "kWh", "#FFA500", 25, 20)}
                <text x="14" y="38" className="text-label-sub3" style={{ fill: "#FFA500" }}>Eigenverbrauch</text>
                <text x="39" y="5" className="text-label-sub1" style={{ fill: "#FFD700" }}>Produktion</text>
                <circle cx="54" cy="20" r="12" strokeWidth="1.5" className="arc-circle"/>
                <path d={pie_path1_2} fill="none" stroke="#FFA500" strokeWidth="1.5"/>
                <path d={pie_path2_2} fill="none" stroke="#3498DB" strokeWidth="1.5"/>

                {createArcValueWithUnit((prod_energy_sum_wh / 1000).toFixed(2), "kWh", "#FFD700", 48, 20)}
                {createArcValueWithUnit((fed_energy_to_grid_wh / 1000).toFixed(2), "kWh", "#3498DB", 72, 20)}
                <text x="55" y="38" className="text-label-sub3" style={{ fill: "#3498DB" }}>Netzeinspeisung</text>



            </svg>
        </div>
        <div className="stats-container">
            <svg viewBox="-100 0 200 40" xmlns="http://www.w3.org/2000/svg" className="stats">
                <text x="-75" y="38" className="text-label-sub3" style={{ fill: "#32CD32" }}>Geladen</text>
                {createArcValueWithUnit((charged_energy_wh / 1000).toFixed(2), "kWh", "#32CD32", -82, 20)}
                <text x="-75" y="5" className="text-label-sub1" style={{ fill: "#32CD32" }}>Batterienutzung</text>
                <circle cx="-54" cy="20" r="12" strokeWidth="1.5" className="arc-circle"/>
                <path d={pie_path1_3} fill="none" stroke="#32CD32" strokeWidth="1.5"/>
                <path d={pie_path2_3} fill="none" stroke="#087515" strokeWidth="1.5"/>
                {createArcValueWithUnit((energy_battery_sum / 1000).toFixed(2), "kWh", "#32CD32", -61, 20)}
                {createArcValueWithUnit((discharged_energy_wh / 1000).toFixed(2), "kWh", "#087515", -37, 20)}
                <text x="-51" y="38" className="text-label-sub3" style={{ fill: "#087515" }}>Entladen</text>

                <circle cx="0" cy="20" r="12" strokeWidth="1.5" className="arc-circle"/>
                <text x="-11" y="5" className="text-label-sub1" style={{ fill: "#FF4500", }}>Heizstab</text>
                <path d={createArcPath(boiler_temp, 0, 100, 0, 360, 12, 0, 20)} fill="none" stroke="#FF4500" strokeWidth="1.5" />
                {createArcValueWithUnit((heated_energy_wh / 1000).toFixed(2), "kWh", "#FF4500", -7, 20)}


                <text x="20" y="32" className="text-label-sub3" style={{ fill: "#FFD700" }}>Süd / West</text>
                {createArcValueWithUnit((prod_energy_pv1_wh / 1000).toFixed(2), "kWh", "#FFD700", 25, 20)}
                <text x="39" y="5" className="text-label-sub1" style={{ fill: "#FFD700" }}>Ausrichtung</text>
                <line x1="42" y1="20" x2="66" y2="20" strokeWidth="1.5" className="arc-circle"/>


                <path d={bar_path1_1} fill="none" stroke="#FFD700" strokeWidth="3"/>
                <path d={bar_path2_1} fill="none" stroke="#FFA500" strokeWidth="3"/>
                <path d={split_line_1} fill="none" stroke="gray" strokeWidth="2"/>
                {createArcValueWithUnit((prod_energy_pv2_wh / 1000).toFixed(2), "kWh", "#FFA500", 72, 20)}
                <text x="74" y="32" className="text-label-sub3" style={{ fill: "#FFA500" }}>Ost</text>
            </svg>
        </div>
        </div>

      <div className="flow-container">
        <svg viewBox="0 10 200 250" xmlns="http://www.w3.org/2000/svg" className="diagram">
          <path d="M110 125 C 135 125, 135 125, 160 125" className="pipeline" />
          <path d="M100 135 C 100 160, 100 160, 100 185" className="pipeline" />
          <path d="M40 125 C 65 125, 65 125, 90 125" className="pipeline" />
          <path d="M175 125 C 175 150, 175 150, 175 195" className="pipeline" />

          <path d="M80 65 C 80 105, 100 90, 100 115" className="pipeline" />
          <path d="M120 65 C 120 105, 100 90, 100 115" className="pipeline" />
          {/* Animation Lines */}
          <path
            d="M80 65 C 80 105, 100 90, 100 115"
            className="pipeline-animation"
            style={{ stroke: "#FFD700", ...getAnimationStyle(pv1_power) }}
            fill="none"
          />
          <path
            d="M120 65 C 120 105, 100 90, 100 115"
            className="pipeline-animation"
            style={{ stroke: "#FFD700", ...getAnimationStyle(pv2_power) }}
            fill="none"
          />
          <path
            d="M110 125 C 135 125, 135 125, 160 125"
            className="pipeline-animation"
            style={{ stroke: "#FFA500", ...getAnimationStyle(p_load_w) }}
          />
          <path
            d="M100 135 C 100 160, 100 160, 100 185"
            className="pipeline-animation"
            style={{ stroke: "#A9A9A9", ...getAnimationStyle(-p_grid_w) }}
          />
          <path
            d="M40 125 C 65 125, 65 125, 90 125"
            className="pipeline-animation"
            style={{ stroke: "#32CD32", ...getAnimationStyle(battery_power_w) }}
          />
          <path
            d="M175 125 C 175 150, 175 150, 175 195"
            className="pipeline-animation"
            style={{ stroke: "#FF4500", ...getAnimationStyle(sl_power) }}
          />

          {/* Images */}
          <image href={pv1_img} x="60" y="45" width="40" alt="pv panel1" data-tooltip-id="pv1-tooltip" />
          <image href={pv2_img} x="100" y="45" width="40" alt="pv panel2" data-tooltip-id="pv2-tooltip" />
          <image href={inverter_img} x="80" y="105" width="40" alt="inverter" data-tooltip-id="inverter-tooltip" />
          <image href={battery_img} x="-35" y="65" width="120" alt="battery" data-tooltip-id="battery-tooltip" />
          <image href={house_img} x="130" y="85" width="80" alt="house" data-tooltip-id="house-tooltip" />
          <image href={grid_img} x="52" y="170" height="56" alt="grid" data-tooltip-id="grid-tooltip" />
          <image href={smartload_img} x="135" y="176" height="50" alt="smartload" data-tooltip-id="smartload-tooltip" />

          <circle cx="25" cy="125" r="19" strokeWidth="2" className="arc-circle"/>
          <path d={createArcPath(battery_soc, 0, 100, -90, 270, 19, 25, 125)} fill="none" stroke="#32CD32" strokeWidth="2" />

          {/* Text Labels */}
          <text x="10" y="130" className="text-label" style={{ fill: "#32CD32" }}>{battery_soc}%</text>
          <text x="3" y="195" className="text-label" style={{ fill: "#32CD32" }}>{battery_power_w}W</text>
          <text x="80" y="33" className="text-label" style={{ fill: "#FFD700" }}>{sum_pv_power}W</text>
          <text x="60" y="45" className="text-label-sub" style={{ fill: "#FFD700" }}>{pv1_power}W</text>
          <text x="110" y="45" className="text-label-sub" style={{ fill: "#FFD700" }}>{pv2_power}W</text>
          <text x="120" y="160" className="text-label" style={{ fill: "#FFA500" }}>{p_load_w}W</text>
          <text x="80" y="240" className="text-label" style={{ fill: "#A9A9A9" }}>{p_grid_w}W</text>
          <text x="160" y="240" className="text-label" style={{ fill: "#FF4500" }}>{sl_power}W</text>
          <text x="129" y="220" className="text-label-sub" style={{ fill: "#FF4500" }}>{boiler_temp}°C</text>
        </svg>
      </div>
        <ReactTooltip id="pv1-tooltip" place="top">
            <div>
                <table>
                <tbody>
                    <tr><td>Spannung:</td><td>{pv1_voltage.toFixed(1)} V</td></tr>
                    <tr><td>Strom:</td><td>{pv1_current.toFixed(2)} A</td></tr>
                    <tr><td>Heute Erzeugt:</td><td>{prod_energy_pv1_wh} Wh</td></tr>
                </tbody>
                </table>
            </div>
        </ReactTooltip>
        <ReactTooltip id="pv2-tooltip" place="top">
            <div>
                <table>
                <tbody>
                    <tr><td>Spannung:</td><td>{pv2_voltage.toFixed(1)} V</td></tr>
                    <tr><td>Strom:</td><td>{pv2_current.toFixed(2)} A</td></tr>
                    <tr><td>Heute Erzeugt:</td><td>{prod_energy_pv2_wh} Wh</td></tr>
                </tbody>
                </table>
            </div>
        </ReactTooltip>
        <ReactTooltip id="inverter-tooltip" place="top">
            <div>
                <table>
                <tbody>
                    <tr><td>AC Leistung:</td><td>{inv_ac_w} W</td></tr>
                    <tr><td>Heute Produziert:</td><td>{prod_energy_sum_wh} Wh</td></tr>
                    <tr><td>Heute Umgerichtet:</td><td>{daily_inv_energy_wh} Wh</td></tr>
                    <tr><td>Gesamt Produziert:</td><td>{total_pv_energy_wh} Wh</td></tr>
                    <tr><td>Gesamt Umgerichtet:</td><td>{total_inv_energy_wh} Wh</td></tr>

                </tbody>
                </table>
            </div>
        </ReactTooltip>
        <ReactTooltip id="battery-tooltip" place="top">
            <div>
                <table>
                <tbody>
                    <tr><td>Modus:</td><td>{battery_working_mode}</td></tr>
                    <tr><td>Heute Geladen:</td><td>{charged_energy_wh} Wh</td></tr>
                    <tr><td>Heute Entladen:</td><td>{discharged_energy_wh} Wh</td></tr>
                    <tr><td>Gesamt Geladen:</td><td>{total_charged_energy_wh} Wh</td></tr>
                    <tr><td>Gesamt Entladen:</td><td>{total_discharged_energy_wh} Wh</td></tr>
                </tbody>
                </table>
            </div>
        </ReactTooltip>
        <ReactTooltip id="house-tooltip" place="top" style={{ marginTop: '45px' }}>
                <div>
                    <table>
                    <tbody>
                        <tr><td>Heute Verbrauch:</td><td>{cons_energy_wh} Wh</td></tr>
                    </tbody>
                    </table>
                </div>
        </ReactTooltip>
        <ReactTooltip id="grid-tooltip" place="top">
            <div>
                <table>
                <tbody>
                    <tr><td>Frequenz:</td><td>{freq_hz.toFixed(2)} Hz</td></tr>
                    <tr><td>Strom L1:</td><td>{L1.current.toFixed(2)} A</td></tr>
                    <tr><td>Strom L2:</td><td>{L2.current.toFixed(2)} A</td></tr>
                    <tr><td>Strom L3:</td><td>{L3.current.toFixed(2)} A</td></tr>
                    <tr><td>Spannung L1:</td><td>{L1.voltage.toFixed(1)} V</td></tr>
                    <tr><td>Spannung L2:</td><td>{L2.voltage.toFixed(1)} V</td></tr>
                    <tr><td>Spannung L3:</td><td>{L3.voltage.toFixed(1)} V</td></tr>
                    <tr><td>Leistung L1:</td><td>{L1.power_real.toFixed(0)} W</td></tr>
                    <tr><td>Leistung L2:</td><td>{L2.power_real.toFixed(0)} W</td></tr>
                    <tr><td>Leistung L3:</td><td>{L3.power_real.toFixed(0)} W</td></tr>
                    <tr><td>Heute Eingespeiste Energie:</td><td>{fed_energy_to_grid_wh} Wh</td></tr>
                    <tr><td>Heute Verbrauchte Energie:</td><td>{cons_energy_from_grid_wh} Wh</td></tr>
                    <tr><td>Gesamt Eingespeiste Energie:</td><td>{energy_real_prod_wh} Wh</td></tr>
                    <tr><td>Gesamt Verbrauchte Energie:</td><td>{energy_real_cons_wh} Wh</td></tr>
                </tbody>
                </table>
            </div>
        </ReactTooltip>
        <ReactTooltip id="smartload-tooltip" place="top" style={{ marginLeft: '18px' }}>
            <div>
                <table>
                <tbody>
                    <tr><td>Status:</td><td>{sl_status}</td></tr>
                    <tr><td>Temperatur:</td><td>{sl_temp} °C</td></tr>
                    <tr><td>Energie verheizt:</td><td>{heated_energy_wh} Wh</td></tr>
                </tbody>
                </table>
            </div>
        </ReactTooltip>
    </div>
  );
};

export default FlowDiagram;
