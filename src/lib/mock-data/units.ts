import type { Unit, UnitFilters } from "../types";

export const mockUnits: Unit[] = [
  // Al Nakhla Gardens - Phase 2
  {
    id: "unit-1",
    projectId: "project-1",
    phaseId: "phase-2",
    unitNumber: "A-101",
    price: 1250000,
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    status: "Available",
    deliveryDate: "2025-06-01",
    images: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
      "https://images.unsplash.com/photo-1600573472591-ee6c563afe60?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    ],
    floorPlan: "https://www.omranarch.com/m/images/projects/2008/0816-calfornia-compund/1.jpg",
    sketchupEmbedUrl: "https://3dwarehouse.sketchup.com/embed/2532d83b-9925-4731-b0e0-8bafba3d4a9f?token=L4tFhudHN9k=&binaryName=s21",
    amenities: [
      "Luxurious and spacious lobby",
      "Fitness Center with lockers",
      "Children Daycare Center",
      "Prayer Room",
      "24/7 security service",
      "Concierge Service",
      "Restaurants",
      "Swimming Pool",
      "Parking",
      "Garden View",
    ],
    projectName: "Al Nakhla Gardens",
    projectNameAr: "حدائق النخلة",
    phaseName: "Phase 2 - Al Yasmin",
    phaseNameAr: "المرحلة الثانية - الياسمين",
    description: "Spacious corner unit with garden views and premium finishes.",
    descriptionAr: "وحدة ركنية واسعة مع إطلالات على الحديقة وتشطيبات فاخرة.",
  },
  {
    id: "unit-2",
    projectId: "project-1",
    phaseId: "phase-2",
    unitNumber: "A-102",
    price: 1150000,
    bedrooms: 2,
    bathrooms: 2,
    area: 145,
    status: "Reserved",
    deliveryDate: "2025-06-01",
    images: [
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80",
    ],
    projectName: "Al Nakhla Gardens",
    projectNameAr: "حدائق النخلة",
    phaseName: "Phase 2 - Al Yasmin",
    phaseNameAr: "المرحلة الثانية - الياسمين",
  },
  {
    id: "unit-3",
    projectId: "project-1",
    phaseId: "phase-2",
    unitNumber: "B-201",
    price: 1450000,
    bedrooms: 4,
    bathrooms: 3,
    area: 220,
    status: "Available",
    deliveryDate: "2025-09-01",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
    ],
    floorPlan: "https://www.omranarch.com/m/images/projects/2008/0816-calfornia-compund/1.jpg",
    sketchupEmbedUrl: "https://3dwarehouse.sketchup.com/embed/2532d83b-9925-4731-b0e0-8bafba3d4a9f?token=L4tFhudHN9k=&binaryName=s21",
    amenities: [
      "Luxurious and spacious lobby",
      "Fitness Center with lockers",
      "Prayer Room",
      "24/7 security service",
      "Concierge Service",
      "Swimming Pool",
      "Parking",
    ],
    projectName: "Al Nakhla Gardens",
    projectNameAr: "حدائق النخلة",
    phaseName: "Phase 2 - Al Yasmin",
    phaseNameAr: "المرحلة الثانية - الياسمين",
  },
  // Al Nakhla Gardens - Phase 3
  {
    id: "unit-4",
    projectId: "project-1",
    phaseId: "phase-3",
    unitNumber: "C-101",
    price: 1350000,
    bedrooms: 3,
    bathrooms: 2,
    area: 190,
    status: "Available",
    deliveryDate: "2026-03-01",
    images: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
    ],
    projectName: "Al Nakhla Gardens",
    projectNameAr: "حدائق النخلة",
    phaseName: "Phase 3 - Al Ward",
    phaseNameAr: "المرحلة الثالثة - الورد",
  },
  // Jewel Residences - Phase 4
  {
    id: "unit-5",
    projectId: "project-2",
    phaseId: "phase-4",
    unitNumber: "E-501",
    price: 2100000,
    bedrooms: 4,
    bathrooms: 4,
    area: 280,
    status: "Available",
    deliveryDate: "2025-12-01",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    ],
    floorPlan: "https://www.omranarch.com/m/images/projects/2008/0816-calfornia-compund/1.jpg",
    sketchupEmbedUrl: "https://3dwarehouse.sketchup.com/embed/2532d83b-9925-4731-b0e0-8bafba3d4a9f?token=L4tFhudHN9k=&binaryName=s21",
    amenities: [
      "Access to M4 owners lounge",
      "Access to prayer room",
      "Access to the business center",
      "Access to fitness center/health club",
      "Access to major events held at the Makkah Clock",
      "24-hour security services",
      "24-hour concierge",
      "Valet parking",
      "Airport transportation",
      "Bell services",
      "Common area housekeeping and maintenance",
      "Internet",
      "Kids Club",
      "International restaurants",
      "Dry cleaning & laundry",
      "Room Service",
    ],
    projectName: "Jewel Residences",
    projectNameAr: "مساكن الجوهرة",
    phaseName: "Phase 1 - Emerald",
    phaseNameAr: "المرحلة الأولى - الزمرد",
    description: "Penthouse with rooftop terrace and city skyline views.",
    descriptionAr: "بنتهاوس مع تراس على السطح وإطلالات على أفق المدينة.",
  },
  {
    id: "unit-6",
    projectId: "project-2",
    phaseId: "phase-4",
    unitNumber: "E-301",
    price: 1650000,
    bedrooms: 3,
    bathrooms: 3,
    area: 200,
    status: "Sold",
    deliveryDate: "2025-12-01",
    images: [
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80",
    ],
    projectName: "Jewel Residences",
    projectNameAr: "مساكن الجوهرة",
    phaseName: "Phase 1 - Emerald",
    phaseNameAr: "المرحلة الأولى - الزمرد",
  },
  // Jewel Residences - Phase 5
  {
    id: "unit-7",
    projectId: "project-2",
    phaseId: "phase-5",
    unitNumber: "S-101",
    price: 1850000,
    bedrooms: 3,
    bathrooms: 3,
    area: 210,
    status: "Available",
    deliveryDate: "2026-06-01",
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    ],
    projectName: "Jewel Residences",
    projectNameAr: "مساكن الجوهرة",
    phaseName: "Phase 2 - Sapphire",
    phaseNameAr: "المرحلة الثانية - الياقوت",
  },
  // City Central Towers - Phase 8
  {
    id: "unit-8",
    projectId: "project-4",
    phaseId: "phase-8",
    unitNumber: "TA-2501",
    price: 3200000,
    bedrooms: 5,
    bathrooms: 5,
    area: 350,
    status: "Available",
    deliveryDate: "2025-09-01",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80",
    ],
    floorPlan: "https://www.omranarch.com/m/images/projects/2008/0816-calfornia-compund/1.jpg",
    sketchupEmbedUrl: "https://3dwarehouse.sketchup.com/embed/2532d83b-9925-4731-b0e0-8bafba3d4a9f?token=L4tFhudHN9k=&binaryName=s21",
    amenities: [
      "Luxurious and spacious lobby",
      "Fitness Center with lockers",
      "Prayer Room",
      "24/7 security service",
      "Concierge Service",
      "Restaurants",
      "Private Elevator",
      "360-degree city views",
      "Smart Home Technology",
      "Direct Mall Access",
    ],
    projectName: "City Central Towers",
    projectNameAr: "أبراج وسط المدينة",
    phaseName: "Tower A",
    phaseNameAr: "البرج أ",
    description: "Luxurious penthouse with 360-degree city views and private elevator.",
    descriptionAr: "بنتهاوس فاخر مع إطلالات 360 درجة على المدينة ومصعد خاص.",
  },
  {
    id: "unit-9",
    projectId: "project-4",
    phaseId: "phase-8",
    unitNumber: "TA-1201",
    price: 1800000,
    bedrooms: 2,
    bathrooms: 2,
    area: 140,
    status: "Available",
    deliveryDate: "2025-09-01",
    images: [
      "https://images.unsplash.com/photo-1600573472591-ee6c563afe60?w=800&q=80",
    ],
    projectName: "City Central Towers",
    projectNameAr: "أبراج وسط المدينة",
    phaseName: "Tower A",
    phaseNameAr: "البرج أ",
  },
  // City Central Towers - Phase 9
  {
    id: "unit-10",
    projectId: "project-4",
    phaseId: "phase-9",
    unitNumber: "TB-1801",
    price: 2400000,
    bedrooms: 3,
    bathrooms: 3,
    area: 220,
    status: "Reserved",
    deliveryDate: "2026-01-01",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    ],
    projectName: "City Central Towers",
    projectNameAr: "أبراج وسط المدينة",
    phaseName: "Tower B",
    phaseNameAr: "البرج ب",
  },
  // Marina Bay Villas - Phase 10
  {
    id: "unit-11",
    projectId: "project-5",
    phaseId: "phase-10",
    unitNumber: "MBV-01",
    price: 5500000,
    bedrooms: 6,
    bathrooms: 7,
    area: 550,
    status: "Available",
    deliveryDate: "2026-06-01",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    ],
    projectName: "Marina Bay Villas",
    projectNameAr: "فلل مارينا باي",
    phaseName: "Waterfront Collection",
    phaseNameAr: "مجموعة الواجهة البحرية",
    description: "Beachfront villa with private pool, yacht berth, and direct sea access.",
    descriptionAr: "فيلا على الشاطئ مع مسبح خاص ومرسى لليخت ووصول مباشر للبحر.",
  },
  {
    id: "unit-12",
    projectId: "project-5",
    phaseId: "phase-10",
    unitNumber: "MBV-02",
    price: 4800000,
    bedrooms: 5,
    bathrooms: 6,
    area: 480,
    status: "Available",
    deliveryDate: "2026-06-01",
    images: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
    ],
    projectName: "Marina Bay Villas",
    projectNameAr: "فلل مارينا باي",
    phaseName: "Waterfront Collection",
    phaseNameAr: "مجموعة الواجهة البحرية",
  },
];

export function getUnitById(id: string): Unit | undefined {
  return mockUnits.find((u) => u.id === id);
}

export function getUnitsByProjectId(projectId: string): Unit[] {
  return mockUnits.filter((u) => u.projectId === projectId);
}

export function getUnitsByPhaseId(phaseId: string): Unit[] {
  return mockUnits.filter((u) => u.phaseId === phaseId);
}

export function searchUnits(filters: UnitFilters): Unit[] {
  return mockUnits.filter((unit) => {
    if (unit.status !== "Available") return false;
    if (filters.projectId && unit.projectId !== filters.projectId) return false;
    if (filters.model && unit.model !== filters.model) return false;
    if (filters.phaseId && unit.phaseId !== filters.phaseId) return false;
    if (filters.minPrice && unit.price < filters.minPrice) return false;
    if (filters.maxPrice && unit.price > filters.maxPrice) return false;
    if (filters.bedrooms && unit.bedrooms !== filters.bedrooms) return false;
    if (filters.minArea && unit.area < filters.minArea) return false;
    if (filters.maxArea && unit.area > filters.maxArea) return false;
    if (filters.status && unit.status !== filters.status) return false;
    if (filters.deliveryYear) {
      const unitYear = new Date(unit.deliveryDate).getFullYear();
      if (unitYear !== filters.deliveryYear) return false;
    }
    return true;
  });
}

export function getAvailableUnitsCount(): number {
  return mockUnits.filter((u) => u.status === "Available").length;
}

export function getRelatedUnits(unitId: string, limit: number = 3): Unit[] {
  const unit = getUnitById(unitId);
  if (!unit) return [];

  return mockUnits
    .filter(
      (u) =>
        u.id !== unitId &&
        u.status === "Available" &&
        (u.projectId === unit.projectId || u.bedrooms === unit.bedrooms)
    )
    .slice(0, limit);
}

