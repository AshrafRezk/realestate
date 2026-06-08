import type { Project, Phase } from "../types";

export const mockPhases: Phase[] = [
  {
    id: "phase-1",
    projectId: "project-1",
    name: "Phase 1 - Al Nakheel",
    nameAr: "المرحلة الأولى - النخيل",
    status: "SoldOut",
    availableUnitsCount: 0,
  },
  {
    id: "phase-2",
    projectId: "project-1",
    name: "Phase 2 - Al Yasmin",
    nameAr: "المرحلة الثانية - الياسمين",
    status: "Available",
    availableUnitsCount: 24,
  },
  {
    id: "phase-3",
    projectId: "project-1",
    name: "Phase 3 - Al Ward",
    nameAr: "المرحلة الثالثة - الورد",
    status: "Available",
    availableUnitsCount: 48,
  },
  {
    id: "phase-4",
    projectId: "project-2",
    name: "Phase 1 - Emerald",
    nameAr: "المرحلة الأولى - الزمرد",
    status: "Available",
    availableUnitsCount: 32,
  },
  {
    id: "phase-5",
    projectId: "project-2",
    name: "Phase 2 - Sapphire",
    nameAr: "المرحلة الثانية - الياقوت",
    status: "Available",
    availableUnitsCount: 56,
  },
  {
    id: "phase-6",
    projectId: "project-3",
    name: "Phase 1 - Exclusive Villas",
    nameAr: "المرحلة الأولى - فلل حصرية",
    status: "SoldOut",
    availableUnitsCount: 0,
  },
  {
    id: "phase-7",
    projectId: "project-3",
    name: "Phase 2 - Premium Estates",
    nameAr: "المرحلة الثانية - عقارات مميزة",
    status: "SoldOut",
    availableUnitsCount: 0,
  },
  {
    id: "phase-8",
    projectId: "project-4",
    name: "Tower A",
    nameAr: "البرج أ",
    status: "Available",
    availableUnitsCount: 18,
  },
  {
    id: "phase-9",
    projectId: "project-4",
    name: "Tower B",
    nameAr: "البرج ب",
    status: "Available",
    availableUnitsCount: 22,
  },
  {
    id: "phase-10",
    projectId: "project-5",
    name: "Waterfront Collection",
    nameAr: "مجموعة الواجهة البحرية",
    status: "Available",
    availableUnitsCount: 15,
  },
];

export const mockProjects: Project[] = [
  {
    id: "project-1",
    name: "Al Nakhla Gardens",
    nameAr: "حدائق النخلة",
    location: "North Riyadh",
    locationAr: "شمال الرياض",
    coverImageUrl:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    featuredVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    status: "Active",
    description:
      "A prestigious residential community featuring modern architecture and world-class amenities, designed for those who appreciate the finest in life.",
    descriptionAr:
      "مجتمع سكني راقٍ يتميز بالعمارة الحديثة والمرافق العالمية، مصمم لمن يقدرون أرقى ما في الحياة.",
    phases: mockPhases.filter((p) => p.projectId === "project-1"),
  },
  {
    id: "project-2",
    name: "Jewel Residences",
    nameAr: "مساكن الجوهرة",
    location: "West Riyadh",
    locationAr: "غرب الرياض",
    coverImageUrl:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    featuredVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    status: "Active",
    description:
      "Luxury apartments and villas in a gated community with premium facilities including a private club, sports complex, and landscaped gardens.",
    descriptionAr:
      "شقق وفلل فاخرة في مجتمع مسور مع مرافق متميزة تشمل نادي خاص ومجمع رياضي وحدائق منسقة.",
    phases: mockPhases.filter((p) => p.projectId === "project-2"),
  },
  {
    id: "project-3",
    name: "Royal Hills",
    nameAr: "التلال الملكية",
    location: "South Riyadh",
    locationAr: "جنوب الرياض",
    coverImageUrl:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    featuredVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    status: "Completed",
    description:
      "An exclusive villa community offering spacious homes with private pools, set amidst beautifully landscaped terrain.",
    descriptionAr:
      "مجتمع فلل حصري يقدم منازل واسعة مع مسابح خاصة، في وسط تضاريس جميلة.",
    phases: mockPhases.filter((p) => p.projectId === "project-3"),
  },
  {
    id: "project-4",
    name: "City Central Towers",
    nameAr: "أبراج وسط المدينة",
    location: "Central Riyadh",
    locationAr: "وسط الرياض",
    coverImageUrl:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    featuredVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    status: "Active",
    description:
      "Modern high-rise living in the heart of the city, featuring panoramic views, smart home technology, and direct mall access.",
    descriptionAr:
      "سكن عصري في أبراج شاهقة في قلب المدينة، مع إطلالات بانورامية وتقنية المنزل الذكي ووصول مباشر للمول.",
    phases: mockPhases.filter((p) => p.projectId === "project-4"),
  },
  {
    id: "project-5",
    name: "Marina Bay Villas",
    nameAr: "فلل مارينا باي",
    location: "King Abdullah Economic City",
    locationAr: "مدينة الملك عبدالله الاقتصادية",
    coverImageUrl:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
    featuredVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    status: "Active",
    description:
      "Stunning waterfront villas with private beach access, yacht berths, and resort-style amenities for an unparalleled lifestyle.",
    descriptionAr:
      "فلل مذهلة على الواجهة البحرية مع وصول خاص للشاطئ ومراسي لليخوت ومرافق على طراز المنتجعات لأسلوب حياة لا مثيل له.",
    phases: mockPhases.filter((p) => p.projectId === "project-5"),
  },
];

export function getProjectById(id: string): Project | undefined {
  return mockProjects.find((p) => p.id === id);
}

export function getPhasesByProjectId(projectId: string): Phase[] {
  return mockPhases.filter((p) => p.projectId === projectId);
}

export function getPhaseById(id: string): Phase | undefined {
  return mockPhases.find((p) => p.id === id);
}

export function getFeaturedProject(): Project {
  return mockProjects[0];
}

export function hasAvailablePhases(project: Project): boolean {
  return project.phases.some((phase) => phase.status === "Available");
}

export function getAvailablePhasesCount(project: Project): number {
  return project.phases.filter((phase) => phase.status === "Available").length;
}

