// MultipleFiles/Map.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.pm/dist/leaflet.pm.css';
import L from 'leaflet';
import 'leaflet.pm';
import MarkerFormModal from '../components/Modals/MarkerFormModal';
import DeleteConfirmModal from '../components/Modals/DeleteConfirmModal';
import MarkerEditModal from '../components/Modals/MarkerEditModal';
import SelectionModal from '../components/Modals/SelectionModal';
import { apiClient } from '../api/api_urls';
import { businessIcons } from '../assets/icons/icons';
import { investibleIcon } from "../assets/icons/icons";
import DeleteWarningModal from '../components/Modals/DeleteWarningModal';

// ---------------- LockedGeoJSONLayer ----------------
function LockedGeoJSONLayer({ data, setHoveredBarangay }) {
  const map = useMap();
  const hoverState = useRef({ currentLayer: null, timeout: null });

  useEffect(() => {
    if (!data || !map) return;

    if (!map.getPane('geojsonPane')) {
      try {
        map.createPane('geojsonPane');
        map.getPane('geojsonPane').style.zIndex = 250;
      } catch (e) {
        console.warn('Could not create geojsonPane', e);
      }
    }

    const clearHighlight = () => {
      if (hoverState.current.currentLayer) {
        try {
          hoverState.current.currentLayer.setStyle({
            weight: 1,
            color: 'black',
            fillColor: 'transparent',
            fillOpacity: 0,
          });
        } catch (_) { }
        hoverState.current.currentLayer = null;
        setHoveredBarangay(null);
      }
    };

    let geoLayer;
    try {
      geoLayer = L.geoJSON(data, {
        pane: 'geojsonPane',
        pmIgnore: true,
        style: {
          color: 'black',
          weight: 1,
          fillColor: 'transparent',
          fillOpacity: 0,
        },
        onEachFeature: (feature, layer) => {
          const name = feature.properties?.name || 'Barangay';
          layer.pmIgnore = true;
          layer.options.pmIgnore = true;
          if (layer.pm) layer.pm.disable?.();
          if (layer.dragging) layer.dragging.disable?.();

          layer.on({
            mouseover: (e) => {
              clearTimeout(hoverState.current.timeout);
              const l = e.target;
              if (hoverState.current.currentLayer && hoverState.current.currentLayer !== l) {
                clearHighlight();
              }
              hoverState.current.timeout = setTimeout(() => {
                try {
                  l.setStyle({
                    weight: 2,
                    color: '#000000',
                    fillColor: '#CCCCCC',
                    fillOpacity: 0.5,
                  });
                  l.bringToFront();
                } catch (_) { }
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
    } catch (err) {
      console.error('Error creating geoJSON layer:', err);
      return;
    }

    try {
      geoLayer.addTo(map);
    } catch (err) {
      console.error('Could not add geoLayer to map (pane may be missing):', err);
    }

    return () => {
      clearTimeout(hoverState.current.timeout);
      try {
        if (map && geoLayer && map.hasLayer && map.hasLayer(geoLayer)) {
          map.removeLayer(geoLayer);
        }
      } catch (err) {
        console.warn('Error removing geoLayer (ignored):', err);
      }
    };
  }, [data, map, setHoveredBarangay]);

  return null;
}

// ---------------- DrawingTools (Markers only) ----------------
function DrawingTools({ userLayerGroupRef, onNewMarker, onRequestDelete, onDragModeChange, deleteMode }) {
  const map = useMap();

  const getFeatureGroup = () => {
    const fg = userLayerGroupRef.current;
    if (!fg) return null;
    if (fg instanceof L.FeatureGroup || fg instanceof L.LayerGroup) return fg;
    return fg._layer || fg;
  };

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
      removalMode: false,
      tooltips: false,
      cutPolygon: false,
    });

    const onCreate = (e) => {
      const layer = e.layer;

      try {
        if (!layer.options) layer.options = {};
        layer.options.pane = 'overlayPane';
      } catch (_) { }

      const fg = getFeatureGroup();
      try {
        if (fg && typeof fg.addLayer === 'function') fg.addLayer(layer);
        else map.addLayer(layer);
      } catch (_) {
        try { map.addLayer(layer); } catch (_) { }
      }

      try {
        layer.pmIgnore = false;
        if (layer.options) layer.options.pmIgnore = false;
      } catch (_) { }

      try {
        layer.on('click', () => {
          if (deleteMode && typeof onRequestDelete === 'function') {
            const markerId = layer.options?.markerId ?? null;
            onRequestDelete(markerId, layer);
          }
        });
      } catch (_) { }

      if (e.shape === 'Marker') {
        try {
          const latlng = layer.getLatLng();
          if (layer.setIcon && businessIcons.default) layer.setIcon(businessIcons.default);
          if (typeof onNewMarker === 'function') onNewMarker(latlng, layer);
        } catch (_) { }
      }
    };

    const onGlobalDragToggle = (e) => {
      if (typeof onDragModeChange === 'function') onDragModeChange(e.enabled);
    };

    map.on('pm:create', onCreate);
    map.on('pm:globaldragmodetoggled', onGlobalDragToggle);

    return () => {
      map.pm.removeControls();
      map.off('pm:create', onCreate);
      map.off('pm:globaldragmodetoggled', onGlobalDragToggle);
    };
  }, [map, userLayerGroupRef, onNewMarker, onRequestDelete, onDragModeChange, deleteMode]);

  return null;
}

// ---------------- Map Component ----------------
export default function Map() {
  const [geoData, setGeoData] = useState(null);
  const [hoveredBarangay, setHoveredBarangay] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [markerType, setMarkerType] = useState(null); // "business" | "investible"
  const [selectionOpen, setSelectionOpen] = useState(false);
  const [newMarker, setNewMarker] = useState(null);
  const [savedMarkers, setSavedMarkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null); // New state for side panel

  const userLayerGroupRef = useRef(null);

  const [deleteMode, setDeleteMode] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [markerToEdit, setMarkerToEdit] = useState(null);
  const [dragModeEnabled, setDragModeEnabled] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState('');

  // Helper: set icon by markerId (used after refresh)
  const setLayerIconByMarkerId = (markerId, icon) => {
    const fg = userLayerGroupRef.current;
    if (!fg) return;
    const layers = fg.getLayers ? fg.getLayers() : fg?._layer?.getLayers?.() || [];
    layers.forEach((layer) => {
      if (layer?.options?.markerId === markerId) {
        if (layer.setIcon) layer.setIcon(icon);
      }
    });
  };

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

  useEffect(() => {
    savedMarkers.forEach((m) => {
      const industry = m.business?.industry;
      const icon = businessIcons[industry] || businessIcons.default;
      if (m.marker_id) setLayerIconByMarkerId(m.marker_id, icon);
    });
  }, [savedMarkers]);

  const removeLayerIfUnsaved = (layer) => {
    try {
      const fg = userLayerGroupRef.current;
      if (fg && typeof fg.removeLayer === 'function') fg.removeLayer(layer);
      else if (layer && typeof layer.remove === 'function') layer.remove();
    } catch (err) {
      console.warn('Could not remove layer', err);
    }
  };

  const handleNewMarker = (latlng, layer) => {
    // when a marker is drawn we first show the selection modal
    setNewMarker({ ...latlng, layer });
    setPendingDelete({ layer, markerId: null }); // temporary stash for newly-drawn marker
    setSelectedIndustry('');
    if (layer && layer.setIcon) layer.setIcon(businessIcons.default);
    setSelectionOpen(true);
  };

  const handleSelectionBusiness = () => {
    setSelectionOpen(false);
    setMarkerType('business');
    setModalOpen(true);
  };

  const handleSelectionInvestible = () => {
    setSelectionOpen(false);
    setMarkerType('investible');
    setModalOpen(true);
  };

  const handleSelectionCancel = () => {
    const layer = pendingDelete?.layer || newMarker?.layer;
    if (layer && !layer.options?.markerId) removeLayerIfUnsaved(layer);
    setSelectionOpen(false);
    setNewMarker(null);
    setPendingDelete(null);
  };

  const handleModalIndustryChange = (industryValue) => {
    setSelectedIndustry(industryValue);
    const layer = (pendingDelete && pendingDelete.layer) || (newMarker && newMarker.layer);
    if (layer && layer.setIcon) layer.setIcon(businessIcons[industryValue] || businessIcons.default);
  };

  // <-- NEW: handler for "Back" from MarkerFormModal -> re-open SelectionModal
  const handleFormBack = () => {
    // keep the drawn marker layer in place; show selection again
    setModalOpen(false);
    setSelectionOpen(true);
    setMarkerType(null);
    // leave newMarker / pendingDelete so user can pick again or cancel
  };

  const handleMarkerSubmit = async (formData) => {
    if (!newMarker || !markerType) return;

    // Set icon based on marker type
    if (newMarker.layer && newMarker.layer.setIcon) {
      if (markerType === 'business') {
        newMarker.layer.setIcon(businessIcons[formData.industry] || businessIcons.default);
      } else if (markerType === 'investible') {
        newMarker.layer.setIcon(investibleIcon);
      }
    }

    try {
      if (markerType === 'business') {
        // Business marker - existing logic
        const businessRes = await apiClient.post('businesses/', {
          bsns_name: formData.label,
          bsns_address: formData.location,
          industry: formData.industry,
        });

        const markerRes = await apiClient.post('markers/', {
          label: formData.label,
          latitude: newMarker.lat,
          longitude: newMarker.lng,
          business_id: businessRes.data.business_id,
        });

        if (newMarker.layer) newMarker.layer.options.markerId = markerRes.data.marker_id;
        setSavedMarkers((prev) => [...prev, markerRes.data]);
      }

      if (markerType === 'investible') {
        const investibleRes = await apiClient.post('investibles/', {
          invst_location: formData.location,
          invst_description: formData.preferred_business || 'Investible property',
          area: formData.area,
          preferred_business: formData.preferred_business,
          landmark: formData.landmark,
          contact_person: formData.contact_person,
          contact_number: formData.contact_number,
          status: formData.status || 'available',
        });

        const markerRes = await apiClient.post('markers/', {
          label: "Investible", // ✅ Set default label here
          latitude: newMarker.lat,
          longitude: newMarker.lng,
          investible_id: investibleRes.data.investible_id,
        });

        if (newMarker.layer) newMarker.layer.options.markerId = markerRes.data.marker_id;
        setSavedMarkers((prev) => [...prev, markerRes.data]);
      }
      setModalOpen(false);
      setNewMarker(null);
      setPendingDelete(null);
      setSelectedIndustry('');
      setMarkerType(null);
    } catch (err) {
      console.error('🛑 Marker API error:', err.response?.data || err);

      // Fallback to frontend-only if backend fails
      const tempMarker = {
        marker_id: `temp-${Date.now()}`,
        label: markerType === 'business' ? formData.label : "Investible", // ✅ Default label
        latitude: newMarker.lat,
        longitude: newMarker.lng,
        [markerType]: markerType === 'business'
          ? {
            bsns_name: formData.label,
            bsns_address: formData.location,
            industry: formData.industry,
          }
          : {
            invst_location: formData.location,
            invst_description: formData.preferred_business,
            area: formData.area,
            preferred_business: formData.preferred_business,
            landmark: formData.landmark,
            contact_person: formData.contact_person,
            contact_number: formData.contact_number,
            status: formData.status || 'available',
          }
      };

      if (newMarker.layer) newMarker.layer.options.markerId = tempMarker.marker_id;
      setSavedMarkers((prev) => [...prev, tempMarker]);
    }
  };

  /* --- rest of delete + edit handlers unchanged --- */

  const handleMarkerDelete = async (markerId) => {
    try {
      const res = await apiClient.delete(`markers/${markerId}/`);
      const fg = userLayerGroupRef.current;
      const layers = fg?.getLayers ? fg.getLayers() : fg?._layer?.getLayers?.() || [];
      layers.forEach((layer) => {
        if (layer.options?.markerId === markerId) {
          try { fg.removeLayer(layer); } catch (_) { try { layer.remove(); } catch (_) { } }
        }
      });
      setSavedMarkers((prev) => prev.filter((m) => m.marker_id !== markerId));
      return { ok: true };
    } catch (err) {
      console.error('❌ Error deleting marker:', err.response?.data || err);
      return { ok: false, error: err };
    }
  };

  const handleEditSubmit = async (formData) => {
    if (!markerToEdit) return;

    try {
      if (formData.markerType === 'business' && markerToEdit.business?.business_id) {
        // Business editing logic
        const businessId = markerToEdit.business.business_id;

        await apiClient.put(`businesses/${businessId}/`, {
          bsns_name: formData.label,
          bsns_address: formData.location,
          industry: formData.industry,
        });

        await apiClient.put(`markers/${markerToEdit.marker_id}/`, {
          label: formData.label,
          latitude: markerToEdit.latitude,
          longitude: markerToEdit.longitude,
          business_id: businessId,
        });

        setSavedMarkers((prev) =>
          prev.map((m) =>
            m.marker_id === markerToEdit.marker_id
              ? {
                ...m,
                label: formData.label,
                business: {
                  ...m.business,
                  bsns_name: formData.label,
                  bsns_address: formData.location,
                  industry: formData.industry
                },
              }
              : m
          )
        );

        setLayerIconByMarkerId(markerToEdit.marker_id, businessIcons[formData.industry] || businessIcons.default);

      } else if (formData.markerType === 'investible' && (markerToEdit.investible?.investible_id || markerToEdit.invst?.investible_id)) {
        const investibleId = markerToEdit.investible?.investible_id || markerToEdit.invst?.investible_id;

        // ✅ USE ViewSet endpoint (same as businesses)
        await apiClient.put(`investibles/${investibleId}/`, {
          invst_location: formData.location,
          invst_description: formData.preferred_business || 'Investible property',
          area: formData.area,
          preferred_business: formData.preferred_business,
          landmark: formData.landmark,
          contact_person: formData.contact_person,
          contact_number: formData.contact_number,
          status: formData.status || 'available', // Add status field
        });

        await apiClient.put(`markers/${markerToEdit.marker_id}/`, {
          label: formData.label,
          latitude: markerToEdit.latitude,
          longitude: markerToEdit.longitude,
          investible_id: investibleId,
        });

        setSavedMarkers((prev) =>
          prev.map((m) =>
            m.marker_id === markerToEdit.marker_id
              ? {
                ...m,
                label: formData.label,
                investible: {
                  ...m.investible,
                  invst_location: formData.location,
                  invst_description: formData.preferred_business,
                  area: formData.area,
                  preferred_business: formData.preferred_business,
                  landmark: formData.landmark,
                  contact_person: formData.contact_person,
                  contact_number: formData.contact_number,
                  status: formData.status || 'available', // Add status field
                },
              }
              : m
          )
        );
      }

      setEditModalOpen(false);
      setMarkerToEdit(null);
      setSelectedMarker(null); // Close side panel when editing is done
    } catch (err) {
      console.error('❌ Error updating marker:', err.response?.data || err);
    }
  };

  const handleMarkerDrag = async (e, marker) => {
    const layer = e.target;
    const { lat, lng } = layer.getLatLng();
    try {
      await apiClient.put(`markers/${marker.marker_id}/`, {
        label: marker.label,
        latitude: lat,
        longitude: lng,
        business_id: marker.business?.business_id,
      });

      setSavedMarkers((prev) =>
        prev.map((m) => (m.marker_id === marker.marker_id ? { ...m, latitude: lat, longitude: lng } : m))
      );
    } catch (err) {
      console.error('❌ Error updating marker position:', err.response?.data || err);
    }
  };

  const handleRequestDelete = (markerId, layer) => {
    setPendingDelete({ markerId, layer });
    setDeleteModalOpen(true);
  };

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  const handleEditClick = (marker) => {
    setEditModalOpen(true);
    setMarkerToEdit(marker);
    setSelectedMarker(null); // Close side panel when opening edit modal
  };

  return (
    <div className="relative w-full h-full bg-[#EDF1FA] flex">
      {/* delete mode toggle */}
      <div className="absolute top-3 right-3 z-[1200]">
        <button
          className={`px-3 py-1 rounded shadow ${deleteMode ? 'bg-red-600 text-white' : 'bg-white'}`}
          onClick={() => {
            setDeleteMode((d) => {
              const next = !d;
              if (next) setWarningOpen(true);
              return next;
            });
          }}
        >
          {deleteMode ? 'Marker Delete Mode: ON' : 'Marker Delete Mode: OFF'}
        </button>
      </div>

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

      <MapContainer
        center={[16.6145, 120.3158]}
        zoom={13}
        scrollWheelZoom
        className="w-full h-full z-10"
      >
        <TileLayer attribution='&copy; <a href="https://carto.com/">CARTO</a>' url="https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

        <FeatureGroup ref={userLayerGroupRef}></FeatureGroup>
        {geoData && <LockedGeoJSONLayer data={geoData} setHoveredBarangay={setHoveredBarangay} />}

        <DrawingTools
          userLayerGroupRef={userLayerGroupRef}
          onNewMarker={handleNewMarker}
          onRequestDelete={handleRequestDelete}
          onDragModeChange={setDragModeEnabled}
          deleteMode={deleteMode}
        />

        {savedMarkers.map((marker) => {
          // Determine if it's an investible marker
          const isInvestible = !!marker.investible || !!marker.invst;
          const icon = isInvestible
            ? investibleIcon
            : businessIcons[marker.business?.industry] || businessIcons.default;

          return (
            <Marker
              key={marker.marker_id}
              position={[marker.latitude, marker.longitude]}
              draggable={dragModeEnabled}
              icon={icon}
              eventHandlers={{
                click: (e) => {
                  if (deleteMode) {
                    e.originalEvent?.stopPropagation?.();
                    const layer = e.target;
                    handleRequestDelete(marker.marker_id, layer);
                  } else {
                    handleMarkerClick(marker);
                  }
                },
                dragend: (e) => handleMarkerDrag(e, marker),
              }}
              ref={(ref) => {
                if (ref) ref.options.markerId = marker.marker_id;
              }}
            />
          );
        })}
      </MapContainer>

      {/* Side Panel */}
      {selectedMarker && (
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white shadow-lg z-[9999] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{selectedMarker.label}</h2>
              <button
                onClick={() => setSelectedMarker(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="text-sm space-y-3">
              {selectedMarker.investible || selectedMarker.invst ? (
                <>
                  <div><strong>Location:</strong> {(selectedMarker.investible || selectedMarker.invst)?.invst_location}</div>
                  <div><strong>Status:</strong> {(selectedMarker.investible || selectedMarker.invst)?.status}</div>
                  <div><strong>Area:</strong> {(selectedMarker.investible || selectedMarker.invst)?.area}</div>
                  <div><strong>Preferred Business:</strong> {(selectedMarker.investible || selectedMarker.invst)?.preferred_business}</div>
                  <div><strong>Landmark:</strong> {(selectedMarker.investible || selectedMarker.invst)?.landmark}</div>
                  <div><strong>Contact Person:</strong> {(selectedMarker.investible || selectedMarker.invst)?.contact_person}</div>
                  <div><strong>Contact Number:</strong> {(selectedMarker.investible || selectedMarker.invst)?.contact_number}</div>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm mt-4"
                    onClick={() => handleEditClick(selectedMarker)}
                  >
                    Edit
                  </button>
                </>
              ) : (
                <>
                  <div><strong>Address:</strong> {selectedMarker.business?.bsns_address}</div>
                  <div><strong>Business Line:</strong> {selectedMarker.business?.industry}</div>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm mt-4"
                    onClick={() => handleEditClick(selectedMarker)}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selection modal */}
      {selectionOpen && (
        <SelectionModal
          isOpen={selectionOpen}
          onCancel={handleSelectionCancel}
          onBusinessSelect={handleSelectionBusiness}
          onInvestibleSelect={handleSelectionInvestible}
        />
      )}

      {/* Marker modal - PASS onBack so MarkerFormModal's Back works */}
      {modalOpen && (
        <MarkerFormModal
          isOpen={modalOpen}
          markerType={markerType}
          onBack={handleFormBack}
          onClose={() => {
            const layer = pendingDelete?.layer || newMarker?.layer;
            if (layer && !layer.options?.markerId) {
              const fg = userLayerGroupRef.current;
              if (fg && typeof fg.removeLayer === 'function') fg.removeLayer(layer);
              else layer.remove();
            }
            setModalOpen(false);
            setNewMarker(null);
            setPendingDelete(null);
            setSelectedIndustry('');
            setMarkerType(null);
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
            setPendingDelete(null);
          }}
          onConfirm={async () => {
            const pd = pendingDelete;
            if (!pd) {
              setDeleteModalOpen(false);
              return;
            }
            const { markerId, layer } = pd;
            if (markerId) {
              const result = await handleMarkerDelete(markerId);
              if (!result.ok) console.warn('Delete failed, keeping layer on map', result.error);
            } else if (layer) {
              try {
                const fg = userLayerGroupRef.current;
                if (fg && typeof fg.removeLayer === 'function') fg.removeLayer(layer);
                else layer.remove();
              } catch (err) {
                console.warn('Could not remove unsaved layer', err);
              }
            }
            setDeleteModalOpen(false);
            setPendingDelete(null);
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
          markerToEdit={markerToEdit}
          onIndustryChange={(industry) => {
            if (markerToEdit.business) {
              setLayerIconByMarkerId(markerToEdit.marker_id, businessIcons[industry] || businessIcons.default);
            }
          }}
        />
      )}

      {warningOpen && (
        <DeleteWarningModal
          isOpen={warningOpen}
          onCancel={() => {
            setWarningOpen(false);
            setDeleteMode(false);
          }}
          onConfirm={() => {
            setWarningOpen(false);
            setDeleteMode(true);
          }}
        />
      )}
    </div>
  );
}