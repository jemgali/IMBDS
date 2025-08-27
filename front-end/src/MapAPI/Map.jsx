// MultipleFiles/Map.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.pm/dist/leaflet.pm.css';
import L from 'leaflet';
import 'leaflet.pm';
import MarkerFormModal from '../components/Modals/MarkerFormModal';
import DeleteConfirmModal from '../components/Modals/DeleteModal';
import MarkerEditModal from '../components/Modals/MarkerEditModal';
import { apiClient } from '../api/api_urls'; // your apiClient
import { businessIcons } from '../assets/icons/icons'; // ✅ Font Awesome icons.js

// ---------------- LockedGeoJSONLayer ----------------
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

// ---------------- DrawingTools ----------------
function DrawingTools({ userLayerGroupRef, onNewMarker, onRequestDelete, onDragModeChange }) {
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

    map.on('pm:create', (e) => {
      if (e.shape !== 'Marker') return;

      const layer = e.layer;
      const latlng = layer.getLatLng();

      userLayerGroupRef.current.addLayer(layer);
      layer.pmIgnore = false;

      // ✅ Use Font Awesome default icon immediately
      if (layer.setIcon && businessIcons.default) {
        layer.setIcon(businessIcons.default);
      }

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

    map.on('pm:globaldragmodetoggled', (e) => {
      if (typeof onDragModeChange === 'function') {
        onDragModeChange(e.enabled);
      }
    });

    return () => {
      map.pm.removeControls();
      map.off('pm:create');
      map.off('pm:remove');
      map.off('pm:globaldragmodetoggled');
    };
  }, [map, userLayerGroupRef, onNewMarker, onRequestDelete, onDragModeChange]);

  return null;
}

// ---------------- Map Component ----------------
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [markerToEdit, setMarkerToEdit] = useState(null);
  const [dragModeEnabled, setDragModeEnabled] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState('');

  // ✅ helper: update marker icon by markerId
  const setLayerIconByMarkerId = (markerId, icon) => {
    const fg = userLayerGroupRef.current;
    if (!fg) return;
    fg.eachLayer((layer) => {
      if (layer?.options?.markerId === markerId) {
        if (layer.setIcon) layer.setIcon(icon);
      }
    });
  };

  // ✅ refresh markers from backend
  const refreshMarkers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('markers/');
      setSavedMarkers(response.data);
    } catch (error) {
      console.error('Error refreshing markers:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch('/assets/san_fernando_boundary.geojson')
      .then((res) => res.json())
      .then(setGeoData)
      .catch((err) => console.error('Error loading GeoJSON:', err));

    refreshMarkers();
  }, [refreshMarkers]);

  // ✅ update marker icons when markers reload
  useEffect(() => {
    savedMarkers.forEach((m) => {
      const industry = m.business?.industry;
      const icon = businessIcons[industry] || businessIcons.default;
      if (m.marker_id) {
        setLayerIconByMarkerId(m.marker_id, icon);
      }
    });
  }, [savedMarkers]);

  // ✅ new marker drawn
  const handleNewMarker = (latlng, layer) => {
    setNewMarker({ ...latlng, layer });
    setPendingLayer(layer);
    setSelectedIndustry('');
    if (layer && layer.setIcon) {
      layer.setIcon(businessIcons.default);
    }
    setModalOpen(true);
  };

  // ✅ live preview in modal
  const handleModalIndustryChange = (industryValue) => {
    setSelectedIndustry(industryValue);
    const layer = pendingLayer || (newMarker && newMarker.layer);
    if (layer && layer.setIcon) {
      layer.setIcon(businessIcons[industryValue] || businessIcons.default);
    }
  };

  // ✅ modal submit → save to backend
  const handleMarkerSubmit = async ({ label, location, industry }) => {
    if (!newMarker) return;

    if (newMarker.layer && newMarker.layer.setIcon) {
      newMarker.layer.setIcon(businessIcons[industry] || businessIcons.default);
    }

    try {
      const businessRes = await apiClient.post('businesses/', {
        bsns_name: label,
        bsns_address: location,
        industry,
      });

      const businessId = businessRes.data.business_id;

      const markerRes = await apiClient.post('markers/', {
        label,
        latitude: newMarker.lat,
        longitude: newMarker.lng,
        business_id: businessId,
      });

      if (newMarker.layer) {
        newMarker.layer.options.markerId = markerRes.data.marker_id;
      }

      setSavedMarkers((prev) => [...prev, markerRes.data]);
      setModalOpen(false);
      setNewMarker(null);
      setPendingLayer(null);
      setSelectedIndustry('');
    } catch (err) {
      console.error('🛑 Marker API error:', err.response?.data || err);
    }
  };

  // ✅ delete marker
  const handleMarkerDelete = async (markerId) => {
    try {
      await apiClient.delete(`markers/${markerId}/`);
      setSavedMarkers((prev) => prev.filter((m) => m.marker_id !== markerId));
      userLayerGroupRef.current.eachLayer((layer) => {
        if (layer.options.markerId === markerId) {
          userLayerGroupRef.current.removeLayer(layer);
        }
      });
    } catch (err) {
      console.error('❌ Error deleting marker:', err.response?.data || err);
    }
  };

  // ✅ edit marker
  const handleEditSubmit = async ({ label, location, industry }) => {
    if (!markerToEdit?.business?.business_id) return;
    const businessId = markerToEdit.business.business_id;

    try {
      await apiClient.put(`businesses/${businessId}/`, {
        bsns_name: label,
        bsns_address: location,
        industry,
      });

      await apiClient.put(`markers/${markerToEdit.marker_id}/`, {
        label,
        latitude: markerToEdit.latitude,
        longitude: markerToEdit.longitude,
        business_id: businessId,
      });

      setSavedMarkers((prev) =>
        prev.map((m) =>
          m.marker_id === markerToEdit.marker_id
            ? {
                ...m,
                label,
                business: { ...m.business, bsns_name: label, bsns_address: location, industry },
              }
            : m
        )
      );

      setLayerIconByMarkerId(markerToEdit.marker_id, businessIcons[industry] || businessIcons.default);

      setEditModalOpen(false);
      setMarkerToEdit(null);
    } catch (err) {
      console.error('❌ Error updating marker or business:', err.response?.data || err);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#EDF1FA] flex">
      {/* Barangay hover label */}
      {hoveredBarangay && (
        <div className="absolute top-3 left-15 z-[1000] bg-white shadow-md rounded p-3 max-w-xs">
          <div className="text-sm font-semibold text-gray-700">Barangay</div>
          <div className="text-lg font-bold text-gray-900">{hoveredBarangay}</div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-white p-4 rounded shadow-lg">
          Loading markers...
        </div>
      )}

      {/* Map */}
      <MapContainer center={[16.6145, 120.3158]} zoom={13} scrollWheelZoom className="w-full h-full z-10">
        <TileLayer attribution='&copy; <a href="https://carto.com/">CARTO</a>' url="https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

        <FeatureGroup ref={userLayerGroupRef}></FeatureGroup>

        {geoData && <LockedGeoJSONLayer data={geoData} setHoveredBarangay={setHoveredBarangay} />}

        <DrawingTools
          userLayerGroupRef={userLayerGroupRef}
          onNewMarker={handleNewMarker}
          onRequestDelete={(id, layer) => {
            setMarkerToDelete(id);
            setPendingLayer(layer);
            setDeleteModalOpen(true);
          }}
          onDragModeChange={setDragModeEnabled}
        />

        {savedMarkers.map((marker) => (
          <Marker
            key={marker.marker_id}
            position={[marker.latitude, marker.longitude]}
            draggable={dragModeEnabled}
            icon={businessIcons[marker.business?.industry] || businessIcons.default} // ✅ Font Awesome
            eventHandlers={{
              dragend: (e) => handleMarkerDrag(e, marker),
            }}
            ref={(ref) => {
              if (ref) {
                ref.options.markerId = marker.marker_id;
              }
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-bold">{marker.label}</div>
                <div>{marker.business?.bsns_address}</div>
                <div className="mb-2 capitalize">{marker.business?.industry}</div>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                  onClick={() => setEditModalOpen(true) || setMarkerToEdit(marker)}
                >
                  Edit
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Modals */}
      {modalOpen && (
        <MarkerFormModal
          isOpen={modalOpen}
          onClose={() => {
            if (newMarker?.layer) userLayerGroupRef.current.removeLayer(newMarker.layer);
            setModalOpen(false);
            setNewMarker(null);
            setPendingLayer(null);
            setSelectedIndustry('');
          }}
          onSubmit={handleMarkerSubmit}
          onIndustryChange={handleModalIndustryChange}
          initialIndustry={selectedIndustry}
        />
      )}

      {deleteModalOpen && (
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onCancel={() => {
            setDeleteModalOpen(false);
            setMarkerToDelete(null);
            if (pendingLayer) userLayerGroupRef.current.removeLayer(pendingLayer);
            setPendingLayer(null);
          }}
          onConfirm={async () => {
            await handleMarkerDelete(markerToDelete);
            setDeleteModalOpen(false);
            setMarkerToDelete(null);
            setPendingLayer(null);
          }}
        />
      )}

      {editModalOpen && markerToEdit && (
        <MarkerEditModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setMarkerToEdit(null);
          }}
          onSubmit={handleEditSubmit}
          defaultValues={{
            label: markerToEdit.business?.bsns_name || '',
            location: markerToEdit.business?.bsns_address || '',
            industry: markerToEdit.business?.industry || '',
          }}
          onIndustryChange={(industry) =>
            setLayerIconByMarkerId(markerToEdit.marker_id, businessIcons[industry] || businessIcons.default)
          }
        />
      )}
    </div>
  );
}
