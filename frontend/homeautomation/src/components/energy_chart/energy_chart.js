import React, { useEffect, useState, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ClipLoader } from "react-spinners";
import "./energy_chart.css";

const API_BASE_URL = "energy_chart_proxy.php";

function EnergyChart() {
  const [chartData, setChartData] = useState({ categories: [], series: [] });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const chartRef = useRef(null);

  const fetchWithTimeout = async (url, timeout = 60000) => {
    const controller = new AbortController();
    const signal = controller.signal;
    setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { signal });
      const text = await response.text();
      const data = JSON.parse(text);
      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        console.error("Request timed out!");
      } else {
        console.error("Fetch error:", error);
      }
      return null;
    }
  };

const fetchData = async (date) => {
  setIsFetching(true);
  setIsLoading(true);
  const formattedDate = formatDateForAPI(date);
  const apiUrl = `${API_BASE_URL}?date=${formattedDate}`;

  const data = await fetchWithTimeout(apiUrl, 60000);
  if (!data) {
    console.warn("Invalid API response format:", data);
    setIsFetching(false);
    setIsLoading(false);
    return;
  }

  // Extracting keys from the data for series
  const keys = Object.keys(data);
  const seriesData = keys.map(key => {
    let color, name, visible = true;

    // Using switch-case to handle each key
    switch (key) {
      case "prod_energy_pv1_wh":
        color = "rgba(255, 255, 0, 0.6)";
        name = "PV West";
        break;
      case "prod_energy_pv2_wh":
        color = "rgba(255, 165, 0, 0.6)";
        name = "PV Ost";
        break;
      case "cons_energy_wh":
        color = "#FFA500";
        name = "Hausverbrauch";
        break;
      case "fed_energy_to_grid_wh":
        color = "#3498DB";
        name = "Einspeisung";
        break;
      case "cons_energy_from_grid_wh":
        color = "#C0392B";
        name = "Bezug";
        break;
      case "charged_energy_wh":
        color = "#32CD32";
        name = "Geladen";
        break;
      case "discharged_energy_wh":
        color = "#087515";
        name = "Entladen";
        break;
      case "heated_energy_wh":
        color = "#FF4500";
        name = "Verheizt";
        break;
      default:
        visible = false;
        color = undefined;
        name = key;
    }

    // For column chart, we can use the key-value pairs directly
    return {
      name: name || key,
      data: [[0, data[key]]], // Single data point at category 0 (since there's no time dimension)
      color: color,
      type: "column",
      visible: visible,
      borderColor: color, // Optional: border color for the column
      borderWidth: 1, // Optional: border width for each column
      states: {
        hover: {
          enabled: true, // Enable hover effect
        },
      },
    };
  });

  // Assuming you want to set a single category (like 'Total' or something relevant)
  setChartData({
    categories: ['Total'], // Single category for a column chart
    series: seriesData,
  });

  setIsFetching(false);
  setIsLoading(false);
};

  useEffect(() => {
    fetchData(selectedDate);
  }, []);


useEffect(() => {
  const handleOrientationChange = () => {
    if (chartRef.current) {
      setTimeout(() => {
        setChartData(prevData => ({ ...prevData })); // Trigger re-render
        chartRef.current.chart.reflow(); // Ensure correct size
      }, 100);
    }
  };

  window.addEventListener("orientationchange", handleOrientationChange);
  return () => window.removeEventListener("orientationchange", handleOrientationChange);
}, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleRequestData = () => {
    fetchData(selectedDate);
  };

  const formatDateForAPI = (date) => {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return utcDate.toISOString().split("T")[0];
  };

const options = {
  chart: {
    type: "column",
    backgroundColor: "#1e1e2f",
    height: window.innerHeight * 0.85,
    style: { fontFamily: "Orbitron, sans-serif" },
  },
  title: {
    text: "",
  },
  xAxis: {
    labels: {
      enabled: false,
    },
    gridLineColor: "#333",
  },
  yAxis: {
    title: { 
      text: "Wh", 
      style: { 
        color: "#f0f0f0",
        fontSize: "16px", // Increase label font size
      },
    },
    labels: { 
      style: { 
        color: "#f0f0f0",
        fontSize: "14px", // Increase label font size
      },
    },
    gridLineColor: "#333",
  },
  tooltip: {
    backgroundColor: "rgba(26, 26, 26, 0.95)",
    borderColor: "#8888ff",
    borderRadius: 8,
    shadow: true,
    style: { color: "#f0f0f0", fontSize: "12px" },
    formatter: function() {
      return `<b>${this.series.name}</b><br/>${this.y} Wh`;
    }
  },
  plotOptions: {
    column: {
      borderWidth: 0, // Remove bar outline
      dataLabels: {
        enabled: true,
        textOutline: 'none',
        fontWeight: 'bold',
        formatter: function() {
          return this.y
        },
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
        },
      },
    },
  },
  legend: {
    enabled: true,
    itemStyle: { color: "#f0f0f0" },
    itemHoverStyle: { color: "#fff" },
    itemHiddenStyle: { color: "#888" },
  },
  series: chartData.series,
};

  return (
    <div style={{ marginTop: "20px" }}>
      <div className="date-picker-container">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="dd/MM/yyyy"
          className="date-picker"
        />
        <button onClick={handleRequestData} className="request-button">
          Abfragen
        </button>
        {isLoading && (
          <div className="loading-spinner-container">
            <ClipLoader color="#00eaff" loading={isLoading} size={35} />
          </div>
        )}
      </div>

      {isFetching && (
        <div className="loading-spinner-overlay">
          <ClipLoader color="#00eaff" loading={isFetching} size={60} />
        </div>
      )}

      <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />
    </div>
  );
}

export default EnergyChart;
