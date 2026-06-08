import { useMemo } from 'react'
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api'
import { Box, Paper, Typography, CircularProgress } from '@mui/material'
import { MapPin } from 'lucide-react'

interface ProjectLocation {
  id: string
  name: string
  lat: number
  lng: number
  address?: string
}

interface ProjectMapProps {
  locations: ProjectLocation[]
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string | number
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
}

const defaultCenter = {
  lat: 30.0,
  lng: 31.7,
}

export default function ProjectMap({
  locations,
  center = defaultCenter,
  zoom = 12,
  height = 400,
}: ProjectMapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  })

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      clickableIcons: true,
      scrollwheel: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    }),
    []
  )

  if (loadError) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', height }}>
        <MapPin size={48} color="#e0e0e0" style={{ margin: '0 auto 16px' }} />
        <Typography variant="body2" color="text.secondary">
          فشل تحميل الخريطة
        </Typography>
      </Paper>
    )
  }

  if (!isLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', height, borderRadius: 2, overflow: 'hidden' }}>
      <GoogleMap
        mapContainerStyle={{ ...mapContainerStyle, height: typeof height === 'number' ? `${height}px` : height }}
        center={center}
        zoom={zoom}
        options={mapOptions}
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={{ lat: location.lat, lng: location.lng }}
            title={location.name}
          />
        ))}
      </GoogleMap>
    </Box>
  )
}

