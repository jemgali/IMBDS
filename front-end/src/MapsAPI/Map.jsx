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

function DrawingTools({ userLayerGroupRef, onNewMarker, onRequestDelete }) {
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

    map.on('pm:remove', (e) => {
      const layer = e.layer;
      if (!(layer instanceof L.Marker)) return;

      const markerId = layer.options.markerId;
      if (markerId) {
        onRequestDelete(markerId, layer);
      } else {
        userLayerGroupRef.current.removeLayer(layer);
      }
    });

    return () => {
      map.pm.removeControls();
      map.off('pm:create');
      map.off('pm:remove');
    };
  }, [map, userLayerGroupRef, onNewMarker, onRequestDelete]);

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
  const [pendingLayer, setPendingLayer] = useState(null);

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
          layer.dragging?.enable();
        }
      });
    };

    const disableDragging = () => {
      userLayerGroupRef.current.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          layer.dragging?.disable();
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

  const handleMarkerSubmit = async ({ label, location, industry }) => {
    if (!newMarker) return;

    try {
      const businessRes = await axios.post('http://127.0.0.1:8000/api/businesses/', {
        bsns_name: label,
        bsns_address: location,
        industry
      });

      const businessId = businessRes.data.business_id;

      const markerRes = await axios.post('http://127.0.0.1:8000/api/markers/', {
        label,
        latitude: newMarker.lat,
        longitude: newMarker.lng,
        business_id: businessId,
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
      setSavedMarkers(prev => prev.filter(m => m.id !== markerId));

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

    let businessId = marker.business_id;

    if (Array.isArray(businessId)) {
      businessId = businessId[0];
    }

    if (typeof businessId === 'object' && businessId !== null) {
      businessId = businessId.business_id;
    }

    try {
      await axios.put(`http://127.0.0.1:8000/api/markers/${marker.marker_id}/`, {
        label: marker.label,
        latitude: lat,
        longitude: lng,
      });

      setSavedMarkers(prev =>
        prev.map(m => (m.marker_id === marker.marker_id ? { ...m, latitude: lat, longitude: lng } : m))
      );
    } catch (err) {
      console.error('Error updating marker:', err.response?.data || err);
    }
  };

  const handleNewMarker = (latlng, layer) => {
    setNewMarker({
      ...latlng,
      layer
    });
    setModalOpen(true);
  };

  const confirmMarkerDeletion = (markerId, layer) => {
    userLayerGroupRef.current.addLayer(layer);
    setMarkerToDelete(markerId);
    setPendingLayer(layer);
    setDeleteModalOpen(true);
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
          onRequestDelete={confirmMarkerDeletion}
        />

        {savedMarkers.map((marker) => (
          <Marker
            key={marker.marker_id}
            position={[marker.latitude, marker.longitude]}
            draggable={true}
            eventHandlers={{
              dragend: (e) => handleMarkerDrag(e, marker)
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
          onCancel={() => {
            setDeleteModalOpen(false);
            setMarkerToDelete(null);
            if (pendingLayer) {
              userLayerGroupRef.current.removeLayer(pendingLayer);
              setPendingLayer(null);
            }
          }}
          onConfirm={async () => {
            await handleMarkerDelete(markerToDelete);
            setDeleteModalOpen(false);
            setMarkerToDelete(null);
            setPendingLayer(null);
          }}
        />
      )}
    </div>
  );
}
