import type { Contact, Case, CaseCategory, CaseStatus } from "../types";
import bcrypt from "bcryptjs";

// Pre-hashed passwords for demo (password is "demo123" for all users)
const DEMO_PASSWORD_HASH = bcrypt.hashSync("demo123", 10);

export const mockContacts: Contact[] = [
  {
    id: "contact-1",
    username: "ahmed.owner",
    passwordHash: DEMO_PASSWORD_HASH,
    firstName: "Ahmed",
    lastName: "Al-Rashid",
    email: "ahmed@example.com",
    phone: "+966501234567",
    ownedUnits: ["unit-6"], // Owns Jewel Residences unit
  },
  {
    id: "contact-2",
    username: "sara.owner",
    passwordHash: DEMO_PASSWORD_HASH,
    firstName: "Sara",
    lastName: "Al-Fahad",
    email: "sara@example.com",
    phone: "+966509876543",
    ownedUnits: ["unit-2", "unit-10"], // Owns multiple units
  },
  {
    id: "contact-3",
    username: "demo",
    passwordHash: DEMO_PASSWORD_HASH,
    firstName: "Demo",
    lastName: "User",
    email: "demo@cloudestate.com",
    phone: "+966500000000",
    ownedUnits: ["unit-1", "unit-5", "unit-8"],
  },
];

export const mockCases: Case[] = [
  {
    id: "case-1",
    contactId: "contact-1",
    unitId: "unit-6",
    subject: "AC Maintenance Required",
    category: "Maintenance",
    description: "The air conditioning unit in the master bedroom is not cooling properly. Please schedule a maintenance visit.",
    status: "InProgress",
    createdAt: "2024-12-15T10:30:00Z",
    updatedAt: "2024-12-20T14:45:00Z",
  },
  {
    id: "case-2",
    contactId: "contact-2",
    unitId: "unit-2",
    subject: "Title Deed Request",
    category: "Documentation",
    description: "I need a copy of the title deed for my unit for bank purposes.",
    status: "Resolved",
    createdAt: "2024-12-10T08:00:00Z",
    updatedAt: "2024-12-18T16:30:00Z",
  },
  {
    id: "case-3",
    contactId: "contact-3",
    unitId: "unit-5",
    subject: "Parking Space Inquiry",
    category: "Inquiry",
    description: "I would like to know if there are additional parking spaces available for purchase.",
    status: "New",
    createdAt: "2024-12-28T12:00:00Z",
    updatedAt: "2024-12-28T12:00:00Z",
  },
  {
    id: "case-4",
    contactId: "contact-3",
    unitId: "unit-8",
    subject: "Water Leak in Bathroom",
    category: "Maintenance",
    description: "There is a water leak under the sink in the guest bathroom. Needs urgent attention.",
    status: "InProgress",
    createdAt: "2024-12-25T09:15:00Z",
    updatedAt: "2024-12-27T11:00:00Z",
  },
];

let casesStore = [...mockCases];

export function getContactByUsername(username: string): Contact | undefined {
  return mockContacts.find((c) => c.username === username);
}

export function getContactById(id: string): Contact | undefined {
  return mockContacts.find((c) => c.id === id);
}

export async function validatePassword(
  contact: Contact,
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, contact.passwordHash);
}

export function getCasesByContactId(contactId: string): Case[] {
  return casesStore.filter((c) => c.contactId === contactId);
}

export function getCaseById(id: string): Case | undefined {
  return casesStore.find((c) => c.id === id);
}

export function createCase(
  contactId: string,
  unitId: string | undefined,
  subject: string,
  category: CaseCategory,
  description: string
): Case {
  const newCase: Case = {
    id: `case-${Date.now()}`,
    contactId,
    unitId,
    subject,
    category,
    description,
    status: "New",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  casesStore.push(newCase);
  return newCase;
}

export function updateCaseStatus(caseId: string, status: CaseStatus): Case | undefined {
  const caseIndex = casesStore.findIndex((c) => c.id === caseId);
  if (caseIndex === -1) return undefined;
  
  casesStore[caseIndex] = {
    ...casesStore[caseIndex],
    status,
    updatedAt: new Date().toISOString(),
  };
  
  return casesStore[caseIndex];
}

