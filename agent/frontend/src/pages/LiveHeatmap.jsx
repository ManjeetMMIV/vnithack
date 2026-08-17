import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './LiveHeatmap.css';
import { MapPin } from 'lucide-react';

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mock Property Data in Nagpur
const mockProperties = [
  { id: 'PROP-001', lat: 21.1458, lng: 79.0882, status: 'VERIFIED', owner: 'Ramesh Singh' },
  { id: 'PROP-002', lat: 21.1500, lng: 79.0900, status: 'TAMPERED', owner: 'Unknown Syndicate' },
  { id: 'PROP-003', lat: 21.1400, lng: 79.0800, status: 'VERIFIED', owner: 'Anita Desai' },
  { id: 'PROP-004', lat: 21.1550, lng: 79.1000, status: 'VERIFIED', owner: 'Vikram Joshi' },
  { id: 'PROP-005', lat: 21.1350, lng: 79.0700, status: 'TAMPERED', owner: 'Shell Corp A' },
  { id: 'PROP-006', lat: 21.1600, lng: 79.0850, status: 'VERIFIED', owner: 'Sunita Sharma' },
];

export default function LiveHeatmap() {
  const nagpurCenter = [21.1458, 79.0882];

  return (
    <div className="heatmap-page fade-in">
      <header className="page-header">
        <h1>Geospatial Registry Map</h1>
        <p className="subtitle">Live mapping of registered land properties in Nagpur Municipal Corporation limits</p>
      </header>

      <div className="map-wrapper">
        <MapContainer center={nagpurCenter} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '12px' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {mockProperties.map((prop) => (
            <CircleMarker
              key={prop.id}
              center={[prop.lat, prop.lng]}
              radius={8}
              pathOptions={{
                fillColor: prop.status === 'VERIFIED' ? '#10b981' : '#ef4444',
                color: prop.status === 'VERIFIED' ? '#059669' : '#dc2626',
                weight: 2,
                fillOpacity: 0.7
              }}
            >
              <Popup className="custom-popup">
                <div className="popup-content">
                  <strong>{prop.id}</strong><br/>
                  Owner: {prop.owner}<br/>
                  <span className={`status-text ${prop.status === 'VERIFIED' ? 'text-green' : 'text-red'}`}>
                    {prop.status}
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
        
        <div className="map-legend">
          <h3><MapPin className="w-4 h-4"/> Legend</h3>
          <div className="legend-item">
            <span className="legend-dot green"></span> Authentic Properties
          </div>
          <div className="legend-item">
            <span className="legend-dot red"></span> Tampering Detected
          </div>
        </div>
      </div>
    </div>
  );
}
