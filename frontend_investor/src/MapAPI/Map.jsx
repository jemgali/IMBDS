// MultipleFiles/Map.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { apiClient } from '../api/api_urls'; // Import apiClient

function LockedGeoJSONLayer({ data, setHoveredBarangay }) {
  const map = useMap();
  const hoverState = useRef({ currentLayer: null, timeout: null });

  useEffect(() => {
    if (!data || !map) return;

    const clearHighlight = () => {
      if (hoverState.current.currentLayer) {
        hoverState.current.currentLayer.setStyle({
          weight: 1,
          color: 'black',
          fillColor: 'transparent',
          fillOpacity: 0,
        });
        hoverState.current.currentLayer = null;
        setHoveredBarangay(null);
      }
    };

    const geoLayer = L.geoJSON(data, {
      style: {
        color: 'black',
        weight: 1,
        fillColor: 'transparent',
        fillOpacity: 0,
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties.name || 'Barangay';

        layer.on({
          mouseover: (e) => {
            clearTimeout(hoverState.current.timeout);
            const l = e.target;
            if (hoverState.current.currentLayer && hoverState.current.currentLayer !== l) {
              clearHighlight();
            }
            hoverState.current.timeout = setTimeout(() => {
              l.setStyle({
                weight: 2,
                color: '#000000',
                fillColor: '#CCCCCC',
                fillOpacity: 0.5,
              });
              l.bringToFront();
              hoverState.current.currentLayer = l;
              setHoveredBarangay(name);
            }, 30);
          },
          mouseout: () => {
            clearTimeout(hoverState.current.timeout);
            hoverState.current.timeout = setTimeout(() => {
              clearHighlight();
            }, 50);
          },
        });
      },
    });

    geoLayer.addTo(map);
    return () => {
      clearTimeout(hoverState.current.timeout);
      map.removeLayer(geoLayer);
    };
  }, [data, map, setHoveredBarangay]);

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
  const [hoveredBarangay, setHoveredBarangay] = useState(null);
  const [savedMarkers, setSavedMarkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshMarkers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('markers/'); // Use apiClient
      setSavedMarkers(response.data);
    } catch (error) {
      console.error('Error refreshing markers:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMarkers();
  }, [refreshMarkers]);

  useEffect(() => {
    const interval = setInterval(refreshMarkers, 30000);
    return () => clearInterval(interval);
  }, [refreshMarkers]);

  return (
    <div className="relative w-full h-full bg-[#EDF1FA] flex">
      {hoveredBarangay && (
        <div className="absolute top-3 left-15 z-[1000] bg-white shadow-md rounded p-3 max-w-xs">
          <div className="text-sm font-semibold text-gray-700">Barangay</div>
          <div className="text-lg font-bold text-gray-900">{hoveredBarangay}</div>
        </div>
      )}

      {isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-white p-4 rounded shadow-lg">
          Loading markers...
        </div>
      )}

      <MapContainer
        center={[16.6145, 120.3158]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <GeoJsonLoader setHoveredBarangay={setHoveredBarangay} />

        {savedMarkers.map((marker) => (
          <Marker
            key={marker.marker_id}
            position={[marker.latitude, marker.longitude]}
            // draggable is removed as editing is not needed
          >
            <Popup>
              <div className="text-sm">
                <div className="font-bold">{marker.label}</div>
                {marker.business && (
                  <>
                    <div>{marker.business.bsns_address}</div>
                    <div className="mb-2 capitalize">{marker.business.industry}</div>
                  </>
                )}
                {marker.invst && ( // Display investible details if available
                  <>
                    <div>{marker.invst.invst_location}</div>
                    <div>{marker.invst.invst_description}</div>
                    <div className="mb-2 capitalize">{marker.invst.status}</div>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
