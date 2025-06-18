// Map.jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map() {
  return (
    // this wrapper gets full height from <main className="flex-1">
    <div className="w-full h-full bg-[#EDF1FA] flex">
      <MapContainer
        center={[16.6145, 120.3158]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"      // <-- fill parent
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
}
