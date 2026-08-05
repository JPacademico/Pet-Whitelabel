import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { SITE } from '@/config/site';

// Leaflet's default marker icon paths break once bundled — this is the standard fix.
const markerIconDefault = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function LazyLeafletMap() {
  return (
    <MapContainer
      center={[SITE.coords.lat, SITE.coords.lng]}
      zoom={15}
      scrollWheelZoom={false}
      className="h-80 w-full rounded-2xl sm:h-96"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[SITE.coords.lat, SITE.coords.lng]} icon={markerIconDefault}>
        <Popup>{SITE.name}</Popup>
      </Marker>
    </MapContainer>
  );
}
