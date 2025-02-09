// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
// import L from 'leaflet';

const LazyMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function Home() {
  const [bridgeData, setBridgeData] = useState([]);
  const [initLocation, setInitLocation] = useState([37.73372222222223, -122.49421111111111]);
  const [initMapZoom, setInitMapZoom] = useState(13);

  const [searchZip, setSearchZip] = useState<string>("");
  const currentLocation = useRef([0, 0]);
  const currentMapZoom = useRef(13);

  function updateSearchZip(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchZip(e.target.value);
  }

  
  function updateCenter(center: L.LatLng, zoom) {
    currentLocation.current = center;
    currentMapZoom.current = zoom;
    // setInitLocation([center.lat, center.lng]);
  }

  function debounce(func, delay = 100) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  function getData(location) {
    fetch(`http://73.162.166.11:9000/?distance=5000&latitude=${location[0]}&longitude=${location[1]}`)
      .then((response) => {
        if (!response.ok) {
          throw Error("Data fetching failed.")
        }
        return response.json();
      })
      .then((data) => {
        // console.log(data);
        setBridgeData(data);
        // setInitLocation(location);
        setSearchZip("");
      })
      .catch((error) => {
        console.log(error)
      });
  }

  function getDataById(bridgeId) {
    fetch(`http://73.162.166.11:9000/structure_number?id=${bridgeId}`)
      .then((response) => {
        if (!response.ok) {
          throw Error("Data fetching failed.")
        }
        return response.json();
      })
      .then((data) => {
        // console.log(data);
        if (data.length == 1) {
          setBridgeData(data);
          setInitLocation([data[0].Latitude, data[0].Longitude]);
          setSearchZip("");
        }
      })
      .catch((error) => {
        console.log(error)
      });
  }

  function getLatLng(zip: string) {
    // console.log(`http://73.162.166.11/:9000/zip?zip=${zip}`);
    fetch(`http://73.162.166.11:9000/zip?zip=${zip}`)
      .then((response) => {
        if (!response.ok) {
          throw Error("Zip fetching failed.")
        }
        return response.json();
      })
      .then((data) => {
        // console.log(data);
        if (data.LAT && data.LNG) {
          setInitLocation([data.LAT, data.LNG]);
          getData([data.LAT, data.LNG]);
          setSearchZip("");
        }
      })
      .catch((error) => {
        console.log(error)
      });
  }

  useEffect(() => { 
    // getData(initLocation) 
    currentLocation.current = initLocation;
  }, [initLocation]);

  useEffect(() => { 
    getData(initLocation);
  }, []);

  function onSearchClick() {
    //console.log(centerPos.current);
    // console.log('clicked');
    // console.log(searchZip.includes(","));
    // setInitLocation([currentLocation.current.lat, currentLocation.current.lng]);
    // setInitMapZoom(currentMapZoom.current);
    if (searchZip.length == 5 && !isNaN(+searchZip)) {
      // console.log("zip");
      getLatLng(searchZip);
    } else if (searchZip.length == 0) {
      // console.log("empty");
      // console.log('clicked');
      // console.log(centerPos.current);
      setInitLocation([currentLocation.current.lat, currentLocation.current.lng]);
      setInitMapZoom(currentMapZoom.current);
      getData([currentLocation.current.lat, currentLocation.current.lng]);
    } else if (searchZip.includes(",")) {
      // console.log("latlng");
      // console.log(searchZip);
      const codes = searchZip.split(",");
      if (codes.length == 2 && !isNaN(+codes[0]) && !isNaN(+codes[1])) {
        const lat = Number(codes[0]);
        const lng = Number(codes[1])
        setInitLocation([lat, lng]);
        getData([lat, lng]);
      }
    } else if (searchZip.includes("-")){
      // console.log("id code");
      const codes = searchZip.split("-");
      if (codes.length == 2) {
        getDataById(codes[0] + ',' + codes[1].replace(/^0+/, ''));
      }
    } 
  }

  function inputOnFocus() {
    setInitLocation([currentLocation.current.lat, currentLocation.current.lng]);
    setInitMapZoom(currentMapZoom.current);
  }

  return (
    <main>
      <div className="flex flex-1 flex-row justify-center text-[32px]">
        Search Bridges
      </div>
      <div className="flex flex-1 flex-row justify-center text-[18px]">
        Zipcode/State Code-Structure Number/Latitude,Longitude/Current location(empty input)
      </div>
      <div className="flex flex-1 flex-row justify-center">
        <input
          className="block w-[800px] h-[24px] p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="E.g. 94043 or 06-1CA0095, or 37.41916,-122.07541 or leave it empty."
          onChange={updateSearchZip}
          value={searchZip}
          onKeyUp={(e) => { if (e.key === 'Enter') { onSearchClick() } }}
          onFocus={inputOnFocus}>
        </input>
        <button
          type="button"
          className="h-[34px] text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={onSearchClick}>
          Search
        </button>
      </div>
      <div className="flex flex-1 flex-row justify-center">
        <LazyMap updateCenter={debounce(updateCenter, 25)} center={initLocation} zoom={initMapZoom} bridges={bridgeData} />
        <div className="h-[400px] w-[600px] overflow-auto">
          <table className="table-auto">
            <thead>
              <tr>
                <th>State Code</th>
                <th>Structure Number</th>
                <th>Year of Build</th>
              </tr>
            </thead>
            <tbody>
            {bridgeData.map((bridge)=>
              <tr key={'t' + bridge.STATE_CODE_001 + bridge.STRUCTURE_NUMBER_008.replace(/^0+/, '')} 
              onClick={()=>{setInitLocation([bridge.Latitude, bridge.Longitude])}}>
                <td>{bridge.STATE_CODE_001}</td>
                <td>{bridge.STRUCTURE_NUMBER_008.replace(/^0+/, '')}</td>
                <td>{bridge.YEAR_BUILT_027}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
