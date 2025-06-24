// Map.jsx
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from '@heroicons/react/24/outline';
import ReactDOM from 'react-dom/client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
      root.unmount();
      control.remove();
    };
  }, [map, onToggle, isFullscreen]);

  return null;
}

export default function Map() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-full'} bg-[#EDF1FA] flex`}>
      <MapContainer
        center={[16.6145, 120.3158]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[16.6145, 120.3158]}>
          <Popup>
            A pretty CSS3 popup.
            <br />
            Easily customizable.
          </Popup>
        </Marker>

        <FullscreenControl
          onToggle={() => setIsFullscreen(!isFullscreen)}
          isFullscreen={isFullscreen}
        />
      </MapContainer>
    </div>
  );
}
