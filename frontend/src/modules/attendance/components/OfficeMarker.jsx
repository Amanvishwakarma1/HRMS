import React from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

export const OfficeMarker = ({ officeConfig }) => {
  if (!officeConfig) return null;

  // Render responsive SVG node to map directly circumventing standard asset loading failures
  const officeSvg = `
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="16" fill="#1E293B" stroke="white" stroke-width="2"/>
      <path d="M12 24V14L18 10L24 14V24H19V19H17V24H12Z" fill="white"/>
    </svg>
  `;

  const officeIcon = L.divIcon({
    html: officeSvg,
    className: 'custom-office-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

  return (
    <>
      <Marker position={[officeConfig.lat, officeConfig.lng]} icon={officeIcon}>
        <Popup>
          <div className="text-xs p-1">
            <p className="font-bold text-slate-800">{officeConfig.officeName || 'Structural Anchoring Core'}</p>
            <p className="text-slate-500 mt-0.5 font-mono">Radius Bounds: {officeConfig.radius}m</p>
          </div>
        </Popup>
      </Marker>
      <Circle
        center={[officeConfig.lat, officeConfig.lng]}
        radius={officeConfig.radius}
        pathOptions={{
          color: '#059669',
          fillColor: '#10B981',
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '4, 4'
        }}
      />
    </>
  );
};