import React from "react";
import usePlacesAutoComplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxOption,
} from "@reach/combobox";

//Search Component
export function Search({ panTo }) {
  /////////////////INIT VARS/////////////////////
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutoComplete({
    requestOptions: {
      location: { lat: () => 37.468319, lng: () => -122.143936 },
      radius: 200 * 1000,
    },
  });
  //////////////////Search Component layout///////////////
  return (
    <div id="search" className="searchContainer">
      <div id="searchContents">
        <h3
          id="searchHeader"
          style={{ textShadow: "4px 4px #111", color: "whitesmoke" }}
        >
          Active Fire Map
        </h3>
        <div id="searchBar">
          <Combobox
            onSelect={async (address) => {
              setValue(address, true);
              clearSuggestions();
              try {
                const results = await getGeocode({ address });
                const { lat, lng } = await getLatLng(results[0]);
                panTo({ lat, lng });
              } catch (error) {}
            }}
          >
            <ComboboxInput
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
              }}
              placeholder="Enter an Address:"
            />
            <ComboboxPopover
              style={{ zIndex: 20, backgroundColor: "whitesmoke" }}
            >
              {status === "OK" &&
                data.map(({ id, description }) => (
                  <div>
                    <ComboboxOption
                      key={id}
                      style={{ zIndex: 12 }}
                      value={description}
                    />
                  </div>
                ))}
            </ComboboxPopover>
          </Combobox>
        </div>
        <div
          id="searchResults"
          style={{ display: "none", visibility: "hidden", textAlign: "center" }}
        ></div>
        <button
          id="legendButton"
          style={{ visibility: "hidden", position: "absolute" }}
          onClick={async () => {
            document.getElementById("legendButton").style.visibility = "hidden";
            document.getElementById("legendButton").style.position = "absolute";
            document.getElementById("searchResults").innerHTML = "";
            document.getElementById("search").style.overflow = "hidden";
          }}
        >
          Close
        </button>
        <p style={{ margin: 0, marginTop: "1em", marginBottom: ".4em" }}>
          <a style={{ color: "#555" }} href="Https://github.com/RyanKeys">
            © Ryan Keys
          </a>
        </p>
      </div>
    </div>
  );
}
