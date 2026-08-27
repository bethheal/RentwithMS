import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Compass,
  FileText,
  FolderOpen,
  Heart,
  History,
  LayoutDashboard,
  LayoutGrid,
  List,
  LoaderCircle,
  LogOut,
  Megaphone,
  Menu,
  Mail,
  MessageSquareText,
  MessagesSquare,
  Minus,
  Plus,
  Receipt,
  Search,
  Settings,
  UserCircle2,
  Wallet,
  Wrench,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { usePropertyStore } from "../../context/PropertyStoreContext.jsx";
import { landlordTrustResponse } from "../../data/mockApi/landlordTrust.js";
import { tenantDashboardResponse } from "../../data/mockApi/tenantDashboard.js";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { getRatingSummary } from "../../utils/landlordTrust.js";
import { classNames } from "../../utils/classNames.js";
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from "../../utils/toast.js";
import {
  isPropertyVisibleToTenant,
  mapManagedPropertyToBrowseListing,
  mapManagedPropertyToTenantCard,
} from "../../utils/propertyRecords.js";
import {
  RatingSummary,
  VerificationBadgeList,
  VerifiedLandlordBadge,
} from "./LandlordTrustShared.jsx";
import TenantListingCard from "./TenantListingCard.jsx";
import {
  TenantLandlordReviewsView,
  TenantVerifiedLandlordsView,
} from "./TenantTrustViews.jsx";
import {
  buildPrintableReceiptHtml,
  ReceiptPreviewModal,
  TenantPayRentView,
  TenantReceiptsView,
  TenantRentHistoryView,
} from "./TenantPaymentsViews.jsx";
import {
  TenantBookingsView,
  TenantDocumentsView,
  TenantOverviewDashboardView,
} from "./TenantGeneralViews.jsx";
import {
  TenantMyPropertiesView,
  TenantPropertyDetailsModal,
} from "./TenantPropertyViews.jsx";
import {
  TenantHelpView,
  TenantSettingsView,
  TenantTermsView,
} from "./TenantPreferencesViews.jsx";
import {
  TenantAnnouncementsView,
  TenantChatWithLandlordView,
  TenantIssueReportView,
  TenantRequestsView,
} from "./TenantSupportViews.jsx";

const defaultActiveItemLabel = "My Properties";
const budgetStep = 100;
const roomCountMax = 99;
const listingsPageSize = 6;

const navItemIconMap = {
  "My Properties": Building2,
  "Saved Homes": Heart,
  "Browse Homes": Compass,
  "Verified Landlords": BadgeCheck,
  "Landlord Reviews": MessageSquareText,
  "Pay Rent": Wallet,
  "Rent History": History,
  Receipts: Receipt,
  "Report Issue": Wrench,
  "My Requests": ClipboardList,
  Announcement: Megaphone,
  "Chat with Landlord": MessagesSquare,
  Dashboard: LayoutDashboard,
  Bookings: CalendarDays,
  Booking: CalendarDays,
  Documents: FolderOpen,
  Settings: Settings,
  Help: CircleHelp,
  "Terms & Conditions": FileText,
  "Sign Out": LogOut,
};

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

function clampValue(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function parseNumberInput(value) {
  const digitsOnly = String(value ?? "").replace(/[^\d]/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
}

function formatSavedDate(dateString) {
  if (!dateString) {
    return "Saved recently";
  }

  const savedDate = new Date(dateString);
  return `Saved ${savedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;
}

function CounterControl({
  value,
  min = 0,
  max = roomCountMax,
  step = 1,
  inputId,
  label,
  onChange,
  onIncrement,
  onDecrement,
}) {
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE5F7] bg-white px-2 py-1 text-[#18399F] shadow-[0_10px_24px_rgba(15,32,86,0.05)]">
      <button
        type="button"
        onClick={onDecrement}
        disabled={!canDecrement}
        className={classNames(
          "grid size-7 place-items-center rounded-full border transition-colors duration-300",
          canDecrement
            ? "border-[#18399F] bg-white text-[#18399F] hover:bg-[#18399F] hover:text-white"
            : "border-[#DCE5F7] bg-[#F3F6FF] text-[#B8C7F3] cursor-not-allowed"
        )}
        aria-label={`Decrease ${label}`}
      >
        <Minus className="size-3.5" />
      </button>

      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <input
        id={inputId}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="h-8 w-16 rounded-full border border-[#DCE5F7] px-2 text-center text-sm font-semibold text-[#18399F] outline-none transition focus:border-[#18399F] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />

      <button
        type="button"
        onClick={onIncrement}
        disabled={!canIncrement}
        className={classNames(
          "grid size-7 place-items-center rounded-full border transition-colors duration-300",
          canIncrement
            ? "border-[#18399F] bg-white text-[#18399F] hover:bg-[#18399F] hover:text-white"
            : "border-[#DCE5F7] bg-[#F3F6FF] text-[#B8C7F3] cursor-not-allowed"
        )}
        aria-label={`Increase ${label}`}
      >
        <Plus className="size-3.5" />
      </button>
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
      aria-label="Edit profile"
    >
      {avatar ? (
        <img src={avatar} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </button>
  );
}

function SidebarNavItem({ isActive, item, onClick }) {
  const Icon = navItemIconMap[item.icon] ?? ChevronRight;

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
        <Icon className={classNames("size-4", item.label === "Saved Homes" ? "fill-current" : "")} />
      </span>
      <span>{item.label}</span>
    </button>
  );
}

function toggleValue(values, value) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function SelectableFilterChip({
  active,
  children,
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      className={classNames(
        "rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-300",
        active
          ? "border-[#18399F] bg-[#18399F] text-white shadow-[0_12px_24px_rgba(24,57,159,0.16)]"
          : "border-[#D7E0F3] bg-white text-[#3656B7] hover:border-[#18399F] hover:text-[#18399F]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function ActiveFilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#CFE0FF] bg-[#EEF4FF] px-3 py-1.5 text-sm font-medium text-[#18399F]">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="grid size-5 place-items-center rounded-full bg-white/85 text-[#18399F] transition-colors duration-300 hover:bg-white"
        aria-label={`Remove ${label} filter`}
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

function SidebarFilterSection({ title, children }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-[#102A74]">{title}</h3>
      {children}
    </section>
  );
}

function ListingSkeletonCard({ viewMode }) {
  const isListView = viewMode === "list";

  return (
    <div
      className={classNames(
        "overflow-hidden rounded-[1.8rem] border border-[#DCE5F7] bg-white p-4 shadow-[0_18px_36px_rgba(15,32,86,0.06)]",
        isListView ? "grid gap-5 md:grid-cols-[15rem_minmax(0,1fr)]" : "space-y-4"
      )}
    >
      <div className="h-[15rem] animate-pulse rounded-[1.35rem] bg-[#EEF3FF]" />
      <div className="space-y-4">
        <div className="h-4 w-28 animate-pulse rounded-full bg-[#EEF3FF]" />
        <div className="h-6 w-2/3 animate-pulse rounded-full bg-[#EEF3FF]" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-[#F4F7FF]" />
        <div className="h-20 w-full animate-pulse rounded-[1rem] bg-[#F8FBFF]" />
        <div className="flex flex-wrap gap-2">
          <div className="h-9 w-28 animate-pulse rounded-full bg-[#EEF3FF]" />
          <div className="h-9 w-32 animate-pulse rounded-full bg-[#EEF3FF]" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-[#EEF3FF]" />
        </div>
      </div>
    </div>
  );
}

function RequestActionModal({ modalState, onClose, onSubmit }) {
  const listing = modalState.listing;
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [message, setMessage] = useState("");

  if (!listing) {
    return null;
  }

  const isContactMode = modalState.mode === "contact";
  const title = isContactMode ? "Contact Landlord" : "Request Viewing";
  const subtitle = isContactMode
    ? "Send a quick message and we will notify the landlord right away."
    : "Share your preferred date and we will send a viewing request instantly.";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-[#07163F]/45"
        aria-label="Close request viewing modal"
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({
            listing,
            mode: modalState.mode,
            fullName,
            phone,
            preferredDate,
            message,
          });
        }}
        className="relative z-10 w-full max-w-lg rounded-[1.8rem] border border-[#DCE5F7] bg-white p-6 shadow-[0_22px_44px_rgba(13,29,76,0.2)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#3656B7]">
              {title}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[#102A74]">
              {listing.title}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full border border-[#C9D4EC] text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
            aria-label="Close request viewing modal"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Full Name
            </span>
            <input
              type="text"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              placeholder="Your full name"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Phone
            </span>
            <input
              type="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              placeholder="055 000 0000"
            />
          </label>
        </div>

        {!isContactMode ? (
          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Preferred Date
            </span>
            <input
              type="date"
              required
              value={preferredDate}
              onChange={(event) => setPreferredDate(event.target.value)}
              className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
            />
          </label>
        ) : null}

        <label className="mt-4 block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            Message
          </span>
          <textarea
            required
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="min-h-[8rem] w-full rounded-[1rem] border border-[#DCE5F7] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
            placeholder={
              isContactMode
                ? "Introduce yourself and ask your question."
                : "Share any preferred time or extra request."
            }
          />
        </label>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-[#18399F] px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
          >
            {isContactMode ? "Send Message" : "Send Request"}
          </button>
        </div>
      </form>
    </div>
  );
}

function PropertyDetailsModal({
  landlord,
  isSaved,
  listing,
  onClose,
  onContact,
  onOpenLandlordProfile,
  onRequestViewing,
  onToggleSave,
  ratingSummary,
}) {
  if (!listing) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-[#07163F]/45"
        aria-label="Close property details"
      />

      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[1.9rem] border border-[#DCE5F7] bg-white shadow-[0_24px_48px_rgba(13,29,76,0.22)]">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative h-full min-h-[18rem] bg-[#EEF3FF]">
            <img
              src={listing.image}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
              {listing.featured ? (
                <span className="rounded-full bg-[#18399F] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                  Featured
                </span>
              ) : null}
              <span className="rounded-full bg-white/92 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#18399F]">
                {listing.houseType}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
                  Property Details
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#102A74]">
                  {listing.title}
                </h2>
                <p className="mt-2 text-sm text-slate-500">{listing.location}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {landlord ? <VerifiedLandlordBadge /> : null}
                  <RatingSummary
                    average={ratingSummary?.average ?? 0}
                    count={ratingSummary?.count ?? 0}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="grid size-9 place-items-center rounded-full border border-[#C9D4EC] text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
                aria-label="Close property details"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="mt-4 text-2xl font-semibold text-[#16327E]">
              {listing.amount}
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-500">
              {listing.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {listing.tags.map((tag) => (
                <span
                  key={`${listing.id}-${tag}`}
                  className="rounded-full bg-[#EEF3FF] px-3 py-2 text-xs font-medium text-[#3656B7]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.2rem] bg-[#F8FBFF] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                  Home Specs
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  {listing.bedrooms} bedroom{listing.bedrooms === 1 ? "" : "s"} and{" "}
                  {listing.bathrooms} bathroom
                  {listing.bathrooms === 1 ? "" : "s"}
                </p>
              </div>

              <div className="rounded-[1.2rem] bg-[#F8FBFF] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                  Amenities
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  {listing.amenities.join(", ")}
                </p>
              </div>
            </div>

            {landlord ? (
              <div className="mt-5 rounded-[1.2rem] border border-[#DCE5F7] bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                      Landlord Profile
                    </p>
                    <p className="mt-2 text-base font-semibold text-[#102A74]">
                      {landlord.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {landlord.responseTime}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenLandlordProfile}
                    className="rounded-full border border-[#C9D4EC] bg-[#F8FBFF] px-4 py-2 text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
                  >
                    Open Profile
                  </button>
                </div>

                <VerificationBadgeList
                  verification={landlord.verification}
                  className="mt-4"
                  compact
                />
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onRequestViewing}
                className="rounded-full bg-[#18399F] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
              >
                Request Viewing
              </button>
              <button
                type="button"
                onClick={onContact}
                className="rounded-full border border-[#C9D4EC] px-4 py-2.5 text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
              >
                Contact
              </button>
              <button
                type="button"
                onClick={onToggleSave}
                className={classNames(
                  "rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors duration-300",
                  isSaved
                    ? "border-[#18399F] bg-[#EEF4FF] text-[#18399F]"
                    : "border-[#C9D4EC] text-[#18399F] hover:border-[#18399F]"
                )}
              >
                {isSaved ? "Saved" : "Save Home"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TenantSidebarContent({
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
          Tenant Dashboard
        </p>
        <h2 className="text-2xl font-bold uppercase tracking-[0.12em] text-[#102A74] sm:text-3xl">
          {title}
        </h2>
      </div>
    </section>
  );
}

export default function TenantDashboardView() {
  const { logout, updateUser, user } = useAuth();
  const { properties: managedProperties } = usePropertyStore();
  const {
    bookings: initialBookings,
    announcements: initialAnnouncements,
    chatConversations: initialChatConversations,
    documents: initialDocuments,
    filters,
    helpCenter,
    issueReports: initialIssueReports,
    listings: initialListings,
    navSections,
    receipts: initialReceipts,
    rentHistory: initialRentHistory,
    rentPayment: initialRentPayment,
    serviceRequests: initialServiceRequests,
    settings: initialSettings,
    termsAndConditions,
    user: fallbackUser,
  } = tenantDashboardResponse.data;
  const verifiedLandlords = landlordTrustResponse.data.verifiedLandlords;
  const normalizedNavSections = navSections.map((section) => ({
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
  const profileName = user?.name ?? fallbackUser.name;
  const profileAvatar = user?.avatar ?? null;
  const initials = deriveInitials(profileName, fallbackUser.initials);
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
  const [searchValue, setSearchValue] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [bedrooms, setBedrooms] = useState(filters.bedrooms);
  const [bathrooms, setBathrooms] = useState(filters.bathrooms);
  const [budgetCurrent, setBudgetCurrent] = useState(filters.budget.current);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [savedSortOption, setSavedSortOption] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const publishedManagedListings = managedProperties
    .filter((property) => property.workflowStatus === "published")
    .map((property) => mapManagedPropertyToBrowseListing(property));
  const listings = [
    ...publishedManagedListings,
    ...initialListings.filter(
      (listing) =>
        !publishedManagedListings.some(
          (managedListing) => managedListing.id === listing.id
        )
    ),
  ];
  const [browsePagination, setBrowsePagination] = useState({
    count: listingsPageSize,
    key: "",
  });
  const [savedPagination, setSavedPagination] = useState({
    count: listingsPageSize,
    key: "",
  });
  const [savedHomeIds, setSavedHomeIds] = useState(() =>
    listings.filter((listing) => listing.isSaved).map((listing) => listing.id)
  );
  const [savedTimestamps, setSavedTimestamps] = useState(() =>
    Object.fromEntries(
      listings
        .filter((listing) => listing.isSaved)
        .map((listing) => [listing.id, listing.savedAt ?? listing.createdAt])
    )
  );
  const [requestModalState, setRequestModalState] = useState({
    listing: null,
    mode: "viewing",
  });
  const [detailsListing, setDetailsListing] = useState(null);
  const [selectedManagedProperty, setSelectedManagedProperty] = useState(null);
  const [landlordReviews, setLandlordReviews] = useState(
    landlordTrustResponse.data.reviews
  );
  const [selectedLandlordId, setSelectedLandlordId] = useState(
    verifiedLandlords[0]?.id ?? null
  );
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [rentPaymentDetails, setRentPaymentDetails] = useState(initialRentPayment);
  const [paymentHistory, setPaymentHistory] = useState(initialRentHistory);
  const [receiptRecords, setReceiptRecords] = useState(initialReceipts);
  const [selectedReceiptId, setSelectedReceiptId] = useState(
    initialReceipts[0]?.id ?? null
  );
  const [receiptPreviewId, setReceiptPreviewId] = useState(null);
  const [bookingRecords, setBookingRecords] = useState(initialBookings);
  const [issueReports, setIssueReports] = useState(initialIssueReports);
  const [serviceRequests, setServiceRequests] = useState(initialServiceRequests);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [chatConversations, setChatConversations] = useState(
    initialChatConversations
  );
  const [tenantSettings, setTenantSettings] = useState({
    ...initialSettings,
    profile: {
      ...initialSettings.profile,
      avatar: profileAvatar ?? initialSettings.profile.avatar ?? null,
      email: user?.email ?? initialSettings.profile.email,
      name: profileName,
      phone: user?.phone ?? initialSettings.profile.phone,
    },
  });
  const [termsAccepted, setTermsAccepted] = useState(
    Boolean(termsAndConditions.accepted)
  );
  const [typingConversationId, setTypingConversationId] = useState(null);
  const chatReplyTimeoutsRef = useRef({});

  useBodyScrollLock(
    isMobileNavOpen ||
      isProfileModalOpen ||
      Boolean(requestModalState.listing) ||
      Boolean(detailsListing) ||
      Boolean(selectedManagedProperty) ||
      Boolean(receiptPreviewId)
  );

  useEffect(() => {
    const hasOverlay =
      isMobileNavOpen ||
      isProfileModalOpen ||
      Boolean(requestModalState.listing) ||
      Boolean(detailsListing) ||
      Boolean(selectedManagedProperty) ||
      Boolean(receiptPreviewId);

    if (!hasOverlay) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      if (receiptPreviewId) {
        setReceiptPreviewId(null);
        return;
      }

      if (detailsListing) {
        setDetailsListing(null);
        return;
      }

      if (selectedManagedProperty) {
        setSelectedManagedProperty(null);
        return;
      }

      if (requestModalState.listing) {
        setRequestModalState({ listing: null, mode: "viewing" });
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
  }, [
    detailsListing,
    isMobileNavOpen,
    isProfileModalOpen,
    receiptPreviewId,
    requestModalState.listing,
    selectedManagedProperty,
  ]);

  useEffect(
    () => () => {
      Object.values(chatReplyTimeoutsRef.current).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    },
    []
  );

  const activeItem =
    allItems.find((item) => item.id === activeItemId) ?? allItems[0];
  const activeSection =
    normalizedNavSections.find((section) =>
      section.items.some((item) => item.id === activeItemId)
    ) ??
    mainNavSections[0] ??
    preferenceSection;
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
  const activeSectionTitle = activeSection?.title ?? "Dashboard";
  const activeItemLabel = activeItem?.label ?? defaultActiveItemLabel;
  const isMyPropertiesView = activeItemLabel === "My Properties";
  const isDashboardOverviewView = activeItemLabel === "Dashboard";
  const isBookingsView =
    activeItemLabel === "Bookings" || activeItemLabel === "Booking";
  const isDocumentsView = activeItemLabel === "Documents";
  const isBrowseHomesView = activeItemLabel === "Browse Homes";
  const isSavedHomesView = activeItemLabel === "Saved Homes";
  const isVerifiedLandlordsView = activeItemLabel === "Verified Landlords";
  const isLandlordReviewsView = activeItemLabel === "Landlord Reviews";
  const isPayRentView = activeItemLabel === "Pay Rent";
  const isRentHistoryView = activeItemLabel === "Rent History";
  const isReceiptsView = activeItemLabel === "Receipts";
  const isReportIssueView = activeItemLabel === "Report Issue";
  const isMyRequestsView = activeItemLabel === "My Requests";
  const isAnnouncementView = activeItemLabel === "Announcement";
  const isChatWithLandlordView = activeItemLabel === "Chat with Landlord";
  const isSettingsView = activeItemLabel === "Settings";
  const isHelpView = activeItemLabel === "Help";
  const isTermsView = activeItemLabel === "Terms & Conditions";
  const hasDedicatedView =
    isMyPropertiesView ||
    isDashboardOverviewView ||
    isBookingsView ||
    isDocumentsView ||
    isBrowseHomesView ||
    isSavedHomesView ||
    isVerifiedLandlordsView ||
    isLandlordReviewsView ||
    isPayRentView ||
    isRentHistoryView ||
    isReceiptsView ||
    isReportIssueView ||
    isMyRequestsView ||
    isAnnouncementView ||
    isChatWithLandlordView ||
    isSettingsView ||
    isHelpView ||
    isTermsView;
  const isActiveSectionExpanded =
    activeSection?.id && activeSection.id !== "preferences"
      ? Boolean(expandedSections[activeSection.id])
      : true;
  const trimmedSearchValue = searchValue.trim();
  const searchTerm = trimmedSearchValue.toLowerCase();
  const areaSuggestions = filters.areaGroups.flatMap((group) =>
    group.areas.map((area) => ({
      area,
      region: group.region,
    }))
  );
  const selectedAreasKey = selectedAreas.join("|");
  const selectedPropertyTypesKey = selectedPropertyTypes.join("|");
  const selectedAmenitiesKey = selectedAmenities.join("|");
  const savedHomeIdsKey = savedHomeIds.join("|");
  const browseQueryKey = [
    activeItemLabel,
    bathrooms,
    bedrooms,
    budgetCurrent,
    searchValue,
    selectedAmenitiesKey,
    selectedAreasKey,
    selectedPropertyTypesKey,
    showSavedOnly,
    sortOption,
  ].join("::");
  const savedQueryKey = [savedHomeIdsKey, savedSortOption, viewMode].join("::");
  const listingsLoadingKey = isBrowseHomesView
    ? ["browse", browseQueryKey, savedHomeIdsKey, viewMode].join("::")
    : isSavedHomesView
      ? ["saved", savedQueryKey].join("::")
      : "";
  const verifiedLandlordsById = Object.fromEntries(
    verifiedLandlords.map((landlord) => [landlord.id, landlord])
  );
  const tenantProfile = {
    email: tenantSettings.profile.email ?? user?.email ?? "",
    name: tenantSettings.profile.name ?? profileName,
  };
  const tenantManagedProperties = managedProperties
    .filter((property) => isPropertyVisibleToTenant(property, tenantProfile))
    .map((property) => mapManagedPropertyToTenantCard(property));
  const selectedLandlord =
    verifiedLandlordsById[selectedLandlordId] ?? verifiedLandlords[0] ?? null;
  const previewReceipt =
    receiptRecords.find((receipt) => receipt.id === receiptPreviewId) ?? null;

  const isListingSaved = (listingId) => savedHomeIds.includes(listingId);
  const getLandlordById = (landlordId) => verifiedLandlordsById[landlordId] ?? null;
  const getReviewsForProperty = (propertyId) =>
    landlordReviews.filter((review) => review.propertyId === propertyId);

  const doesListingMatchFilters = (listing, options = {}) => {
    const {
      ignoreAmenities = false,
      ignoreAreas = false,
      ignorePropertyTypes = false,
    } = options;
    const searchableText = [
      listing.title,
      listing.description,
      listing.location,
      listing.area,
      listing.region,
      listing.houseType,
      ...listing.amenities,
      ...listing.tags,
    ]
      .join(" ")
      .toLowerCase();
    const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
    const matchesArea =
      ignoreAreas ||
      selectedAreas.length === 0 ||
      selectedAreas.includes(listing.area);
    const matchesPropertyType =
      ignorePropertyTypes ||
      selectedPropertyTypes.length === 0 ||
      selectedPropertyTypes.includes(listing.houseType);
    const matchesAmenities =
      ignoreAmenities ||
      selectedAmenities.length === 0 ||
      selectedAmenities.every((amenity) => listing.amenities.includes(amenity));
    const matchesBedrooms = bedrooms === 0 || listing.bedrooms >= bedrooms;
    const matchesBathrooms = bathrooms === 0 || listing.bathrooms >= bathrooms;
    const matchesBudget = listing.amountValue <= budgetCurrent;
    const matchesSaved = !showSavedOnly || isListingSaved(listing.id);

    return (
      matchesSearch &&
      matchesArea &&
      matchesPropertyType &&
      matchesAmenities &&
      matchesBedrooms &&
      matchesBathrooms &&
      matchesBudget &&
      matchesSaved
    );
  };

  const groupedAreaFilters = filters.areaGroups.map((group) => ({
    ...group,
    areas: group.areas.map((area) => ({
      area,
      count: listings.filter(
        (listing) =>
          listing.area === area &&
          doesListingMatchFilters(listing, { ignoreAreas: true })
      ).length,
    })),
  }));

  const propertyTypeFilters = filters.propertyTypes.map((type) => ({
    type,
    count: listings.filter(
      (listing) =>
        listing.houseType === type &&
        doesListingMatchFilters(listing, { ignorePropertyTypes: true })
    ).length,
  }));

  const amenityFilters = filters.amenities.map((amenity) => ({
    amenity,
    count: listings.filter(
      (listing) =>
        listing.amenities.includes(amenity) &&
        doesListingMatchFilters(listing, { ignoreAmenities: true })
    ).length,
  }));

  const visibleSuggestions =
    searchTerm && isSearchFocused
      ? areaSuggestions
          .filter(({ area }) => area.toLowerCase().includes(searchTerm))
          .slice(0, 6)
      : [];

  const activeBrowseFilters = [
    ...(trimmedSearchValue &&
    !selectedAreas.some((area) => area.toLowerCase() === searchTerm)
      ? [
          {
            key: "search",
            label: trimmedSearchValue,
            onRemove: () => setSearchValue(""),
          },
        ]
      : []),
    ...selectedAreas.map((area) => ({
      key: `area-${area}`,
      label: area,
      onRemove: () =>
        setSelectedAreas((current) => current.filter((item) => item !== area)),
    })),
    ...selectedPropertyTypes.map((type) => ({
      key: `type-${type}`,
      label: type,
      onRemove: () =>
        setSelectedPropertyTypes((current) =>
          current.filter((item) => item !== type)
        ),
    })),
    ...selectedAmenities.map((amenity) => ({
      key: `amenity-${amenity}`,
      label: amenity,
      onRemove: () =>
        setSelectedAmenities((current) =>
          current.filter((item) => item !== amenity)
        ),
    })),
    ...(bedrooms > 0
      ? [
          {
            key: "bedrooms",
            label: `${bedrooms}+ Bedrooms`,
            onRemove: () => setBedrooms(filters.bedrooms),
          },
        ]
      : []),
    ...(bathrooms > 0
      ? [
          {
            key: "bathrooms",
            label: `${bathrooms}+ Bathrooms`,
            onRemove: () => setBathrooms(filters.bathrooms),
          },
        ]
      : []),
    ...(budgetCurrent < filters.budget.max
      ? [
          {
            key: "budget",
            label: `Up to GHS ${budgetCurrent.toLocaleString()}`,
            onRemove: () => setBudgetCurrent(filters.budget.max),
          },
        ]
      : []),
    ...(showSavedOnly
      ? [
          {
            key: "saved-only",
            label: "Saved Only",
            onRemove: () => setShowSavedOnly(false),
          },
        ]
      : []),
  ];

  const filteredBrowseListings = listings.filter((listing) =>
    doesListingMatchFilters(listing)
  );

  const sortedBrowseListings = [...filteredBrowseListings].sort((left, right) => {
    if (sortOption === "price-asc") {
      return left.amountValue - right.amountValue;
    }

    if (sortOption === "price-desc") {
      return right.amountValue - left.amountValue;
    }

    return new Date(right.createdAt) - new Date(left.createdAt);
  });

  const savedListings = listings.filter((listing) => isListingSaved(listing.id));

  const sortedSavedListings = [...savedListings].sort((left, right) => {
    if (savedSortOption === "price-asc") {
      return left.amountValue - right.amountValue;
    }

    if (savedSortOption === "recent") {
      return (
        new Date(savedTimestamps[right.id] ?? right.createdAt) -
        new Date(savedTimestamps[left.id] ?? left.createdAt)
      );
    }

    return savedHomeIds.indexOf(left.id) - savedHomeIds.indexOf(right.id);
  });

  const browseVisibleCount =
    browsePagination.key === browseQueryKey
      ? browsePagination.count
      : listingsPageSize;
  const savedVisibleCount =
    savedPagination.key === savedQueryKey
      ? savedPagination.count
      : listingsPageSize;
  const browseListingsToRender = sortedBrowseListings.slice(0, browseVisibleCount);
  const savedListingsToRender = sortedSavedListings.slice(0, savedVisibleCount);

  useEffect(() => {
    if (!listingsLoadingKey) {
      return;
    }

    let hideTimeoutId = null;
    const showTimeoutId = window.setTimeout(() => {
      setIsLoadingListings(true);
      hideTimeoutId = window.setTimeout(() => {
        setIsLoadingListings(false);
      }, 180);
    }, 0);

    return () => {
      window.clearTimeout(showTimeoutId);
      if (hideTimeoutId) {
        window.clearTimeout(hideTimeoutId);
      }
    };
  }, [listingsLoadingKey]);

  const handleSectionToggle = (sectionId) => {
    setExpandedSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
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

    setTenantSettings((current) => ({
      ...current,
      profile: {
        ...current.profile,
        avatar: profileDraftAvatar ?? null,
        email: user?.email ?? current.profile.email,
        name: nextName,
        phone: user?.phone ?? current.profile.phone,
      },
    }));
    updateUser({
      ...(user ?? {}),
      avatar: profileDraftAvatar ?? null,
      email: user?.email ?? "tenant@example.com",
      id: user?.id ?? "usr_tenant_01",
      name: nextName,
      phone: user?.phone ?? tenantSettings.profile.phone,
      role: user?.role ?? fallbackUser.role,
    });
    setIsProfileModalOpen(false);
    showFeedback("Profile updated successfully.");
  };

  const toggleAreaFilter = (area) => {
    setSelectedAreas((current) => toggleValue(current, area));
  };

  const togglePropertyTypeFilter = (type) => {
    setSelectedPropertyTypes((current) => toggleValue(current, type));
  };

  const toggleAmenityFilter = (amenity) => {
    setSelectedAmenities((current) => toggleValue(current, amenity));
  };

  const handleSuggestionSelect = (area) => {
    setSearchValue(area);
    setSelectedAreas((current) =>
      current.includes(area) ? current : [...current, area]
    );
    setIsSearchFocused(false);
  };

  const handleBedroomChange = (event) => {
    setBedrooms(
      clampValue(parseNumberInput(event.target.value), 0, roomCountMax)
    );
  };

  const handleBathroomChange = (event) => {
    setBathrooms(
      clampValue(parseNumberInput(event.target.value), 0, roomCountMax)
    );
  };

  const adjustBudget = (direction) => {
    setBudgetCurrent((current) =>
      clampValue(
        current + direction * budgetStep,
        filters.budget.min,
        filters.budget.max
      )
    );
  };

  const handleBudgetInputChange = (event) => {
    setBudgetCurrent(
      clampValue(
        parseNumberInput(event.target.value),
        filters.budget.min,
        filters.budget.max
      )
    );
  };

  const handleBudgetRangeChange = (event) => {
    setBudgetCurrent(
      clampValue(
        Number(event.target.value),
        filters.budget.min,
        filters.budget.max
      )
    );
  };

  const handleBudgetWheel = (event) => {
    event.preventDefault();
    adjustBudget(event.deltaY < 0 ? 1 : -1);
  };

  const resetBrowseFilters = () => {
    setSearchValue("");
    setSelectedAreas([]);
    setSelectedPropertyTypes([]);
    setSelectedAmenities([]);
    setBedrooms(filters.bedrooms);
    setBathrooms(filters.bathrooms);
    setBudgetCurrent(filters.budget.max);
    setShowSavedOnly(false);
  };

  const handleSelectPaymentMethod = (methodId) => {
    setRentPaymentDetails((current) => ({
      ...current,
      selectedPaymentMethodId: methodId,
    }));
  };

  const handleToggleReminder = () => {
    let nextReminderState = false;

    setRentPaymentDetails((current) => {
      nextReminderState = !current.reminderEnabled;

      return {
        ...current,
        reminderEnabled: nextReminderState,
      };
    });

    showFeedback(
      nextReminderState
        ? "We will remind you before the due date."
        : "Due date reminder turned off.",
      "info"
    );
  };

  const handleSelectReceipt = (receiptId) => {
    setSelectedReceiptId(receiptId);
  };

  const handleOpenReceiptPreview = (receiptId) => {
    setSelectedReceiptId(receiptId);
    setReceiptPreviewId(receiptId);
  };

  const handleCloseReceiptPreview = () => {
    setReceiptPreviewId(null);
  };

  const handleDownloadReceipt = (receipt) => {
    if (!receipt) {
      return;
    }

    const receiptWindow = window.open("", "_blank", "noopener,noreferrer");

    if (!receiptWindow) {
      showFeedback("Please allow pop-ups to save the receipt as PDF.", "error");
      return;
    }

    receiptWindow.document.write(buildPrintableReceiptHtml(receipt));
    receiptWindow.document.close();
    showFeedback(`Receipt ${receipt.id} is ready to print or save as PDF.`, "info");
  };

  const handleViewReceiptFromHistory = (receiptId) => {
    handleOpenReceiptPreview(receiptId);
    selectNavItemByLabel("Receipts");
  };

  const handleCreateBooking = ({
    date,
    endTime,
    location,
    notes,
    startTime,
    title,
    type,
  }) => {
    const nextBooking = {
      date,
      endTime,
      host: "Tenant Booking Desk",
      id: `booking-${Date.now()}`,
      location,
      notes,
      startTime,
      status: "Upcoming",
      title,
      type,
    };

    setBookingRecords((current) => [nextBooking, ...current]);
    showFeedback(`${title} has been added to your bookings.`);
  };

  const handleDownloadDocument = (document) => {
    if (!document) {
      return;
    }

    showFeedback(`${document.name} is ready for download.`, "info");
  };

  const handlePayRent = () => {
    if (rentPaymentDetails.paymentStatus === "Paid") {
      showFeedback("This rent invoice is already marked as paid.", "info");
      return;
    }

    const paymentDate = new Date().toISOString().slice(0, 10);
    const selectedMethod =
      rentPaymentDetails.paymentMethods.find(
        (method) => method.id === rentPaymentDetails.selectedPaymentMethodId
      ) ?? rentPaymentDetails.paymentMethods[0];
    const receiptId = `RCT-${paymentDate.replace(/-/g, "")}-${String(
      receiptRecords.length + 1
    ).padStart(3, "0")}`;
    const nextReceipt = {
      amount: rentPaymentDetails.totalAmount,
      id: receiptId,
      landlordName: rentPaymentDetails.landlordName,
      paymentDate,
      paymentMethod: selectedMethod?.label ?? "Mobile Money",
      paymentBreakdown: {
        rent: rentPaymentDetails.rentAmount,
        utilities: rentPaymentDetails.utilitiesAmount,
      },
      propertyDetails: rentPaymentDetails.propertyDetails,
      propertyName: rentPaymentDetails.propertyName,
      status: "Successful",
      tenantName: rentPaymentDetails.tenantName,
      totalPaid: rentPaymentDetails.totalAmount,
    };
    const nextHistoryEntry = {
      amountPaid: rentPaymentDetails.totalAmount,
      id: `rent-history-${paymentHistory.length + 1}`,
      paymentDate,
      paymentMethod: selectedMethod?.label ?? "Mobile Money",
      propertyName: rentPaymentDetails.propertyName,
      receiptId,
      status: "Successful",
    };

    setRentPaymentDetails((current) => ({
      ...current,
      lastReceiptId: receiptId,
      outstandingAmount: 0,
      paymentStatus: "Paid",
    }));
    setPaymentHistory((current) => [nextHistoryEntry, ...current]);
    setReceiptRecords((current) => [nextReceipt, ...current]);
    setSelectedReceiptId(receiptId);
    showFeedback(
      `Rent payment recorded successfully via ${selectedMethod?.label ?? "your selected method"}.`
    );
  };

  const handleSaveTenantSettings = (nextSettings) => {
    const nextProfileName = nextSettings.profile.name.trim() || profileName;
    const nextProfileEmail =
      nextSettings.profile.email.trim() ||
      user?.email ||
      tenantSettings.profile.email;
    const normalizedSettings = {
      ...nextSettings,
      profile: {
        ...nextSettings.profile,
        avatar: nextSettings.profile.avatar ?? null,
        email: nextProfileEmail,
        name: nextProfileName,
        phone: nextSettings.profile.phone.trim(),
      },
    };

    setTenantSettings(normalizedSettings);
    updateUser({
      ...(user ?? {}),
      avatar: normalizedSettings.profile.avatar,
      email: normalizedSettings.profile.email,
      id: user?.id ?? "usr_tenant_01",
      name: normalizedSettings.profile.name,
      phone: normalizedSettings.profile.phone,
      role: user?.role ?? fallbackUser.role,
    });
    showFeedback("Settings updated successfully.");
  };

  const handleOpenSupportChat = () => {
    showFeedback("Support chat request started. We will follow up shortly.", "info");
  };

  const handleToggleTermsAcceptance = (nextAccepted) => {
    setTermsAccepted(nextAccepted);
    showFeedback(
      nextAccepted ? "Terms accepted successfully." : "Terms acceptance removed.",
      nextAccepted ? "success" : "info"
    );
  };

  const handleSubmitIssueReport = ({
    attachments = [],
    category,
    description,
    priority,
    title,
  }) => {
    const nextIssue = {
      attachments,
      category,
      description,
      id: `issue-${Date.now()}`,
      priority,
      status: "Pending",
      submittedAt: new Date().toISOString(),
      title,
    };

    setIssueReports((current) => [nextIssue, ...current]);
    showFeedback("Issue report submitted successfully.");
  };

  const handleCreateServiceRequest = ({
    attachments = [],
    details,
    requestType,
    title,
  }) => {
    const nextRequest = {
      attachments,
      details,
      id: `request-${Date.now()}`,
      requestType,
      response: "",
      status: "Pending",
      submittedAt: new Date().toISOString(),
      title,
    };

    setServiceRequests((current) => [nextRequest, ...current]);
    showFeedback("New service request created.");
  };

  const handleOpenAnnouncement = (announcementId) => {
    setAnnouncements((current) =>
      current.map((announcement) =>
        announcement.id === announcementId
          ? { ...announcement, isRead: true }
          : announcement
      )
    );
  };

  const handleOpenConversation = (conversationId) => {
    setChatConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: conversation.messages.map((message) =>
                message.sender === "landlord"
                  ? { ...message, readByTenant: true }
                  : message
              ),
            }
          : conversation
      )
    );
  };

  const handleSendChatMessage = (conversationId, { attachments = [], text }) => {
    const trimmedText = text.trim();

    if (!trimmedText && attachments.length === 0) {
      return;
    }

    const sentAt = new Date().toISOString();
    const nextTenantMessage = {
      attachments,
      deliveryStatus: "Sent",
      id: `message-${Date.now()}`,
      sender: "tenant",
      text: trimmedText,
      timestamp: sentAt,
    };

    setChatConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: [...conversation.messages, nextTenantMessage],
            }
          : conversation
      )
    );
    setTypingConversationId(conversationId);

    if (chatReplyTimeoutsRef.current[conversationId]) {
      window.clearTimeout(chatReplyTimeoutsRef.current[conversationId]);
    }

    chatReplyTimeoutsRef.current[conversationId] = window.setTimeout(() => {
      const replyText = trimmedText
        ? `Thanks, ${profileName.split(" ")[0]}. I have seen your message and will follow up shortly.`
        : `Thanks, ${profileName.split(" ")[0]}. I received the attachment and will review it shortly.`;

      setTypingConversationId((current) =>
        current === conversationId ? null : current
      );
      setChatConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: [
                  ...conversation.messages.map((message) =>
                    message.sender === "tenant"
                      ? { ...message, deliveryStatus: "Read" }
                      : message
                  ),
                  {
                    id: `message-reply-${Date.now()}`,
                    readByTenant: false,
                    sender: "landlord",
                    text: replyText,
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : conversation
        )
      );
    }, 1200);
  };

  const handleToggleSave = (listing) => {
    const isSaved = isListingSaved(listing.id);

    setSavedHomeIds((current) =>
      isSaved
        ? current.filter((id) => id !== listing.id)
        : [listing.id, ...current.filter((id) => id !== listing.id)]
    );

    setSavedTimestamps((current) => {
      const nextState = { ...current };

      if (isSaved) {
        delete nextState[listing.id];
      } else {
        nextState[listing.id] = new Date().toISOString();
      }

      return nextState;
    });

    showFeedback(
      isSaved ? "Removed from saved homes." : "Added to saved homes.",
      isSaved ? "info" : "success"
    );
  };

  const openRequestModal = (listing, mode = "viewing") => {
    setRequestModalState({ listing, mode });
  };

  const closeRequestModal = () => {
    setRequestModalState({ listing: null, mode: "viewing" });
  };

  const handleSubmitRequest = ({ listing, mode }) => {
    showFeedback(
      mode === "contact"
        ? `Message sent for ${listing.title}`
        : `Viewing requested for ${listing.title}`
    );
    closeRequestModal();
  };

  const openDetailsModal = (listing) => {
    setDetailsListing(listing);
  };

  const closeDetailsModal = () => {
    setDetailsListing(null);
  };

  const openManagedPropertyDetails = (property) => {
    setSelectedManagedProperty(property);
  };

  const closeManagedPropertyDetails = () => {
    setSelectedManagedProperty(null);
  };

  const handleOpenRequestFromDetails = (listing, mode) => {
    setDetailsListing(null);
    openRequestModal(listing, mode);
  };

  const anonymizeTenantName = (name) => {
    const parts = String(name ?? "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!parts.length) {
      return "Anonymous Tenant";
    }

    if (parts.length === 1) {
      return `${parts[0][0]}. Tenant`;
    }

    return `${parts[0][0]}. ${parts.at(-1)}`;
  };

  const handleOpenLandlordProfile = (landlordId) => {
    if (!landlordId) {
      return;
    }

    setSelectedLandlordId(landlordId);
    setDetailsListing(null);
    selectNavItemByLabel("Verified Landlords");
  };

  const handleOpenLandlordReviews = () => {
    selectNavItemByLabel("Landlord Reviews");
  };

  const handleSubmitLandlordReview = ({
    comment,
    landlordId,
    propertyId,
    rating,
    tenantName,
  }) => {
    setLandlordReviews((current) => [
      {
        id: `review-${Date.now()}`,
        landlordId,
        propertyId,
        tenantName: anonymizeTenantName(tenantName || profileName),
        rating,
        comment,
        date: new Date().toISOString(),
      },
      ...current,
    ]);
    setSelectedLandlordId(landlordId);
    showFeedback("Review submitted.");
  };

  const renderDashboardOverviewView = () => (
    <TenantOverviewDashboardView
      announcements={announcements}
      onContactLandlord={() => selectNavItemByLabel("Chat with Landlord")}
      onOpenAnnouncement={handleOpenAnnouncement}
      onPayRent={() => selectNavItemByLabel("Pay Rent")}
      onReportIssue={() => selectNavItemByLabel("Report Issue")}
      paymentDetails={rentPaymentDetails}
      paymentHistory={paymentHistory}
      serviceRequests={serviceRequests}
    />
  );

  const renderBookingsView = () => (
    <TenantBookingsView
      bookings={bookingRecords}
      onCreateBooking={handleCreateBooking}
    />
  );

  const renderDocumentsView = () => (
    <TenantDocumentsView
      documents={initialDocuments}
      onDownloadDocument={handleDownloadDocument}
    />
  );

  const renderMyPropertiesView = () => (
    <TenantMyPropertiesView
      onViewDetails={openManagedPropertyDetails}
      properties={tenantManagedProperties}
    />
  );

  const renderBrowseHomesView = () => (
    <>
      <div className="lg:hidden">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[#111827]">
          {activeSectionTitle}
        </p>
        <p className="mt-1 text-sm text-[#3656B7]">{activeItemLabel}</p>
      </div>

      <section className="mt-4 rounded-[2rem] border border-[#DCE5F7] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FAFF_100%)] p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
            Browse Homes
          </p>
          <h2 className="text-2xl font-semibold text-[#102A74] sm:text-[2rem]">
            Explore every available listing with instant filters and quick actions.
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-slate-500">
            Search by area, refine by property needs, save favorites, and request
            a viewing without leaving the page.
          </p>
        </div>

        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-5 top-1/2 z-10 size-5 -translate-y-1/2 text-[#18399F]" />
          <input
            type="text"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => {
              window.setTimeout(() => setIsSearchFocused(false), 120);
            }}
            placeholder="Search areas (e.g. East Legon, Tema, Kasoa)"
            className="h-16 w-full rounded-[1.25rem] border border-[#DCE5F7] bg-white pl-14 pr-14 text-base text-slate-700 outline-none transition focus:border-[#18399F] focus:shadow-[0_12px_30px_rgba(24,57,159,0.12)] placeholder:text-slate-400"
          />
          {searchValue ? (
            <button
              type="button"
              onClick={() => setSearchValue("")}
              className="absolute right-4 top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full text-[#18399F] transition-colors duration-300 hover:bg-[#EEF3FF]"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          ) : null}

          {visibleSuggestions.length > 0 ? (
            <div className="absolute inset-x-0 top-[calc(100%+0.6rem)] z-20 overflow-hidden rounded-[1.4rem] border border-[#DCE5F7] bg-white shadow-[0_22px_44px_rgba(15,32,86,0.12)]">
              {visibleSuggestions.map(({ area, region }) => {
                const count = listings.filter(
                  (listing) =>
                    listing.area === area &&
                    doesListingMatchFilters(listing, { ignoreAreas: true })
                ).length;

                return (
                  <button
                    key={createId(`${region}-${area}`)}
                    type="button"
                    onClick={() => handleSuggestionSelect(area)}
                    className="flex w-full items-center justify-between gap-3 border-b border-[#EEF3FF] px-4 py-3 text-left transition-colors duration-300 last:border-b-0 hover:bg-[#F7FAFF]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#102A74]">
                        {area}
                      </p>
                      <p className="text-xs text-slate-500">{region}</p>
                    </div>
                    <span className="rounded-full bg-[#EEF3FF] px-3 py-1 text-xs font-semibold text-[#3656B7]">
                      {count} listing{count === 1 ? "" : "s"}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {activeBrowseFilters.length > 0 ? (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {activeBrowseFilters.map((filter) => (
              <ActiveFilterChip
                key={filter.key}
                label={filter.label}
                onRemove={filter.onRemove}
              />
            ))}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
            Popular Areas
          </span>
          {filters.popularAreas.map((area) => (
            <SelectableFilterChip
              key={area}
              active={selectedAreas.includes(area)}
              onClick={() => toggleAreaFilter(area)}
            >
              {area}
            </SelectableFilterChip>
          ))}
          <SelectableFilterChip
            active={showSavedOnly}
            onClick={() => setShowSavedOnly((current) => !current)}
            className="ml-auto"
          >
            Show Saved Only
          </SelectableFilterChip>
        </div>
      </section>

      <div className="mt-7 grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_16px_32px_rgba(15,32,86,0.06)] xl:sticky xl:top-5 xl:self-start">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
                Filters
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[#102A74]">
                Refine results
              </h3>
            </div>
            <button
              type="button"
              onClick={resetBrowseFilters}
              className="text-sm font-semibold text-[#18399F] underline underline-offset-4"
            >
              Reset
            </button>
          </div>

          <div className="mt-6 space-y-6">
            <SidebarFilterSection title="Area">
              <div className="space-y-5">
                {groupedAreaFilters.map((group) => (
                  <div key={group.region} className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                      {group.region}
                    </p>

                    <div className="space-y-2">
                      {group.areas.map(({ area, count }) => {
                        const isSelected = selectedAreas.includes(area);
                        const isDisabled = count === 0 && !isSelected;

                        return (
                          <label
                            key={area}
                            className={classNames(
                              "flex cursor-pointer items-center justify-between gap-3 rounded-[1rem] border px-3 py-3 transition-colors duration-300",
                              isSelected
                                ? "border-[#18399F] bg-[#EEF4FF]"
                                : "border-[#E5ECF8] bg-[#FBFDFF] hover:border-[#C9D4EC]",
                              isDisabled && "cursor-not-allowed opacity-50"
                            )}
                          >
                            <span className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isDisabled}
                                onChange={() => toggleAreaFilter(area)}
                                className="size-4 rounded accent-[#18399F]"
                              />
                              <span className="text-sm font-medium text-slate-600">
                                {area}
                              </span>
                            </span>
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#3656B7]">
                              {count}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </SidebarFilterSection>

            <SidebarFilterSection title="Price range">
              <div className="rounded-[1.2rem] border border-[#DCE5F7] bg-[#F8FBFF] p-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                      Max budget
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[#102A74]">
                      GHS {budgetCurrent.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400">
                    GHS {filters.budget.min.toLocaleString()} -{" "}
                    {filters.budget.max.toLocaleString()}
                  </p>
                </div>

                <div className="mt-4" onWheel={handleBudgetWheel}>
                  <label htmlFor="tenant-budget-range" className="sr-only">
                    Budget slider
                  </label>
                  <input
                    id="tenant-budget-range"
                    type="range"
                    min={filters.budget.min}
                    max={filters.budget.max}
                    step={budgetStep}
                    value={budgetCurrent}
                    onChange={handleBudgetRangeChange}
                    className="h-2 w-full cursor-ew-resize accent-[#18399F]"
                  />
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjustBudget(-1)}
                    className="grid size-8 shrink-0 place-items-center rounded-full border border-[#18399F] bg-white text-[#18399F] transition-colors duration-300 hover:bg-[#18399F] hover:text-white"
                    aria-label="Decrease maximum budget"
                  >
                    <Minus className="size-4" />
                  </button>
                  <label htmlFor="tenant-budget-input" className="sr-only">
                    Maximum budget
                  </label>
                  <input
                    id="tenant-budget-input"
                    type="number"
                    min={filters.budget.min}
                    max={filters.budget.max}
                    step={budgetStep}
                    value={budgetCurrent}
                    onChange={handleBudgetInputChange}
                    className="h-11 w-full rounded-full border border-[#DCE5F7] px-4 text-sm font-semibold text-[#18399F] outline-none transition focus:border-[#18399F] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => adjustBudget(1)}
                    className="grid size-8 shrink-0 place-items-center rounded-full border border-[#18399F] bg-white text-[#18399F] transition-colors duration-300 hover:bg-[#18399F] hover:text-white"
                    aria-label="Increase maximum budget"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
            </SidebarFilterSection>

            <SidebarFilterSection title="Property type">
              <div className="space-y-2">
                {propertyTypeFilters.map(({ count, type }) => {
                  const isSelected = selectedPropertyTypes.includes(type);
                  const isDisabled = count === 0 && !isSelected;

                  return (
                    <label
                      key={type}
                      className={classNames(
                        "flex cursor-pointer items-center justify-between gap-3 rounded-[1rem] border px-3 py-3 transition-colors duration-300",
                        isSelected
                          ? "border-[#18399F] bg-[#EEF4FF]"
                          : "border-[#E5ECF8] bg-[#FBFDFF] hover:border-[#C9D4EC]",
                        isDisabled && "cursor-not-allowed opacity-50"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => togglePropertyTypeFilter(type)}
                          className="size-4 rounded accent-[#18399F]"
                        />
                        <span className="text-sm font-medium text-slate-600">
                          {type}
                        </span>
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#3656B7]">
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </SidebarFilterSection>

            <SidebarFilterSection title="Bedrooms / Bathrooms">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                    Bedrooms
                  </p>
                  <CounterControl
                    inputId="tenant-bedroom-count"
                    label="bedrooms"
                    value={bedrooms}
                    onChange={handleBedroomChange}
                    onIncrement={() =>
                      setBedrooms((current) =>
                        clampValue(current + 1, 0, roomCountMax)
                      )
                    }
                    onDecrement={() =>
                      setBedrooms((current) =>
                        clampValue(current - 1, 0, roomCountMax)
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                    Bathrooms
                  </p>
                  <CounterControl
                    inputId="tenant-bathroom-count"
                    label="bathrooms"
                    value={bathrooms}
                    onChange={handleBathroomChange}
                    onIncrement={() =>
                      setBathrooms((current) =>
                        clampValue(current + 1, 0, roomCountMax)
                      )
                    }
                    onDecrement={() =>
                      setBathrooms((current) =>
                        clampValue(current - 1, 0, roomCountMax)
                      )
                    }
                  />
                </div>
              </div>
            </SidebarFilterSection>

            <SidebarFilterSection title="Amenities">
              <div className="space-y-2">
                {amenityFilters.map(({ amenity, count }) => {
                  const isSelected = selectedAmenities.includes(amenity);
                  const isDisabled = count === 0 && !isSelected;

                  return (
                    <label
                      key={amenity}
                      className={classNames(
                        "flex cursor-pointer items-center justify-between gap-3 rounded-[1rem] border px-3 py-3 transition-colors duration-300",
                        isSelected
                          ? "border-[#18399F] bg-[#EEF4FF]"
                          : "border-[#E5ECF8] bg-[#FBFDFF] hover:border-[#C9D4EC]",
                        isDisabled && "cursor-not-allowed opacity-50"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => toggleAmenityFilter(amenity)}
                          className="size-4 rounded accent-[#18399F]"
                        />
                        <span className="text-sm font-medium text-slate-600">
                          {amenity}
                        </span>
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#3656B7]">
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </SidebarFilterSection>
          </div>
        </aside>

        <section className="space-y-5">
          <div className="rounded-[2rem] border border-[#DCE5F7] bg-white px-5 py-5 shadow-[0_16px_32px_rgba(15,32,86,0.06)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
                  Listings
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-[#102A74]">
                  Showing {sortedBrowseListings.length} home
                  {sortedBrowseListings.length === 1 ? "" : "s"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedAreas.length > 0
                    ? `Filtered in ${selectedAreas.join(", ")}`
                    : "Browse all available homes across the listed regions."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <SelectableFilterChip
                  active={sortOption === "newest"}
                  onClick={() => setSortOption("newest")}
                >
                  Newest
                </SelectableFilterChip>
                <SelectableFilterChip
                  active={sortOption === "price-asc"}
                  onClick={() => setSortOption("price-asc")}
                >
                  Price: Low-High
                </SelectableFilterChip>
                <SelectableFilterChip
                  active={sortOption === "price-desc"}
                  onClick={() => setSortOption("price-desc")}
                >
                  Price: High-Low
                </SelectableFilterChip>
                <div className="ml-2 flex items-center gap-2 rounded-full border border-[#D7E0F3] bg-[#F8FBFF] p-1">
                  <DashboardActionButton
                    onClick={() => setViewMode("grid")}
                    className={classNames(
                      "size-9 border-transparent",
                      viewMode === "grid" && "bg-[#18399F] text-white hover:text-white"
                    )}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="size-4" />
                  </DashboardActionButton>
                  <DashboardActionButton
                    onClick={() => setViewMode("list")}
                    className={classNames(
                      "size-9 border-transparent",
                      viewMode === "list" && "bg-[#18399F] text-white hover:text-white"
                    )}
                    aria-label="List view"
                  >
                    <List className="size-4" />
                  </DashboardActionButton>
                </div>
              </div>
            </div>
          </div>

          {isLoadingListings ? (
            <div
              className={classNames(
                viewMode === "grid"
                  ? "grid gap-5 md:grid-cols-2"
                  : "space-y-5"
              )}
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <ListingSkeletonCard
                  key={`browse-skeleton-${index}`}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : browseListingsToRender.length > 0 ? (
            <>
              <div
                className={classNames(
                  "gap-5",
                  viewMode === "grid"
                    ? "grid md:grid-cols-2"
                    : "space-y-5"
                )}
              >
                {browseListingsToRender.map((listing) => {
                  const landlord = getLandlordById(listing.landlordId);
                  const ratingSummary = getRatingSummary(
                    getReviewsForProperty(listing.id)
                  );

                  return (
                    <TenantListingCard
                      key={listing.id}
                      listing={listing}
                      isSaved={isListingSaved(listing.id)}
                      isVerifiedLandlord={Boolean(landlord)}
                      landlordName={landlord?.name ?? listing.landlordName ?? ""}
                      onContact={() => openRequestModal(listing, "contact")}
                      onRequestViewing={() => openRequestModal(listing, "viewing")}
                      onToggleSave={() => handleToggleSave(listing)}
                      onViewDetails={() => openDetailsModal(listing)}
                      onViewLandlordProfile={
                        landlord
                          ? () => handleOpenLandlordProfile(landlord.id)
                          : undefined
                      }
                      ratingSummary={ratingSummary}
                      saveLabel={
                        isListingSaved(listing.id) ? "Remove saved home" : "Save home"
                      }
                      viewMode={viewMode}
                    />
                  );
                })}
              </div>

              {sortedBrowseListings.length > browseVisibleCount ? (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setBrowsePagination((current) => ({
                        count:
                          (current.key === browseQueryKey
                            ? current.count
                            : listingsPageSize) + listingsPageSize,
                        key: browseQueryKey,
                      }))
                    }
                    className="rounded-full bg-[#18399F] px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
                  >
                    Load More
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-[1.8rem] border border-dashed border-[#C9D4EC] bg-[#F9FBFF] px-6 py-12 text-center">
              <p className="text-lg font-semibold text-[#102A74]">
                No homes match your filters
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Try broadening the search, clearing a few filters, or increasing
                your budget range.
              </p>
              <button
                type="button"
                onClick={resetBrowseFilters}
                className="mt-6 rounded-full bg-[#18399F] px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );

  const renderSavedHomesView = () => (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-[#DCE5F7] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FAFF_100%)] p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
          Saved Homes
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#102A74] sm:text-[2rem]">
          Saved Homes
        </h2>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          Your favorite properties in one place
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-[#102A74]">
              You have {savedListings.length} saved home
              {savedListings.length === 1 ? "" : "s"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Revisit homes you like, compare options, and take action quickly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SelectableFilterChip
              active={savedSortOption === "all"}
              onClick={() => setSavedSortOption("all")}
            >
              All
            </SelectableFilterChip>
            <SelectableFilterChip
              active={savedSortOption === "recent"}
              onClick={() => setSavedSortOption("recent")}
            >
              Recently Saved
            </SelectableFilterChip>
            <SelectableFilterChip
              active={savedSortOption === "price-asc"}
              onClick={() => setSavedSortOption("price-asc")}
            >
              Price Low-High
            </SelectableFilterChip>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex items-center gap-2 rounded-full border border-[#D7E0F3] bg-[#F8FBFF] p-1">
          <DashboardActionButton
            onClick={() => setViewMode("grid")}
            className={classNames(
              "size-9 border-transparent",
              viewMode === "grid" && "bg-[#18399F] text-white hover:text-white"
            )}
            aria-label="Grid view"
          >
            <LayoutGrid className="size-4" />
          </DashboardActionButton>
          <DashboardActionButton
            onClick={() => setViewMode("list")}
            className={classNames(
              "size-9 border-transparent",
              viewMode === "list" && "bg-[#18399F] text-white hover:text-white"
            )}
            aria-label="List view"
          >
            <List className="size-4" />
          </DashboardActionButton>
        </div>
      </div>

      {isLoadingListings ? (
        <div
          className={classNames(
            viewMode === "grid" ? "grid gap-5 md:grid-cols-2" : "space-y-5"
          )}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <ListingSkeletonCard
              key={`saved-skeleton-${index}`}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : savedListingsToRender.length > 0 ? (
        <>
          <div
            className={classNames(
              "gap-5",
              viewMode === "grid" ? "grid md:grid-cols-2" : "space-y-5"
            )}
          >
            {savedListingsToRender.map((listing) => {
              const landlord = getLandlordById(listing.landlordId);
              const ratingSummary = getRatingSummary(
                getReviewsForProperty(listing.id)
              );

              return (
                <div key={listing.id} className="space-y-3">
                  <div className="flex items-center justify-between gap-3 px-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                      {formatSavedDate(savedTimestamps[listing.id])}
                    </p>
                    <span className="text-xs text-slate-400">{listing.area}</span>
                  </div>
                  <TenantListingCard
                    listing={listing}
                    isSaved
                    isVerifiedLandlord={Boolean(landlord)}
                    landlordName={landlord?.name ?? listing.landlordName ?? ""}
                    onContact={() => openRequestModal(listing, "contact")}
                    onRequestViewing={() => openRequestModal(listing, "viewing")}
                    onToggleSave={() => handleToggleSave(listing)}
                    onViewDetails={() => openDetailsModal(listing)}
                    onViewLandlordProfile={
                      landlord
                        ? () => handleOpenLandlordProfile(landlord.id)
                        : undefined
                    }
                    ratingSummary={ratingSummary}
                    saveLabel="Remove saved home"
                    showRemoveButton
                    viewMode={viewMode}
                  />
                </div>
              );
            })}
          </div>

          {sortedSavedListings.length > savedVisibleCount ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setSavedPagination((current) => ({
                    count:
                      (current.key === savedQueryKey
                        ? current.count
                        : listingsPageSize) + listingsPageSize,
                    key: savedQueryKey,
                  }))
                }
                className="rounded-full bg-[#18399F] px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
              >
                Load More
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="rounded-[1.8rem] border border-dashed border-[#C9D4EC] bg-[#F9FBFF] px-6 py-12 text-center">
          <p className="text-lg font-semibold text-[#102A74]">
            You haven&apos;t saved any homes yet
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Start browsing available listings and tap the heart icon to keep your
            favorite homes here.
          </p>
          <button
            type="button"
            onClick={() => selectNavItemByLabel("Browse Homes")}
            className="mt-6 rounded-full bg-[#18399F] px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
          >
            Browse Homes
          </button>
        </div>
      )}
    </section>
  );

  const renderVerifiedLandlordsView = () => (
    <TenantVerifiedLandlordsView
      landlords={verifiedLandlords}
      listings={listings}
      onOpenReviewsPage={handleOpenLandlordReviews}
      onSelectLandlord={setSelectedLandlordId}
      onSubmitReview={handleSubmitLandlordReview}
      reviews={landlordReviews}
      selectedLandlordId={selectedLandlord?.id ?? null}
      tenantName={profileName}
    />
  );

  const renderLandlordReviewsView = () => (
    <TenantLandlordReviewsView
      landlords={verifiedLandlords}
      listings={listings}
      onOpenVerifiedLandlords={() => selectNavItemByLabel("Verified Landlords")}
      onSelectLandlord={setSelectedLandlordId}
      onSubmitReview={handleSubmitLandlordReview}
      reviews={landlordReviews}
      tenantName={profileName}
    />
  );

  const renderPayRentView = () => (
    <TenantPayRentView
      onPayNow={handlePayRent}
      onSelectPaymentMethod={handleSelectPaymentMethod}
      onToggleReminder={handleToggleReminder}
      paymentDetails={rentPaymentDetails}
    />
  );

  const renderRentHistoryView = () => (
    <TenantRentHistoryView
      history={paymentHistory}
      onViewReceipt={handleViewReceiptFromHistory}
    />
  );

  const renderReceiptsView = () => (
    <TenantReceiptsView
      onDownloadReceipt={handleDownloadReceipt}
      onOpenReceiptPreview={handleOpenReceiptPreview}
      onSelectReceipt={handleSelectReceipt}
      receipts={receiptRecords}
      selectedReceiptId={selectedReceiptId}
    />
  );

  const renderReportIssueView = () => (
    <TenantIssueReportView
      issues={issueReports}
      onSubmitIssue={handleSubmitIssueReport}
    />
  );

  const renderMyRequestsView = () => (
    <TenantRequestsView
      onCreateRequest={handleCreateServiceRequest}
      requests={serviceRequests}
    />
  );

  const renderAnnouncementsView = () => (
    <TenantAnnouncementsView
      announcements={announcements}
      onOpenAnnouncement={handleOpenAnnouncement}
    />
  );

  const renderChatWithLandlordView = () => (
    <TenantChatWithLandlordView
      conversations={chatConversations}
      onOpenConversation={handleOpenConversation}
      onSendMessage={handleSendChatMessage}
      tenantName={profileName}
      typingConversationId={typingConversationId}
    />
  );

  const renderSettingsView = () => (
    <TenantSettingsView
      onSaveSettings={handleSaveTenantSettings}
      settings={tenantSettings}
    />
  );

  const renderHelpView = () => (
    <TenantHelpView
      helpCenter={helpCenter}
      onStartSupportChat={handleOpenSupportChat}
    />
  );

  const renderTermsView = () => (
    <TenantTermsView
      accepted={termsAccepted}
      onToggleAccepted={handleToggleTermsAcceptance}
      terms={termsAndConditions}
    />
  );

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
              <p className="text-xs text-[#3656B7]">Tenant Profile</p>
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
            onClick={() => selectNavItemByLabel(defaultActiveItemLabel)}
            aria-label={`Open ${defaultActiveItemLabel}`}
          >
            <Plus className="size-4" />
          </DashboardActionButton>

          <DashboardActionButton
            onClick={() => selectNavItemByLabel("Saved Homes")}
            aria-label="Open saved homes"
          >
            <Heart className="size-4" />
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
          <TenantSidebarContent
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
                aria-label="Open tenant navigation"
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

          <main className="flex-1 px-4 py-4 sm:px-6 lg:min-h-0 lg:px-7 lg:py-5">
            {isMyPropertiesView ? renderMyPropertiesView() : null}
            {isDashboardOverviewView ? renderDashboardOverviewView() : null}
            {isBookingsView ? renderBookingsView() : null}
            {isDocumentsView ? renderDocumentsView() : null}
            {isBrowseHomesView ? renderBrowseHomesView() : null}
            {isSavedHomesView ? renderSavedHomesView() : null}
            {isVerifiedLandlordsView ? renderVerifiedLandlordsView() : null}
            {isLandlordReviewsView ? renderLandlordReviewsView() : null}
            {isPayRentView ? renderPayRentView() : null}
            {isRentHistoryView ? renderRentHistoryView() : null}
            {isReceiptsView ? renderReceiptsView() : null}
            {isReportIssueView ? renderReportIssueView() : null}
            {isMyRequestsView ? renderMyRequestsView() : null}
            {isAnnouncementView ? renderAnnouncementsView() : null}
            {isChatWithLandlordView ? renderChatWithLandlordView() : null}
            {isSettingsView ? renderSettingsView() : null}
            {isHelpView ? renderHelpView() : null}
            {isTermsView ? renderTermsView() : null}
            {!hasDedicatedView ? (
              <EmptyDashboardView
                title={activeItem?.label ?? defaultActiveItemLabel}
              />
            ) : null}
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
          aria-label="Close tenant navigation overlay"
        />

        <aside
          className={classNames(
            "absolute left-0 top-0 flex h-full w-full max-w-[18rem] flex-col border-r border-[#D6DFF1] bg-[#F4F4F4] transition-transform duration-300",
            isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <TenantSidebarContent
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
          aria-label="Close profile editor overlay"
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
              aria-label="Close profile editor"
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
                    : "border-[#E3E8F5] text-slate-300 cursor-not-allowed"
                )}
              >
                Remove Image
              </button>
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="tenant-profile-name"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#3656B7]"
            >
              Profile Name
            </label>
            <input
              id="tenant-profile-name"
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

          <p className="mt-4 text-xs text-slate-400">
            Click outside the modal or press Escape to close it.
          </p>
        </div>
      </div>

      <ReceiptPreviewModal
        onClose={handleCloseReceiptPreview}
        onDownloadReceipt={handleDownloadReceipt}
        receipt={previewReceipt}
      />

      {requestModalState.listing ? (
        <RequestActionModal
          key={`${requestModalState.mode}-${requestModalState.listing.id}`}
          modalState={requestModalState}
          onClose={closeRequestModal}
          onSubmit={handleSubmitRequest}
        />
      ) : null}

      <TenantPropertyDetailsModal
        onClose={closeManagedPropertyDetails}
        property={selectedManagedProperty}
      />

      <PropertyDetailsModal
        landlord={detailsListing ? getLandlordById(detailsListing.landlordId) : null}
        listing={detailsListing}
        isSaved={detailsListing ? isListingSaved(detailsListing.id) : false}
        onClose={closeDetailsModal}
        onContact={() =>
          detailsListing
            ? handleOpenRequestFromDetails(detailsListing, "contact")
            : null
        }
        onOpenLandlordProfile={() =>
          detailsListing
            ? handleOpenLandlordProfile(detailsListing.landlordId)
            : null
        }
        onRequestViewing={() =>
          detailsListing
            ? handleOpenRequestFromDetails(detailsListing, "viewing")
            : null
        }
        onToggleSave={() =>
          detailsListing ? handleToggleSave(detailsListing) : null
        }
        ratingSummary={
          detailsListing
            ? getRatingSummary(getReviewsForProperty(detailsListing.id))
            : { average: 0, count: 0 }
        }
      />

    </div>
  );
}
