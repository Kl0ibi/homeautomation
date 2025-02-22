import React, { useEffect, useState, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ClipLoader } from "react-spinners";
import "./grid_chart.css";

const API_BASE_URL = "grid_chart_proxy.php";

function GridChart() {
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
    if (!data || !data.fields) {
      console.warn("Invalid API response format:", data);
      setIsFetching(false);
      setIsLoading(false);
      return;
    }

    const fields = Object.keys(data.fields);
    if (!fields.length || !Array.isArray(data.fields[fields[0]])) {
      console.error("Invalid data structure:", data);
      setIsFetching(false);
      setIsLoading(false);
      return;
    }

    const timestamps = data.fields[fields[0]].map(entry => new Date(entry.time).getTime());
    const seriesData = fields.map(field => {
      let color, fillColor, type, yAxis, visible = true, name;

      switch (field) {
        case "i_l1":
          color = "rgba(165, 42, 42, 0.6)";
          fillColor = "rgba(165, 42, 42, 0.3)";
          type = "spline";
          yAxis = 0;
          name= "Strom L1";
          break;
        case "i_l2":
          color = "rgba(30, 30, 150, 0.6)";
          fillColor = "rgba(30, 30, 150, 0.3)";
          type = "spline";
          yAxis = 0;
          name= "Strom L2";
          break;
        case "i_l3":
          color = "rgba(0, 100, 150, 0.6)";
          fillColor = "rgba(0, 100, 150, 0.3)";
          type = "spline";
          yAxis = 0;
          name= "Strom L3";
          break;
        case "u_l1":
          color = "rgba(255, 0, 0, 0.6)";
          fillColor = "rgba(255, 0, 0, 0.3)";
          type = "spline";
          yAxis = 1;
          name= "Spannung L1";
          break;
        case "u_l2":
          color = "rgba(0, 255, 0, 0.6)";
          fillColor = "rgba(0, 255, 0, 0.3)";
          type = "spline";
          yAxis = 1;
          name= "Spannung L2";
          break;
        case "u_l3":
          color = "rgba(0, 0, 255, 0.6)";
          fillColor = "rgba(0, 0, 255, 0.3)";
          type = "spline";
          yAxis = 1;
          name= "Spannung L3";
          break;
        case "freq":
          color = "rgba(255, 165, 0, 0.6)";
          fillColor = "rgba(255, 165, 0, 0.3)";
          type = "spline";
          yAxis = 1;
          name= "Frequenz";
          break;
        default:
          visible = false;
          color = undefined;
          fillColor = undefined;
          type = "spline";
          yAxis = 0;
          name= null;
      }

const dataWithGaps = data.fields[field].map((entry, index) => {
    const currentTime = new Date(entry.time).getTime();
    const prevTime = index > 0 ? new Date(data.fields[field][index - 1].time).getTime() : currentTime;
    const timeDiff = currentTime - prevTime;
    if (timeDiff > 5 * 60 * 1000) {
        return [prevTime + 1, null];
    }
    return [currentTime, entry.value];
});

// Highcharts options

      return {
        name: name != null ? name : field,
        data: dataWithGaps,
        turboThreshold: 5000,
        marker: { enabled: false },
        lineWidth: 2,
        type: type,
        color: color,
        fillColor: fillColor,
        fillOpacity: fillColor ? 0.3 : 0,
        yAxis: yAxis,
        visible: visible,
        zIndex: yAxis === 0 ? 1 : 0,
        states: {
          hover: {
            enabled: false, // Disable hover effect for this series
          },
        },
      };
    });

    setChartData({ categories: timestamps, series: seriesData });
    setIsFetching(false);
    setIsLoading(false);

    if (chartRef.current) {
      chartRef.current.chart.zoomOut();
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, []);

  // Add Vim-like motion controls
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!chartRef.current) return;

      const chart = chartRef.current.chart;
      const xAxis = chart.xAxis[0];
      const currentExtremes = xAxis.getExtremes();
      const range = currentExtremes.max - currentExtremes.min;

      switch (event.key) {
        case "h": // Move left
          xAxis.setExtremes(currentExtremes.min - range / 10, currentExtremes.max - range / 10);
          break;
        case "j": // Zoom in
          xAxis.setExtremes(currentExtremes.min + range / 10, currentExtremes.max - range / 10);
          break;
        case "k": // Zoom out
          xAxis.setExtremes(currentExtremes.min - range / 10, currentExtremes.max + range / 10);
          break;
        case "l": // Move right
          xAxis.setExtremes(currentExtremes.min + range / 10, currentExtremes.max + range / 10);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Redraw chart on orientation change
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

  function get_unit(field) {
    switch (field) {
      case "Strom L1":
      case "Strom L2":
      case "Strom L3":
        return "A";
      case "Spannung L1":
      case "Spannung L2":
      case "Spannung L3":
        return "V";
      case "Frequenz":
        return "Hz";
      default:
        return "";
    }
  }

  function get_unit_tofixed(field) {
    switch (field) {
      case "Strom L1":
      case "Strom L2":
      case "Strom L3":
      case "Frequenz":
        return 2;
      case "Spannung L1":
      case "Spannung L2":
      case "Spannung L3":
        return 1;
      default:
        return 0;
    }
  }

  const chartHeight = window.innerHeight * 0.85;

  const options = {
    chart: {
      type: "spline",
      backgroundColor: "#1e1e2f",
      zoomType: "x",
      style: { fontFamily: "Orbitron, sans-serif" },
      height: chartHeight,
      resetZoomButton: {
            theme: {
            	style: {
                color: '#ffffff',  
                marginRight: "100px",
                margin: "20px",
                padding: "200px",
     
              },
                fill: "none",
                r: 16,
                states: {
                    hover: {
                        fill: '#00b8d4',
                    }
                }
            }
        }
    },
    title: {
      text: "",
    },
    xAxis: {
      type: "datetime",
      labels: {
        style: { color: "#f0f0f0" },
        formatter: function () {
          return formatDateForChart(this.value);
        },
      },
      crosshair: { color: "#8888ff", width: 1, dashStyle: "solid" },
      gridLineColor: "#333",
    },
    yAxis: [
      {
        title: { text: "A", style: { color: "#f0f0f0" } },
        labels: { style: { color: "#f0f0f0" } },
        gridLineColor: "#333",
      },
      {
        title: { text: "V, Hz", style: { color: "#f0f0f0"} },
        labels: { style: { color: "#f0f0f0" } },
        gridLineColor: "#333",
        rotation: 180,
        opposite: true,
      },
    ],
    tooltip: {
      shared: true,
      useHTML: true,
      backgroundColor: "rgba(26, 26, 26, 0.95)",
      borderColor: "#8888ff",
      borderRadius: 8,
      shadow: true,
      style: { color: "#f0f0f0", fontSize: "12px" },
        formatter: function () {
        let tooltipHTML = `
            <div style="padding:8px; min-width:150px;">
            <b>${formatDateForChart(this.x)}</b>
            <table style="border-collapse: collapse; width: 100%; margin-top: 5px;">
                <tbody>
        `;

        this.points.forEach(point => {
            tooltipHTML += `
            <tr>
                <td style="color:${point.series.color}; padding: 2px;">●</td>
                <td style="padding: 2px;">${point.series.name}:</td>
                <td style="padding: 2px; text-align: right;"><b>${point.y.toFixed(get_unit_tofixed(point.series.name))} ${get_unit(point.series.name) || ''}</b></td>
            </tr>
            `;
        });

  tooltipHTML += `
        </tbody>
      </table>
    </div>
  `;

  return tooltipHTML;
}
    },
    legend: { itemStyle: { color: "#f0f0f0" } },
    plotOptions: {
      series: {
        states: {
          hover: {
            enabled: false
          },
        },
      },
    },
    series: chartData.series,
  };

  const formatDateForAPI = (date) => {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return utcDate.toISOString().split("T")[0];
  };

  const formatDateForChart = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      timeZone: "Europe/Berlin",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return new Intl.DateTimeFormat("de-DE", options).format(date);
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

export default GridChart;
