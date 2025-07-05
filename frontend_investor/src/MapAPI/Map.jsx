// Map.jsx
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON, } from 'react-leaflet';

import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from '@heroicons/react/24/outline';
import ReactDOM from 'react-dom/client';
import 'leaflet';

function LockedGeoJSONLayer({ data, setHoveredBarangay }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!data || !map) return;

    const geoLayer = L.geoJSON(data, {
      pmIgnore: true, // This is the key property to prevent PM editing
      style: {
        color: 'black',
        weight: 1,
        fillColor: 'transparent',
        fillOpacity: 0.3,
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties.name || 'Barangay';

        // Hover effects
        layer.on({
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({
              weight: 2,
              color: '#FF8800',
              fillOpacity: 0.5,
            });
            setHoveredBarangay(name);
          },
          mouseout: (e) => {
            const l = e.target;
            l.setStyle({
              weight: 1,
              color: 'black',
              fillOpacity: 0.3,
            });
            setHoveredBarangay(null);
          },
        });

        // Explicitly disable PM for this layer
        if (layer.pm) {
          layer.pm.disable();
        }

        // Prevent PM from attaching to this layer
        layer.options.pmIgnore = true;
        layer.pmIgnore = true;

        // Disable dragging if available
        if (layer.dragging) {
          layer.dragging.disable();
        }
      },
    });

    geoLayer.addTo(map);
    layerRef.current = geoLayer;

    return () => {
      map.removeLayer(geoLayer);
    };
  }, [data, map, setHoveredBarangay]);

  return null;
}
// ...existing code...

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

// Loader component to fetch GeoJSON at runtime
function GeoJsonLoader({ setHoveredBarangay }) {
  const [geoData, setGeoData] = useState(null);
  useEffect(() => {
    fetch('/assets/san_fernando_boundary.geojson')
      .then(res => res.json())
      .then(setGeoData)
      .catch(() => setGeoData(null));
  }, []);
  if (!geoData) return null;
  return <LockedGeoJSONLayer data={geoData} setHoveredBarangay={setHoveredBarangay} />;
}

export default function Map() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredBarangay, setHoveredBarangay] = useState(null);
  const [bounds, setBounds] = useState(null);

  // Fetch the GeoJSON and compute bounds on mount
  useEffect(() => {
    fetch('/assets/san_fernando_boundary.geojson')
      .then(res => res.json())
      .then(data => {
        // Find the first polygon feature
        const feature = data.features.find(f => f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'));
        if (feature) {
          let coords = feature.geometry.coordinates;
          // For MultiPolygon, flatten one level
          if (feature.geometry.type === 'MultiPolygon') {
            coords = coords.flat();
          }
          // coords is now an array of [lng, lat] pairs
          // Convert to [lat, lng] for Leaflet
          const latlngs = coords[0].map(([lng, lat]) => [lat, lng]);
          setBounds(latlngs);
        }
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
        minZoom={13}
        maxZoom={18}
        zoomSnap={0}
        scrollWheelZoom={true}
        dragging={true} // <-- Always allow dragging
        doubleClickZoom={true}
        boxZoom={true}
        keyboard={true}
        className="w-full h-full z-10"
        {...(bounds ? {bounds: bounds, maxBounds: bounds, maxBoundsViscosity: 1.0} : {})}
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <GeoJsonLoader setHoveredBarangay={setHoveredBarangay} />
        <FullscreenControl
          onToggle={() => setIsFullscreen(!isFullscreen)}
          isFullscreen={isFullscreen}
        />
      </MapContainer>
    </div>
  );
}
