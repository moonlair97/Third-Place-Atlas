'use client';

import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import { useEffect, useState } from 'react';
import type { Place } from '@/lib/types';

type MapProps = {
  places?: Place[];
  center?: [number, number];
  markerPosition?: [number, number] | null;
  onPick?: (lat: number, lng: number) => void;
  className?: string;
};

function Clickable({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (event) => onPick(event.latlng.lat, event.latlng.lng),
  });
  return null;
}

export default function Map({
  places = [],
  center = [47.6062, -122.3321],
  markerPosition = null,
  onPick,
  className,
}: MapProps) {
  const [markerIcon, setMarkerIcon] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const L = await import('leaflet');
      const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        shadowSize: [41, 41],
      });

      if (mounted) setMarkerIcon(icon);

      try {
        // @ts-ignore - importing CSS only on the client; no types are available
        await import('leaflet/dist/leaflet.css');
      } catch (e) {
        // ignore CSS import failures
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom={false} className={className || 'map-shell'}>
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {onPick ? <Clickable onPick={onPick} /> : null}

      {markerIcon &&
        (markerPosition
          ? (
              <Marker key={`single`} position={markerPosition} icon={markerIcon} />
            )
          : places.map((place) => (
              <Marker key={place.id} position={[place.lat, place.lng]} icon={markerIcon}>
                <Popup>
                  <strong>{place.name}</strong>
                  <br />
                  {place.category}
                </Popup>
              </Marker>
            )))}
    </MapContainer>
  );
}
