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

  const [searchZip, setSearchZip] = useState<string>("");
  const centerPos = useRef([0, 0]);

  function updateSearchZip(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchZip(e.target.value);
  }

  function updateCenter(center: L.LatLng) {
    centerPos.current = center;
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
        setSearchZip("");
        if (data.LAT && data.LNG) {
          setInitLocation([data.LAT, data.LNG]);
          getData([data.LAT, data.LNG])
        }
      })
      .catch((error) => {
        console.log(error)
      });
  }

  useEffect(() => { 
    // getData(initLocation) 
    centerPos.current = initLocation;
  }, [initLocation]);

  useEffect(() => { 
    getData(initLocation);
  }, []);

  function onSearchClick() {
    //console.log(centerPos.current);
    // console.log('clicked');
    if (searchZip.length == 5) {
      getLatLng(searchZip);
    } else {
      // console.log('clicked');
      // console.log(centerPos.current);
      setInitLocation([centerPos.current.lat, centerPos.current.lng]);
      getData([centerPos.current.lat, centerPos.current.lng]);
    }
    setSearchZip('');
  }

  return (
    <main>
      <div className="flex flex-1 flex-row justify-center">
        Search bridges by Zipcode or current location(empty input)
      </div>
      <div className="flex flex-1 flex-row justify-center">
        <input
          className="block w-1000 p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="US Zip"
          onChange={updateSearchZip}
          value={searchZip}
          onKeyUp={(e) => { if (e.key === 'Enter') { onSearchClick() } }}>
        </input>
        <button
          type="button"
          className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={onSearchClick}>
          Search
        </button>
      </div>
      <div className="flex flex-1 flex-row justify-center">
        <LazyMap updateCenter={updateCenter} center={initLocation} bridges={bridgeData} />
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
