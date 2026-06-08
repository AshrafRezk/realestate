import { Unit, Lead, Case, AuthUser, UnitFilters, ApiResponse } from '../types'
import {
  extractProjectModelFiles,
  findProjectModelFile,
  isModelAttachmentTitle,
} from '../projectMedia'
import type { ProjectModelFile } from '../types'
import { salesforceQuery, salesforceFetchUnits, salesforceFetchNewsArticles, salesforceFetchNewsArticleDetail, SalesforceUnitDTO } from '../salesforce/client'
import { DEMO_CONFIG } from '../demo-config'

const BASE_URL = import.meta.env.VITE_API_URL || ''

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
      ...options,
    })

    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      // If not JSON, return error response
      return {
        success: false,
        error: 'API endpoint not available',
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error)
    return {
      success: false,
      error: 'Network error or endpoint not available',
    }
  }
}

/**
 * Detect aspect ratio from native video metadata
 * Priority 2: If Aspect_Ratio__c is not available, detect from video element
 * @param videoUrl - URL to the video file (.mp4, .m3u8, etc.)
 * @param videoElement - Optional existing video element to use
 * @returns Promise resolving to aspect ratio (width/height) or null if detection fails
 */
export async function detectVideoAspectRatio(
  videoUrl: string,
  videoElement?: HTMLVideoElement
): Promise<number | null> {
  // Only detect for native video URLs
  const isNativeVideo = /\.(mp4|webm|ogg|m3u8|mov|avi)(\?|$)/i.test(videoUrl) ||
    videoUrl.startsWith('blob:') ||
    videoUrl.startsWith('data:video/')

  if (!isNativeVideo) {
    console.log('[Video Detection] Not a native video URL, skipping detection:', videoUrl)
    return null
  }

  return new Promise((resolve) => {
    const video = videoElement || document.createElement('video')
    let resolved = false

    const cleanup = () => {
      if (!videoElement && video.parentNode) {
        video.parentNode.removeChild(video)
      } else if (!videoElement) {
        video.src = ''
        video.load()
      }
    }

    const finish = (value: number | null) => {
      if (resolved) return
      resolved = true
      clearTimeout(timeout)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('error', handleError)
      cleanup()
      resolve(value)
    }

    const handleLoadedMetadata = () => {
      if (resolved) return

      const width = video.videoWidth
      const height = video.videoHeight

      if (width && height) {
        const aspectRatio = width / height
        console.log('[Video Detection] ✅ Detected aspect ratio:', {
          width,
          height,
          aspectRatio,
        })
        finish(aspectRatio)
      } else {
        console.warn('[Video Detection] ⚠️ Could not get video dimensions')
        finish(null)
      }
    }

    const handleError = () => {
      if (resolved) return
      console.warn('[Video Detection] ⚠️ Error loading video metadata:', videoUrl)
      finish(null)
    }

    // Set timeout to avoid hanging
    const timeout = setTimeout(() => {
      if (resolved) return
      console.warn('[Video Detection] ⚠️ Timeout detecting video aspect ratio')
      finish(null)
    }, 5000)

    video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true })
    video.addEventListener('error', handleError, { once: true })

    // Set video source
    if (!videoElement) {
      video.preload = 'metadata'
      video.muted = true
      video.playsInline = true
      video.style.position = 'absolute'
      video.style.visibility = 'hidden'
      video.style.width = '1px'
      video.style.height = '1px'
      document.body.appendChild(video)
    }

    video.src = videoUrl
    video.load()
  })
}

interface PWAContent {
  Id: string
  Name: string
  Content_URL__c: string
  Type__c: string
  Location__c: string
  Meta_keywords__c?: string
  Aspect_Ratio__c?: string
}

interface SalesforceProjectRecord {
  Id: string
  Name: string
  City__c?: string
  Province_Region__c?: string
  District__c?: string
  Hero_Image_URL__c?: string
  Logo_URL__c?: string
  Available_Units__c?: number
  Map_Centroid_Lat__c?: number
  Map_Centroid_Lng__c?: number
  Map_Geometry_JSON__c?: string
  Description__c?: string
}

interface SalesforceContentDocumentLinkRecord {
  ContentDocumentId: string
  LinkedEntityId: string
}

interface SalesforceContentVersionRecord {
  Id: string
  Title: string
  FileExtension?: string
  FileType?: string
  ContentDocumentId: string
  CreatedDate: string
}

function extractSalesforceIdFromAnchor(value?: string): string {
  if (!value) return ''
  const m = value.match(/href=["']\/([a-zA-Z0-9]{15,18})["']/i)
  return m?.[1] || ''
}

function salesforceFileProxyUrl(versionId: string): string {
  return `/.netlify/functions/salesforce-file?versionId=${encodeURIComponent(versionId)}`
}

function isRasterImageExtension(ext?: string): boolean {
  const e = (ext || '').toLowerCase()
  return e === 'png' || e === 'jpg' || e === 'jpeg' || e === 'webp' || e === 'gif'
}

async function getPrimaryUnitImagesFromFiles(
  unitIds: string[]
): Promise<Map<string, { unitImage: string; images: string[] }>> {
  const result = new Map<string, { unitImage: string; images: string[] }>()
  const ids = unitIds.filter(Boolean)
  if (ids.length === 0) return result

  const idsSoql = ids.map((id) => `'${id.replace(/'/g, "\\'")}'`).join(',')
  const linksQuery = `SELECT ContentDocumentId, LinkedEntityId
                      FROM ContentDocumentLink
                      WHERE LinkedEntityId IN (${idsSoql})`
  const linksResult = await salesforceQuery<SalesforceContentDocumentLinkRecord>(linksQuery)
  const links = linksResult.records || []
  const contentDocumentIds = Array.from(new Set(links.map((l) => l.ContentDocumentId).filter(Boolean)))
  if (contentDocumentIds.length === 0) return result

  const docIdsSoql = contentDocumentIds.map((id) => `'${id}'`).join(',')
  const versionsQuery = `SELECT Id, Title, FileExtension, ContentDocumentId, CreatedDate
                         FROM ContentVersion
                         WHERE IsLatest = true
                         AND ContentDocumentId IN (${docIdsSoql})
                         ORDER BY CreatedDate DESC`
  const versionsResult = await salesforceQuery<SalesforceContentVersionRecord>(versionsQuery)
  const versions = versionsResult.records || []

  const docToUnit = new Map<string, string>()
  for (const link of links) {
    docToUnit.set(link.ContentDocumentId, link.LinkedEntityId)
  }

  const preferred = new Map<string, { unitImage: string; images: string[] }>()
  const fallback = new Map<string, { unitImage: string; images: string[] }>()

  for (const v of versions) {
    if (!isRasterImageExtension(v.FileExtension)) continue
    const unitId = docToUnit.get(v.ContentDocumentId)
    if (!unitId) continue
    const title = (v.Title || '').toLowerCase()
    const isUnitPreview = title.startsWith('unit-preview-') || title.startsWith('home-')
    const url = salesforceFileProxyUrl(v.Id)
    const entry = { unitImage: url, images: [url] }
    if (isUnitPreview) {
      if (!preferred.has(unitId)) preferred.set(unitId, entry)
    } else if (!fallback.has(unitId)) {
      fallback.set(unitId, entry)
    }
  }

  for (const unitId of new Set(docToUnit.values())) {
    const pick = preferred.get(unitId) || fallback.get(unitId)
    if (pick) result.set(unitId, pick)
  }

  return result
}

async function getProjectNotesAndAttachments(projectId: string) {
  // Files & enhanced notes are both exposed via ContentDocumentLink/ContentVersion.
  const linksQuery = `SELECT ContentDocumentId
                      FROM ContentDocumentLink
                      WHERE LinkedEntityId = '${projectId}'`
  const linksResult = await salesforceQuery<SalesforceContentDocumentLinkRecord>(linksQuery)
  const documentIds = (linksResult.records || []).map((r) => r.ContentDocumentId).filter(Boolean)

  if (documentIds.length === 0) {
    return { notes: [], attachments: [] }
  }

  const idsSoql = documentIds.map((id) => `'${id}'`).join(',')
  const versionsQuery = `SELECT Id, Title, FileExtension, FileType, ContentDocumentId, CreatedDate
                         FROM ContentVersion
                         WHERE IsLatest = true
                         AND ContentDocumentId IN (${idsSoql})
                         ORDER BY CreatedDate DESC`
  const versionsResult = await salesforceQuery<SalesforceContentVersionRecord>(versionsQuery)
  const versions = versionsResult.records || []

  const isNote = (v: SalesforceContentVersionRecord) => {
    const ext = (v.FileExtension || '').toLowerCase()
    const type = (v.FileType || '').toUpperCase()
    return ext === 'snote' || type === 'SNOTE'
  }

  const toUrl = (versionId: string) => `/.netlify/functions/salesforce-file?versionId=${encodeURIComponent(versionId)}`

  const notes = versions
    .filter(isNote)
    .map((v) => ({
      id: v.Id,
      title: v.Title,
      url: toUrl(v.Id),
    }))

  const attachments = versions
    .filter((v) => !isNote(v))
    .map((v) => ({
      id: v.Id,
      title: v.Title,
      fileExtension: v.FileExtension,
      fileType: v.FileType,
      url: toUrl(v.Id),
    }))

  return { notes, attachments }
}

async function getProjectsMedia(projectIds: string[]) {
  if (projectIds.length === 0) return new Map<string, { heroUrl?: string; logoUrl?: string; defaultUrl?: string; videoUrl?: string }>()

  const idsSoql = projectIds.map((id) => `'${id}'`).join(',')
  const linksQuery = `SELECT ContentDocumentId, LinkedEntityId
                      FROM ContentDocumentLink
                      WHERE LinkedEntityId IN (${idsSoql})`
  const linksResult = await salesforceQuery<SalesforceContentDocumentLinkRecord>(linksQuery)
  const links = linksResult.records || []

  const contentDocumentIds = Array.from(new Set(links.map((l) => l.ContentDocumentId).filter(Boolean)))
  if (contentDocumentIds.length === 0) return new Map<string, { heroUrl?: string; logoUrl?: string; defaultUrl?: string; videoUrl?: string }>()

  const docIdsSoql = contentDocumentIds.map((id) => `'${id}'`).join(',')
  const versionsQuery = `SELECT Id, Title, FileExtension, FileType, ContentDocumentId, CreatedDate
                         FROM ContentVersion
                         WHERE IsLatest = true
                         AND ContentDocumentId IN (${docIdsSoql})
                         ORDER BY CreatedDate DESC`
  const versionsResult = await salesforceQuery<SalesforceContentVersionRecord>(versionsQuery)
  const versions = versionsResult.records || []

  const versionByDocId = new Map<string, SalesforceContentVersionRecord>()
  for (const v of versions) {
    // Query is ORDER BY CreatedDate DESC, so first we see is newest
    if (!versionByDocId.has(v.ContentDocumentId)) versionByDocId.set(v.ContentDocumentId, v)
  }

  const isMedia = (ext?: string) => {
    const e = (ext || '').toLowerCase()
    return e === 'png' || e === 'jpg' || e === 'jpeg' || e === 'webp' || e === 'mp4' || e === 'webm' || e === 'mov'
  }

  const mediaByProjectId = new Map<string, { 
    heroUrl?: string; 
    logoUrl?: string; 
    defaultUrl?: string; 
    videoUrl?: string; 
    topPlanUrl?: string;
    brochureUrl?: string;
    gallery?: Array<{ url: string; tagEn: string; tagAr: string; }>;
  }>()
  for (const link of links) {
    const v = versionByDocId.get(link.ContentDocumentId)
    if (!v) continue
    if (!isMedia(v.FileExtension)) continue

    const projectId = link.LinkedEntityId;
    if (!mediaByProjectId.has(projectId)) {
      mediaByProjectId.set(projectId, { gallery: [] })
    }
    const media = mediaByProjectId.get(projectId)!;

    const title = (v.Title || '').toLowerCase()
    const url = `/.netlify/functions/salesforce-file?versionId=${encodeURIComponent(v.Id)}`

    if (title.includes('project-logo') || title.includes('project logo')) {
      if (!media.logoUrl) media.logoUrl = url;
    } else if (title.includes('project-hero') || title.includes('project hero')) {
      if (!media.heroUrl) media.heroUrl = url;
    } else if (title.includes('project-video-advert') || title.includes('video advert')) {
      if (!media.videoUrl) media.videoUrl = url;
    } else if (title.includes('project-top-plan') || title.includes('project top plan')) {
      if (!media.topPlanUrl) media.topPlanUrl = url;
    } else if (title.includes('project-brochure') || title.includes('project brochure')) {
      if (!media.brochureUrl) media.brochureUrl = url;
    } else if (title.includes('project-gallery') || title.includes('project gallery')) {
      let tagEn = 'Inspiring Interiors';
      let tagAr = 'مساحات داخلية تلهمك';
      
      if (title.includes('exterior')) {
        tagEn = 'Amazing Exteriors';
        tagAr = 'واجهات تأسر الأبصار';
      } else if (title.includes('kitchen')) {
        tagEn = 'A Kitchen that Feels Like Home';
        tagAr = 'مطبخ ينبض بالدفء والسكينة';
      } else if (title.includes('reception')) {
        tagEn = 'Welcoming Elegance';
        tagAr = 'فخامة الاستقبال وحفاوة اللقاء';
      } else if (title.includes('bedroom')) {
        tagEn = 'Serene Sanctuaries';
        tagAr = 'ملاذ السكينة والهدوء';
      }
      
      media.gallery!.push({ url, tagEn, tagAr });
    } else if (!isModelAttachmentTitle(v.Title || '')) {
      if (!media.defaultUrl) media.defaultUrl = url;
    }
  }

  const imageVersionsByProject = new Map<string, SalesforceContentVersionRecord[]>()
  for (const link of links) {
    const v = versionByDocId.get(link.ContentDocumentId)
    if (!v || !isRasterImageExtension(v.FileExtension)) continue
    const projectId = link.LinkedEntityId
    if (!imageVersionsByProject.has(projectId)) {
      imageVersionsByProject.set(projectId, [])
    }
    imageVersionsByProject.get(projectId)!.push(v)
  }
  for (const [projectId, vers] of imageVersionsByProject) {
    const media = mediaByProjectId.get(projectId) || { gallery: [] }
    if (media.heroUrl) {
      if (!mediaByProjectId.has(projectId)) mediaByProjectId.set(projectId, media)
      continue
    }
    vers.sort((a, b) => (b.CreatedDate || '').localeCompare(a.CreatedDate || ''))
    media.heroUrl = salesforceFileProxyUrl(vers[0].Id)
    mediaByProjectId.set(projectId, media)
  }

  return mediaByProjectId
}

function pickMediaFromAttachments(attachments: Array<{ title: string; fileExtension?: string; url: string }>) {
  const isMedia = (ext?: string) => {
    const e = (ext || '').toLowerCase()
    return e === 'png' || e === 'jpg' || e === 'jpeg' || e === 'webp' || e === 'mp4' || e === 'webm' || e === 'mov' || e === 'pdf'
  }
  
  const media: { 
    heroUrl?: string; 
    logoUrl?: string; 
    defaultUrl?: string; 
    videoUrl?: string; 
    topPlanUrl?: string; 
    brochureUrl?: string;
    gallery: Array<{ url: string; tagEn: string; tagAr: string; }>;
  } = { gallery: [] }
  
  for (const a of attachments) {
    if (isMedia(a.fileExtension)) {
      const title = (a.title || '').toLowerCase()
      if (isModelAttachmentTitle(a.title)) {
        continue
      }
      if (title.includes('project-logo') || title.includes('project logo')) {
        if (!media.logoUrl) media.logoUrl = a.url;
      } else if (title.includes('project-hero') || title.includes('project hero')) {
        if (!media.heroUrl) media.heroUrl = a.url;
      } else if (title.includes('project-video-advert') || title.includes('video advert')) {
        if (!media.videoUrl) media.videoUrl = a.url;
      } else if (title.includes('project-top-plan') || title.includes('project top plan')) {
        if (!media.topPlanUrl) media.topPlanUrl = a.url;
      } else if (title.includes('project-brochure') || title.includes('project brochure')) {
        if (!media.brochureUrl) media.brochureUrl = a.url;
      } else if (title.includes('project-gallery') || title.includes('project gallery')) {
        let tagEn = 'Inspiring Interiors';
        let tagAr = 'مساحات داخلية تلهمك';
        
        if (title.includes('exterior')) {
          tagEn = 'Amazing Exteriors';
          tagAr = 'واجهات تأسر الأبصار';
        } else if (title.includes('kitchen')) {
          tagEn = 'A Kitchen that Feels Like Home';
          tagAr = 'مطبخ ينبض بالدفء والسكينة';
        } else if (title.includes('reception')) {
          tagEn = 'Welcoming Elegance';
          tagAr = 'فخامة الاستقبال وحفاوة اللقاء';
        } else if (title.includes('bedroom')) {
          tagEn = 'Serene Sanctuaries';
          tagAr = 'ملاذ السكينة والهدوء';
        }
        
        media.gallery.push({ url: a.url, tagEn, tagAr });
      } else {
        if (!media.defaultUrl) media.defaultUrl = a.url;
      }
    }
  }
  
  return media;
}

// Projects
export async function getProjects() {
  const CACHE_KEY = `${DEMO_CONFIG.cacheKeyPrefix}_projects_cache`
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  // Check cache
  try {
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (cached) {
      const { timestamp, data } = JSON.parse(cached)
      if (Date.now() - timestamp < CACHE_TTL) {
        console.log('[Projects] Returning cached data')
        return { success: true, data }
      }
    }
  } catch (e) {
    console.warn('[Projects] Cache parse error', e)
    sessionStorage.removeItem(CACHE_KEY)
  }

  try {
    // Try to fetch from Salesforce first
    console.log('[Projects] Fetching projects from Salesforce...')

    // 1. Fetch Projects
    const projectsQuery = `SELECT Id, Name, City__c, Province_Region__c, District__c,
                          Hero_Image_URL__c, Logo_URL__c, Available_Units__c,
                          Map_Centroid_Lat__c, Map_Centroid_Lng__c, Map_Geometry_JSON__c,
                          Description__c
                          FROM Project__c 
                          ORDER BY CreatedDate DESC`

    const projectsResult = await salesforceQuery<SalesforceProjectRecord>(projectsQuery)

    const sfProjects = projectsResult.records || []

    if (sfProjects.length === 0) {
      // Salesforce is the only data source; return empty list if no records.
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          data: [],
        })
      )
      return { success: true, data: [] }
    }

    const projectIds = sfProjects.map((p) => p.Id)
    const mediaByProjectId = await getProjectsMedia(projectIds)

    // Transform to application format
    const mappedProjects = sfProjects.map((p) => {
      const availableUnitsCount = Number(p.Available_Units__c || 0)
      const mapGeometryJson = (() => {
        const raw = (p.Map_Geometry_JSON__c || '').trim()
        if (!raw) return undefined
        try {
          return JSON.parse(raw)
        } catch {
          return undefined
        }
      })()

      const media = mediaByProjectId.get(p.Id) || {}

      return {
        id: p.Id,
        name: p.Name,
        nameAr: p.Name,
        provinceRegion: p.Province_Region__c?.trim() || undefined,
        city: p.City__c?.trim() || undefined,
        location: [p.District__c, p.City__c, p.Province_Region__c].filter(Boolean).join(', '),
        locationAr: [p.District__c, p.City__c, p.Province_Region__c].filter(Boolean).join(', '),
        coverImageUrl: media.heroUrl || media.defaultUrl || p.Hero_Image_URL__c || p.Logo_URL__c || '',
        featuredVideoUrl: media.videoUrl || '',
        status: 'Active',
        mapCentroidLat: typeof p.Map_Centroid_Lat__c === 'number' ? p.Map_Centroid_Lat__c : undefined,
        mapCentroidLng: typeof p.Map_Centroid_Lng__c === 'number' ? p.Map_Centroid_Lng__c : undefined,
        mapGeometryJson,
        logoUrl: media.logoUrl || p.Logo_URL__c || '',
        topPlanUrl: media.topPlanUrl,
        gallery: media.gallery || [],
        phases: [],
        // UI Helpers (kept for compatibility)
        hasAvailability: availableUnitsCount > 0,
        availablePhasesCount: availableUnitsCount,
        // Description from Salesforce
        description: p.Description__c?.trim() || undefined,
        descriptionAr: p.Description__c?.trim() || undefined,
        // Compatibility with older UI fields
        nameEn: p.Name,
        locationEn: [p.District__c, p.City__c, p.Province_Region__c].filter(Boolean).join(', '),
      }
    })

    console.log('[Projects] ✅ Loaded from Salesforce:', mappedProjects.length)

    // Cache success result
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data: mappedProjects,
      })
    )

    return {
      success: true,
      data: mappedProjects,
    }
  } catch (error) {
    console.error('[Projects] ❌ Failed to load from Salesforce:', error)
    return {
      success: false,
      error: 'Failed to load projects from Salesforce',
    }
  }
}

function parseSalesforceAggregateCount(record: Record<string, unknown> | undefined): number {
  if (!record) return 0
  for (const [key, val] of Object.entries(record)) {
    if (key === 'attributes') continue
    if (typeof val === 'number' && Number.isFinite(val)) return val
    if (typeof val === 'string' && val.trim() !== '' && !Number.isNaN(Number(val))) {
      return Number(val)
    }
  }
  return 0
}

export async function getHomePageStats() {
  const CACHE_KEY = `${DEMO_CONFIG.cacheKeyPrefix}_home_stats_cache_v2`
  const CACHE_TTL = 5 * 60 * 1000

  try {
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (cached) {
      const { timestamp, data } = JSON.parse(cached) as {
        timestamp: number
        data: { unitsCount: number; projectsCount: number }
      }
      if (Date.now() - timestamp < CACHE_TTL) {
        return { success: true, data }
      }
    }
  } catch (e) {
    console.warn('[Home Stats] Cache parse error', e)
    sessionStorage.removeItem(CACHE_KEY)
  }

  try {
    const [projectsRes, unitsFetchResult] = await Promise.all([
      getProjects(),
      salesforceFetchUnits({ page: 1, pageSize: 1 }),
    ])

    let projectsCount =
      projectsRes.success && projectsRes.data ? projectsRes.data.length : 0
    let unitsCount = 0
    if (unitsFetchResult.success && unitsFetchResult.data) {
      unitsCount =
        unitsFetchResult.data.pagination?.totalCount ??
        unitsFetchResult.data.units?.length ??
        0
    }

    // SOQL COUNT fallback when list/search APIs return empty (e.g. permissions differ per endpoint)
    if (projectsCount === 0) {
      try {
        const projectsCountResult = await salesforceQuery<Record<string, unknown>>(
          'SELECT COUNT(Id) projectCount FROM Project__c'
        )
        projectsCount = parseSalesforceAggregateCount(projectsCountResult.records?.[0])
      } catch (e) {
        console.warn('[Home Stats] Project COUNT fallback failed:', e)
      }
    }

    if (unitsCount === 0) {
      try {
        const unitsCountResult = await salesforceQuery<Record<string, unknown>>(
          'SELECT COUNT(Id) unitCount FROM Unit__c'
        )
        unitsCount = parseSalesforceAggregateCount(unitsCountResult.records?.[0])
      } catch (e) {
        console.warn('[Home Stats] Unit COUNT fallback failed:', e)
      }
    }

    const data = { unitsCount, projectsCount }

    console.log('[Home Stats] Loaded counts:', data)

    // Avoid caching stale zeros from a partial/failed load
    if (projectsRes.success || unitsFetchResult.success) {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }))
    }

    return { success: true, data }
  } catch (error) {
    console.error('[Home Stats] Failed to load counts from Salesforce:', error)
    return {
      success: false,
      error: 'Failed to load home page stats from Salesforce',
    }
  }
}

export async function getProject(id: string) {
  console.log('[Project] Fetching project from Salesforce:', id)

  try {
    const projectQuery = `SELECT Id, Name, City__c, Province_Region__c, District__c,
                          Hero_Image_URL__c, Logo_URL__c, Available_Units__c,
                          Map_Centroid_Lat__c, Map_Centroid_Lng__c, Map_Geometry_JSON__c,
                          Description__c
                          FROM Project__c 
                          WHERE Id = '${id}'
                          LIMIT 1`

    const projectResult = await salesforceQuery<SalesforceProjectRecord>(projectQuery)
    const p = projectResult.records?.[0]
    if (!p) {
      return { success: false, error: 'Project not found in Salesforce' }
    }

    const { notes, attachments: allAttachments } = await getProjectNotesAndAttachments(id)
    const modelFiles = extractProjectModelFiles(allAttachments)
    const attachments = allAttachments.filter((a) => !isModelAttachmentTitle(a.title))
    const media = pickMediaFromAttachments(allAttachments)
    const availableUnitsCount = Number(p.Available_Units__c || 0)
    const mapCentroidLat = typeof p.Map_Centroid_Lat__c === 'number' ? p.Map_Centroid_Lat__c : undefined
    const mapCentroidLng = typeof p.Map_Centroid_Lng__c === 'number' ? p.Map_Centroid_Lng__c : undefined
    const mapGeometryJson = (() => {
      const raw = (p.Map_Geometry_JSON__c || '').trim()
      if (!raw) return undefined
      try {
        return JSON.parse(raw)
      } catch {
        return undefined
      }
    })()

    return {
      success: true,
      data: {
        id: p.Id,
        name: p.Name,
        nameAr: p.Name,
        location: [p.District__c, p.City__c, p.Province_Region__c].filter(Boolean).join(', '),
        locationAr: [p.District__c, p.City__c, p.Province_Region__c].filter(Boolean).join(', '),
        coverImageUrl: media.heroUrl || media.defaultUrl || p.Hero_Image_URL__c || p.Logo_URL__c || '',
        featuredVideoUrl: media.videoUrl || '',
        status: 'Active',
        mapCentroidLat,
        mapCentroidLng,
        mapGeometryJson,
        logoUrl: media.logoUrl || p.Logo_URL__c || '',
        topPlanUrl: media.topPlanUrl,
        brochureUrl: media.brochureUrl,
        gallery: media.gallery,
        modelFiles,
        notes,
        attachments,
        phases: [],
        hasAvailability: availableUnitsCount > 0,
        availablePhasesCount: availableUnitsCount,
        description: p.Description__c?.trim() || undefined,
        descriptionAr: p.Description__c?.trim() || undefined,
        nameEn: p.Name,
        locationEn: [p.District__c, p.City__c, p.Province_Region__c].filter(Boolean).join(', '),
      },
    }
  } catch (error) {
    console.error('[Project] ❌ Failed to load project from Salesforce:', error)
    return {
      success: false,
      error: 'Failed to load project from Salesforce',
    }
  }
}

export async function getFeaturedVideo() {
  console.log('[Hero Video] Starting to fetch featured video via Netlify Function...')

  try {
    // Query Salesforce for PWA Content with Location = 'Homepage Hero Section' and Type = 'Video'
    // This now uses Netlify Functions, so secrets are kept server-side
    const soql = `SELECT Id, Name, Content_URL__c, Type__c, Location__c, Meta_keywords__c, Aspect_Ratio__c 
                  FROM PWA_Content__c 
                  WHERE Location__c = 'Homepage Hero Section' 
                  AND Type__c = 'Video' 
                  ORDER BY CreatedDate DESC 
                  LIMIT 1`

    console.log('[Hero Video] Querying Salesforce for hero video record via Netlify Function...')
    const result = await salesforceQuery<PWAContent>(soql)

    if (result.records && result.records.length > 0) {
      const content = result.records[0]
      console.log('[Hero Video] ✅ Found Salesforce record:', {
        id: content.Id,
        name: content.Name,
        type: content.Type__c,
        location: content.Location__c,
        contentUrl: content.Content_URL__c,
      })

      // Extract video URL - handle Instagram, YouTube, Google Drive, and direct video URLs
      let videoUrl = (content.Content_URL__c || '').trim()

      if (!videoUrl) {
        console.warn('[Hero Video] ⚠️ No video URL in Salesforce record')
        // No video URL in record, fall through to API endpoint
        throw new Error('No video URL in Salesforce record')
      }

      console.log('[Hero Video] Processing video URL:', videoUrl)

      // Parse aspect ratio from Salesforce field (Priority 1)
      let aspectRatio: number | undefined = undefined
      if (content.Aspect_Ratio__c) {
        const ratioMatch = content.Aspect_Ratio__c.match(/(\d+):(\d+)/)
        if (ratioMatch) {
          aspectRatio = parseFloat(ratioMatch[1]) / parseFloat(ratioMatch[2])
          console.log('[Hero Video] ✅ Parsed aspect ratio from Salesforce:', {
            raw: content.Aspect_Ratio__c,
            decimal: aspectRatio,
          })
        } else {
          console.warn('[Hero Video] ⚠️ Invalid aspect ratio format:', content.Aspect_Ratio__c)
        }
      }

      // Handle Instagram URLs (reels and posts)
      // Instagram uses official embed script, so we keep the original URL
      // The HeroSection component will handle the Instagram embed differently
      if (videoUrl.includes('instagram.com/reel/') || videoUrl.includes('instagram.com/p/')) {
        // Clean up the URL - remove utm_source and other query params, keep the base URL
        const cleanUrl = videoUrl.split('?')[0]
        videoUrl = cleanUrl
        console.log('[Hero Video] ✅ Prepared Instagram URL for official embed:', videoUrl)
      }
      // Handle Google Drive URLs
      else if (videoUrl.includes('drive.google.com')) {
        // Extract file ID from various Google Drive URL formats
        // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
        // Format: https://drive.google.com/file/d/FILE_ID/view
        // Format: https://drive.google.com/open?id=FILE_ID
        // Format: https://drive.google.com/uc?id=FILE_ID
        let fileId = ''

        // Primary pattern: /file/d/FILE_ID/ (works for /view, /preview, etc.)
        const fileIdMatch = videoUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
        // Fallback patterns
        const openIdMatch = videoUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/)
        const ucIdMatch = videoUrl.match(/\/uc\?id=([a-zA-Z0-9_-]+)/)

        fileId = fileIdMatch?.[1] || openIdMatch?.[1] || ucIdMatch?.[1] || ''

        if (fileId) {
          // Convert to embeddable preview URL with autoplay
          // Google Drive preview supports autoplay via URL parameter
          videoUrl = `https://drive.google.com/file/d/${fileId}/preview?autoplay=1&mute=1`
          console.log('[Hero Video] ✅ Converted Google Drive URL to embed with autoplay:', {
            originalUrl: videoUrl,
            fileId: fileId,
            embedUrl: videoUrl,
          })
        } else {
          console.warn('[Hero Video] ⚠️ Could not extract Google Drive file ID from URL:', videoUrl)
        }
      }
      // Handle YouTube URLs
      else if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        let videoId = ''

        if (videoUrl.includes('youtube.com/watch')) {
          // Format: https://www.youtube.com/watch?v=VIDEO_ID
          videoId = videoUrl.match(/[?&]v=([^&]+)/)?.[1] || ''
          console.log('[Hero Video] Extracted YouTube video ID from watch URL:', videoId)
        } else if (videoUrl.includes('youtu.be/')) {
          // Format: https://youtu.be/VIDEO_ID?si=...
          const match = videoUrl.match(/youtu\.be\/([^/?&]+)/)
          videoId = match?.[1] || ''
          console.log('[Hero Video] Extracted YouTube video ID from short URL:', videoId, 'from:', videoUrl)
        } else if (videoUrl.includes('youtube.com/embed/')) {
          // Format: https://www.youtube.com/embed/VIDEO_ID
          videoId = videoUrl.match(/embed\/([^?&]+)/)?.[1] || ''
          console.log('[Hero Video] Extracted YouTube video ID from embed URL:', videoId)
        }

        if (videoId) {
          // Build YouTube embed URL with autoplay and mute
          const params = new URLSearchParams({
            autoplay: '1',
            mute: '1',
            loop: '1',
            playlist: videoId, // Required for looping
            controls: '0',
            showinfo: '0',
            playsinline: '1',
            enablejsapi: '1',
            rel: '0',
            modestbranding: '1',
          })
          videoUrl = `https://www.youtube.com/embed/${videoId}?${params.toString()}`
          console.log('[Hero Video] ✅ Built YouTube embed URL:', videoUrl)
        } else {
          console.warn('[Hero Video] ⚠️ Could not extract YouTube video ID from URL:', videoUrl)
        }
      }

      // Try to extract thumbnail/cover image
      let coverImageUrl = ''
      if (videoUrl.includes('instagram.com')) {
        // Instagram embed doesn't provide direct thumbnail, use a default gradient
        coverImageUrl = ''
        console.log('[Hero Video] Using default gradient for Instagram cover image')
      } else if (videoUrl.includes('youtube.com/embed/')) {
        // Extract YouTube video ID for thumbnail
        const thumbVideoId = videoUrl.match(/embed\/([^?]+)/)?.[1]
        if (thumbVideoId) {
          coverImageUrl = `https://img.youtube.com/vi/${thumbVideoId}/maxresdefault.jpg`
          console.log('[Hero Video] Generated YouTube thumbnail URL:', coverImageUrl)
        }
      } else if (videoUrl.includes('drive.google.com')) {
        // Google Drive doesn't provide direct thumbnail, use a default gradient
        coverImageUrl = ''
        console.log('[Hero Video] Using default gradient for Google Drive cover image')
      }

      const videoData = {
        projectId: '',
        projectName: content.Name,
        projectNameAr: content.Name,
        videoUrl: videoUrl,
        coverImageUrl: coverImageUrl,
        aspectRatio: aspectRatio,
      }

      console.log('[Hero Video] ✅ Returning video data:', videoData)

      return {
        success: true,
        data: videoData,
      } as ApiResponse<{
        projectId: string
        projectName: string
        projectNameAr: string
        videoUrl: string
        coverImageUrl: string
        aspectRatio?: number
      }>
    } else {
      console.warn('[Hero Video] ⚠️ No records found in Salesforce query result')
    }

  } catch (error) {
    console.error('[Hero Video] ❌ ERROR fetching from Salesforce:', error)
    return {
      success: true,
      data: {
        projectId: '',
        projectName: '',
        projectNameAr: '',
        videoUrl: '',
        coverImageUrl: '',
        aspectRatio: undefined,
      },
    }
  }
}

// Units
function parseEligibleForSubsidies(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const v = value.toLowerCase().trim()
    return v === 'yes' || v === 'true' || v === 'eligible' || v === '1'
  }
  return !!value
}

function unitImagesFromSalesforceDto(sfUnit: SalesforceUnitDTO): { images: string[]; unitImage?: string } {
  if (sfUnit.contentVersionId) {
    const url = salesforceFileProxyUrl(sfUnit.contentVersionId)
    return { images: [url], unitImage: url }
  }
  if (sfUnit.unitImage?.includes('salesforce-file?versionId=')) {
    const images = sfUnit.images?.length ? sfUnit.images : [sfUnit.unitImage]
    return { images, unitImage: sfUnit.unitImage }
  }
  if (sfUnit.images?.length) {
    return { images: sfUnit.images, unitImage: sfUnit.unitImage || sfUnit.images[0] }
  }
  if (sfUnit.unitImage) {
    return { images: [sfUnit.unitImage], unitImage: sfUnit.unitImage }
  }
  return { images: [] }
}

function isHttpImageUrl(url?: string): boolean {
  if (!url?.trim()) return false
  const u = url.trim().toLowerCase()
  return u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/')
}

function mapSalesforceUnit(sfUnit: SalesforceUnitDTO & { Model__c?: string }): Unit {
  const fileImages = unitImagesFromSalesforceDto(sfUnit)
  return {
    id: sfUnit.id,
    projectId: sfUnit.project?.id || '',
    phaseId: sfUnit.phase?.id || '',
    unitNumber: sfUnit.name,
    model: sfUnit.model ?? sfUnit.Model__c,
    externalId: sfUnit.externalId,
    price: sfUnit.price,
    finalPrice: sfUnit.finalPrice,
    status: sfUnit.status as Unit['status'],
    bedrooms: sfUnit.numberOfBedrooms,
    bathrooms: sfUnit.numberOfBathrooms,
    area: sfUnit.totalArea,
    bua: sfUnit.bua,
    floor: sfUnit.floor,
    finishing: sfUnit.finishing,
    usageType: sfUnit.usageType,
    view: sfUnit.view,
    hasGarden: sfUnit.hasGarden,
    hasLand: sfUnit.hasLand,
    hasRoof: sfUnit.hasRoof,
    hasOutdoor: sfUnit.hasOutdoor,
    gardenArea: sfUnit.gardenArea,
    landArea: sfUnit.landArea,
    roofArea: sfUnit.roofArea,
    outdoorArea: sfUnit.outdoorArea,
    eligibleForSubsidies: parseEligibleForSubsidies(sfUnit.eligibleForSubsidies),
    subsidies: sfUnit.subsidies,
    images: fileImages.images,
    unitImage: fileImages.unitImage,
    projectName: sfUnit.project?.name,
    phaseName: sfUnit.phase?.name,
    buildingName: sfUnit.building?.name,
    blockName: sfUnit.block?.name,
    notes: sfUnit.notes,
  }
}

export async function searchUnits(filters?: UnitFilters) {
  console.log('[Units] Searching units from Salesforce...')

  const availableOnlyFilters: UnitFilters = {
    ...(filters || {}),
    status: 'Available',
    phaseId: undefined,
  }

  try {
    const result = await salesforceFetchUnits(availableOnlyFilters as Record<string, unknown>)

    if (result.success && result.data) {
      const rawUnits = result.data.units || []
      const mappedUnits = rawUnits.map(mapSalesforceUnit)
      console.log('[Units] ✅ Loaded from Salesforce:', mappedUnits.length)
      return {
        success: true,
        data: mappedUnits,
        pagination: result.data.pagination,
        totalCount: result.data.pagination?.totalCount ?? mappedUnits.length,
      }
    }
  } catch (error) {
    console.error('[Units] ❌ Failed to load from Salesforce:', error)
    return {
      success: false,
      error: 'Failed to load units from Salesforce',
    }
  }
  return {
    success: true,
    data: [],
    totalCount: 0,
  }
}

const UNIT_DETAIL_CORE_FIELDS = `Id, Name,
      External_ID__c, Status__c, Price__c, Final_Price__c,
      Number_of_Bedrooms__c, Number_of_Bathrooms__c, Total_Area__c, BUA__c, Floor__c,
      Finishing__c, Usage_Type__c, View__c,
      Has_Garden__c, Has_Land__c, Has_Roof__c, Has_Outdoor__c,
      Garden_Area__c, Land_Area__c, Roof_Area__c, Outdoor_Area__c,
      Eligible_for_Subsidies__c, Subsidies__c,
      Unit_Image__c, X3D_Warehouse_iframe__c,
      Project__c, Phase__c, Block__c, Building__c`

function buildUnitDetailSoql(id: string, includeModel: boolean, includeProjectViaBuilding: boolean): string {
  const fields = [UNIT_DETAIL_CORE_FIELDS]
  if (includeModel) {
    fields.push('Model__c')
  }
  if (includeProjectViaBuilding) {
    fields.push('Building__r.Block__r.Phase__r.Project__c')
  }
  return `SELECT ${fields.join(', ')} FROM Unit__c WHERE Id = '${id}' LIMIT 1`
}

function isRetriableUnitDetailQueryError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error)
  return (
    /Model__c/i.test(msg) ||
    /INVALID_FIELD/i.test(msg) ||
    /no such column/i.test(msg) ||
    /did not understand relationship/i.test(msg)
  )
}

async function queryUnitDetailRecord(id: string) {
  type SalesforceUnitRecord = {
    Id: string
    Name: string
    External_ID__c?: string
    Status__c?: string
    Price__c?: number
    Final_Price__c?: number
    Number_of_Bedrooms__c?: number
    Number_of_Bathrooms__c?: number
    Total_Area__c?: number
    BUA__c?: number
    Floor__c?: number
    Finishing__c?: string
    Usage_Type__c?: string
    View__c?: string
    Has_Garden__c?: boolean
    Has_Land__c?: boolean
    Has_Roof__c?: boolean
    Has_Outdoor__c?: boolean
    Garden_Area__c?: number
    Land_Area__c?: number
    Roof_Area__c?: number
    Outdoor_Area__c?: number
    Eligible_for_Subsidies__c?: string
    Subsidies__c?: number
    Unit_Image__c?: string
    X3D_Warehouse_iframe__c?: string
    Model__c?: string
    Project__c?: string
    Phase__c?: string
    Block__c?: string
    Building__c?: string
    Building__r?: {
      Block__r?: {
        Phase__r?: {
          Project__c?: string
        }
      }
    }
  }

  const attempts: Array<{ includeModel: boolean; includeProjectViaBuilding: boolean }> = [
    { includeModel: false, includeProjectViaBuilding: true },
    { includeModel: false, includeProjectViaBuilding: false },
    { includeModel: true, includeProjectViaBuilding: false },
  ]

  let lastError: unknown
  for (const attempt of attempts) {
    try {
      const soql = buildUnitDetailSoql(
        id,
        attempt.includeModel,
        attempt.includeProjectViaBuilding
      )
      const result = await salesforceQuery<SalesforceUnitRecord>(soql)
      if (result.records?.[0]) {
        return result.records[0]
      }
    } catch (error) {
      lastError = error
      if (!isRetriableUnitDetailQueryError(error)) {
        throw error
      }
      console.warn('[Units] Unit detail SOQL failed, trying simpler query:', error)
    }
  }

  if (lastError) {
    throw lastError
  }
  return undefined
}

export async function getUnit(id: string) {
  console.log('[Units] Fetching unit details from Salesforce:', id)

  try {
    const record = await queryUnitDetailRecord(id)
    if (!record) return { success: false, error: 'Unit not found' }

    const resolvedProjectId =
      extractSalesforceIdFromAnchor(record.Project__c) ||
      record.Project__c ||
      record.Building__r?.Block__r?.Phase__r?.Project__c ||
      ''

    /** Load project labels separately — avoids fragile Unit SOQL relationship subqueries */
    let projectNameFromSf: string | undefined
    let projectProvinceRegionFromSf: string | undefined
    let projectCityFromSf: string | undefined
    if (resolvedProjectId) {
      try {
        const esc = resolvedProjectId.replace(/'/g, "\\'")
        const projectSoql = `SELECT Id, Name, City__c, Province_Region__c FROM Project__c WHERE Id = '${esc}' LIMIT 1`
        type SfProjectLite = {
          Id: string
          Name?: string
          City__c?: string
          Province_Region__c?: string
        }
        const pr = await salesforceQuery<SfProjectLite>(projectSoql)
        const prow = pr.records?.[0]
        if (prow) {
          projectNameFromSf = prow.Name?.trim()
          projectCityFromSf = prow.City__c?.trim()
          projectProvinceRegionFromSf = prow.Province_Region__c?.trim()
        }
      } catch (e) {
        console.warn('[Units] Optional Project__c lookup failed (unit still returned):', e)
      }
    }

    const embed = record.X3D_Warehouse_iframe__c || ''
    const embedSrcMatch = embed.match(/src=["']([^"']+)["']/i)
    const embedSrc = embedSrcMatch?.[1]

    const eligible =
      (record.Eligible_for_Subsidies__c || '').toLowerCase() === 'yes' ||
      (record.Eligible_for_Subsidies__c || '').toLowerCase() === 'true' ||
      (record.Eligible_for_Subsidies__c || '').toLowerCase() === 'eligible'

    const unitFileImages = await getPrimaryUnitImagesFromFiles([id])
    const primaryFileImage = unitFileImages.get(id)

    const unit: Unit = {
      id: record.Id,
      projectId: resolvedProjectId,
      phaseId: extractSalesforceIdFromAnchor(record.Phase__c) || record.Phase__c || '',
      unitNumber: record.Name,
      model: record.Model__c?.trim() || undefined,
      externalId: record.External_ID__c,
      price: record.Price__c || 0,
      finalPrice: record.Final_Price__c || undefined,
      status: (record.Status__c as Unit['status']) || 'Available',
      bedrooms: record.Number_of_Bedrooms__c || 0,
      bathrooms: record.Number_of_Bathrooms__c || undefined,
      area: record.Total_Area__c || 0,
      bua: record.BUA__c || undefined,
      floor: record.Floor__c || undefined,
      finishing: record.Finishing__c || undefined,
      usageType: record.Usage_Type__c || undefined,
      view: record.View__c || undefined,
      hasGarden: record.Has_Garden__c || false,
      hasLand: record.Has_Land__c || false,
      hasRoof: record.Has_Roof__c || false,
      hasOutdoor: record.Has_Outdoor__c || false,
      gardenArea: record.Garden_Area__c || undefined,
      landArea: record.Land_Area__c || undefined,
      roofArea: record.Roof_Area__c || undefined,
      outdoorArea: record.Outdoor_Area__c || undefined,
      eligibleForSubsidies: eligible,
      subsidies: record.Subsidies__c ? String(record.Subsidies__c) : undefined,
      deliveryDate: undefined,
      images:
        primaryFileImage?.images ??
        (isHttpImageUrl(record.Unit_Image__c) ? [record.Unit_Image__c!] : []),
      unitImage:
        primaryFileImage?.unitImage ??
        (isHttpImageUrl(record.Unit_Image__c) ? record.Unit_Image__c : undefined),
      floorPlan: undefined,
      sketchupEmbedUrl: embedSrc || undefined,
      amenities: undefined,
      description: undefined,
      descriptionAr: undefined,
      projectName: projectNameFromSf,
      projectNameAr: projectNameFromSf,
      projectProvinceRegion: projectProvinceRegionFromSf,
      projectCity: projectCityFromSf,
      phaseName: record.Phase__c || undefined,
      phaseNameAr: undefined,
      buildingName: undefined,
      blockName: record.Block__c || undefined,
      notes: undefined,
      paymentProgress: undefined,
      paymentStatus: undefined,
    }

    let relatedUnits: Unit[] = []
    if (unit.projectId) {
      const relatedSoql = `SELECT Id, Name, Unit_Image__c, Price__c, Final_Price__c, Status__c,
        Number_of_Bedrooms__c, Number_of_Bathrooms__c, Total_Area__c, BUA__c, Floor__c
        FROM Unit__c
        WHERE Project__c = '${unit.projectId}' AND Id != '${id}'
        ORDER BY LastModifiedDate DESC
        LIMIT 4`
      const relatedResult = await salesforceQuery<{
        Id: string
        Name: string
        Unit_Image__c?: string
        Price__c?: number
        Final_Price__c?: number
        Status__c?: string
        Number_of_Bedrooms__c?: number
        Number_of_Bathrooms__c?: number
        Total_Area__c?: number
        BUA__c?: number
        Floor__c?: number
      }>(relatedSoql)

      const relatedIds = (relatedResult.records || []).map((r) => r.Id)
      const relatedFileImages = await getPrimaryUnitImagesFromFiles(relatedIds)

      relatedUnits = (relatedResult.records || [])
        .map((r) => {
          const fileImg = relatedFileImages.get(r.Id)
          return {
            id: r.Id,
            projectId: unit.projectId,
            phaseId: '',
            unitNumber: r.Name,
            externalId: undefined,
            price: r.Price__c || 0,
            finalPrice: r.Final_Price__c || undefined,
            status: (r.Status__c as Unit['status']) || 'Available',
            bedrooms: r.Number_of_Bedrooms__c || 0,
            bathrooms: r.Number_of_Bathrooms__c || undefined,
            area: r.Total_Area__c || 0,
            bua: r.BUA__c || undefined,
            floor: r.Floor__c || undefined,
            images: fileImg?.images ?? [],
            unitImage: fileImg?.unitImage,
            notes: undefined,
          }
        })
        .slice(0, 3)
    }

    let modelFile: ProjectModelFile | null = null
    if (resolvedProjectId && unit.model) {
      try {
        const { attachments: projectAttachments } = await getProjectNotesAndAttachments(resolvedProjectId)
        const projectModelFiles = extractProjectModelFiles(projectAttachments)
        modelFile = findProjectModelFile(projectModelFiles, unit.model)
      } catch (e) {
        console.warn('[Units] Optional project model file lookup failed:', e)
      }
    }

    return {
      success: true,
      data: {
        unit,
        relatedUnits,
        modelFile,
      },
    }
  } catch (error) {
    console.error('[Units] ❌ Failed to load unit from Salesforce:', error)
    return {
      success: false,
      error: 'Failed to load unit from Salesforce',
    }
  }

  return {
    success: false,
    error: 'Unit not found',
  }
}

export type CreateLeadOptions = {
  supplierPdf?: File
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Failed to read file'))
        return
      }
      const base64 = result.includes(',') ? result.split(',')[1] : result
      resolve(base64)
    }
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// Leads (Salesforce via Netlify Function)
export async function createLead(
  data: Omit<Lead, 'id' | 'createdAt' | 'source'>,
  options?: CreateLeadOptions
): Promise<ApiResponse<Lead>> {
  try {
    const payload: Record<string, unknown> = { ...data, source: 'PWA' }

    if (data.profile === 'Supplier' && options?.supplierPdf) {
      payload.supplierAttachment = {
        fileName: options.supplierPdf.name,
        contentType: options.supplierPdf.type || 'application/pdf',
        base64: await fileToBase64(options.supplierPdf),
      }
    }

    const response = await fetch('/.netlify/functions/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return { success: false, error: 'Lead submission is unavailable' }
    }

    const result = (await response.json()) as ApiResponse<Lead>
    if (!response.ok && result.success !== true) {
      return {
        success: false,
        error: result.error || 'Failed to submit registration',
      }
    }
    return result
  } catch (error) {
    console.error('[Leads] createLead error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit registration',
    }
  }
}

// Auth
export async function login(username: string, password: string) {
  // Session-based login (cookie set by Netlify Function)
  return fetcher<{ user: AuthUser }>('/.netlify/functions/auth-login', {
    method: 'POST',
    body: JSON.stringify({ email: username, password }),
  })
}

export async function getCurrentUser() {
  return fetcher<AuthUser | null>('/.netlify/functions/auth-me')
}

export async function logout() {
  return fetcher<void>('/.netlify/functions/auth-logout', { method: 'POST' })
}

// My Opportunities + Units (session-based)
export type MyOpportunity = {
  id: string
  name: string
  stageName?: string
  closeDate?: string | null
  amount?: number | null
  units: Unit[]
}

export async function getMyOpportunities() {
  return fetcher<MyOpportunity[]>('/.netlify/functions/my-opportunities')
}

// Cases (owner requests — session cookie auth via Netlify Function)
async function casesFetcher<T>(
  method: 'GET' | 'POST',
  body?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch('/.netlify/functions/cases', {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })

    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return { success: false, error: 'Requests service is unavailable' }
    }

    const result = (await response.json()) as ApiResponse<T>
    if (!response.ok && result.success !== true) {
      return {
        success: false,
        error: result.error || 'Request failed',
      }
    }
    return result
  } catch (error) {
    console.error('[Cases] request error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Request failed',
    }
  }
}

export async function getCases() {
  return casesFetcher<Case[]>('GET')
}

export async function createCase(data: {
  unitId?: string
  projectName?: string
  subject: string
  category: string
  description: string
}) {
  return casesFetcher<Case>('POST', data)
}

/**
 * Fetch Google Maps iframe URL from Salesforce PWA Content
 * Location: 'HQ Office'
 * Type: 'iframe element url'
 */
export async function getOfficeMapUrl(): Promise<{ mapUrl: string | null; metaKeywords?: string }> {
  console.log('[Office Map] Starting to fetch office map iframe URL via Netlify Function...')

  try {
    const soql = `SELECT Id, Name, Content_URL__c, Type__c, Location__c, Meta_keywords__c 
                  FROM PWA_Content__c 
                  WHERE Location__c = 'HQ Office' 
                  AND Type__c = 'iframe element url' 
                  ORDER BY CreatedDate DESC 
                  LIMIT 1`

    console.log('[Office Map] Querying Salesforce for office map record via Netlify Function...')
    const result = await salesforceQuery<PWAContent>(soql)

    if (result.records && result.records.length > 0) {
      const content = result.records[0]
      // Get URL exactly as stored, ensuring no double encoding
      let mapUrl = (content.Content_URL__c || '').trim()
      const metaKeywords = content.Meta_keywords__c || undefined

      // Ensure URL is properly formatted (no extra encoding)
      if (mapUrl) {
        // Decode if it's double-encoded, then use as-is
        try {
          const decoded = decodeURIComponent(mapUrl)
          // Only use decoded if it's different and still a valid URL
          if (decoded !== mapUrl && decoded.includes('google.com/maps/embed')) {
            mapUrl = decoded
          }
        } catch {
          // If decoding fails, use original URL - it's already correct
        }
      }

      if (mapUrl) {
        // Validate Google Maps embed URL
        const isGoogleMapsEmbed = mapUrl.includes('google.com/maps/embed')

        if (isGoogleMapsEmbed) {
          // Check if URL has a 'pb' parameter and if it appears complete
          const pbMatch = mapUrl.match(/[?&]pb=([^&]*)/)
          if (pbMatch) {
            const pbValue = pbMatch[1]
            // Google Maps pb parameters typically end with specific patterns
            // If it seems truncated (doesn't end properly), log a warning
            if (pbValue.length < 50 || !pbValue.includes('!')) {
              console.warn('[Office Map] ⚠️ Google Maps pb parameter appears truncated:', {
                pbLength: pbValue.length,
                urlLength: mapUrl.length,
              })
            }
          }

          // Ensure URL is properly encoded
          try {
            // Validate URL format
            new URL(mapUrl)
          } catch (urlError) {
            console.error('[Office Map] ❌ Invalid URL format:', urlError)
            return { mapUrl: null, metaKeywords }
          }
        }

        console.log('[Office Map] ✅ Found Salesforce record with map URL:', {
          id: content.Id,
          name: content.Name,
          location: content.Location__c,
          urlLength: mapUrl.length,
          isGoogleMapsEmbed,
          mapUrlPreview: mapUrl.substring(0, 150) + (mapUrl.length > 150 ? '...' : ''),
          metaKeywords,
        })
        return { mapUrl, metaKeywords }
      } else {
        console.warn('[Office Map] ⚠️ No map URL in Salesforce record')
        return { mapUrl: null, metaKeywords }
      }
    } else {
      console.warn('[Office Map] ⚠️ No records found in Salesforce query result')
      return { mapUrl: null }
    }
  } catch (error) {
    console.error('[Office Map] ❌ ERROR fetching from Salesforce:', error)
    return { mapUrl: null }
  }
}

export async function getNewsArticles(filters: Record<string, unknown> = {}) {
  return salesforceFetchNewsArticles(filters);
}

export async function getNewsArticle(id: string) {
  return salesforceFetchNewsArticleDetail(id);
}
