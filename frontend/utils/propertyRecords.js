export function sanitizeDigits(value) {
  return String(value ?? "").replace(/[^\d]/g, "");
}

export function formatDurationLabel(value) {
  const duration = Math.max(1, Number(value) || 1);
  return `${duration} ${duration === 1 ? "year" : "years"}`;
}

export function createPreviewCode(price, fallbackCode) {
  const digits = sanitizeDigits(price);

  if (digits) {
    return `GHS${digits}`;
  }

  return fallbackCode;
}

export function formatRentAmount(value, duration = 1) {
  const amount = Number(sanitizeDigits(value) || 0);

  if (!amount) {
    return "Rent pending";
  }

  const formattedAmount = new Intl.NumberFormat("en-US").format(amount);
  return `GHS ${formattedAmount} / ${duration === 1 ? "yr" : `${duration} yrs`}`;
}

export function formatPropertyDate(dateString, fallbackLabel = "Not available") {
  if (!dateString) {
    return fallbackLabel;
  }

  return new Date(dateString).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function buildPropertyLocation(details, fallbackLocation = "") {
  const location = [
    details?.address,
    details?.city,
    details?.region,
    details?.country,
  ]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join(", ");

  return location || fallbackLocation;
}

export function clonePropertyDraft(draft) {
  return {
    details: {
      ...draft.details,
      facilities: [...(draft.details?.facilities ?? [])],
    },
    pricing: {
      ...draft.pricing,
      duration: Math.max(1, Number(draft.pricing?.duration) || 1),
    },
    gallery: [...(draft.gallery ?? [])],
    mediaReady: Boolean(draft.mediaReady),
  };
}

export function buildPropertyPreview(draft, fallbackPreview, isPublished = false) {
  const nextDraft = clonePropertyDraft(draft);
  const location = buildPropertyLocation(nextDraft.details, fallbackPreview.location);

  return {
    ...fallbackPreview,
    code: createPreviewCode(nextDraft.pricing.price, fallbackPreview.code),
    title: nextDraft.details.name?.trim() || fallbackPreview.title,
    location,
    image: nextDraft.gallery[0] || fallbackPreview.image,
    chips: [
      nextDraft.details.bedrooms || fallbackPreview.chips[0],
      nextDraft.details.bathrooms || fallbackPreview.chips[1],
      formatDurationLabel(nextDraft.pricing.duration),
    ],
    notice: isPublished
      ? "Your listing is published and ready for tenants to discover."
      : fallbackPreview.notice,
  };
}

export function buildManagedPropertyRecord({
  draft,
  existingProperty = null,
  fallbackPreview,
  landlord,
}) {
  const nextDraft = clonePropertyDraft(draft);
  const preview = buildPropertyPreview(
    nextDraft,
    fallbackPreview,
    existingProperty?.workflowStatus === "published"
  );
  const now = new Date().toISOString();

  return {
    id: existingProperty?.id ?? `managed-property-${Date.now()}`,
    landlordId: landlord?.id ?? existingProperty?.landlordId ?? "landlord-demo",
    landlordName:
      landlord?.name?.trim() || existingProperty?.landlordName || "Landlord",
    createdAt: existingProperty?.createdAt ?? now,
    updatedAt: now,
    publishedAt: existingProperty?.publishedAt ?? null,
    workflowStatus: existingProperty?.workflowStatus ?? "draft",
    draft: nextDraft,
    summary: {
      code: preview.code,
      title: preview.title,
      location: preview.location,
      image: preview.image,
      amount: formatRentAmount(nextDraft.pricing.price, nextDraft.pricing.duration),
      amountValue: Number(sanitizeDigits(nextDraft.pricing.price) || 0),
      bedrooms: Number(nextDraft.details.bedrooms) || 0,
      bathrooms: Number(nextDraft.details.bathrooms) || 0,
      duration: Math.max(1, Number(nextDraft.pricing.duration) || 1),
      amenities: [...(nextDraft.details.facilities ?? [])],
      description: nextDraft.details.description?.trim() || "",
    },
  };
}

function normalizeComparableValue(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function isPropertyAssignedToTenant(property, tenantProfile) {
  const assignedEmail = normalizeComparableValue(
    property?.draft?.details?.assignedTenantEmail
  );
  const assignedName = normalizeComparableValue(
    property?.draft?.details?.assignedTenantName
  );
  const tenantEmail = normalizeComparableValue(tenantProfile?.email);
  const tenantName = normalizeComparableValue(tenantProfile?.name);

  if (assignedEmail && tenantEmail) {
    return assignedEmail === tenantEmail;
  }

  if (assignedName && tenantName) {
    return assignedName === tenantName;
  }

  return false;
}

export function isPropertyVisibleToTenant(property, tenantProfile) {
  return (
    property?.workflowStatus === "published" &&
    isPropertyAssignedToTenant(property, tenantProfile)
  );
}

export function mapManagedPropertyToTenantCard(property) {
  return {
    id: property.id,
    title: property.summary.title,
    location: property.summary.location,
    amount: property.summary.amount,
    amountValue: property.summary.amountValue,
    image: property.summary.image,
    description: property.summary.description,
    amenities: [...(property.summary.amenities ?? [])],
    bedrooms: property.summary.bedrooms,
    bathrooms: property.summary.bathrooms,
    landlordName: property.landlordName,
    moveInDate: property.draft.details.moveInDate || null,
    propertyType: property.draft.details.propertyType || "Private",
    status: property.draft.details.tenantStatus || "Pending",
    updatedAt: property.updatedAt,
  };
}

export function mapManagedPropertyToBrowseListing(property) {
  const [area = "Available", region = ""] = String(
    property.summary.location || property.draft?.details?.city || ""
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const houseType =
    property.draft?.details?.propertyType ||
    property.draft?.details?.houseType ||
    "Private";

  return {
    id: property.id,
    title: property.summary.title,
    description: property.summary.description,
    location: property.summary.location,
    amount: property.summary.amount,
    amountValue: property.summary.amountValue,
    landlordId: property.landlordId,
    landlordName: property.landlordName,
    area,
    region: region || area,
    houseType,
    amenities: [...(property.summary.amenities ?? [])],
    bedrooms: property.summary.bedrooms,
    bathrooms: property.summary.bathrooms,
    image: property.summary.image,
    featured: false,
    isSaved: false,
    createdAt: property.publishedAt ?? property.updatedAt ?? property.createdAt,
    tags: ["Published", houseType].filter(Boolean),
  };
}
