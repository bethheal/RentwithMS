import listingImage from "../../assets/listing.png";

export const landlordDashboardResponse = {
  success: true,
  message: "Landlord dashboard data loaded successfully.",
  data: {
    user: {
      initials: "MT",
      name: "Mabel Tetteh",
      role: "Landlord",
    },
    navSections: [
      {
        title: "Properties",
        items: ["My Properties", "Add Property", "Property Listings"],
      },
      {
        title: "Tenants",
        items: ["My Tenants", "Tenant Application", "Tenant Reviews"],
      },
      {
        title: "Rent & Payments",
        items: ["Rent Payments", "Payment History", "Outstanding Rent", "Receipts"],
      },
      {
        title: "Requests",
        items: ["Viewing Request", "Rental Application"],
      },
      {
        title: "Finances",
        items: ["Payouts", "Commission", "Earnings"],
      },
      {
        title: "Messages",
        items: ["Messages", "Announcement", "Issues"],
      },
      {
        title: "General",
        items: ["Documents", "Analytics", "Verification"],
      },
      {
        title: "Preferences",
        items: ["Settings", "Help", "Terms & Conditions", "Sign Out"],
      },
    ],
    steps: [
      { id: "details", label: "Property Details" },
      { id: "price", label: "Property Price" },
      { id: "image", label: "Property Image" },
      { id: "completed", label: "Completed" },
    ],
    propertyDetails: {
      houseType: "Single Room",
      propertyType: "",
      name: "LT House Cottage",
      description: "1 room self contain with neat washroom and tiled compound.",
      address: "279 Street Legon",
      houseNumber: "12415",
      city: "New Chaotra",
      region: "06 Region",
      country: "Ghana",
      bedrooms: "1",
      bathrooms: "1",
      roomSize: "",
      roomOccupation: "Double",
      facilities: ["Prepaid Meter", "Water Availability", "Parking"],
    },
    pricing: {
      price: "12345677",
      negotiable: "Yes",
      duration: 2,
    },
    preview: {
      code: "GHS12345677",
      title: "LT House",
      location: "Lupaz 4th street, Accra",
      image: listingImage,
      chips: ["2", "1", "year"],
      notice: "This is a preview when your property is published",
    },
    gallery: [
      listingImage,
      listingImage,
      listingImage,
    ],
  },
};
