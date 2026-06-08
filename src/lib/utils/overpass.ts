export type AmenityCategory = 
  | 'Train Station'
  | 'Airport'
  | 'Bank'
  | 'Chamber of Commerce'
  | 'Port'
  | 'University'
  | 'School'
  | 'Library'
  | 'Hospital'
  | 'Mall';

export interface NearbyAmenity {
  id: number;
  name: string;
  nameAr?: string;
  category: AmenityCategory;
  distanceKm: number;
  estimatedMinutes: number;
}

// Haversine formula to calculate distance between two lat/lng points in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Estimate driving time in minutes based on distance
function estimateDrivingTime(distanceKm: number): number {
  // Assuming average urban speed of 40 km/h and a routing factor of 1.4 (roads aren't straight lines)
  const speedKmh = 40;
  const routingFactor = 1.4;
  const effectiveDistance = distanceKm * routingFactor;
  return Math.round((effectiveDistance / speedKmh) * 60);
}

function determineCategory(tags: Record<string, string>): AmenityCategory | null {
  const name = (tags.name || '').toLowerCase();
  const nameEn = (tags['name:en'] || '').toLowerCase();
  
  if (tags.aeroway === 'aerodrome') return 'Airport';
  if (tags.railway === 'station' || tags.railway === 'halt') return 'Train Station';
  if (tags.amenity === 'hospital' || tags.amenity === 'clinic') return 'Hospital';
  if (tags.amenity === 'university' || tags.amenity === 'college') return 'University';
  if (tags.amenity === 'school') return 'School';
  if (tags.amenity === 'library') return 'Library';
  if (tags.shop === 'mall' || name.includes('mall') || nameEn.includes('mall')) return 'Mall';
  if (tags.office === 'chamber_of_commerce' || name.includes('chamber of commerce') || nameEn.includes('chamber of commerce')) return 'Chamber of Commerce';
  if (tags.industrial === 'port' || name.includes('port') || nameEn.includes('port')) return 'Port';
  if (tags.amenity === 'bank') return 'Bank';

  return null;
}

export async function getNearbyAmenities(lat: number, lng: number): Promise<NearbyAmenity[]> {
  const radius = 25000; // 25km radius (roughly 30-40 mins driving)
  
  // Overpass QL query to find specific nodes/ways/relations
  const query = `
    [out:json][timeout:25];
    (
      nwr["aeroway"="aerodrome"](around:${radius}, ${lat}, ${lng});
      nwr["railway"~"station|halt"](around:${radius}, ${lat}, ${lng});
      nwr["amenity"~"hospital|clinic"](around:${radius}, ${lat}, ${lng});
      nwr["amenity"~"university|college"](around:${radius}, ${lat}, ${lng});
      nwr["amenity"="school"](around:${radius}, ${lat}, ${lng});
      nwr["amenity"="library"](around:${radius}, ${lat}, ${lng});
      nwr["shop"="mall"](around:${radius}, ${lat}, ${lng});
      nwr["office"="chamber_of_commerce"](around:${radius}, ${lat}, ${lng});
      nwr["industrial"="port"](around:${radius}, ${lat}, ${lng});
      nwr["amenity"="bank"](around:${radius}, ${lat}, ${lng});
    );
    out center 150;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'CloudEstate-PWA/1.0 (info@cloudestate.com)',
      },
      body: 'data=' + encodeURIComponent(query),
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();
    const results: NearbyAmenity[] = [];
    const seenNames = new Set<string>();

    for (const element of data.elements) {
      if (!element.tags || !element.tags.name) continue;
      
      const elLat = element.lat || element.center?.lat;
      const elLng = element.lon || element.center?.lon;
      
      if (!elLat || !elLng) continue;

      const category = determineCategory(element.tags);
      if (!category) continue;

      const nameEn = element.tags['name:en'] || element.tags.name;
      const nameAr = element.tags['name:ar'] || element.tags.name;
      
      // Avoid exact duplicates
      const uniqueName = nameEn.toLowerCase();
      if (seenNames.has(uniqueName)) continue;
      seenNames.add(uniqueName);

      const distanceKm = calculateDistance(lat, lng, elLat, elLng);
      const estimatedMinutes = estimateDrivingTime(distanceKm);

      // Only include if it's less than or equal to 30 minutes away
      if (estimatedMinutes <= 30) {
        results.push({
          id: element.id,
          name: nameEn,
          nameAr: nameAr,
          category,
          distanceKm,
          estimatedMinutes: Math.max(1, estimatedMinutes), // Ensure at least 1 min
        });
      }
    }

    // Process and pick the closest ones for each category
    const grouped = results.reduce((acc, curr) => {
      if (!acc[curr.category]) acc[curr.category] = [];
      acc[curr.category].push(curr);
      return acc;
    }, {} as Record<AmenityCategory, NearbyAmenity[]>);

    const finalAmenities: NearbyAmenity[] = [];

    const getTop = (cat: AmenityCategory, count: number) => {
      if (grouped[cat]) {
        grouped[cat].sort((a, b) => a.estimatedMinutes - b.estimatedMinutes);
        finalAmenities.push(...grouped[cat].slice(0, count));
      }
    };

    // Requested numbers based on typical UI limits
    getTop('Train Station', 2);
    getTop('Airport', 1);
    
    // For banks, try to prioritize specific ones if requested, otherwise pick top 2
    if (grouped['Bank']) {
      grouped['Bank'].sort((a, b) => a.estimatedMinutes - b.estimatedMinutes);
      const preferred = grouped['Bank'].filter(b => b.name.toLowerCase().includes('national commercial') || b.name.toLowerCase().includes('samba') || b.name.toLowerCase().includes('snb'));
      const others = grouped['Bank'].filter(b => !preferred.includes(b));
      finalAmenities.push(...[...preferred, ...others].slice(0, 2));
    }

    getTop('Chamber of Commerce', 1);
    getTop('Port', 1);
    getTop('University', 2);
    getTop('School', 2);
    getTop('Library', 1);
    getTop('Hospital', 2);
    getTop('Mall', 2);

    // Sort the final list by estimated time
    return finalAmenities.sort((a, b) => a.estimatedMinutes - b.estimatedMinutes);

  } catch (error) {
    console.error('Failed to fetch nearby amenities:', error);
    return [];
  }
}
