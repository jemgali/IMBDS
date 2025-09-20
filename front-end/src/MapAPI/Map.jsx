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
import { apiClient } from '../api/api_urls';
import { businessIcons } from '../assets/icons/icons';
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
        map.getPane('geojsonPane').style.zIndex = 250; // under overlayPane
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
          // lock down PM on these layers
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

// ---------------- DrawingTools ----------------
// Responsible for PM toolbar and wiring created layers into the FeatureGroup/map.
// It no longer uses PM removal mode; deletion is handled by the parent (via onRequestDelete).
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

    // disable PM removalMode - we will handle deletes with a confirm modal
    map.pm.addControls({
      position: 'topleft',
      drawMarker: true,
      drawCircle: false,
      drawPolyline: false,
      drawPolygon: true,
      drawRectangle: false,
      drawCircleMarker: false,
      editMode: true,
      dragMode: true,
      removalMode: false, // <--- disabled
      tooltips: false,
    });

    const onCreate = (e) => {
      const layer = e.layer;

      // prefer overlayPane for user shapes so SVG renderer manages them
      try {
        if (!layer.options) layer.options = {};
        layer.options.pane = 'overlayPane';
      } catch (err) {
        // ignore if cannot set
      }

      const fg = getFeatureGroup();
      try {
        if (fg && typeof fg.addLayer === 'function') fg.addLayer(layer);
        else map.addLayer(layer);
      } catch (err) {
        try { map.addLayer(layer); } catch (_) { console.warn('Failed to add new layer to FG or map', _); }
      }

      // ensure PM will act on this layer
      try {
        layer.pmIgnore = false;
        if (layer.options) layer.options.pmIgnore = false;
      } catch (_) { }

      // add click handler to open confirm modal when deleteMode is active
      try {
        layer.on('click', (ev) => {
          if (deleteMode && typeof onRequestDelete === 'function') {
            // pass markerId if present on layer.options, otherwise null for unsaved shapes
            const markerId = layer.options?.markerId ?? null;
            onRequestDelete(markerId, layer);
          }
        });
      } catch (_) { }

      // if the drawn shape is a Marker, call onNewMarker
      if (e.shape === 'Marker') {
        try {
          const latlng = layer.getLatLng();
          if (layer.setIcon && businessIcons.default) layer.setIcon(businessIcons.default);
          if (typeof onNewMarker === 'function') onNewMarker(latlng, layer);
        } catch (_) { }
        return;
      }

      // non-marker: enable pm editing & drag
      try {
        if (layer.pm) {
          if (typeof layer.pm.enable === 'function') layer.pm.enable({ allowSelfIntersection: false });
          if (typeof layer.pm.toggleDrag === 'function') layer.pm.toggleDrag();
          else if (layer.dragging && typeof layer.dragging.enable === 'function') layer.dragging.enable();
        }
      } catch (err) {
        console.warn('Could not enable pm editing/drag on layer', err);
      }

      // avoid handles being left behind by toggling edit mode around drag
      try {
        layer.on('pm:dragstart', () => {
          try { if (layer.pm && typeof layer.pm.disable === 'function') layer.pm.disable(); } catch (_) { }
        });

        layer.on('pm:dragend', () => {
          try { if (layer.pm && typeof layer.pm.enable === 'function') layer.pm.enable({ allowSelfIntersection: false }); } catch (_) { }
        });

        layer.on('pm:editstart', () => {
          try { if (layer.pm && typeof layer.pm.toggleDrag === 'function') layer.pm.toggleDrag(false); } catch (_) { }
        });
      } catch (_) { }
    };

    const onRemove = (e) => {
      // Because we disabled PM removal mode, normal PM eraser won't trigger here.
      // We keep this handler in case other code triggers remove events.
      const layer = e.layer;
      const fg = getFeatureGroup();
      try {
        if (fg && typeof fg.removeLayer === 'function') fg.removeLayer(layer);
        else map.removeLayer(layer);
      } catch (err) {
        try { if (map && map.hasLayer && map.hasLayer(layer)) map.removeLayer(layer); } catch (_) { }
      }
    };

    const onGlobalDragToggle = (e) => {
      if (typeof onDragModeChange === 'function') onDragModeChange(e.enabled);
    };

    map.on('pm:create', onCreate);
    map.on('pm:remove', onRemove);
    map.on('pm:globaldragmodetoggled', onGlobalDragToggle);

    return () => {
      map.pm.removeControls();
      map.off('pm:create', onCreate);
      map.off('pm:remove', onRemove);
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
  const [newMarker, setNewMarker] = useState(null);
  const [savedMarkers, setSavedMarkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // react-leaflet will assign the actual FeatureGroup instance here
  const userLayerGroupRef = useRef(null);

  // deleteMode UI toggle
  const [deleteMode, setDeleteMode] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);


  // pending delete object set when user clicks a saved marker/shape while deleteMode is true
  const [pendingDelete, setPendingDelete] = useState(null); // { layer, markerId } or null
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

  const handleNewMarker = (latlng, layer) => {
    setNewMarker({ ...latlng, layer });
    setPendingDelete({ layer, markerId: null }); // temporary stash for newly-drawn marker
    setSelectedIndustry('');
    if (layer && layer.setIcon) layer.setIcon(businessIcons.default);
    setModalOpen(true);
  };

  const handleModalIndustryChange = (industryValue) => {
    setSelectedIndustry(industryValue);
    const layer = (pendingDelete && pendingDelete.layer) || (newMarker && newMarker.layer);
    if (layer && layer.setIcon) layer.setIcon(businessIcons[industryValue] || businessIcons.default);
  };

  const handleMarkerSubmit = async ({ label, location, industry }) => {
    if (!newMarker) return;

    if (newMarker.layer && newMarker.layer.setIcon) newMarker.layer.setIcon(businessIcons[industry] || businessIcons.default);

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

      if (newMarker.layer) newMarker.layer.options.markerId = markerRes.data.marker_id;

      setSavedMarkers((prev) => [...prev, markerRes.data]);
      setModalOpen(false);
      setNewMarker(null);
      setPendingDelete(null);
      setSelectedIndustry('');
    } catch (err) {
      console.error('🛑 Marker API error:', err.response?.data || err);
    }
  };

  // Delete marker from backend and remove from FeatureGroup/state
  const handleMarkerDelete = async (markerId) => {
    try {
      const res = await apiClient.delete(`markers/${markerId}/`);
      // remove any FG layers with that id
      const fg = userLayerGroupRef.current;
      const layers = fg?.getLayers ? fg.getLayers() : fg?._layer?.getLayers?.() || [];
      layers.forEach((layer) => {
        if (layer.options?.markerId === markerId) {
          try { fg.removeLayer(layer); } catch (_) { try { layer.remove(); } catch (_) { } }
        }
      });
      // update savedMarkers
      setSavedMarkers((prev) => prev.filter((m) => m.marker_id !== markerId));
      return { ok: true };
    } catch (err) {
      console.error('❌ Error deleting marker:', err.response?.data || err);
      return { ok: false, error: err };
    }
  };

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

  // Called from DrawingTools when a user clicks a created shape or marker in deleteMode
  const handleRequestDelete = (markerId, layer) => {
    // don't remove the layer — just stash it and open the confirm modal
    setPendingDelete({ markerId, layer });
    setDeleteModalOpen(true);
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
              if (next) setWarningOpen(true); // open warning when turning ON
              return next;
            });
          }}
          title={deleteMode ? 'Click a feature to delete it (confirm will appear)' : 'Toggle delete mode'}
        >
          {deleteMode ? 'Delete: ON' : 'Delete: OFF'}
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
        whenCreated={(map) => {
          try {
            if (!map.getPane('geojsonPane')) {
              map.createPane('geojsonPane');
              map.getPane('geojsonPane').style.zIndex = 250;
            }
          } catch (err) {
            console.warn('whenCreated pane setup failed', err);
          }
        }}
      >
        <TileLayer attribution='&copy; <a href="https://carto.com/">CARTO</a>' url="https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

        {/* FeatureGroup for user-drawn layers */}
        <FeatureGroup ref={userLayerGroupRef}></FeatureGroup>

        {/* locked geojson boundaries (non-editable) */}
        {geoData && <LockedGeoJSONLayer data={geoData} setHoveredBarangay={setHoveredBarangay} />}

        <DrawingTools
          userLayerGroupRef={userLayerGroupRef}
          onNewMarker={handleNewMarker}
          onRequestDelete={handleRequestDelete}
          onDragModeChange={setDragModeEnabled}
          deleteMode={deleteMode}
        />

        {savedMarkers.map((marker) => (
          <Marker
            key={marker.marker_id}
            position={[marker.latitude, marker.longitude]}
            draggable={dragModeEnabled}
            icon={businessIcons[marker.business?.industry] || businessIcons.default}
            eventHandlers={{
              click: (e) => {
                if (deleteMode) {
                  // prevent popup open when in delete mode
                  e.originalEvent?.stopPropagation?.();
                  const layer = e.target;
                  handleRequestDelete(marker.marker_id, layer);
                }
              },
              dragend: (e) => handleMarkerDrag(e, marker),
            }}
            ref={(ref) => {
              if (ref) ref.options.markerId = marker.marker_id;
            }}
          >
            {!deleteMode && (
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
            )}
          </Marker>
        ))}
      </MapContainer>

      {/* New marker modal */}
      {modalOpen && (
        <MarkerFormModal
          isOpen={modalOpen}
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
          }}
          onSubmit={handleMarkerSubmit}
          onIndustryChange={handleModalIndustryChange}
          initialIndustry={selectedIndustry}
        />
      )}

      {/* Confirm delete modal */}
      {deleteModalOpen && (
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onCancel={() => {
            // simply close modal; we never removed layer because PM removalMode is off
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
              if (!result.ok) {
                // deletion failed — keep layer and show console warning
                console.warn('Delete failed, keeping layer on map', result.error);
              }
            } else if (layer) {
              // unsaved local shape: remove from FG
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

      {/* Edit marker modal */}
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
      {warningOpen && (
        <DeleteWarningModal
          isOpen={warningOpen}
          onCancel={() => {
            setWarningOpen(false);
            setDeleteMode(false); // cancel = turn off delete mode
          }}
          onConfirm={() => {
            setWarningOpen(false);
            setDeleteMode(true); // confirm = actually enable delete mode
          }}
        />
      )}
    </div>
  );
}
