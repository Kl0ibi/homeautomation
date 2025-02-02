import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// Sample solar PV data
const solarPVData = {
  production: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120], // kW
  consumption: [5, 15, 25, 35, 45, 55, 65, 75, 85, 95, 105, 115], // kW
  time: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
};

function SolarPVChart() {
  const options = {
    chart: {
      type: 'spline',
      backgroundColor: '#1a1a1a',
      style: {
        fontFamily: 'Orbitron, sans-serif',
      },
    },
    title: {
      text: 'Solar PV Data',
      style: {
        color: '#00eaff',
        fontSize: '1.5em',
      },
    },
    xAxis: {
      categories: solarPVData.time,
      labels: {
        style: {
          color: '#f0f0f0',
        },
      },
      gridLineColor: '#333',
    },
    yAxis: {
      title: {
        text: 'Power (kW)',
        style: {
          color: '#f0f0f0',
        },
      },
      labels: {
        style: {
          color: '#f0f0f0',
        },
      },
      gridLineColor: '#333',
    },
    series: [
      {
        name: 'Production',
        data: solarPVData.production,
        color: '#00eaff',
      },
      {
        name: 'Consumption',
        data: solarPVData.consumption,
        color: '#ff4444',
      },
    ],
    legend: {
      itemStyle: {
        color: '#f0f0f0',
      },
    },
    tooltip: {
      backgroundColor: '#1a1a1a',
      style: {
        color: '#f0f0f0',
      },
    },
    plotOptions: {
      spline: {
        marker: {
          enabled: true,
          symbol: 'circle',
          radius: 4,
          fillColor: '#ffffff',
          lineWidth: 2,
          lineColor: null, // inherit from series color
        },
      },
    },
  };

  return (
    <div className="solar-pv-chart">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}

export default SolarPVChart;
