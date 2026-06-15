import listingImage from "../../assets/listing.png";
import { buildManagedPropertyRecord } from "../../utils/propertyRecords.js";

const palmCourtDraft = {
  details: {
    houseType: "Apartment",
    propertyType: "Private",
    name: "Palm Court Apartment",
    description:
      "Bright two-bedroom apartment with stable utilities, secure access, and a calm move-in ready layout for long-term tenants.",
    address: "Block B, Apartment 4",
    houseNumber: "4",
    city: "East Legon",
    region: "Accra",
    country: "Ghana",
    bedrooms: "2",
    bathrooms: "2",
    roomSize: "Large",
    roomOccupation: "Family",
    facilities: ["Water", "Electricity", "Parking", "Security"],
    assignedTenantName: "Mabel Tetteh",
    assignedTenantEmail: "mabel.tetteh@example.com",
    moveInDate: "2026-04-02",
    tenantStatus: "Active",
  },
  pricing: {
    price: "8400",
    negotiable: "No",
    duration: 1,
  },
  gallery: [listingImage, listingImage, listingImage],
  mediaReady: true,
};

const palmCourtPreview = {
  code: "GHS8400",
  title: "Palm Court Apartment",
  location: "Block B, Apartment 4, East Legon, Accra",
  image: listingImage,
  chips: ["2", "2", "1 year"],
  notice: "This is a preview when your property is published",
};

const palmCourtRecord = buildManagedPropertyRecord({
  draft: palmCourtDraft,
  fallbackPreview: palmCourtPreview,
  landlord: {
    id: "landlord-kwame-asare",
    name: "Kwame Asare",
  },
});

export const initialManagedProperties = [
  {
    ...palmCourtRecord,
    id: "managed-property-001",
    createdAt: "2026-03-25T08:15:00.000Z",
    updatedAt: "2026-04-18T09:40:00.000Z",
    publishedAt: "2026-04-01T09:00:00.000Z",
    workflowStatus: "published",
  },
];
