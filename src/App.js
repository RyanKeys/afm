import React from "react";
import logo from "./logo.svg";
import { useState, useEffect } from "react";
import { Search } from "./Search";

import "./App.css";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import mapStyle from "./mapStyles";
const dotenv = require("dotenv");
dotenv.config();

function App() {
  const [fires, setFires] = useState();

  useEffect(() => {
    const href = "https://firemap.global/api";
    console.log(test);
    async function postData(url = href, data = {}) {
      // Default options are marked with *
      const response = await fetch(url, {
        method: "POST",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.json(); // parses JSON response into native JavaScript objects
    }
    postData().then((res) => {
      setFires(res);
    });
  }, []);

  //fn Moves Map to user input location
  const panTo = React.useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
  }, []);

  //Opens up Legend background then fills it with populateSearch()
  const openLegend = (fire) => {
    const legend = document.getElementById("search");
    legend.style.height = "auto";
    legend.style.overflow = "auto";
    const button = document.getElementById("legendButton");
    button.style.visibility = "visible";
    button.style.position = "relative";
    button.style.zIndex = 10;
    populateSearch(fire);
  };

  //Grabs containers inside legend and populates it with json data via fireResultsHtml().
  const populateSearch = (fire) => {
    const searchResults = document.getElementById("searchResults");
    searchResults.innerHTML = "";
    searchResults.innerHTML += fireResultsHtml(fire);
    searchResults.style.display = "block";
    searchResults.style.visibility = "visible";
    return {
      searchResults,
    };
  };

  const fireResultsHtml = (fire) => {
    return `<div id=fireResults>
      <h3 id=fireTitle>Coordinates:<br/>${fire.latitude}/${fire.longitude}</h3>
      <h3 id=fireTitle>Date Discovered:<br/>${fire.acq_date}<h3/>
      <h3 id=fireTitle>Probability:<br/>${fire.confidence}<h3/> 
      <h3 id=fireTitle>Scan:<br/>${fire.scan}</h3>
      <h3 id=fireTitle>Bright T 31:<br/>${fire.bright_t31}</h3>
      <h3 id=fireTitle>FRP:<br/>${fire.frp}</h3>
      <h3 id=fireTitle>Satellite:<br/>${fire.satellite}</h3>
      <br/>
    </div>`;
  };

  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);
  const libraries = ["places"];
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_API_KEY,
    libraries,
  });

  if (loadError) return "Error Loading Data.";
  // TODO animation in place of Loading Fire Data.
  if (!isLoaded) return "Loading map data.";
  const mapStyles = {
    height: "100vh",
    width: "100%",
  };
  const options = {
    styles: mapStyle,
    disableDefaultUI: true,
  };

  var markerSize = 30;

  return (
    <div className="App">
      <Search panTo={panTo} />
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={8}
        center={{ lat: 37.468319, lng: -122.143936 }}
        options={options}
        onLoad={onMapLoad}
      >
        {fires &&
          fires.map((fire) => (
            // Add onClick to markers
            <Marker
              key={fire.id}
              position={{
                lat: parseFloat(fire.latitude),
                lng: parseFloat(fire.longitude),
              }}
              onClick={async () => {
                const lat = parseFloat(fire.latitude);
                const lng = parseFloat(fire.longitude);
                panTo({ lat, lng });
                openLegend(fire);
              }}
              icon={{
                url: "https://cdn140.picsart.com/268960205000211.png",
                scaledSize: new window.google.maps.Size(markerSize, markerSize),
                origin: new window.google.maps.Point(0, 0),
              }}
            />
          ))}
      </GoogleMap>
    </div>
  );
}

export default App;
