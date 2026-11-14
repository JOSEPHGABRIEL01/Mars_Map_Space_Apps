import { useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet'

import L from 'leaflet'

// Corrige la ubicación de los iconos de los marcadores
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Ajusta el mapa cuando cambian las ubicaciones
function MapUpdater({ locations }) {
  const map = useMap()

  useEffect(() => {
    if (locations.length === 0) return

    if (locations.length === 1) {
      map.setView(
        [locations[0].lat, locations[0].lng],
        5
      )
      return
    }

    const bounds = L.latLngBounds(
      locations.map((location) => [
        location.lat,
        location.lng,
      ])
    )

    map.fitBounds(bounds, { padding: [40, 40] })
  }, [locations, map])

  return null
}

export default function EarthMap({
  locations = [],
  selectedLocationId,
  onSelectLocation,
}) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      scrollWheelZoom={true}
      style={{
        height: '550px',
        width: '100%',
        borderRadius: '16px',
      }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater locations={locations} />

      {locations.map((location) => (
        <Marker
          key={location.id}
          position={[location.lat, location.lng]}
          icon={defaultIcon}
          eventHandlers={{
            click: () => onSelectLocation?.(location.id),
          }}
        >
          <Popup>
            <strong>{location.name}</strong>
            <br />
            {location.country}
            <br />
            Similarity: {location.similarity}%
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}