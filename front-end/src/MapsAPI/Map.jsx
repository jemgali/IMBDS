import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, FeatureGroup, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import 'leaflet.pm/dist/leaflet.pm.css';
import L from 'leaflet';
import 'leaflet.pm';
import MarkerFormModal from '../components/Modals/MarkerFormModal';
import DeleteConfirmModal from '../components/Modals/DeleteModal';

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
      pmIgnore: true,
      style: {
        color: 'black',
        weight: 1,
        fillColor: 'transparent',
        fillOpacity: 0,
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties.name || 'Barangay';
        layer.pmIgnore = true;
        layer.options.pmIgnore = true;
        if (layer.pm) layer.pm.disable();
        if (layer.dragging) layer.dragging.disable();

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

function DrawingTools({ userLayerGroupRef, onNewMarker, handleMarkerDelete }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !userLayerGroupRef.current) return;

    map.pm.addControls({
      position: 'topleft',
      drawMarker: true,
      drawCircle: false,
      drawPolyline: false,
      drawPolygon: false,
      drawRectangle: false,
      drawCircleMarker: false,
      editMode: false,
      dragMode: true,
      removalMode: true,
    });

    map.on('pm:drawstart', (e) => {
      if (e.workingLayer && e.workingLayer._tooltip) {
        e.workingLayer._tooltip.remove();
      }
    });

    map.on('pm:create', (e) => {
      if (e.shape !== 'Marker') return;

      const layer = e.layer;
      const latlng = layer.getLatLng();

      userLayerGroupRef.current.addLayer(layer);
      layer.pmIgnore = false;

      onNewMarker(latlng, layer);
    });

    map.on('pm:remove', async (e) => {
      const layer = e.layer;
      if (!(layer instanceof L.Marker)) return;

      if (layer.options.markerId) {
        await handleMarkerDelete(layer.options.markerId);
      } else {
        // For markers without IDs (temporary ones)
        userLayerGroupRef.current.removeLayer(layer);
      }
    });

    return () => {
      map.pm.removeControls();
      map.off('pm:create');
      map.off('pm:remove');
    };
  }, [map, userLayerGroupRef, onNewMarker]);

  return null;
}

export default function Map() {
  const [geoData, setGeoData] = useState(null);
  const [hoveredBarangay, setHoveredBarangay] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newMarker, setNewMarker] = useState(null);
  const [savedMarkers, setSavedMarkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const userLayerGroupRef = useRef(L.featureGroup());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [markerToDelete, setMarkerToDelete] = useState(null);


  const refreshMarkers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/markers/');
      setSavedMarkers(response.data);
    } catch (error) {
      console.error('Error refreshing markers:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch('/assets/san_fernando_boundary.geojson')
      .then(res => res.json())
      .then(setGeoData)
      .catch(err => console.error("Error loading GeoJSON:", err));

    refreshMarkers();
  }, [refreshMarkers]);

  useEffect(() => {
    const map = userLayerGroupRef.current._map;
    if (!map) return;

    const enableDragging = () => {
      userLayerGroupRef.current.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          layer.dragging.enable();
        }
      });
    };

    const disableDragging = () => {
      userLayerGroupRef.current.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          layer.dragging.disable();
        }
      });
    };

    map.on('pm:dragstart', enableDragging);
    map.on('pm:dragend', disableDragging);

    return () => {
      map.off('pm:dragstart', enableDragging);
      map.off('pm:dragend', disableDragging);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshMarkers, 30000);
    return () => clearInterval(interval);
  }, [refreshMarkers]);

  const handleMarkerSubmit = async ({ label, location, businessType, industry }) => {
    if (!newMarker) return;

    try {
      // Create Business first
      const businessRes = await axios.post('http://127.0.0.1:8000/api/businesses/', {
        bsns_name: label,
        bsns_address: location,
        bsns_type: businessType.toLowerCase(),
        industry: industry || "General"
      });

      const businessId = businessRes.data.business_id;

      // Then create Marker
      const markerRes = await axios.post('http://127.0.0.1:8000/api/markers/', {
        label,
        latitude: newMarker.lat,
        longitude: newMarker.lng,
        business_id: businessId, // ✅ Correct!
      });

      if (newMarker.layer) {
        newMarker.layer.options.markerId = markerRes.data.id;
      }

      setSavedMarkers(prev => [...prev, markerRes.data]);
      setModalOpen(false);
      setNewMarker(null);
    } catch (err) {
      if (err.response) {
        console.error('🛑 Marker API error:', err.response.data);
      } else {
        console.error('❌ Unexpected marker error:', err);
      }
    }
  };

  const handleMarkerDelete = async (markerId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/markers/${markerId}/`);
      // Optimistically update both state and FeatureGroup
      setSavedMarkers(prev => prev.filter(m => m.id !== markerId));

      // Find and remove the marker from FeatureGroup
      userLayerGroupRef.current.eachLayer(layer => {
        if (layer.options.markerId === markerId) {
          userLayerGroupRef.current.removeLayer(layer);
        }
      });
    } catch (err) {
      if (err.response) {
        console.error('🛑 Backend validation error:', err.response.data);
      } else {
        console.error('❌ Error saving marker with business:', err);
      }
    }
  };

  const handleMarkerDrag = async (e, marker) => {
    const { lat, lng } = e.target.getLatLng();
    try {
      await axios.put(`http://127.0.0.1:8000/api/markers/${marker.marker_id}/`, {
        label: marker.label,
        latitude: lat,
        longitude: lng,
      });
      setSavedMarkers(prev =>
        prev.map(m => (m.id === marker.id ? { ...m, latitude: lat, longitude: lng } : m))
      );
    } catch (err) {
      console.error('Error updating marker:', err);
    }
  };

  const handleNewMarker = (latlng, layer) => {
    setNewMarker({
      ...latlng,
      layer // Store the layer reference
    });
    setModalOpen(true);
  };

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

        <FeatureGroup ref={userLayerGroupRef}></FeatureGroup>
        {geoData && <LockedGeoJSONLayer data={geoData} setHoveredBarangay={setHoveredBarangay} />}
        <DrawingTools
          userLayerGroupRef={userLayerGroupRef}
          onNewMarker={handleNewMarker}
          handleMarkerDelete={handleMarkerDelete}
        />

        {savedMarkers.map((marker) => (
          <Marker
            key={marker.marker_id}
            position={[marker.latitude, marker.longitude]}
            draggable={false}
            eventHandlers={{
              dragend: (e) => handleMarkerDrag(e, marker),
              click: (e) => {
                // Add a right-click context menu for deletion
                e.originalEvent.preventDefault();
                if (e.originalEvent.button === 2) { // Right-click
                  setMarkerToDelete(marker.marker_id);
                  setDeleteModalOpen(true);
                }
              },
              contextmenu: (e) => {
                // Prevent default context menu
                e.originalEvent.preventDefault();
              }
            }}
            ref={(ref) => {
              if (ref) {
                ref.options.markerId = marker.marker_id;
                ref.feature = {
                  properties: {
                    id: marker.marker_id
                  }
                };
              }
            }}
          >
            <Popup>
              {marker.label}
            </Popup>
          </Marker>
        ))}

      </MapContainer>

      {modalOpen && (
        <MarkerFormModal
          isOpen={modalOpen}
          onClose={() => {
            if (newMarker?.layer) {
              userLayerGroupRef.current.removeLayer(newMarker.layer);
            }
            setModalOpen(false);
            setNewMarker(null);
          }}
          onSubmit={handleMarkerSubmit}
        />
      )}

      {deleteModalOpen && (
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onCancel={() => setDeleteModalOpen(false)}
          onConfirm={async () => {
            await handleMarkerDelete(markerToDelete);
            setDeleteModalOpen(false);
            setMarkerToDelete(null);
          }}
        />
      )}

    </div>
  );
}