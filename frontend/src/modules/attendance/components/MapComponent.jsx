import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';

const getPinStyle = (name, status, verified) => {
  let pinColor = '#EF4444'; // Outside Geofence -> Red
  if (status === 'Checked Out') pinColor = '#64748B'; // Muted Gray
  else if (verified) pinColor = '#10B981'; // Present and Inside -> Green

  return new L.DivIcon({
    html: `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="background-color: ${pinColor}; 
                    color: white; padding: 4px 8px; border-radius: 20px; 
                    font-size: 11px; font-weight: bold; white-space: nowrap;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2); border: 1px solid white;">
          ${name} ${status === 'Checked Out' ? '(OFF)' : ''}
        </div>
        <div style="width: 0; height: 0; border-left: 5px solid transparent; 
                    border-right: 5px solid transparent; border-top: 8px solid ${pinColor};"></div>
      </div>`,
    className: 'emp-marker-pin',
    iconSize: [120, 45],
    iconAnchor: [60, 43]
  });
};

const getOfficePinStyle = (name) => {
  return new L.DivIcon({
    html: `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="background-color: #3B82F6; 
                    color: white; padding: 4px 8px; border-radius: 20px; 
                    font-size: 11px; font-weight: bold; white-space: nowrap;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2); border: 1px solid white;">
          🏢 ${name}
        </div>
        <div style="width: 0; height: 0; border-left: 5px solid transparent; 
                    border-right: 5px solid transparent; border-top: 8px solid #3B82F6;"></div>
      </div>`,
    className: 'office-marker-pin',
    iconSize: [120, 45],
    iconAnchor: [60, 43]
  });
};

const InvalidateMapFix = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => { map.invalidateSize(); }, 300);
  }, [map]);
  return null;
};

const ChangeMapCenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const MapComponent = ({ locations, userLocation, officeConfig }) => {
  const officeLat = officeConfig?.lat || 28.6282;
  const officeLng = officeConfig?.lng || 77.3898;
  const allowedRadius = officeConfig?.radius || 200;
  const officeName = officeConfig?.officeName || "Headquarters Alpha";

  const centerPoint = userLocation ? [userLocation.lat, userLocation.lng] : [officeLat, officeLng];

  return (
    <div style={{ height: '100%', width: '100%', minHeight: '450px', position: 'relative' }}>
      <MapContainer center={centerPoint} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <InvalidateMapFix />
        <ChangeMapCenter center={centerPoint} />
        
        {/* Draw office geofence circle */}
        <Circle 
          center={[officeLat, officeLng]} 
          radius={allowedRadius} 
          pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.15, weight: 2 }}
        />

        {/* Office Marker */}
        <Marker position={[officeLat, officeLng]} icon={getOfficePinStyle(officeName)}>
          <Popup>
            <div style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>
              <strong>🏢 {officeName}</strong> <br />
              Radius: {allowedRadius}m <br />
              Geofence Center Node
            </div>
          </Popup>
        </Marker>

        {/* Live locations list */}
        {locations && locations.map((emp) => {
          const lat = parseFloat(emp.latitude);
          const lng = parseFloat(emp.longitude);
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker 
              key={emp.id} 
              position={[lat, lng]}
              icon={getPinStyle(emp.name || `Operator ${emp.id}`, emp.status, emp.geofence_verified)}
            >
              <Popup>
                <div style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>
                  <strong>{emp.name}</strong> <br />
                  Role: {emp.role || 'Operator'} <br />
                  Status: <b style={{ color: emp.status === 'Checked Out' ? '#64748B' : '#10B981' }}>{emp.status || 'Present'}</b> <br />
                  Zone Verified: {emp.geofence_verified ? "✓ Inside Office Area" : "❌ Outside Office Boundary"}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Single user location pin */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={getPinStyle("You", "Present", true)}
          >
            <Popup>
              <div style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>
                <strong>Current Position</strong> <br />
                Latitude: {userLocation.lat.toFixed(5)} <br />
                Longitude: {userLocation.lng.toFixed(5)}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;