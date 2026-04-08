import faqImage from "../../assets/faq.png";

export const tenantDashboardResponse = {
  success: true,
  message: "Tenant dashboard data loaded successfully.",
  data: {
    user: {
      initials: "MT",
      name: "Mabel Tetteh",
      role: "Tenant",
    },
    navSections: [
      {
        title: "Homes",
        items: ["My Home", "Browse Homes", "All Homes"],
      },
      {
        title: "Landlords",
        items: ["Verified Landlords", "Flagged Landlords", "Landlords Reviews"],
      },
      {
        title: "Rent & Payments",
        items: ["Pay Rent", "Rent History", "Receipts"],
      },
      {
        title: "Utilities",
        items: ["Electricity", "Water Bills", "Waste"],
      },
      {
        title: "Maintenance",
        items: ["Report Issue", "My Requests"],
      },
      {
        title: "Messages",
        items: ["Announcement", "Chat with Landlord"],
      },
      {
        title: "General",
        items: ["Dashboard", "Booking", "Documents"],
      },
      {
        title: "Preferences",
        items: ["Settings", "Help", "Terms & Conditions", "Sign Out"],
      },
    ],
    filters: {
      areas: ["Anyaa Market", "Ablekuma", "Santa Maria", "Santa Maria"],
      houses: ["House", "Duplex", "Mansion", "Apartment", "Room & Parlour", "Mini Flat"],
      utilities: ["Prepaid Meter", "Water"],
      bedrooms: 0,
      bathrooms: 0,
      budget: {
        min: 0,
        max: 50000,
        current: 6000,
      },
    },
    map: {
      title: "Location",
      labels: [
        { name: "Accra", top: "68%", left: "69%" },
        { name: "Ghana", top: "48%", left: "52%" },
        { name: "Benin", top: "22%", left: "78%" },
        { name: "Togo", top: "33%", left: "71%" },
        { name: "Cote d'Ivoire", top: "48%", left: "18%" },
      ],
    },
    listings: [
      {
        id: "tenant-home-01",
        title: "House",
        description: "Bright 2-bedroom apartment close to transport routes and shopping.",
        location: "East Legon, Accra",
        amount: "GHS 6,000 / yr",
        image: faqImage,
      },
      {
        id: "tenant-home-02",
        title: "House",
        description: "Neat apartment with prepaid meter, parking, and tiled washrooms.",
        location: "Ablekuma, Accra",
        amount: "GHS 4,800 / yr",
        image: faqImage,
      },
    ],
  },
};
