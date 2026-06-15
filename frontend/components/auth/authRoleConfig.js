export const authRoleContent = {
  admin: {
    label: "Admin",
    defaultName: "Trust Admin",
    defaultEmail: "admin@rms.app",
    signupNameLabel: "Admin Name*",
    signupNamePlaceholder: "Name",
    googleSignupName: "Google Admin",
    googleSignupEmail: "admin.google@rms.app",
    googleLoginEmail: "admin.google@rms.app",
  },
  tenant: {
    label: "Tenant",
    defaultName: "New Tenant",
    defaultEmail: "tenant@rms.app",
    signupNameLabel: "Name*",
    signupNamePlaceholder: "Name",
    googleSignupName: "Google Tenant",
    googleSignupEmail: "tenant.google@rms.app",
    googleLoginEmail: "tenant.google@rms.app",
  },
  landlord: {
    label: "Landlord",
    defaultName: "New Landlord",
    defaultEmail: "landlord@rms.app",
    signupNameLabel: "Full (as registered on Property)*",
    signupNamePlaceholder: "Name",
    googleSignupName: "Google Landlord",
    googleSignupEmail: "landlord.google@rms.app",
    googleLoginEmail: "landlord.google@rms.app",
  },
};

export function normalizeAuthRole(value) {
  const normalizedValue = String(value ?? "").trim().toLowerCase();

  if (
    normalizedValue === "admin" ||
    normalizedValue === "tenant" ||
    normalizedValue === "landlord"
  ) {
    return normalizedValue;
  }

  return "";
}
