import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bath,
  BedDouble,
  Bell,
  Building2,
  CalendarDays,
  Check,
  CircleHelp,
  ClipboardList,
  ChevronDown,
  Circle,
  FileText,
  FolderOpen,
  History,
  ImageUp,
  Info,
  LayoutDashboard,
  LineChart,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageSquareText,
  MessagesSquare,
  Plus,
  Receipt,
  Send,
  Settings,
  ShieldCheck,
  UserCircle2,
  Users,
  Wallet,
  Wrench,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { usePropertyStore } from "../../context/PropertyStoreContext.jsx";
import { landlordDashboardResponse } from "../../data/mockApi/landlordDashboard.js";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { classNames } from "../../utils/classNames.js";
import { clonePropertyDraft } from "../../utils/propertyRecords.js";
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from "../../utils/toast.js";
import {
  LandlordMyPropertiesView,
  LandlordPropertyListingsView,
} from "./LandlordPropertyViews.jsx";
import {
  LandlordAnalyticsView,
  LandlordAnnouncementsView,
  LandlordApplicationsView,
  LandlordCommissionView,
  LandlordDocumentsView,
  LandlordEarningsView,
  LandlordHelpView,
  LandlordIssuesView,
  LandlordMessagesView,
  LandlordPaymentHistoryView,
  LandlordPayoutsView,
  LandlordReceiptsView,
  LandlordRentPaymentsView,
  LandlordReviewsView,
  LandlordSettingsView,
  LandlordTenantsView,
  LandlordTermsView,
  LandlordOutstandingRentView,
  LandlordVerificationView,
  LandlordViewingRequestsView,
} from "./LandlordWorkspaceViews.jsx";

const defaultActiveItemLabel = "Add Property";

const landlordNavItemIconMap = {
  "My Properties": Building2,
  "Add Property": Plus,
  "Property Listings": LayoutDashboard,
  "My Tenants": Users,
  "Tenant Application": ClipboardList,
  "Tenant Reviews": MessageSquareText,
  "Rent Payments": Wallet,
  "Payment History": History,
  "Outstanding Rent": Wallet,
  Receipts: Receipt,
  "Viewing Request": CalendarDays,
  "Rental Application": ClipboardList,
  Payouts: LineChart,
  Commission: LineChart,
  Earnings: Wallet,
  Messages: MessagesSquare,
  Announcement: Bell,
  Issues: Wrench,
  Documents: FolderOpen,
  Analytics: LineChart,
  Verification: ShieldCheck,
  Settings: Settings,
  Help: CircleHelp,
  "Terms & Conditions": FileText,
  "Sign Out": LogOut,
};

const detailStepFields = [
  "houseType",
  "propertyType",
  "name",
  "address",
  "houseNumber",
  "city",
  "region",
  "country",
  "bedrooms",
  "bathrooms",
  "roomSize",
];

const detailStepMessages = {
  houseType: "Choose a house type to continue.",
  propertyType: "Choose a property type to continue.",
  name: "Add a property name to continue.",
  address: "Add the street address to continue.",
  houseNumber: "Add the house number to continue.",
  city: "Add the city to continue.",
  region: "Choose a region to continue.",
  country: "Choose a country to continue.",
  bedrooms: "Choose the number of bedrooms.",
  bathrooms: "Choose the number of bathrooms.",
  roomSize: "Choose the room size to continue.",
};

function createInitialPropertyDraft(data) {
  return {
    details: {
      ...data.propertyDetails,
      facilities: [...data.propertyDetails.facilities],
    },
    pricing: {
      ...data.pricing,
      duration: Number(data.pricing.duration) || 1,
    },
    gallery: [...data.gallery],
    mediaReady: false,
  };
}

function createEmptyValidationState() {
  return {
    details: {},
    pricing: {},
    image: {},
  };
}

function sanitizeDigits(value) {
  return String(value ?? "").replace(/[^\d]/g, "");
}

function formatDurationLabel(value) {
  const duration = Math.max(1, Number(value) || 1);
  return `${duration} ${duration === 1 ? "year" : "years"}`;
}

function createPreviewCode(price, fallbackCode) {
  const digits = sanitizeDigits(price);

  if (digits) {
    return `GHS${digits}`;
  }

  return fallbackCode;
}

function buildPropertyPreview(draft, fallbackPreview, isPublished = false) {
  const location = [draft.details.address, draft.details.city, draft.details.country]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join(", ");

  return {
    ...fallbackPreview,
    code: createPreviewCode(draft.pricing.price, fallbackPreview.code),
    title: draft.details.name?.trim() || fallbackPreview.title,
    location: location || fallbackPreview.location,
    image: draft.gallery[0] || fallbackPreview.image,
    chips: [
      draft.details.bedrooms || fallbackPreview.chips[0],
      draft.details.bathrooms || fallbackPreview.chips[1],
      formatDurationLabel(draft.pricing.duration),
    ],
    notice: isPublished
      ? "Your listing is published and ready for tenants to discover."
      : fallbackPreview.notice,
  };
}

function hasStepErrors(errors) {
  return Object.keys(errors).length > 0;
}

function validatePropertyStep(stepIndex, draft) {
  if (stepIndex === 0) {
    return detailStepFields.reduce((errors, field) => {
      if (String(draft.details[field] ?? "").trim()) {
        return errors;
      }

      return {
        ...errors,
        [field]: detailStepMessages[field],
      };
    }, {});
  }

  if (stepIndex === 1) {
    const errors = {};

    if (!sanitizeDigits(draft.pricing.price)) {
      errors.price = "Enter a price before continuing.";
    }

    if (!String(draft.pricing.negotiable ?? "").trim()) {
      errors.negotiable = "Choose whether the price is negotiable.";
    }

    if ((Number(draft.pricing.duration) || 0) < 1) {
      errors.duration = "Set a duration of at least 1 year.";
    }

    return errors;
  }

  if (stepIndex === 2) {
    const errors = {};

    if (draft.gallery.length === 0) {
      errors.gallery = "Upload at least one property image.";
    }

    if (!draft.mediaReady) {
      errors.mediaReady = "Confirm that the property media is ready before publishing.";
    }

    return errors;
  }

  return {};
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error(`Unsupported file result for ${file.name}.`));
    };

    reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

function createId(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeNavItem(item) {
  const label = typeof item === "string" ? item : item.label;

  return {
    id: createId(label),
    label,
    icon: typeof item === "string" ? label : item.icon ?? label,
  };
}

function deriveInitials(name, fallback = "") {
  const initials = String(name ?? "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || fallback;
}

function ProfileAvatarButton({
  avatar,
  className = "",
  initials,
  name,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`Edit profile for ${name}`}
      className={classNames(
        "grid shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full bg-[#D9D9D9] font-bold text-[#18399F] transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18399F]",
        className
      )}
      aria-label="Edit landlord profile"
    >
      {avatar ? (
        <img src={avatar} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </button>
  );
}

function Panel({ title, children, className = "" }) {
  return (
    <section
      className={`rounded-[1.35rem] border border-[#D8E0F1] bg-white p-5 shadow-[0_16px_28px_rgba(15,32,86,0.08)] ${className}`}
    >
      {title ? (
        <h3 className="text-[0.92rem] font-semibold text-[#111827]">{title}</h3>
      ) : null}
      <div className={title ? "mt-4" : ""}>{children}</div>
    </section>
  );
}

function Field({ label, children, className = "", error }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[0.72rem] font-medium text-slate-500">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-rose-600">{error}</span>
      ) : null}
    </label>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-[0.8rem] border border-[#D7E0F1] bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F] ${props.className ?? ""}`}
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className={`h-11 w-full rounded-[0.8rem] border border-[#D7E0F1] bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F] ${props.className ?? ""}`}
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`min-h-[7.5rem] w-full rounded-[0.8rem] border border-[#D7E0F1] bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#18399F] ${props.className ?? ""}`}
    />
  );
}

function DurationControl({ value, onDecrease, onIncrease }) {
  const isMinimum = value <= 1;

  return (
    <div className="inline-flex items-center gap-2 rounded-[0.55rem] border border-[#D7E0F1] bg-white px-2 py-1 shadow-[0_10px_20px_rgba(15,32,86,0.05)]">
      <button
        type="button"
        onClick={onDecrease}
        disabled={isMinimum}
        className={classNames(
          "grid size-6 place-items-center rounded-[0.35rem] border border-[#D7E0F1] text-[#18399F]",
          isMinimum ? "cursor-not-allowed opacity-40" : "hover:border-[#18399F]"
        )}
      >
        -
      </button>
      <span className="min-w-5 text-center text-sm font-semibold text-[#18399F]">
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        className="grid size-6 place-items-center rounded-[0.35rem] border border-[#D7E0F1] text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
      >
        +
      </button>
    </div>
  );
}

function StepItem({ index, isActive, isComplete, isLast, label, onClick }) {
  const palette = isActive
    ? "border-[#18399F] bg-[#EEF4FF] text-[#18399F]"
    : isComplete
      ? "border-[#18399F] bg-[#18399F] text-white"
      : "border-[#CBD5E8] bg-white text-slate-500";

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "relative flex min-h-12 w-full items-center justify-center gap-2 rounded-[0.9rem] border px-3 py-3 text-sm font-semibold transition",
        "sm:min-w-[10rem]",
        !isLast && "xl:after:absolute xl:after:-right-3 xl:after:top-1/2 xl:after:size-5 xl:after:-translate-y-1/2 xl:after:rotate-45 xl:after:border-r xl:after:border-t xl:after:border-[#CAD5ED] xl:after:bg-white",
        palette
      )}
    >
      <span
        className={`grid size-5 place-items-center rounded-full text-[0.68rem] ${
          isComplete
            ? "bg-white/20 text-white"
            : isActive
              ? "bg-[#18399F] text-white"
              : "bg-slate-100 text-slate-500"
        }`}
      >
        {isComplete ? <Check className="size-3.5" /> : index + 1}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function PropertyPreviewCard({ preview }) {
  const chipIcons = [BedDouble, Bath, CalendarDays];

  return (
    <div className="space-y-3">
      <article className="rounded-[1.4rem] border border-[#D7E0F1] bg-white p-3 shadow-[0_14px_26px_rgba(15,32,86,0.08)]">
        <div className="overflow-hidden rounded-[1rem] border border-[#E3E9F5] bg-[#F5F8FF]">
          <img
            src={preview.image}
            alt={preview.title}
            className="h-28 w-full object-cover"
          />
        </div>

        <div className="mt-4">
          <p className="text-sm font-black tracking-[0.02em] text-[#111827]">
            {preview.code}
          </p>
          <p className="mt-1 text-xs font-semibold text-[#111827]">
            {preview.title}
          </p>
          <div className="mt-2 flex items-center gap-1 text-[0.72rem] text-slate-500">
            <MapPin className="size-3.5 text-[#18399F]" />
            <span>{preview.location}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {preview.chips.map((chip, index) => {
              const Icon = chipIcons[index] ?? Circle;

              return (
                <span
                  key={`${preview.code}-${chip}-${index}`}
                  className="inline-flex items-center gap-1 rounded-full bg-[#EEF4FF] px-2 py-1 text-[0.68rem] font-semibold text-[#18399F]"
                >
                  <Icon className="size-3" />
                  <span>{chip}</span>
                </span>
              );
            })}
          </div>
        </div>
      </article>

      <div className="flex items-start gap-2 rounded-[1rem] border border-[#18399F] bg-[#EEF4FF] px-3 py-3 text-[0.74rem] text-[#18399F]">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>{preview.notice}</p>
      </div>
    </div>
  );
}

function DashboardActionButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={classNames(
        "grid size-7 place-items-center rounded-full border border-[#C9D4EC] bg-white text-[#18399F] transition-colors duration-300 hover:border-[#18399F] hover:text-[#102A74]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function SidebarNavItem({ isActive, item, onClick }) {
  const Icon = landlordNavItemIconMap[item.icon] ?? ChevronDown;

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "flex w-full items-center gap-3 rounded-[0.95rem] px-3 py-2.5 text-left text-[0.84rem] transition-colors duration-300",
        isActive
          ? "bg-white font-semibold text-[#102A74] shadow-[0_12px_20px_rgba(15,32,86,0.08)]"
          : "text-[#3656B7] hover:bg-white/80 hover:text-[#18399F]"
      )}
    >
      <span
        className={classNames(
          "grid size-7 shrink-0 place-items-center rounded-full",
          isActive ? "bg-[#E8EEFF] text-[#18399F]" : "bg-white/65 text-[#3656B7]"
        )}
      >
        <Icon className="size-4" />
      </span>
      <span>{item.label}</span>
    </button>
  );
}

function LandlordSidebarContent({
  activeItemId,
  expandedSections,
  mainNavSections,
  onClose,
  onSelectItem,
  onToggleSection,
  preferenceItems,
  showCloseButton = false,
  showBrandRow = true,
}) {
  return (
    <>
      {showBrandRow ? (
        <div className="flex h-14 items-center justify-between border-b border-[#C9D4EC] px-6">
          <Link
            to="/"
            className="text-[1.05rem] font-black uppercase tracking-[0.08em] text-black"
          >
            RMS
          </Link>

          {showCloseButton ? (
            <button
              type="button"
              onClick={onClose}
              className="grid size-10 place-items-center rounded-full border border-[#C9D4EC] text-[#18399F]"
              aria-label="Close dashboard navigation"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-5">
            {mainNavSections.map((section) => {
              const isExpanded = expandedSections[section.id];

              return (
                <div key={section.id}>
                  <button
                    type="button"
                    onClick={() => onToggleSection(section.id)}
                    className="flex w-full items-center justify-between gap-2 text-left text-[0.8rem] font-bold uppercase text-[#111827]"
                    aria-expanded={isExpanded}
                  >
                    <span>{section.title}</span>
                    <ChevronDown
                      className={classNames(
                        "size-3 transition-transform duration-300",
                        isExpanded ? "rotate-0" : "-rotate-90"
                      )}
                    />
                  </button>

                  {isExpanded ? (
                    <div className="mt-2 space-y-1.5">
                      {section.items.map((item) => (
                        <SidebarNavItem
                          key={item.id}
                          item={item}
                          isActive={item.id === activeItemId}
                          onClick={() => onSelectItem(section.id, item)}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {preferenceItems.length > 0 ? (
          <div className="border-t border-[#D6DFF1] px-5 py-5">
            <p className="text-[0.8rem] font-bold uppercase text-[#111827]">
              Preferences
            </p>
            <div className="mt-3 space-y-1.5">
              {preferenceItems.map((item) => (
                <SidebarNavItem
                  key={item.id}
                  item={item}
                  isActive={item.id === activeItemId}
                  onClick={() => onSelectItem("preferences", item)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

function EmptyDashboardView({ title }) {
  return (
    <section className="grid min-h-[62vh] place-items-center rounded-[2rem] border border-[#DCE5F7] bg-[linear-gradient(180deg,#FFFFFF_0%,#F7FAFF_100%)] p-6 text-center shadow-[0_18px_36px_rgba(15,32,86,0.06)]">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Landlord Dashboard
        </p>
        <h2 className="text-2xl font-bold uppercase tracking-[0.12em] text-[#102A74] sm:text-3xl">
          {title}
        </h2>
        <p className="text-sm leading-7 text-slate-500">
          This landlord section is using the tenant-style shell while the detailed
          workspace for this page is still being built.
        </p>
      </div>
    </section>
  );
}

function AddPropertyView({
  activeStep,
  contentByStep,
  data,
  isPrimaryDisabled,
  onAnnouncement,
  onMessages,
  onOpenProfileModal,
  onPrimaryAction,
  onResetForm,
  preview,
  primaryActionLabel,
  publishMessage,
  onSelectStep,
}) {
  return (
    <>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-[1.55rem] font-black tracking-[-0.04em] text-[#111827]">
            Add Properties
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Properties &gt; <span className="font-semibold text-[#18399F]">Add Property</span>
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
          <button
            type="button"
            onClick={onResetForm}
            className="grid size-8 place-items-center rounded-full bg-[#18399F] text-white shadow-[0_12px_24px_rgba(24,57,159,0.18)]"
            aria-label="Start a new property draft"
          >
            <Plus className="size-4" />
          </button>

          {[
            {
              icon: Mail,
              key: "messages",
              label: "Open messages",
              onClick: onMessages,
            },
            {
              icon: Bell,
              key: "announcements",
              label: "Open announcements",
              onClick: onAnnouncement,
            },
            {
              icon: UserCircle2,
              key: "profile",
              label: "Open landlord profile editor",
              onClick: onOpenProfileModal,
            },
          ].map((quickAction) => {
            const QuickActionIcon = quickAction.icon;

            return (
              <button
                key={quickAction.key}
                type="button"
                onClick={quickAction.onClick}
                className="grid size-8 place-items-center rounded-full border border-[#CAD5ED] bg-white text-[#18399F]"
                aria-label={quickAction.label}
              >
                <QuickActionIcon className="size-4" />
              </button>
            );
          })}

          <button
            type="button"
            onClick={onResetForm}
            className="min-w-[8rem] flex-1 rounded-[0.75rem] border border-[#CAD5ED] bg-white px-4 py-2 text-sm font-semibold text-[#18399F] transition hover:border-[#18399F] sm:flex-none"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={onPrimaryAction}
            disabled={isPrimaryDisabled}
            className={classNames(
              "inline-flex min-w-[8rem] flex-1 items-center justify-center gap-2 rounded-[0.75rem] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(24,57,159,0.18)] transition sm:flex-none",
              isPrimaryDisabled
                ? "cursor-not-allowed bg-[#93A8E6] shadow-none"
                : "bg-[#18399F] hover:bg-[#102A74]"
            )}
          >
            <span>{primaryActionLabel}</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      {publishMessage ? (
        <div
          className="mt-4 rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
          role="status"
        >
          {publishMessage}
        </div>
      ) : null}

      <div className="mt-4 grid gap-2 rounded-[0.95rem] border border-[#CAD5ED] bg-white p-2 shadow-[0_12px_24px_rgba(15,32,86,0.05)] sm:grid-cols-2 xl:grid-cols-4">
        {data.steps.map((step, index) => (
          <StepItem
            key={step.id}
            index={index}
            label={step.label}
            isActive={index === activeStep}
            isComplete={index < activeStep}
            isLast={index === data.steps.length - 1}
            onClick={() => onSelectStep(index)}
          />
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_14rem]">
        <div>{contentByStep[activeStep]}</div>
        <div className="xl:sticky xl:top-5 xl:self-start">
          <PropertyPreviewCard preview={preview} />
        </div>
      </div>
    </>
  );
}

function DetailsStep({
  details,
  errors,
  facilityOptions,
  onDetailsChange,
  onFacilityToggle,
}) {
  const houseTypeOptions = Array.from(
    new Set([details.houseType, "Studio", "Single Room", "Apartment"])
  ).filter(Boolean);
  const regionOptions = Array.from(
    new Set([details.region, "Greater Accra", "Central", "Ashanti"])
  ).filter(Boolean);
  const countryOptions = Array.from(
    new Set([details.country, "Ghana", "Nigeria", "Kenya"])
  ).filter(Boolean);
  const bedroomOptions = Array.from(
    new Set([details.bedrooms, "1", "2", "3", "4"])
  ).filter(Boolean);
  const bathroomOptions = Array.from(
    new Set([details.bathrooms, "1", "2", "3"])
  ).filter(Boolean);
  const roomOccupationOptions = Array.from(
    new Set([details.roomOccupation, "Single", "Double", "Family"])
  ).filter(Boolean);

  return (
    <div className="space-y-5">
      <Panel title="General Information">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="House Type *" error={errors.houseType}>
            <Select
              value={details.houseType}
              onChange={(event) => onDetailsChange("houseType", event.target.value)}
              className={errors.houseType ? "border-rose-300 focus:border-rose-500" : ""}
            >
              {houseTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Property Type *" error={errors.propertyType}>
            <Select
              value={details.propertyType || ""}
              onChange={(event) => onDetailsChange("propertyType", event.target.value)}
              className={errors.propertyType ? "border-rose-300 focus:border-rose-500" : ""}
            >
              <option value="">Select property type</option>
              {["Private", "Shared", "Serviced"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Name *" className="md:col-span-2" error={errors.name}>
            <Input
              value={details.name}
              onChange={(event) => onDetailsChange("name", event.target.value)}
              className={errors.name ? "border-rose-300 focus:border-rose-500" : ""}
            />
          </Field>

          <Field label="Description" className="md:col-span-2">
            <TextArea
              value={details.description}
              onChange={(event) => onDetailsChange("description", event.target.value)}
            />
          </Field>
        </div>
      </Panel>

      <Panel title="Unit Location">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Street Address" className="md:col-span-2" error={errors.address}>
            <Input
              value={details.address}
              onChange={(event) => onDetailsChange("address", event.target.value)}
              className={errors.address ? "border-rose-300 focus:border-rose-500" : ""}
            />
          </Field>

          <Field label="House Number *" error={errors.houseNumber}>
            <Input
              value={details.houseNumber}
              onChange={(event) => onDetailsChange("houseNumber", event.target.value)}
              className={errors.houseNumber ? "border-rose-300 focus:border-rose-500" : ""}
            />
          </Field>

          <Field label="City *" error={errors.city}>
            <Input
              value={details.city}
              onChange={(event) => onDetailsChange("city", event.target.value)}
              className={errors.city ? "border-rose-300 focus:border-rose-500" : ""}
            />
          </Field>

          <Field label="Region *" error={errors.region}>
            <Select
              value={details.region}
              onChange={(event) => onDetailsChange("region", event.target.value)}
              className={errors.region ? "border-rose-300 focus:border-rose-500" : ""}
            >
              {regionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Country *" error={errors.country}>
            <Select
              value={details.country}
              onChange={(event) => onDetailsChange("country", event.target.value)}
              className={errors.country ? "border-rose-300 focus:border-rose-500" : ""}
            >
              {countryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Panel>

      <Panel title="Room Information">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Number of Bedroom *" error={errors.bedrooms}>
            <Select
              value={details.bedrooms}
              onChange={(event) => onDetailsChange("bedrooms", event.target.value)}
              className={errors.bedrooms ? "border-rose-300 focus:border-rose-500" : ""}
            >
              {bedroomOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Number of Bath *" error={errors.bathrooms}>
            <Select
              value={details.bathrooms}
              onChange={(event) => onDetailsChange("bathrooms", event.target.value)}
              className={errors.bathrooms ? "border-rose-300 focus:border-rose-500" : ""}
            >
              {bathroomOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Size of Room *" error={errors.roomSize}>
            <Select
              value={details.roomSize || ""}
              onChange={(event) => onDetailsChange("roomSize", event.target.value)}
              className={errors.roomSize ? "border-rose-300 focus:border-rose-500" : ""}
            >
              <option value="">Select room size</option>
              {["Compact", "Medium", "Large"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Room Occupation">
            <Select
              value={details.roomOccupation}
              onChange={(event) => onDetailsChange("roomOccupation", event.target.value)}
            >
              {roomOccupationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="mt-4">
          <p className="text-[0.72rem] font-medium text-slate-500">Main Facilities</p>
          <div className="mt-2 space-y-1.5">
            {facilityOptions.map((facility) => (
              <label key={facility} className="flex items-center gap-2 text-sm text-[#18399F]">
                <input
                  type="checkbox"
                  checked={details.facilities.includes(facility)}
                  onChange={() => onFacilityToggle(facility)}
                  className="size-3.5 accent-[#18399F]"
                />
                <span>{facility}</span>
              </label>
            ))}
          </div>
        </div>
      </Panel>

      <Panel title="Tenant Assignment">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Assigned Tenant Name">
            <Input
              value={details.assignedTenantName || ""}
              onChange={(event) =>
                onDetailsChange("assignedTenantName", event.target.value)
              }
              placeholder="Mabel Tetteh"
            />
          </Field>

          <Field label="Assigned Tenant Email">
            <Input
              type="email"
              value={details.assignedTenantEmail || ""}
              onChange={(event) =>
                onDetailsChange("assignedTenantEmail", event.target.value)
              }
              placeholder="tenant@example.com"
            />
          </Field>

          <Field label="Move-In Date">
            <Input
              type="date"
              value={details.moveInDate || ""}
              onChange={(event) => onDetailsChange("moveInDate", event.target.value)}
            />
          </Field>

          <Field label="Tenant Status">
            <Select
              value={details.tenantStatus || "Pending"}
              onChange={(event) => onDetailsChange("tenantStatus", event.target.value)}
            >
              {["Active", "Pending", "Inactive"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-500">
          Published properties only appear in the tenant portal when the tenant is
          assigned by email or name.
        </p>
      </Panel>
    </div>
  );
}

function PricingStep({ pricing, errors, onDurationChange, onPricingChange }) {
  return (
    <Panel title="Pricing" className="min-h-[22rem]">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Set Your Price *" error={errors.price}>
          <Input
            value={pricing.price}
            inputMode="numeric"
            onChange={(event) =>
              onPricingChange("price", sanitizeDigits(event.target.value))
            }
            className={errors.price ? "border-rose-300 focus:border-rose-500" : ""}
          />
        </Field>

        <Field label="Negotiable *" error={errors.negotiable}>
          <Select
            value={pricing.negotiable}
            onChange={(event) => onPricingChange("negotiable", event.target.value)}
            className={errors.negotiable ? "border-rose-300 focus:border-rose-500" : ""}
          >
            {Array.from(new Set([pricing.negotiable, "Yes", "No"]))
              .filter(Boolean)
              .map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
          </Select>
        </Field>
      </div>

      <div className="mt-5">
        <Field label="Duration (in a Year) *" error={errors.duration}>
          <div className="flex flex-wrap items-center gap-3">
            <DurationControl
              value={pricing.duration}
              onDecrease={() => onDurationChange(Math.max(1, pricing.duration - 1))}
              onIncrease={() => onDurationChange(pricing.duration + 1)}
            />
            <span className="text-sm text-slate-500">
              {formatDurationLabel(pricing.duration)}
            </span>
          </div>
        </Field>
      </div>
    </Panel>
  );
}

function ImageStep({
  errors,
  gallery,
  mediaReady,
  onGalleryUpload,
  onMediaReadyChange,
  onRemoveImage,
}) {
  return (
    <Panel title="Image of House">
      <label className="block cursor-pointer rounded-[1rem] border border-dashed border-[#BFD0F3] bg-[#FBFDFF] px-6 py-10 text-center transition-colors duration-300 hover:border-[#18399F]">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#EEF4FF] text-[#18399F]">
          <ImageUp className="size-8" />
        </div>
        <p className="mt-4 text-sm font-semibold text-[#18399F]">
          Click to upload
          <span className="ml-1 font-normal text-slate-500">
            or drag and drop
          </span>
        </p>
        <p className="mt-2 text-xs text-slate-400">
          SVG, PNG, JPG, or GIF (max 800x400px)
        </p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onGalleryUpload}
          className="hidden"
        />
      </label>

      {errors.gallery ? (
        <p className="mt-3 text-xs font-medium text-rose-600">{errors.gallery}</p>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {gallery.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className="relative overflow-hidden rounded-[1rem] border border-[#D7E0F1] bg-[#F7F9FF] shadow-[0_10px_20px_rgba(15,32,86,0.05)]"
          >
            <img
              src={image}
              alt={`Property preview ${index + 1}`}
              className="h-28 w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemoveImage(index)}
              className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-[#07163F]/75 text-white transition-colors duration-300 hover:bg-[#07163F]"
              aria-label={`Remove property image ${index + 1}`}
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <label className="mt-5 flex items-start gap-2 text-sm text-slate-500">
        <input
          type="checkbox"
          checked={mediaReady}
          onChange={(event) => onMediaReadyChange(event.target.checked)}
          className="mt-1 size-4 accent-[#18399F]"
        />
        <span>
          I agree to all policies and confirm the property media is ready for publication.
        </span>
      </label>

      {errors.mediaReady ? (
        <p className="mt-2 text-xs font-medium text-rose-600">{errors.mediaReady}</p>
      ) : null}
    </Panel>
  );
}

function CompletedStep({ isPublished, onPublish, onResetForm, preview }) {
  return (
    <Panel
      title=""
      className="flex min-h-[26rem] items-center justify-center rounded-[1.6rem]"
    >
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto grid size-24 place-items-center rounded-full bg-[radial-gradient(circle_at_top,#DCE8FF_0%,#EEF4FF_62%,#FFFFFF_100%)] text-[#18399F] shadow-[0_18px_28px_rgba(15,32,86,0.10)]">
          <Send className="size-10" />
        </div>
        <h3 className="mt-6 text-[2rem] font-black tracking-[-0.03em] text-[#111827]">
          Property Details Complete
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          Your property draft is ready. Review the preview card, then post it to publish
          the listing for tenants to discover.
        </p>

        <div className="mt-6 rounded-[1rem] border border-[#D8E0F1] bg-[#F8FAFF] p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3656B7]">
            Ready to publish
          </p>
          <p className="mt-2 text-sm font-semibold text-[#111827]">{preview.title}</p>
          <p className="mt-1 text-sm text-slate-500">{preview.location}</p>
          <p className="mt-3 text-sm font-semibold text-[#18399F]">{preview.code}</p>
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onPublish}
            disabled={isPublished}
            className={classNames(
              "inline-flex items-center gap-2 rounded-[0.9rem] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(24,57,159,0.24)] transition",
              isPublished
                ? "cursor-not-allowed bg-[#93A8E6] shadow-none"
                : "bg-[#18399F] hover:bg-[#102A74]"
            )}
          >
            <span>{isPublished ? "Published" : "Post"}</span>
            <ArrowRight className="size-4" />
          </button>

          {isPublished ? (
            <button
              type="button"
              onClick={onResetForm}
              className="rounded-[0.9rem] border border-[#CAD5ED] bg-white px-6 py-3 text-sm font-semibold text-[#18399F] transition hover:border-[#18399F]"
            >
              Add Another Property
            </button>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}

export default function LandlordDashboardView() {
  const { logout, updateUser, user } = useAuth();
  const {
    deleteProperty,
    properties,
    publishProperty,
    savePropertyDraft,
    unpublishProperty,
  } = usePropertyStore();
  const { data } = landlordDashboardResponse;
  const facilityOptions = Array.from(new Set(data.propertyDetails.facilities));
  const [activeStep, setActiveStep] = useState(0);
  const normalizedNavSections = data.navSections.map((section) => ({
    ...section,
    id: createId(section.title),
    items: section.items.map((item) => normalizeNavItem(item)),
  }));
  const preferenceSection = normalizedNavSections.find(
    (section) => section.id === "preferences"
  );
  const mainNavSections = normalizedNavSections.filter(
    (section) => section.id !== "preferences"
  );
  const allItems = [
    ...mainNavSections.flatMap((section) => section.items),
    ...(preferenceSection?.items ?? []),
  ];
  const profileName = user?.name ?? data.user.name;
  const profileAvatar = user?.avatar ?? null;
  const initials = deriveInitials(profileName, data.user.initials);
  const initialExpandedSections = mainNavSections.reduce(
    (accumulator, section) => ({
      ...accumulator,
      [section.id]: true,
    }),
    {}
  );
  const [activeItemId, setActiveItemId] = useState(
    createId(defaultActiveItemLabel)
  );
  const [expandedSections, setExpandedSections] = useState(
    initialExpandedSections
  );
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileDraftName, setProfileDraftName] = useState(profileName);
  const [profileDraftAvatar, setProfileDraftAvatar] = useState(profileAvatar);
  const [propertyDraft, setPropertyDraft] = useState(() =>
    createInitialPropertyDraft(data)
  );
  const [validationErrors, setValidationErrors] = useState(createEmptyValidationState);
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  const [publishMessage, setPublishMessage] = useState("");
  const [tenantRecords] = useState(data.tenants);
  const [tenantApplications, setTenantApplications] = useState(
    data.tenantApplications
  );
  const [rentalApplications, setRentalApplications] = useState(
    data.rentalApplications
  );
  const [tenantReviews, setTenantReviews] = useState(data.tenantReviews);
  const [paymentRecords] = useState(data.payments);
  const [outstandingRentRecords] = useState(data.outstandingRent);
  const [receiptRecords, setReceiptRecords] = useState(data.receipts);
  const [viewingRequests, setViewingRequests] = useState(data.viewingRequests);
  const [payoutRecords, setPayoutRecords] = useState(data.payouts);
  const [announcementRecords, setAnnouncementRecords] = useState(
    data.announcements
  );
  const [issueRecords, setIssueRecords] = useState(data.issues);
  const [chatConversations, setChatConversations] = useState(
    data.chatConversations
  );
  const [documentRecords, setDocumentRecords] = useState(data.documents);
  const [verificationState, setVerificationState] = useState(
    data.verification
  );
  const [settingsState, setSettingsState] = useState(data.settings);
  const [termsAccepted, setTermsAccepted] = useState(
    data.termsAndConditions.accepted
  );
  const [paymentHistorySearchSeed, setPaymentHistorySearchSeed] = useState("");
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  useBodyScrollLock(isProfileModalOpen || isMobileNavOpen);

  useEffect(() => {
    if (!(isProfileModalOpen || isMobileNavOpen)) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      if (isProfileModalOpen) {
        setIsProfileModalOpen(false);
        return;
      }

      if (isMobileNavOpen) {
        setIsMobileNavOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileNavOpen, isProfileModalOpen]);

  const activeItem =
    allItems.find((item) => item.id === activeItemId) ?? allItems[0];
  const activeSection =
    normalizedNavSections.find((section) =>
      section.items.some((item) => item.id === activeItemId)
    ) ??
    mainNavSections[0] ??
    preferenceSection;
  const activeSectionTitle = activeSection?.title ?? "Dashboard";
  const activeItemLabel = activeItem?.label ?? defaultActiveItemLabel;
  const isActiveSectionExpanded =
    activeSection?.id && activeSection.id !== "preferences"
      ? Boolean(expandedSections[activeSection.id])
      : true;
  const isCompletedStep = activeStep === data.steps.length - 1;
  const preview = buildPropertyPreview(propertyDraft, data.preview, isPublished);
  const landlordAccount = {
    id: user?.id ?? "landlord-admin",
    name: profileName,
  };
  const availablePayoutBalance = Math.max(
    0,
    data.earnings.entries.reduce((sum, entry) => sum + entry.amount, 0) -
      payoutRecords
        .filter((payout) => payout.status !== "Failed")
        .reduce((sum, payout) => sum + payout.amount, 0)
  );

  const showFeedback = (message, tone = "success") => {
    if (tone === "error") {
      showErrorToast(message);
      return;
    }

    if (tone === "info") {
      showInfoToast(message);
      return;
    }

    showSuccessToast(message);
  };

  const ensureConversationOpen = ({
    contactId,
    name,
    phone = "",
    propertyName = "Direct Conversation",
    roleLabel = "Applicant",
  }) => {
    const nextConversationId = `conversation-${createId(contactId || `${name}-${propertyName}`)}`;

    setChatConversations((current) => {
      if (current.some((conversation) => conversation.id === nextConversationId)) {
        return current;
      }

      return [
        {
          id: nextConversationId,
          tenantName: name,
          propertyName,
          roleLabel,
          online: false,
          phone,
          messages: [],
        },
        ...current,
      ];
    });

    setSelectedConversationId(nextConversationId);
    selectNavItemByLabel("Messages");

    return nextConversationId;
  };

  const handleOpenProfileModal = () => {
    setProfileDraftName(profileName);
    setProfileDraftAvatar(profileAvatar);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileDraftAvatar(reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleProfileSave = () => {
    const nextName = profileDraftName.trim() || profileName;

    updateUser({
      ...(user ?? {}),
      avatar: profileDraftAvatar ?? null,
      email: user?.email ?? "landlord@example.com",
      id: user?.id ?? "usr_landlord_01",
      name: nextName,
      role: user?.role ?? data.user.role,
    });
    setSettingsState((current) => ({
      ...current,
      profile: {
        ...current.profile,
        avatar: profileDraftAvatar ?? null,
        name: nextName,
      },
    }));
    setIsProfileModalOpen(false);
    showFeedback("Profile updated successfully.");
  };

  const handleSectionToggle = (sectionId) => {
    setExpandedSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };

  const resetDraftStatus = () => {
    setIsPublished(false);
    setPublishMessage("");
  };

  const clearStepError = (stepKey, field) => {
    setValidationErrors((current) => {
      if (!current[stepKey]?.[field]) {
        return current;
      }

      const nextStepErrors = {
        ...current[stepKey],
      };

      delete nextStepErrors[field];

      return {
        ...current,
        [stepKey]: nextStepErrors,
      };
    });
  };

  const validateStep = (stepIndex) => {
    const stepKey = ["details", "pricing", "image"][stepIndex];

    if (!stepKey) {
      return {};
    }

    const nextErrors = validatePropertyStep(stepIndex, propertyDraft);

    setValidationErrors((current) => ({
      ...current,
      [stepKey]: nextErrors,
    }));

    return nextErrors;
  };

  const resetPropertyDraft = () => {
    setPropertyDraft(createInitialPropertyDraft(data));
    setValidationErrors(createEmptyValidationState());
    setEditingPropertyId(null);
    resetDraftStatus();
    setActiveStep(0);
  };

  const handleDetailsChange = (field, value) => {
    setPropertyDraft((current) => ({
      ...current,
      details: {
        ...current.details,
        [field]: value,
      },
    }));
    clearStepError("details", field);
    resetDraftStatus();
  };

  const handleFacilityToggle = (facility) => {
    setPropertyDraft((current) => {
      const nextFacilities = current.details.facilities.includes(facility)
        ? current.details.facilities.filter((item) => item !== facility)
        : [...current.details.facilities, facility];

      return {
        ...current,
        details: {
          ...current.details,
          facilities: nextFacilities,
        },
      };
    });
    resetDraftStatus();
  };

  const handlePricingChange = (field, value) => {
    setPropertyDraft((current) => ({
      ...current,
      pricing: {
        ...current.pricing,
        [field]: value,
      },
    }));
    clearStepError("pricing", field);
    resetDraftStatus();
  };

  const handleDurationChange = (value) => {
    setPropertyDraft((current) => ({
      ...current,
      pricing: {
        ...current.pricing,
        duration: Math.max(1, Number(value) || 1),
      },
    }));
    clearStepError("pricing", "duration");
    resetDraftStatus();
  };

  const handleGalleryUpload = async (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    try {
      const nextImages = await Promise.all(
        files.slice(0, 6).map((file) => readFileAsDataUrl(file))
      );

      setPropertyDraft((current) => ({
        ...current,
        gallery: [...current.gallery, ...nextImages].slice(0, 6),
      }));
      clearStepError("image", "gallery");
      resetDraftStatus();
    } catch {
      setValidationErrors((current) => ({
        ...current,
        image: {
          ...current.image,
          gallery: "We could not read one of those images. Please try again.",
        },
      }));
    }
  };

  const handleRemoveImage = (index) => {
    setPropertyDraft((current) => ({
      ...current,
      gallery: current.gallery.filter((_, imageIndex) => imageIndex !== index),
    }));
    resetDraftStatus();
  };

  const handleMediaReadyChange = (checked) => {
    setPropertyDraft((current) => ({
      ...current,
      mediaReady: checked,
    }));
    clearStepError("image", "mediaReady");
    resetDraftStatus();
  };

  const handleSelectItem = (sectionId, item) => {
    if (item.label === "Sign Out") {
      logout();
      return;
    }

    if (sectionId !== "preferences") {
      setExpandedSections((current) => ({
        ...current,
        [sectionId]: true,
      }));
    }

    setActiveItemId(item.id);
    setIsMobileNavOpen(false);
  };

  const selectNavItemByLabel = (label) => {
    const matchedSection = normalizedNavSections.find((section) =>
      section.items.some((item) => item.label === label)
    );
    const matchedItem = matchedSection?.items.find((item) => item.label === label);

    if (matchedSection && matchedItem) {
      handleSelectItem(matchedSection.id, matchedItem);
    }
  };

  const handleHeaderSectionToggle = () => {
    if (activeSection?.id && activeSection.id !== "preferences") {
      handleSectionToggle(activeSection.id);
      return;
    }

    selectNavItemByLabel("Settings");
  };

  const updateApplicationStatus = (setRecords, recordId, nextStatus, label) => {
    let nextApplicantName = "Application";

    setRecords((current) =>
      current.map((application) => {
        if (application.id !== recordId) {
          return application;
        }

        nextApplicantName = application.applicantName;

        return {
          ...application,
          isNew: false,
          status: nextStatus,
        };
      })
    );

    showFeedback(`${label} for ${nextApplicantName} marked ${nextStatus.toLowerCase()}.`);
  };

  const handleApproveTenantApplication = (recordId) => {
    updateApplicationStatus(
      setTenantApplications,
      recordId,
      "Approved",
      "Tenant application"
    );
  };

  const handleRejectTenantApplication = (recordId) => {
    updateApplicationStatus(
      setTenantApplications,
      recordId,
      "Rejected",
      "Tenant application"
    );
  };

  const handleApproveRentalApplication = (recordId) => {
    updateApplicationStatus(
      setRentalApplications,
      recordId,
      "Approved",
      "Rental application"
    );
  };

  const handleRejectRentalApplication = (recordId) => {
    updateApplicationStatus(
      setRentalApplications,
      recordId,
      "Rejected",
      "Rental application"
    );
  };

  const handleReplyToReview = (reviewId, response) => {
    let reviewAuthor = "the tenant";

    setTenantReviews((current) =>
      current.map((review) => {
        if (review.id !== reviewId) {
          return review;
        }

        reviewAuthor = review.tenantName;

        return {
          ...review,
          response,
        };
      })
    );

    showFeedback(`Response saved for ${reviewAuthor}.`);
  };

  const handleViewPaymentHistory = (tenant) => {
    setPaymentHistorySearchSeed(tenant.fullName);
    selectNavItemByLabel("Payment History");
  };

  const openConversationForRecord = (record, roleLabel = "Tenant") => {
    const conversationId =
      record.conversationId ??
      ensureConversationOpen({
        contactId: record.id ?? record.applicantName ?? record.tenantName,
        name: record.fullName ?? record.tenantName ?? record.applicantName,
        phone: record.phone ?? record.contactPhone,
        propertyName: record.propertyName,
        roleLabel,
      });

    setSelectedConversationId(conversationId);
    selectNavItemByLabel("Messages");
  };

  const handleMessageTenant = (record) => {
    openConversationForRecord(record, "Tenant");
    showFeedback(
      `Opening messages with ${record.fullName ?? record.tenantName}.`,
      "info"
    );
  };

  const handleMessageApplicant = (record) => {
    openConversationForRecord(
      {
        ...record,
        id: record.id,
        tenantName: record.applicantName,
      },
      "Applicant"
    );
    showFeedback(`Opening messages with ${record.applicantName}.`, "info");
  };

  const handleOpenConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    setChatConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: conversation.messages.map((message) =>
                message.sender === "tenant"
                  ? {
                      ...message,
                      readByLandlord: true,
                    }
                  : message
              ),
            }
          : conversation
      )
    );
  };

  const handleSendMessage = (conversationId, draft) => {
    const nextText = draft.text?.trim() ?? "";

    if (!nextText && !(draft.attachments?.length > 0)) {
      return;
    }

    let conversationName = "the conversation";

    setChatConversations((current) =>
      current.map((conversation) => {
        if (conversation.id !== conversationId) {
          return conversation;
        }

        conversationName = conversation.tenantName;

        return {
          ...conversation,
          messages: [
            ...conversation.messages.map((message) =>
              message.sender === "tenant"
                ? {
                    ...message,
                    readByLandlord: true,
                  }
                : message
            ),
            {
              id: `message-${Date.now()}`,
              sender: "landlord",
              text: nextText,
              timestamp: new Date().toISOString(),
              attachments: draft.attachments,
            },
          ],
        };
      })
    );

    showFeedback(`Message sent to ${conversationName}.`);
  };

  const handleIssueReceipt = (payment) => {
    if (payment.status !== "Successful") {
      showFeedback("Only successful payments can generate a receipt.", "error");
      return;
    }

    const existingReceipt =
      receiptRecords.find((receipt) => receipt.paymentId === payment.id) ?? null;

    if (existingReceipt) {
      setSelectedReceiptId(existingReceipt.id);
      selectNavItemByLabel("Receipts");
      showFeedback(`Opened existing receipt ${existingReceipt.id}.`, "info");
      return;
    }

    const linkedTenant = tenantRecords.find((tenant) => tenant.id === payment.tenantId);
    const nextReceipt = {
      id: `RCT-${new Date(payment.paymentDate).toISOString().slice(0, 10).replace(/-/g, "")}-${payment.id.slice(-2)}`,
      paymentId: payment.id,
      paymentDate: payment.paymentDate,
      amount: payment.amount,
      totalPaid: payment.amount,
      landlordName: data.landlordProfile.businessName,
      landlordEmail: data.landlordProfile.email,
      landlordPhone: data.landlordProfile.phone,
      tenantName: payment.tenantName,
      tenantEmail: linkedTenant?.email ?? "tenant@example.com",
      tenantPhone: linkedTenant?.phone ?? "",
      propertyName: payment.propertyName,
      propertyDetails: `${payment.unit}, ${payment.propertyName}`,
      paymentBreakdown: {
        rent: payment.amount,
        utilities: 0,
        fees: 0,
      },
      paymentMethod: payment.paymentMethod,
      status: payment.status,
    };

    setReceiptRecords((current) => [nextReceipt, ...current]);
    setSelectedReceiptId(nextReceipt.id);
    selectNavItemByLabel("Receipts");
    showFeedback(`Receipt ${nextReceipt.id} generated for ${payment.tenantName}.`);
  };

  const handleResendReceipt = (receipt) => {
    showFeedback(`Receipt ${receipt.id} re-sent to ${receipt.tenantName}.`);
  };

  const handleConfirmViewingRequest = (requestId) => {
    let applicantName = "Applicant";

    setViewingRequests((current) =>
      current.map((request) => {
        if (request.id !== requestId) {
          return request;
        }

        applicantName = request.applicantName;

        return {
          ...request,
          status: "Confirmed",
        };
      })
    );

    showFeedback(`Viewing confirmed for ${applicantName}.`);
  };

  const handleDeclineViewingRequest = (requestId) => {
    let applicantName = "Applicant";

    setViewingRequests((current) =>
      current.map((request) => {
        if (request.id !== requestId) {
          return request;
        }

        applicantName = request.applicantName;

        return {
          ...request,
          status: "Cancelled",
        };
      })
    );

    showFeedback(`Viewing request declined for ${applicantName}.`);
  };

  const handleRescheduleViewingRequest = (requestId, nextDateTime) => {
    let applicantName = "Applicant";

    setViewingRequests((current) =>
      current.map((request) => {
        if (request.id !== requestId) {
          return request;
        }

        applicantName = request.applicantName;

        return {
          ...request,
          preferredDateTime: nextDateTime,
          status: "Confirmed",
        };
      })
    );

    showFeedback(`Viewing rescheduled for ${applicantName}.`);
  };

  const handleRequestPayout = ({ amount, paymentMethod }) => {
    if (!amount || amount <= 0) {
      showFeedback("Enter a valid payout amount first.", "error");
      return;
    }

    if (amount > availablePayoutBalance) {
      showFeedback("That payout amount is above the available balance.", "error");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const nextPayout = {
      id: `PO-${today.replace(/-/g, "")}-${String(payoutRecords.length + 1).padStart(2, "0")}`,
      amount,
      dateRequested: today,
      dateProcessed: "",
      status: "Pending",
      paymentMethod: paymentMethod === "mobile-money" ? "Mobile Money" : "Bank",
      destination:
        paymentMethod === "mobile-money"
          ? "MTN MoMo **** 3012"
          : "GCB Bank **** 1420",
      timeline: [
        { label: "Requested", date: today, complete: true },
        { label: "Processed", date: "", complete: false },
        { label: "Completed", date: "", complete: false },
      ],
    };

    setPayoutRecords((current) => [nextPayout, ...current]);
    showFeedback(`Payout request ${nextPayout.id} submitted.`);
  };

  const handleCreateAnnouncement = ({ category, content, isImportant, title }) => {
    if (!title.trim() || !content.trim()) {
      showFeedback("Add both an announcement title and content.", "error");
      return;
    }

    const nextAnnouncement = {
      id: `announcement-${Date.now()}`,
      title: title.trim(),
      category,
      content: content.trim(),
      authorName: profileName,
      authorRole: "Landlord",
      datePosted: new Date().toISOString(),
      isImportant,
      isRead: false,
    };

    setAnnouncementRecords((current) => [nextAnnouncement, ...current]);
    showFeedback("Announcement published.");
  };

  const handleOpenAnnouncement = (announcementId) => {
    setAnnouncementRecords((current) =>
      current.map((announcement) =>
        announcement.id === announcementId
          ? {
              ...announcement,
              isRead: true,
            }
          : announcement
      )
    );
  };

  const handleUpdateIssueStatus = (issueId, nextStatus) => {
    let tenantName = "the tenant";

    setIssueRecords((current) =>
      current.map((issue) => {
        if (issue.id !== issueId) {
          return issue;
        }

        tenantName = issue.tenantName;

        return {
          ...issue,
          status: nextStatus,
        };
      })
    );

    showFeedback(`Issue status updated for ${tenantName}.`);
  };

  const handleSendReminder = (record) => {
    showFeedback(`Reminder sent to ${record.tenantName}.`);
  };

  const handleDeleteDocument = (documentId) => {
    const nextDocument = documentRecords.find((document) => document.id === documentId);

    if (
      typeof window !== "undefined" &&
      nextDocument &&
      !window.confirm(`Delete ${nextDocument.name}?`)
    ) {
      return;
    }

    setDocumentRecords((current) =>
      current.filter((document) => document.id !== documentId)
    );

    if (nextDocument) {
      showFeedback(`${nextDocument.name} deleted.`);
    }
  };

  const handleUploadDocument = (documentDraft) => {
    if (
      !documentDraft.name.trim() ||
      !documentDraft.relatedName.trim() ||
      !documentDraft.propertyName.trim()
    ) {
      showFeedback("Complete the document name, related name, and property fields.", "error");
      return;
    }

    const nextDocument = {
      id: `document-${Date.now()}`,
      name: documentDraft.name.trim(),
      section: documentDraft.section,
      relatedName: documentDraft.relatedName.trim(),
      propertyName: documentDraft.propertyName.trim(),
      uploadDate: new Date().toISOString().slice(0, 10),
      fileType: documentDraft.fileType,
      size: "New upload",
    };

    setDocumentRecords((current) => [nextDocument, ...current]);
    showFeedback(`${nextDocument.name} uploaded.`);
  };

  const handleUploadVerificationDocument = (documentDraft) => {
    if (!documentDraft.name.trim()) {
      showFeedback("Add a document name before uploading.", "error");
      return;
    }

    const nextDocument = {
      id: `verification-${Date.now()}`,
      name: documentDraft.name.trim(),
      section: documentDraft.section,
      uploadDate: new Date().toISOString().slice(0, 10),
      status: "Under Review",
      reason: "",
      fileType: documentDraft.fileType,
    };

    setVerificationState((current) => ({
      ...current,
      documents: [nextDocument, ...current.documents],
      overallStatus: "Pending",
      steps: current.steps.map((step) => {
        if (
          documentDraft.section === "Identity Verification" &&
          step.id === "identity-docs"
        ) {
          return {
            ...step,
            complete: true,
          };
        }

        if (
          documentDraft.section === "Property Ownership Verification" &&
          step.id === "property-docs"
        ) {
          return {
            ...step,
            complete: true,
          };
        }

        return step;
      }),
    }));

    showFeedback(`${nextDocument.name} uploaded for review.`);
  };

  const handleSaveSettings = (nextSettings) => {
    setSettingsState(nextSettings);
    updateUser({
      ...(user ?? {}),
      avatar: nextSettings.profile.avatar ?? profileAvatar ?? null,
      email: nextSettings.profile.email,
      id: user?.id ?? "usr_landlord_01",
      name: nextSettings.profile.name,
      role: user?.role ?? data.user.role,
    });
    showFeedback("Settings saved.");
  };

  const handleToggleTermsAcceptance = (accepted) => {
    setTermsAccepted(accepted);
    showFeedback(
      accepted ? "Terms accepted." : "Terms marked as pending.",
      accepted ? "success" : "info"
    );
  };

  const handleOpenSupportChat = () => {
    selectNavItemByLabel("Messages");
    showFeedback("Support can continue in the messages workspace.", "info");
  };

  const handleNextStep = () => {
    const nextErrors = validateStep(activeStep);

    if (hasStepErrors(nextErrors)) {
      return;
    }

    setActiveStep((currentStep) => Math.min(currentStep + 1, data.steps.length - 1));
  };

  const handleSelectStep = (nextStep) => {
    if (nextStep <= activeStep) {
      setActiveStep(nextStep);
      return;
    }

    for (let stepIndex = 0; stepIndex < nextStep; stepIndex += 1) {
      const nextErrors = validateStep(stepIndex);

      if (hasStepErrors(nextErrors)) {
        setActiveStep(stepIndex);
        return;
      }
    }

    setActiveStep(nextStep);
  };

  const handleCreateProperty = () => {
    resetPropertyDraft();
    selectNavItemByLabel("Add Property");
  };

  const handleEditProperty = (property) => {
    setEditingPropertyId(property.id);
    setPropertyDraft(clonePropertyDraft(property.draft));
    setValidationErrors(createEmptyValidationState());
    setIsPublished(false);
    setPublishMessage(
      property.workflowStatus === "published"
        ? "Editing a published property. Publish again to sync changes for tenants."
        : "Editing a hidden property. Publish it when you are ready to show it to tenants."
    );
    setActiveStep(0);
    selectNavItemByLabel("Add Property");
  };

  const handleDeleteManagedProperty = (property) => {
    deleteProperty(property.id);

    if (editingPropertyId === property.id) {
      resetPropertyDraft();
    }
  };

  const handleTogglePropertyPublication = (property) => {
    if (property.workflowStatus === "published") {
      unpublishProperty(property.id);

      if (editingPropertyId === property.id) {
        setIsPublished(false);
        setPublishMessage(
          `${property.summary.title} was unpublished and is now hidden from tenants.`
        );
      }

      return;
    }

    publishProperty(property.id);

    if (editingPropertyId === property.id) {
      setIsPublished(true);
      setPublishMessage(
        `${property.summary.title} was published and is now visible to assigned tenants.`
      );
    }
  };

  const handlePublish = () => {
    for (let stepIndex = 0; stepIndex < data.steps.length - 1; stepIndex += 1) {
      const nextErrors = validateStep(stepIndex);

      if (hasStepErrors(nextErrors)) {
        setActiveStep(stepIndex);
        return;
      }
    }

    const savedProperty = savePropertyDraft({
      draft: propertyDraft,
      fallbackPreview: data.preview,
      landlord: landlordAccount,
      propertyId: editingPropertyId,
    });

    if (!savedProperty) {
      return;
    }

    publishProperty(savedProperty.id, savedProperty);

    const publishedOn = new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date());

    setEditingPropertyId(savedProperty.id);
    setIsPublished(true);
    setPublishMessage(`${savedProperty.summary.title} was published on ${publishedOn}.`);
    setActiveStep(data.steps.length - 1);
  };

  const contentByStep = [
    <DetailsStep
      key="details"
      details={propertyDraft.details}
      errors={validationErrors.details}
      facilityOptions={facilityOptions}
      onDetailsChange={handleDetailsChange}
      onFacilityToggle={handleFacilityToggle}
    />,
    <PricingStep
      key="pricing"
      pricing={propertyDraft.pricing}
      errors={validationErrors.pricing}
      onDurationChange={handleDurationChange}
      onPricingChange={handlePricingChange}
    />,
    <ImageStep
      key="image"
      errors={validationErrors.image}
      gallery={propertyDraft.gallery}
      mediaReady={propertyDraft.mediaReady}
      onGalleryUpload={handleGalleryUpload}
      onMediaReadyChange={handleMediaReadyChange}
      onRemoveImage={handleRemoveImage}
    />,
    <CompletedStep
      key="completed"
      isPublished={isPublished}
      onPublish={handlePublish}
      onResetForm={resetPropertyDraft}
      preview={preview}
    />,
  ];

  const renderMyPropertiesView = () => (
    <LandlordMyPropertiesView
      onCreateProperty={handleCreateProperty}
      onDeleteProperty={handleDeleteManagedProperty}
      onEditProperty={handleEditProperty}
      onPublishToggle={handleTogglePropertyPublication}
      properties={properties}
    />
  );

  const renderPropertyListingsView = () => (
    <LandlordPropertyListingsView
      onManageProperties={() => selectNavItemByLabel("My Properties")}
      onOpenAddProperty={handleCreateProperty}
      properties={properties}
    />
  );

  const renderAddPropertyView = () => (
    <AddPropertyView
      activeStep={activeStep}
      contentByStep={contentByStep}
      data={data}
      isPrimaryDisabled={isCompletedStep && isPublished}
      onAnnouncement={() => selectNavItemByLabel("Announcement")}
      onMessages={() => selectNavItemByLabel("Messages")}
      onOpenProfileModal={handleOpenProfileModal}
      onPrimaryAction={isCompletedStep ? handlePublish : handleNextStep}
      onResetForm={resetPropertyDraft}
      preview={preview}
      primaryActionLabel={
        isCompletedStep
          ? isPublished
            ? "Published"
            : editingPropertyId
              ? "Update & Publish"
              : "Publish"
          : "Next"
      }
      publishMessage={publishMessage}
      onSelectStep={handleSelectStep}
    />
  );

  const dedicatedView = (() => {
    switch (activeItemLabel) {
      case "My Properties":
        return renderMyPropertiesView();
      case "Add Property":
        return renderAddPropertyView();
      case "Property Listings":
        return renderPropertyListingsView();
      case "My Tenants":
        return (
          <LandlordTenantsView
            onMessageTenant={handleMessageTenant}
            onViewPaymentHistory={handleViewPaymentHistory}
            tenants={tenantRecords}
          />
        );
      case "Tenant Application":
        return (
          <LandlordApplicationsView
            applications={tenantApplications}
            description="Review incoming tenant applications, inspect full profiles, and approve or reject them with minimal back-and-forth."
            eyebrow="Incoming Applications"
            onApprove={handleApproveTenantApplication}
            onReject={handleRejectTenantApplication}
            title="Tenant Application"
          />
        );
      case "Tenant Reviews":
        return (
          <LandlordReviewsView
            onReply={handleReplyToReview}
            reviews={tenantReviews}
          />
        );
      case "Rent Payments":
        return (
          <LandlordRentPaymentsView
            onIssueReceipt={handleIssueReceipt}
            payments={paymentRecords}
            tenants={tenantRecords}
          />
        );
      case "Payment History":
        return (
          <LandlordPaymentHistoryView
            key={paymentHistorySearchSeed || "payment-history"}
            initialSearchValue={paymentHistorySearchSeed}
            payments={paymentRecords}
          />
        );
      case "Outstanding Rent":
        return (
          <LandlordOutstandingRentView
            onContactTenant={handleMessageTenant}
            onSendReminder={handleSendReminder}
            outstandingRent={outstandingRentRecords}
          />
        );
      case "Receipts":
        return (
          <LandlordReceiptsView
            key={selectedReceiptId ?? "receipts"}
            initialSelectedReceiptId={selectedReceiptId}
            onResendReceipt={handleResendReceipt}
            receipts={receiptRecords}
          />
        );
      case "Viewing Request":
        return (
          <LandlordViewingRequestsView
            onConfirm={handleConfirmViewingRequest}
            onDecline={handleDeclineViewingRequest}
            onMessageApplicant={handleMessageApplicant}
            onReschedule={handleRescheduleViewingRequest}
            requests={viewingRequests}
          />
        );
      case "Rental Application":
        return (
          <LandlordApplicationsView
            applications={rentalApplications}
            description="Track listing-specific applications, compare applicants by property, and make quick approval decisions."
            eyebrow="Rental Applications"
            onApprove={handleApproveRentalApplication}
            onReject={handleRejectRentalApplication}
            title="Rental Application"
          />
        );
      case "Payouts":
        return (
          <LandlordPayoutsView
            availableBalance={availablePayoutBalance}
            onRequestPayout={handleRequestPayout}
            payouts={payoutRecords}
          />
        );
      case "Commission":
        return <LandlordCommissionView commission={data.commission} />;
      case "Earnings":
        return <LandlordEarningsView earnings={data.earnings} />;
      case "Messages":
        return (
          <LandlordMessagesView
            key={selectedConversationId ?? "messages"}
            conversations={chatConversations}
            initialConversationId={selectedConversationId}
            landlordName={profileName}
            onOpenConversation={handleOpenConversation}
            onSendMessage={handleSendMessage}
          />
        );
      case "Announcement":
        return (
          <LandlordAnnouncementsView
            announcements={announcementRecords}
            onCreateAnnouncement={handleCreateAnnouncement}
            onOpenAnnouncement={handleOpenAnnouncement}
          />
        );
      case "Issues":
        return (
          <LandlordIssuesView
            issues={issueRecords}
            onMessageTenant={handleMessageTenant}
            onUpdateStatus={handleUpdateIssueStatus}
          />
        );
      case "Documents":
        return (
          <LandlordDocumentsView
            documents={documentRecords}
            onDeleteDocument={handleDeleteDocument}
            onUploadDocument={handleUploadDocument}
          />
        );
      case "Analytics":
        return <LandlordAnalyticsView analytics={data.analytics} />;
      case "Verification":
        return (
          <LandlordVerificationView
            onUploadVerificationDocument={handleUploadVerificationDocument}
            verification={verificationState}
          />
        );
      case "Settings":
        return (
          <LandlordSettingsView
            key={`${settingsState.profile.name}-${settingsState.profile.email}`}
            onSaveSettings={handleSaveSettings}
            settings={settingsState}
          />
        );
      case "Help":
        return (
          <LandlordHelpView
            helpCenter={data.helpCenter}
            onStartSupportChat={handleOpenSupportChat}
          />
        );
      case "Terms & Conditions":
        return (
          <LandlordTermsView
            accepted={termsAccepted}
            onToggleAccepted={handleToggleTermsAcceptance}
            terms={data.termsAndConditions}
          />
        );
      default:
        return <EmptyDashboardView title={activeItemLabel} />;
    }
  })();

  return (
    <div className="min-h-screen bg-white text-[#18399F]">
      <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:grid-rows-[3rem_2.65rem_minmax(0,1fr)]">
        <div className="hidden items-center border-b border-r border-[#C9D4EC] bg-[#F4F4F4] px-8 lg:flex lg:col-start-1 lg:row-start-1">
          <Link
            to="/"
            className="text-[1.05rem] font-black uppercase tracking-[0.08em] text-black"
          >
            RMS
          </Link>
        </div>

        <div className="hidden items-center justify-between border-b border-[#C9D4EC] bg-[#F4F4F4] px-5 lg:flex lg:col-start-2 lg:row-start-1">
          <div className="flex items-center gap-3">
            <ProfileAvatarButton
              avatar={profileAvatar}
              className="size-8 text-xs"
              initials={initials}
              name={profileName}
              onClick={handleOpenProfileModal}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#102A74]">
                {profileName}
              </p>
              <p className="text-xs text-[#3656B7]">Landlord Profile</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex size-9 items-center justify-center rounded-[0.4rem] bg-[#18399F] text-white transition-colors duration-300 hover:bg-[#102A74]"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>

        <div className="hidden flex-col justify-center border-b border-r border-[#C9D4EC] bg-[#F4F4F4] px-8 lg:flex lg:col-start-1 lg:row-start-2">
          <button
            type="button"
            onClick={handleHeaderSectionToggle}
            className="inline-flex w-fit items-center gap-1 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[#111827]"
          >
            <span>{activeSectionTitle}</span>
            <ChevronDown
              className={classNames(
                "size-3 text-[#18399F] transition-transform duration-300",
                isActiveSectionExpanded ? "rotate-0" : "-rotate-90"
              )}
            />
          </button>
          <p className="mt-0.5 text-[0.72rem] text-[#3656B7]">{activeItemLabel}</p>
        </div>

        <div className="hidden items-center justify-end gap-2 border-b border-[#C9D4EC] bg-[#F4F4F4] px-4 lg:flex lg:col-start-2 lg:row-start-2">
          <DashboardActionButton
            onClick={() => selectNavItemByLabel("Add Property")}
            aria-label="Open add property"
          >
            <Plus className="size-4" />
          </DashboardActionButton>

          <DashboardActionButton
            onClick={() => selectNavItemByLabel("Messages")}
            aria-label="Open messages"
          >
            <Mail className="size-4" />
          </DashboardActionButton>

          <DashboardActionButton
            onClick={() => selectNavItemByLabel("Announcement")}
            aria-label="Open announcements"
          >
            <Bell className="size-4" />
          </DashboardActionButton>

          <DashboardActionButton
            onClick={() => selectNavItemByLabel("Settings")}
            aria-label="Open settings"
          >
            <UserCircle2 className="size-4" />
          </DashboardActionButton>

          <DashboardActionButton
            onClick={handleHeaderSectionToggle}
            aria-label={`Toggle ${activeSectionTitle} section`}
          >
            <ChevronDown
              className={classNames(
                "size-4 transition-transform duration-300",
                isActiveSectionExpanded ? "rotate-0" : "-rotate-90"
              )}
            />
          </DashboardActionButton>
        </div>

        <aside className="hidden min-h-0 border-r border-[#D6DFF1] bg-[#F4F4F4] lg:flex lg:col-start-1 lg:row-start-3 lg:flex-col">
          <LandlordSidebarContent
            activeItemId={activeItemId}
            expandedSections={expandedSections}
            mainNavSections={mainNavSections}
            onSelectItem={handleSelectItem}
            onToggleSection={handleSectionToggle}
            preferenceItems={preferenceSection?.items ?? []}
            showBrandRow={false}
          />
        </aside>

        <div className="flex min-w-0 flex-col lg:col-start-2 lg:row-start-3 lg:min-h-0">
          <header className="flex h-14 items-center justify-between border-b border-[#C9D4EC] px-4 sm:px-6 lg:hidden">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                className="grid size-10 place-items-center rounded-full border border-[#C9D4EC] text-[#18399F] lg:hidden"
                aria-label="Open landlord navigation"
              >
                <Menu className="size-4" />
              </button>
              <Link
                to="/"
                className="text-[1rem] font-black uppercase tracking-[0.08em] text-black lg:hidden"
              >
                RMS
              </Link>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <span className="hidden max-w-[7rem] truncate text-sm font-semibold text-[#102A74] sm:block">
                {profileName}
              </span>
              <ProfileAvatarButton
                avatar={profileAvatar}
                className="size-9 text-sm"
                initials={initials}
                name={profileName}
                onClick={handleOpenProfileModal}
              />
            </div>

            <button
              type="button"
              onClick={logout}
              className="ml-4 inline-flex size-9 items-center justify-center rounded-[0.4rem] bg-[#18399F] text-white transition-colors duration-300 hover:bg-[#102A74]"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </header>

          <main className="flex-1 bg-[#FAFBFF] px-4 py-4 sm:px-6 lg:min-h-0 lg:px-7 lg:py-5">
            {dedicatedView}
          </main>
        </div>
      </div>

      <div
        className={classNames(
          "fixed inset-0 z-50 lg:hidden",
          isMobileNavOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!isMobileNavOpen}
      >
        <button
          type="button"
          onClick={() => setIsMobileNavOpen(false)}
          className={classNames(
            "absolute inset-0 bg-[#07163F]/45 transition-opacity duration-300",
            isMobileNavOpen ? "opacity-100" : "opacity-0"
          )}
          aria-label="Close landlord navigation overlay"
        />

        <aside
          className={classNames(
            "absolute left-0 top-0 flex h-full w-full max-w-[18rem] flex-col border-r border-[#D6DFF1] bg-[#F4F4F4] transition-transform duration-300",
            isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <LandlordSidebarContent
            activeItemId={activeItemId}
            expandedSections={expandedSections}
            mainNavSections={mainNavSections}
            onClose={() => setIsMobileNavOpen(false)}
            onSelectItem={handleSelectItem}
            onToggleSection={handleSectionToggle}
            preferenceItems={preferenceSection?.items ?? []}
            showCloseButton
          />
        </aside>
      </div>

      <div
        className={classNames(
          "fixed inset-0 z-[70] flex items-center justify-center p-4 transition-opacity duration-300",
          isProfileModalOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
        aria-hidden={!isProfileModalOpen}
      >
        <button
          type="button"
          onClick={handleCloseProfileModal}
          className="absolute inset-0 bg-[#07163F]/45"
          aria-label="Close landlord profile editor overlay"
        />

        <div
          className="relative z-10 w-full max-w-md rounded-[1.8rem] border border-[#DCE5F7] bg-white p-6 shadow-[0_22px_44px_rgba(13,29,76,0.2)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#3656B7]">
                Edit Profile
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[#102A74]">
                Update your avatar and display name
              </h2>
            </div>

            <button
              type="button"
              onClick={handleCloseProfileModal}
              className="grid size-9 place-items-center rounded-full border border-[#C9D4EC] text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
              aria-label="Close landlord profile editor"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4 text-center">
            <div className="grid size-24 place-items-center overflow-hidden rounded-full bg-[#E8EEFF] text-2xl font-bold text-[#18399F]">
              {profileDraftAvatar ? (
                <img
                  src={profileDraftAvatar}
                  alt={profileDraftName || profileName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{deriveInitials(profileDraftName, initials)}</span>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#18399F] px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]">
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  onClick={(event) => {
                    event.currentTarget.value = "";
                  }}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setProfileDraftAvatar(null)}
                disabled={!profileDraftAvatar}
                className={classNames(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-300",
                  profileDraftAvatar
                    ? "border-[#C9D4EC] text-[#18399F] hover:border-[#18399F]"
                    : "cursor-not-allowed border-[#E3E8F5] text-slate-300"
                )}
              >
                Remove Image
              </button>
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="landlord-profile-name"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#3656B7]"
            >
              Profile Name
            </label>
            <input
              id="landlord-profile-name"
              type="text"
              value={profileDraftName}
              onChange={(event) => setProfileDraftName(event.target.value)}
              placeholder="Enter your profile name"
              className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseProfileModal}
              className="rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleProfileSave}
              className="rounded-full bg-[#18399F] px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
