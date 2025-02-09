"use client";

import "leaflet/dist/leaflet.css";

// Fixes Marker image url
import L from 'leaflet';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
});

import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect, useRef, useCallback } from "react";

function MapControl({ updateCenter, center }) {
  const map = useMap()
  const position = useRef(map.getCenter())

  // const onClick = useCallback(() => {
  //   map.setView(center, zoom)
  // }, [map])

  const onMove = useCallback(() => {
    position.current = map.getCenter()
    // console.log('map center:', position.current)
    updateCenter(map.getCenter())
  }, [map, updateCenter])

  useEffect(() => {
    map.on('move', onMove)
    return () => {
      map.off('move', onMove)
    }
  }, [map, onMove])
  map.flyTo(center, map.getZoom());
  return null
}

export default function Map({ updateCenter, center, bridges }) {
  return (
    <MapContainer
      preferCanvas={true}
      center={center}
      zoom={11}
      scrollWheelZoom={true}
      style={{ height: "400px", width: "600px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {bridges.map((bridge, index) =>
        <Marker key={bridge.STATE_CODE_001 + bridge.STRUCTURE_NUMBER_008.replace(/^0+/, '')} position={[bridge.Latitude, bridge.Longitude]}>
          <Popup>
            <ul>
              <li>
                State code: {bridge.STATE_CODE_001}
              </li>
              <li>
                Structure number: {bridge.STRUCTURE_NUMBER_008.replace(/^0+/, '')}
              </li>
              <li>
                Year of build: {bridge.YEAR_BUILT_027}
              </li>
            </ul>
          </Popup>
        </Marker>)}

      <MapControl updateCenter={updateCenter} center={center} />
    </MapContainer>
  );
}
