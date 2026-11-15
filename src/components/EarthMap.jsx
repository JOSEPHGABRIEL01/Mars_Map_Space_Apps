import { useEffect, useRef } from 'react'
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
import styles from './EarthMap.module.css'

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

/**
 * Keep the map in sync with the result list.
 * - Fit all markers when the result set changes.
 * - Fly to the marker selected in the list and open its popup.
 */
function MapController({ locations, selectedLocationId, markerRefs }) {
  const map = useMap()

  useEffect(() => {
    if (locations.length === 0) return

    if (locations.length === 1) {
      map.setView([locations[0].lat, locations[0].lng], 4)
      return
    }

    const bounds = L.latLngBounds(
      locations.map((location) => [location.lat, location.lng]),
    )

    map.fitBounds(bounds, { padding: [40, 40] })
  }, [locations, map])

  useEffect(() => {
    if (!selectedLocationId) return

    const location = locations.find((item) => item.id === selectedLocationId)
    if (!location) return

    map.flyTo([location.lat, location.lng], Math.max(map.getZoom(), 4), {
      duration: 0.8,
    })

    const marker = markerRefs.current[selectedLocationId]
    if (marker) marker.openPopup()
  }, [selectedLocationId, locations, map, markerRefs])

  return null
}

export default function EarthMap({
  locations = [],
  selectedLocationId,
  onSelectLocation,
  status = 'idle',
}) {
  const markerRefs = useRef({})
  const isBusy = status === 'searching' || status === 'analyzing'
  const isEmpty = !isBusy && locations.length === 0

  return (
    <div className={styles.wrapper}>
      <MapContainer
        className={styles.map}
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={true}
        worldCopyJump={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          locations={locations}
          selectedLocationId={selectedLocationId}
          markerRefs={markerRefs}
        />

        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={defaultIcon}
            ref={(marker) => {
              markerRefs.current[location.id] = marker
            }}
            eventHandlers={{
              click: () => onSelectLocation?.(location.id),
            }}
          >
            <Popup>
              <strong>{location.name}</strong>
              <br />
              {location.region}, {location.country}
              <br />
              DEMO similarity: {location.similarity}%
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {isBusy && (
        <div className={styles.overlay} role="status" aria-live="polite">
          <span className={styles.spinner} aria-hidden="true" />
          <p>Loading Earth analogues…</p>
        </div>
      )}

      {isEmpty && (
        <div className={styles.overlay}>
          <p className={styles.overlayTitle}>No locations to display</p>
          <p className={styles.overlayText}>
            Select a feature and adjust the minimum compatibility to see Earth analogues here.
          </p>
        </div>
      )}
    </div>
  )
}
