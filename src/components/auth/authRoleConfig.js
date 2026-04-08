export const authRoleContent = {
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

  if (normalizedValue === "tenant" || normalizedValue === "landlord") {
    return normalizedValue;
  }

  return "";
}
