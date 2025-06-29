// Map.jsx
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON, } from 'react-leaflet';
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from '@heroicons/react/24/outline';
import ReactDOM from 'react-dom/client';
import 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.pm';
import 'leaflet.pm/dist/leaflet.pm.css';

function FullscreenControl({ onToggle, isFullscreen }) {
  const map = useMap();
  const containerRef = useRef(null);

  useEffect(() => {
    const controlDiv = L.DomUtil.create('div', 'leaflet-bar');
    controlDiv.style.background = 'white';
    controlDiv.style.border = '1px solid #ccc';
    controlDiv.style.padding = '6px';
    controlDiv.style.cursor = 'pointer';
    controlDiv.style.borderRadius = '4px';
    controlDiv.style.display = 'flex';
    controlDiv.style.alignItems = 'center';
    controlDiv.style.justifyContent = 'center';

    // Make React root for icon
    const iconContainer = document.createElement('div');
    controlDiv.appendChild(iconContainer);
    const root = ReactDOM.createRoot(iconContainer);

    root.render(
      isFullscreen ? (
        <ArrowsPointingInIcon className="h-5 w-5 text-black" />
      ) : (
        <ArrowsPointingOutIcon className="h-5 w-5 text-black" />
      )
    );

    controlDiv.onclick = onToggle;

    const control = L.control({ position: 'topright' });
    control.onAdd = () => controlDiv;
    control.addTo(map);

    // Clean up
    return () => {
      setTimeout(() => {
        root.unmount();
        control.remove();
      }, 0);
    };
  }, [map, onToggle, isFullscreen]);

  return null;
}

function DrawingTools() {
  const map = useMap();

  useEffect(() => {
    if (!map || !map.pm) return;

    map.pm.addControls({
      position: 'topleft',
      drawMarker: true,
      drawPolyline: true,
      drawCircleMarker: true,
      drawCircle: true,
      drawPolygon: true,
      drawRectangle: true,
      editMode: true,
      dragMode: true,
      removalMode: true,
    });

    map.on('pm:create', (e) => {
      const layer = e.layer;

      if (layer instanceof L.Circle) {
        const radius = layer.getRadius().toFixed(2);
        layer.bindPopup(`Radius: ${radius} meters`).openPopup();
      }

      if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
        const latlngs = layer.getLatLngs()[0];
        const area = L.GeometryUtil.geodesicArea(latlngs);
        const readableArea = (area / 1000000).toFixed(2);
        layer.bindPopup(`Area: ${readableArea} km²`).openPopup();
      }
    });
  }, [map]);

  return null;
}


export default function Map() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [geoData, setGeoData] = useState(null);
  const [hoveredBarangay, setHoveredBarangay] = useState(null);

  useEffect(() => {
    fetch('/assets/san_fernando_boundary.geojson')
      .then(res => res.json())
      .then(data => {
        console.log("GeoJSON loaded:", data);
        setGeoData(data);
      });
  }, []);
  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'relative w-full h-full'} bg-[#EDF1FA] flex`}>
      {hoveredBarangay && (
        <div className="absolute top-3 left-15 z-[1000] bg-white shadow-md rounded p-3 max-w-xs">
          <div className="text-sm font-semibold text-gray-700">Barangay</div>
          <div className="text-lg font-bold text-gray-900">
            {hoveredBarangay ? hoveredBarangay : <span className="text-gray-400 italic">Hover on a barangay</span>}
          </div>
        </div>

      )}
      <MapContainer
        center={[16.6145, 120.3158]}
        zoom={13}
        maxZoom={18}
        zoomSnap={0}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >

        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {geoData && (
          <GeoJSON
            data={geoData}
            style={{
              color: 'black',
              weight: 2,
              fillColor: 'transparent',
              fillOpacity: 0.3,
            }}
            onEachFeature={(feature, layer) => {
              const name = feature.properties.name || 'Barangay';

              // Hover popup and highlight
              layer.on({
                mouseover: function (e) {
                  const layer = e.target;
                  layer.setStyle({
                    weight: 3,
                    color: '#FF8800',
                    fillOpacity: 0.5,
                  });
                  setHoveredBarangay(name);
                },
                mouseout: function (e) {
                  const layer = e.target;
                  layer.setStyle({
                    weight: 2,
                    color: 'black',
                    fillOpacity: 0.3,
                  });
                  setHoveredBarangay(null);
                },
              });
            }}

          />
        )}


        <FullscreenControl
          onToggle={() => setIsFullscreen(!isFullscreen)}
          isFullscreen={isFullscreen}
        />
        <DrawingTools />
      </MapContainer>
    </div>
  );
}
