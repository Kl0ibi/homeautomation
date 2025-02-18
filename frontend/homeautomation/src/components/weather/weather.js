import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './weather.css';

const Weather = ({}) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get('http://192.168.8.162:4000/weather');
        const data = response.data;

        setWeatherData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);
  const handleDayClick = (index) => {
    setSelectedDay(daily[index].hourly);
  };


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const { current, daily } = weatherData;

    console.log(current);

  return (
    <div>
      <div className="current-weather">
        <img
          src={`https://rodrigokamada.github.io/openweathermap/images/${current.icon}_t.png`}
          alt={current.description}
        />
        <p>{current.temperature.toFixed(2)}°C</p>
        <p>{current.description}</p>
        <p>Von {current.temp_min.toFixed(2)}°C bis {current.temp_max.toFixed(2)}°C</p>
        <p>Gefühlt wie: {current.feels_like}°C</p>
        <p>Luftfeuchtigkeit: {current.humidity}%</p>
        <p>Wind: {current.wind_speed} m/s aus {current.wind_deg}</p>
        <p>Luftdruck: {current.pressure} hPa</p>
        <p>Sonnenaufgang: {current.sunrise}</p>
        <p>Sonnenuntergang: {current.sunset}</p>
      </div>

      <div className="forecast">
        <div className="forecast-days">
          {daily.map((item, index) => (
            <div
              key={index}
              className="forecast-day"
              onClick={() => handleDayClick(index)}
            >
              <p>{item.date}</p>
              <img
                src={`https://rodrigokamada.github.io/openweathermap/images/${item.avgValues.icon}_t.png`}
                alt="Wetter Icon"
              />
              <p>{item.avgValues.avgTemperature.toFixed(2)}°C</p>
            </div>
          ))}
        </div>

        {selectedDay && (
          <div className="hourly-forecast">
            <h3>Vorhersage für {new Date(selectedDay[0].timestamp * 1000).toLocaleDateString()}</h3>
            <div className="hourly-items">
              {selectedDay.map((hour, index) => (
                <div key={index} className="hourly-item">
                  <p>{new Date(hour.timestamp * 1000).toLocaleTimeString()}</p>
                  <img
                    src={`https://rodrigokamada.github.io/openweathermap/images/${hour.icon}_t.png`}
                    alt={hour.description}
                  />
                    <p>{hour.temperature.toFixed(2)}°C</p>
                    <p>{hour.description}</p>
                    <p>Von {hour.temp_min.toFixed(2)}°C bis {hour.temp_max.toFixed(2)}°C</p>
                    <p>Luftfeuchtigkeit: {hour.humidity}%</p>
                    <p>Wind: {hour.wind_speed} m/s aus {hour.wind_deg}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {!selectedDay && <div>Wählen Sie einen Tag aus, um die stündlichen Vorhersagen zu sehen.</div>}
      </div>
    </div>
  );
};

export default Weather;
