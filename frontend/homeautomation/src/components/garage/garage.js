import React, { useState, useEffect } from 'react';
import "./garage.css";

function GarageControl() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [compassActive, setCompassActive] = useState(false);
  const [buttonPosition, setButtonPosition] = useState('inside');

  // Check credentials on component mount
  useEffect(() => {
    const username = localStorage.getItem('garageuser');
    const password = localStorage.getItem('garagepass');
    const compassActive = localStorage.getItem('compassActive') === 'true';
    const buttonPosition = localStorage.getItem('buttonPosition') || 'inside';

    if (username && password) {
      checkCredentials(username, password);
    }
    setCompassActive(compassActive);
    setButtonPosition(buttonPosition);
  }, []);

  // Check credentials with the server
  const checkCredentials = async (username, password) => {
    try {
      const response = await fetch('http://192.168.8.80/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.message === 'Success') {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Handle login
  const handleLogin = async (username, password, rememberMe) => {
    try {
      const response = await fetch('http://192.168.8.80/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.message === 'Success') {
        setIsLoggedIn(true);
        if (rememberMe) {
          localStorage.setItem('garageuser', username);
          localStorage.setItem('garagepass', password);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('garageuser');
    localStorage.removeItem('garagepass');
    setIsLoggedIn(false);
  };

  // Toggle compass functionality
  const toggleCompass = () => {
    const newCompassActive = !compassActive;
    setCompassActive(newCompassActive);
    localStorage.setItem('compassActive', newCompassActive);

    if (newCompassActive) {
      startCompass();
    } else {
      window.removeEventListener('deviceorientation', handleOrientation);
    }
  };

  // Start compass
  const startCompass = () => {
    if (window.DeviceOrientationEvent) {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(permissionState => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        }).catch(console.error);
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    } else {
      console.log('Device Orientation API not supported.');
    }
  };

  // Handle device orientation
  const handleOrientation = (event) => {
    let compassHeading;

    if (event.webkitCompassHeading) {
      compassHeading = event.webkitCompassHeading; // iOS-specific
    } else {
      compassHeading = 360 - event.alpha; // Other browsers
    }

    if (compassHeading <= 300 && compassHeading >= 150) {
      setButtonPosition('outside');
    } else {
      setButtonPosition('inside');
    }
  };

  // Toggle button position manually
  const toggleButtonPosition = () => {
    if (compassActive) {
      alert('Auto Location needs to be deactivated!');
      return;
    }
    const newPosition = buttonPosition === 'inside' ? 'outside' : 'inside';
    setButtonPosition(newPosition);
    localStorage.setItem('buttonPosition', newPosition);
  };

  // Send request to the server
  const sendRequest = async (uri) => {
    const username = localStorage.getItem('garageuser');
    const password = localStorage.getItem('garagepass');

    try {
      const response = await fetch(`http://192.168.8.80?uri=${encodeURIComponent(uri)}`, {
        method: 'GET',
        headers: {
          'X-Auth-User': username,
          'X-Auth-Pass': password,
        },
      });
      const data = await response.json();
      if (data.message === 'Success') {
        console.log(`Request to ${uri} was successful.`);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="garage-control">
      {!isLoggedIn ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
          <button className="compass-toggle" onClick={toggleCompass}>
            Auto Location: {compassActive ? 'ON' : 'OFF'}
          </button>
          <img
            src={buttonPosition === 'inside' ? 'inside.png' : 'outside.png'}
            alt="Position Toggle"
            onClick={toggleButtonPosition}
            className="toggle-image"
          />
          <h1>Garage Door Control</h1>
          <div className="button-group" style={{ order: buttonPosition === 'inside' ? 1 : 2 }}>
            <button className="button up" onClick={() => sendRequest('/left/open')}></button>
            <button className="button hold" onClick={() => sendRequest('/left/hold')}></button>
            <button className="button down" onClick={() => sendRequest('/left/close')}></button>
          </div>
          <div className="button-group" style={{ order: buttonPosition === 'inside' ? 2 : 1 }}>
            <button className="button up" onClick={() => sendRequest('/right/open')}></button>
            <button className="button hold" onClick={() => sendRequest('/right/hold')}></button>
            <button className="button down" onClick={() => sendRequest('/right/close')}></button>
          </div>
        </>
      )}
    </div>
  );
}

// LoginForm Subcomponent
function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password, rememberMe);
  };

  return (
    <div className="overlay">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="remember-me-container">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="rememberMe">Remember Me</label>
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default GarageControl;
