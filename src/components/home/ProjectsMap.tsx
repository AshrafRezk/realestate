import { useEffect, useState, useMemo } from 'react'
import { Box, Button, Paper, SxProps, Theme } from '@mui/material'
import { MapContainer, TileLayer, Marker, Polygon, Tooltip, useMap } from 'react-leaflet'
import L, { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { getProjects } from '../../lib/api-client'
import type { Project } from '../../lib/types'

type ProjectWithAvailability = Project & {
  hasAvailability?: boolean
  availablePhasesCount?: number
  renderLat?: number
  renderLng?: number
}

type GeoJsonPolygon = {
  type: 'Polygon'
  coordinates: number[][][]
}

type GeoJsonMultiPolygon = {
  type: 'MultiPolygon'
  coordinates: number[][][][]
}

function isPolygon(g: unknown): g is GeoJsonPolygon {
  return !!g && typeof g === 'object' && (g as unknown as Record<string, unknown>).type === 'Polygon' && Array.isArray((g as unknown as Record<string, unknown>).coordinates)
}

function isMultiPolygon(g: unknown): g is GeoJsonMultiPolygon {
  return !!g && typeof g === 'object' && (g as unknown as Record<string, unknown>).type === 'MultiPolygon' && Array.isArray((g as unknown as Record<string, unknown>).coordinates)
}

function ringToLatLngs(ring: number[][]): LatLngExpression[] {
  return ring.map(([lng, lat]) => [lat, lng])
}

function createMapPinIcon(fill: string) {
  return L.divIcon({
    className: 'project-map-pin',
    html: `
      <div style="display:flex;justify-content:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));">
        <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24C32 7.163 24.837 0 16 0z" fill="${fill}" stroke="rgba(255,255,255,0.85)" stroke-width="1.5"/>
          <circle cx="16" cy="15" r="5" fill="white" fill-opacity="0.95"/>
        </svg>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    tooltipAnchor: [0, -36],
  })
}

const availablePinIcon = createMapPinIcon('#223559') // Brand navy blue
const highlightedPinIcon = createMapPinIcon('#c9a227') // Premium gold active highlight
const soldOutPinIcon = createMapPinIcon('#6b7280')

function getProjectPinIcon(project: ProjectWithAvailability, isHighlighted: boolean) {
  if (isHighlighted) return highlightedPinIcon
  const isSoldOut = !project.hasAvailability && (project.availablePhasesCount ?? 0) === 0
  return isSoldOut ? soldOutPinIcon : availablePinIcon
}

type POIType = 'airport' | 'hospital' | 'university' | 'school'

function createPOIPinIcon(type: POIType) {
  let svgPath = ''
  let bgColor = '#1a365d'

  switch (type) {
    case 'airport':
      svgPath = '<path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" fill="white"/>'
      break
    case 'hospital':
      bgColor = '#d32f2f'
      svgPath = '<path d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM13 17H11V13H7V11H11V7H13V11H17V13H13V17Z" fill="white"/>'
      break
    case 'university':
      bgColor = '#388e3c'
      svgPath = '<path d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3ZM18.82 9L12 12.72L5.18 9L12 5.28L18.82 9Z" fill="white"/>'
      break
    case 'school':
      bgColor = '#f57c00'
      svgPath = '<path d="M12 3L2 12H5V21H19V12H22L12 3ZM12 7.7C13.27 7.7 14.3 8.73 14.3 10C14.3 11.27 13.27 12.3 12 12.3C10.73 12.3 9.7 11.27 9.7 10C9.7 8.73 10.73 7.7 12 7.7ZM16 19H8V15C8 13.68 10.66 13 12 13C13.34 13 16 15 16 19Z" fill="white"/>'
      break
  }

  return L.divIcon({
    className: 'poi-map-pin',
    html: `
      <div style="display:flex;justify-content:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="background:${bgColor};border-radius:50%;padding:4px;border:2px solid white;">
          ${svgPath}
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    tooltipAnchor: [0, -14],
  })
}

const icons = {
  airport: createPOIPinIcon('airport'),
  hospital: createPOIPinIcon('hospital'),
  university: createPOIPinIcon('university'),
  school: createPOIPinIcon('school'),
}

const EGYPT_MAP_CENTER: [number, number] = [30.0, 31.7]
const EGYPT_DEFAULT_ZOOM = 6

function getEgyptRegionCenter(rName?: string): [number, number] {
  const lower = (rName || '').toLowerCase()
  if (lower.includes('red sea') || lower.includes('البحر الأحمر')) return [27.24, 33.84]
  if (lower.includes('administrative capital') || lower.includes('العاصمة الإدارية')) return [30.028, 31.768]
  if (lower.includes('cairo') || lower.includes('القاهرة')) return [30.044, 31.235]
  if (lower.includes('giza') || lower.includes('الجيزة')) return [30.013, 31.209]
  if (lower.includes('alexandria') || lower.includes('الإسكندرية')) return [31.200, 29.918]
  return EGYPT_MAP_CENTER
}

const POIs: Array<{ id: string; lat: number; lng: number; nameAr: string; nameEn: string; type: POIType }> = [
  { id: 'cai-airport', lat: 30.1219, lng: 31.4056, nameAr: 'مطار القاهرة الدولي', nameEn: 'Cairo International Airport', type: 'airport' },
  { id: 'hrg-airport', lat: 27.1783, lng: 33.7994, nameAr: 'مطار الغردقة الدولي', nameEn: 'Hurghada International Airport', type: 'airport' },
  { id: 'nac-hospital', lat: 30.025, lng: 31.77, nameAr: 'مستشفى العاصمة الإدارية', nameEn: 'New Capital Medical Complex', type: 'hospital' },
  { id: 'cai-hospital', lat: 30.0275, lng: 31.235, nameAr: 'مستشفى النيل', nameEn: 'Nile Hospital', type: 'hospital' },
  { id: 'auc-uni', lat: 30.042, lng: 31.208, nameAr: 'الجامعة الأمريكية بالقاهرة', nameEn: 'American University in Cairo', type: 'university' },
  { id: 'cu-uni', lat: 30.027, lng: 31.21, nameAr: 'جامعة القاهرة', nameEn: 'Cairo University', type: 'university' },
  { id: 'nac-school', lat: 30.03, lng: 31.76, nameAr: 'مدارس العاصمة الإدارية', nameEn: 'New Capital International Schools', type: 'school' },
]

function MapController({
  selectedRegion,
  projects,
  resetTrigger,
  highlightedProjectId,
}: {
  selectedRegion: string | null
  projects: ProjectWithAvailability[]
  resetTrigger: number
  highlightedProjectId?: string | null
}) {
  const map = useMap()

  useEffect(() => {
    if (!projects.length) return

    // If there is a highlighted project, fly to it with slow zoom!
    if (highlightedProjectId) {
      const hp = projects.find((p) => p.id === highlightedProjectId)
      if (hp) {
        const lat = typeof hp.renderLat === 'number' ? hp.renderLat : hp.mapCentroidLat
        const lng = typeof hp.renderLng === 'number' ? hp.renderLng : hp.mapCentroidLng
        if (typeof lat === 'number' && typeof lng === 'number') {
          // Slow animation zoom speed (duration: 3.0 seconds, zoom level: 13)
          map.flyTo([lat, lng], 13, {
            duration: 3.0,
            easeLinearity: 0.25,
            noMoveStart: true,
          })
          return
        }
      }
    }

    const targetProjects = selectedRegion
      ? projects.filter((p) => p.provinceRegion?.toLowerCase() === selectedRegion.toLowerCase())
      : projects

    const pts: [number, number][] = []
    targetProjects.forEach((p) => {
      if (typeof p.renderLat === 'number' && typeof p.renderLng === 'number') {
        pts.push([p.renderLat, p.renderLng])
      } else if (typeof p.mapCentroidLat === 'number' && typeof p.mapCentroidLng === 'number') {
        pts.push([p.mapCentroidLat, p.mapCentroidLng])
      }
      if (isPolygon(p.mapGeometryJson)) {
        p.mapGeometryJson.coordinates.forEach((ring) => {
          ring.forEach(([lng, lat]) => pts.push([lat, lng]))
        })
      } else if (isMultiPolygon(p.mapGeometryJson)) {
        p.mapGeometryJson.coordinates.forEach((poly) => {
          poly.forEach((ring) => {
            ring.forEach(([lng, lat]) => pts.push([lat, lng]))
          })
        })
      }
    })

    if (pts.length > 0) {
      const bounds = L.latLngBounds(pts)
      map.flyToBounds(bounds, { padding: [60, 60], duration: 1.2 })
    } else if (!selectedRegion) {
      map.flyTo(EGYPT_MAP_CENTER, EGYPT_DEFAULT_ZOOM, { duration: 1.2 })
    }
  }, [selectedRegion, projects, resetTrigger, map, highlightedProjectId])

  return null
}

function MapResizeInvalidate() {
  const map = useMap()

  useEffect(() => {
    const run = () => map.invalidateSize()
    const t1 = window.setTimeout(run, 0)
    const t2 = window.setTimeout(run, 200)
    window.addEventListener('resize', run)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.removeEventListener('resize', run)
    }
  }, [map])

  return null
}

function ZoomTracker({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMap()
  useEffect(() => {
    const handleZoom = () => {
      onZoomChange(map.getZoom())
    }
    map.on('zoomend', handleZoom)
    // Run once initially
    onZoomChange(map.getZoom())
    return () => {
      map.off('zoomend', handleZoom)
    }
  }, [map, onZoomChange])

  return null
}

type ProjectsMapProps = {
  sx?: SxProps<Theme>
  highlightedProjectId?: string | null
  onProjectSelect?: (id: string | null) => void
  projects?: ProjectWithAvailability[]
}

export default function ProjectsMap({ sx, highlightedProjectId, onProjectSelect, projects: passedProjects }: ProjectsMapProps) {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const [fetchedProjects, setFetchedProjects] = useState<ProjectWithAvailability[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [resetTrigger, setResetTrigger] = useState(0)
  const [currentZoom, setCurrentZoom] = useState(6)

  useEffect(() => {
    if (passedProjects) return
    async function loadProjects() {
      try {
        const res = await getProjects()
        if (res.success && res.data) {
          const mappable = res.data.filter(
            (p) =>
              (typeof p.mapCentroidLat === 'number' && typeof p.mapCentroidLng === 'number') ||
              p.mapGeometryJson != null
          )
          setFetchedProjects(mappable)
        }
      } catch (err) {
        console.error('Error loading projects map data:', err)
      }
    }
    loadProjects()
  }, [passedProjects])

  const projects = passedProjects || fetchedProjects
  const isRtl = i18n.language === 'ar'

  const regions = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.provinceRegion).filter((r): r is string => !!r)))
  }, [projects])

  const projectMarkers = useMemo(() => {
    const fallbackCounts: Record<string, number> = {}

    return projects.map((project) => {
      let lat = project.mapCentroidLat
      let lng = project.mapCentroidLng

      if (typeof lat !== 'number' || typeof lng !== 'number') {
        if (isPolygon(project.mapGeometryJson) && project.mapGeometryJson.coordinates[0]?.[0]) {
          lat = project.mapGeometryJson.coordinates[0][0][1]
          lng = project.mapGeometryJson.coordinates[0][0][0]
        }
      }

      if (typeof lat !== 'number' || typeof lng !== 'number') {
        const [baseLat, baseLng] = getEgyptRegionCenter(project.provinceRegion)
        const key = `${baseLat}-${baseLng}`
        const count = fallbackCounts[key] || 0
        fallbackCounts[key] = count + 1

        const angle = count * 2.4
        const radius = 0.05 + Math.floor(count / 4) * 0.05
        lat = baseLat + (count === 0 ? 0 : Math.sin(angle) * radius)
        lng = baseLng + (count === 0 ? 0 : Math.cos(angle) * radius)
      }

      return {
        ...project,
        renderLat: lat,
        renderLng: lng,
      }
    })
  }, [projects])

  const getLocalizedRegionName = (rName: string) => {
    if (!rName) return ''

    const lines = rName.split(/[\r\n-]+/)
    if (isRtl) {
      const arabicLine = lines.find((l) => /[\u0600-\u06FF]/.test(l))
      if (arabicLine) return arabicLine.replace(/^-?\s*/, '').trim()
      return rName
    }

    const linesEn = rName.split(/[\r\n]+/)
    const englishLine = linesEn.find((l) => /[a-zA-Z]/.test(l))
    if (englishLine) return englishLine.replace(/^-?\s*/, '').trim()
    return rName
  }

  const allPolygons = useMemo(() => {
    const list: { id: string; rings: LatLngExpression[][]; isSelected: boolean; isHighlighted: boolean }[] = []
    projects.forEach((p) => {
      const isSelected = selectedRegion
        ? p.provinceRegion?.toLowerCase() === selectedRegion.toLowerCase()
        : true
      const isHighlighted = p.id === highlightedProjectId

      if (isPolygon(p.mapGeometryJson)) {
        const rings = p.mapGeometryJson.coordinates.map(ringToLatLngs)
        list.push({ id: p.id, rings, isSelected, isHighlighted })
      } else if (isMultiPolygon(p.mapGeometryJson)) {
        p.mapGeometryJson.coordinates.forEach((poly) => {
          const rings = poly.map(ringToLatLngs)
          list.push({ id: p.id, rings, isSelected, isHighlighted })
        })
      }
    })
    return list
  }, [projects, selectedRegion, highlightedProjectId])

  const displayedProjects = useMemo(() => {
    if (!selectedRegion) return projectMarkers
    return projectMarkers.filter((p) => p.provinceRegion?.toLowerCase() === selectedRegion.toLowerCase())
  }, [projectMarkers, selectedRegion])

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: { xs: 360, sm: 420, md: 560 },
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.08)',
        ...sx,
      }}
    >
      <MapContainer
        center={EGYPT_MAP_CENTER}
        zoom={EGYPT_DEFAULT_ZOOM}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
        />

        <MapResizeInvalidate />
        <ZoomTracker onZoomChange={setCurrentZoom} />
        <MapController
          selectedRegion={selectedRegion}
          projects={projectMarkers}
          resetTrigger={resetTrigger}
          highlightedProjectId={highlightedProjectId}
        />

        {allPolygons.map((item, idx) =>
          item.rings.map((ring, rIdx) => (
            <Polygon
              key={`${idx}-${rIdx}`}
              positions={ring}
              pathOptions={{
                color: item.isHighlighted ? '#c9a227' : '#e91e63',
                weight: item.isHighlighted ? 4.0 : (item.isSelected ? 2.5 : 1.5),
                dashArray: item.isHighlighted ? '0' : '5, 5',
                fillColor: item.isHighlighted ? '#c9a227' : '#1b5e20',
                fillOpacity: item.isHighlighted ? 0.5 : (item.isSelected ? 0.35 : 0.15),
              }}
            />
          ))
        )}

        {displayedProjects.map((project) => {
          const isHighlighted = highlightedProjectId === project.id
          const isSoldOut = !project.hasAvailability && (project.availablePhasesCount ?? 0) === 0
          const projectName = isRtl ? project.nameAr : project.name
          const statusLabel = isSoldOut
            ? isRtl ? 'مباع بالكامل' : 'Sold Out'
            : isRtl ? 'استكشف' : 'Explore'

          return (
            <Marker
              key={project.id}
              position={[project.renderLat, project.renderLng]}
              icon={getProjectPinIcon(project, isHighlighted)}
              eventHandlers={{
                click: () => {
                  if (highlightedProjectId === project.id) {
                    navigate(`/project/${project.id}`)
                  } else {
                    onProjectSelect?.(project.id)
                  }
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -36]} opacity={0.95}>
                <span style={{ fontWeight: 600 }}>{projectName}</span>
                <br />
                <span style={{ fontSize: 11, opacity: 0.85 }}>{statusLabel}</span>
              </Tooltip>
            </Marker>
          )
        })}

        {currentZoom >= 10 && POIs.map((poi) => (
          <Marker
            key={poi.id}
            position={[poi.lat, poi.lng]}
            icon={icons[poi.type]}
            zIndexOffset={100}
          >
            <Tooltip direction="top" offset={[0, -14]} opacity={0.95}>
              <span style={{ fontWeight: 600 }}>{isRtl ? poi.nameAr : poi.nameEn}</span>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      <Box
        sx={{
          position: 'absolute',
          bottom: 24,
          left: 24,
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          onClick={() => {
            setSelectedRegion(null)
            setResetTrigger((prev) => prev + 1)
          }}
          sx={{
            bgcolor: '#000',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'none',
            px: 2,
            py: 1,
            borderRadius: 1,
            boxShadow: 4,
            '&:hover': {
              bgcolor: '#222',
            },
          }}
        >
          {isRtl ? 'إعادة ضبط الخريطة' : 'Reset Zoom'}
        </Button>
      </Box>

      {regions.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 1,
            width: 'calc(100% - 32px)',
            maxWidth: '100%',
            bgcolor: 'rgba(20, 20, 20, 0.85)',
            backdropFilter: 'blur(12px)',
            p: 0.75,
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {regions.map((regionName) => {
            const isSelected = selectedRegion?.toLowerCase() === regionName.toLowerCase()
            return (
              <Button
                key={regionName}
                onClick={() => setSelectedRegion(regionName)}
                sx={{
                  color: isSelected ? '#223559' : '#fff',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  px: 2,
                  py: 0.75,
                  borderRadius: 1.5,
                  transition: 'all 0.2s',
                  borderBottom: isSelected ? '2px solid #223559' : '2px solid transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                {getLocalizedRegionName(regionName)}
              </Button>
            )
          })}
        </Box>
      )}
    </Paper>
  )
}
