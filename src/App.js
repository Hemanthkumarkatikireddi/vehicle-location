import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  Polyline,
} from "@react-google-maps/api";
import axios from "axios";
import "./App.css";

const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};

const center = {
  lat: 17.385044,
  lng: 78.486671,
};

const App = () => {
  const [vehiclePath, setVehiclePath] = useState([]);
  const [currentLocation, setCurrentLocation] = useState([]);
  const [mapCenter, setMapcenter] = useState(center);
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [selectedDate, setSelectedDate] = useState("yesterday");
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.75);
  const [playbackInterval, setPlaybackInterval] = useState(null);
  const [markerLocation, setMarkerRotation] = useState(0);
  const [showPlaybackControls, setShowPlaybackControls] = useState(false);

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const fetchData = async (date) => {
    try {
      console.log("date", date);
      const response = await axios.get(
        `https://vehicle-location-api.onrender.com/vehicle-location?data=${date}`
      );

      const data = response.data;

      if (Array.isArray(data) && data.length > 0) {
        const formattedPath = data.map((coord) => ({
          lat: coord.latitude,
          lng: coord.longitude,
        }));
        console.log("formattedPath", formattedPath);
        setVehiclePath(formattedPath);
        setStartLocation(formattedPath[0]);
        setEndLocation(formattedPath[formattedPath.length - 1]);
        setCurrentLocation(formattedPath[0]);
        setMapcenter(formattedPath[0]);
        // setShowInfoWindow(true);
      } else {
        setVehiclePath([]);
        setCurrentLocation(center);
        setStartLocation(null);
        setEndLocation(null);
        setMapcenter(center);
      }
    } catch (error) {
      console.log(`Error fetching`);
    }
  };

  const handlePlaybackSpeedChange = (event) => {
    setSelectedDate(Number(event.target.value));
  };

  const calculateAngle = (point1, point2) => {
    const dy = point2.lat - point1.lat;
    const dx = point2.lng - point1.lng;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return angle;
  };
  const startPlayBack = () => {
    if (playbackInterval) {
      clearInterval(playbackInterval);
    }
    let index = 0;
    const interval = setInterval(() => {
      if (index < vehiclePath.length - 1) {
        setCurrentLocation(vehiclePath[index]);
        const angle = calculateAngle(
          vehiclePath[index],
          vehiclePath[index + 1]
        );
        setMarkerRotation(angle);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 1000 / playbackSpeed);
    setPlaybackInterval(interval);
  };
  return (
    <LoadScript
      googleMapsApiKey="AIzaSyB2YGKBYF225rnp93MJmeoGfmHmLHa6n4U"
      onLoad={() => setIsLoaded(true)}
      onError={() => console.error("Error Loading Google Maps")}
    >
      {isLoaded && (
        <div style={{ position: "relative" }}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={8}
            center={mapCenter}
          >
            {startLocation && (
              <Marker
                position={startLocation}
                icon={{
                  url: "http://maps.google.com/mapfiles/kml/paddle/go.png",
                  scaledsize: new window.google.maps.Size(50, 50),
                }}
              />
            )}
            {endLocation && (
              <Marker
                position={endLocation}
                icon={{
                  url: "http://maps.google.com/mapfiles/kml/paddle/go.png",
                  scaledsize: new window.google.maps.Size(50, 50),
                }}
              />
            )}
            {vehiclePath.length > 0 && (
              <>
                <Polyline
                  path={vehiclePath}
                  options={{ strokeColor: "#555802", strokeWeight: 5 }}
                />
                <Marker
                  position={currentLocation}
                  icon={{
                    url: "http://img.icons8.com/?size=100&id=b6Yx1jSCrEyb&format=png&color=000000",
                    scaledsize: new window.google.maps.Size(1000, 1000),
                    rotation: markerLocation,
                  }}
                />
              </>
            )}

            {showInfoWindow && (
              <InfoWindow
                position={currentLocation}
                onCloseClick={() => setShowInfoWindow(false)}
              >
                <div className="info-window-content">
                  <h2>WireLess</h2>
                  <p>A/23/28, Vijay Nagar Rd, Vijay Nagar, Delhi</p>
                  <p>July 20, 07:09 AM</p>
                  <div className="info-window-details">
                    <div>
                      <p>Speed: 0.00km/h</p>
                      <p>Distance: 0.00km</p>
                      <p>Total Distance: 834.89 km</p>
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}

            <div className="controls-window">
              {/* <select
                onChange={(e) => setSelectedDate(e.target.value)}
                className="btn"
              >
                <option value={""}>Select Date</option>
                <option value={"today"}>Today</option>
                <option value="yesterday">Yesterday</option>
                <option value={"this_week"}>This Week</option>
              </select> */}
              <button className="btn" onClick={() => startPlayBack()}>
                Start
              </button>
            </div>
          </GoogleMap>
        </div>
      )}
    </LoadScript>
  );
};

export default App;
