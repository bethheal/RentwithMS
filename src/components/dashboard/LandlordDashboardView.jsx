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
import { landlordDashboardResponse } from "../../data/mockApi/landlordDashboard.js";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { classNames } from "../../utils/classNames.js";

const stepShape = {
  first:
    "polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%, 0 50%)",
  middle:
    "polygon(18px 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 18px 100%, 0 50%)",
  last:
    "polygon(18px 0, 100% 0, 100% 100%, 18px 100%, 0 50%)",
};

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

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[0.72rem] font-medium text-slate-500">
        {label}
      </span>
      {children}
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

function DurationControl({ value }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-[0.55rem] border border-[#D7E0F1] bg-white px-2 py-1 shadow-[0_10px_20px_rgba(15,32,86,0.05)]">
      <button
        type="button"
        className="grid size-6 place-items-center rounded-[0.35rem] border border-[#D7E0F1] text-[#18399F]"
      >
        -
      </button>
      <span className="min-w-5 text-center text-sm font-semibold text-[#18399F]">
        {value}
      </span>
      <button
        type="button"
        className="grid size-6 place-items-center rounded-[0.35rem] border border-[#D7E0F1] text-[#18399F]"
      >
        +
      </button>
    </div>
  );
}

function StepItem({ index, isActive, isComplete, isLast, label, onClick }) {
  const shape = index === 0 ? stepShape.first : isLast ? stepShape.last : stepShape.middle;
  const palette = isActive
    ? "border-[#18399F] bg-[#EEF4FF] text-[#18399F]"
    : isComplete
      ? "border-[#18399F] bg-[#18399F] text-white"
      : "border-[#CBD5E8] bg-white text-slate-500";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-12 min-w-[10rem] flex-1 items-center justify-center gap-2 border text-sm font-semibold transition ${palette}`}
      style={{ clipPath: shape }}
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
  onNextStep,
  onOpenProfileModal,
  onResetStep,
  preview,
  setActiveStep,
}) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[1.55rem] font-black tracking-[-0.04em] text-[#111827]">
            Add Properties
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Properties &gt; <span className="font-semibold text-[#18399F]">Add Property</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="grid size-8 place-items-center rounded-full bg-[#18399F] text-white shadow-[0_12px_24px_rgba(24,57,159,0.18)]"
          >
            <Plus className="size-4" />
          </button>

          {[Mail, Bell, UserCircle2].map((Icon, index) => (
            <button
              key={index}
              type="button"
              onClick={Icon === UserCircle2 ? onOpenProfileModal : undefined}
              className="grid size-8 place-items-center rounded-full border border-[#CAD5ED] bg-white text-[#18399F]"
              aria-label={
                Icon === UserCircle2 ? "Open landlord profile editor" : undefined
              }
            >
              <Icon className="size-4" />
            </button>
          ))}

          <button
            type="button"
            onClick={onResetStep}
            className="ml-2 rounded-[0.75rem] border border-[#CAD5ED] bg-white px-4 py-2 text-sm font-semibold text-[#18399F] transition hover:border-[#18399F]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onNextStep}
            className="inline-flex items-center gap-2 rounded-[0.75rem] bg-[#18399F] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(24,57,159,0.18)] transition hover:bg-[#102A74]"
          >
            <span>Next</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1 rounded-[0.95rem] border border-[#CAD5ED] bg-white p-1 shadow-[0_12px_24px_rgba(15,32,86,0.05)]">
        {data.steps.map((step, index) => (
          <StepItem
            key={step.id}
            index={index}
            label={step.label}
            isActive={index === activeStep}
            isComplete={index < activeStep}
            isLast={index === data.steps.length - 1}
            onClick={() => setActiveStep(index)}
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

function DetailsStep({ details }) {
  return (
    <div className="space-y-5">
      <Panel title="General Information">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="House Type *">
            <Select defaultValue={details.houseType}>
              <option>{details.houseType}</option>
              <option>Studio</option>
              <option>Single Room</option>
              <option>Apartment</option>
            </Select>
          </Field>

          <Field label="Property Type *">
            <Select defaultValue={details.propertyType || ""}>
              <option value="">Select property type</option>
              <option>Private</option>
              <option>Shared</option>
              <option>Serviced</option>
            </Select>
          </Field>

          <Field label="Name *" className="md:col-span-2">
            <Input defaultValue={details.name} />
          </Field>

          <Field label="Description" className="md:col-span-2">
            <TextArea defaultValue={details.description} />
          </Field>
        </div>
      </Panel>

      <Panel title="Unit Location">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Street Address" className="md:col-span-2">
            <Input defaultValue={details.address} />
          </Field>

          <Field label="House Number *">
            <Input defaultValue={details.houseNumber} />
          </Field>

          <Field label="City *">
            <Input defaultValue={details.city} />
          </Field>

          <Field label="Region *">
            <Select defaultValue={details.region}>
              <option>{details.region}</option>
              <option>Greater Accra</option>
              <option>Central</option>
              <option>Ashanti</option>
            </Select>
          </Field>

          <Field label="Country *">
            <Select defaultValue={details.country}>
              <option>{details.country}</option>
              <option>Ghana</option>
              <option>Nigeria</option>
              <option>Kenya</option>
            </Select>
          </Field>
        </div>
      </Panel>

      <Panel title="Room Information">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Number of Bedroom *">
            <Select defaultValue={details.bedrooms}>
              <option>{details.bedrooms}</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
            </Select>
          </Field>

          <Field label="Number of Bath *">
            <Select defaultValue={details.bathrooms}>
              <option>{details.bathrooms}</option>
              <option>2</option>
              <option>3</option>
            </Select>
          </Field>

          <Field label="Size of Room *">
            <Select defaultValue={details.roomSize || ""}>
              <option value="">Select room size</option>
              <option>Compact</option>
              <option>Medium</option>
              <option>Large</option>
            </Select>
          </Field>

          <Field label="Room Occupation">
            <Select defaultValue={details.roomOccupation}>
              <option>{details.roomOccupation}</option>
              <option>Single</option>
              <option>Double</option>
              <option>Family</option>
            </Select>
          </Field>
        </div>

        <div className="mt-4">
          <p className="text-[0.72rem] font-medium text-slate-500">Main Facilities</p>
          <div className="mt-2 space-y-1.5">
            {details.facilities.map((facility) => (
              <label key={facility} className="flex items-center gap-2 text-sm text-[#18399F]">
                <input type="checkbox" defaultChecked className="size-3.5 accent-[#18399F]" />
                <span>{facility}</span>
              </label>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}

function PricingStep({ pricing }) {
  return (
    <Panel title="Pricing" className="min-h-[22rem]">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Set Your Price *">
          <Input defaultValue={pricing.price} />
        </Field>

        <Field label="Negotiable *">
          <Select defaultValue={pricing.negotiable}>
            <option>{pricing.negotiable}</option>
            <option>Yes</option>
            <option>No</option>
          </Select>
        </Field>
      </div>

      <div className="mt-5">
        <Field label="Duration (in a Year) *">
          <DurationControl value={pricing.duration} />
        </Field>
      </div>
    </Panel>
  );
}

function ImageStep({ gallery }) {
  return (
    <Panel title="Image of House">
      <div className="rounded-[1rem] border border-dashed border-[#BFD0F3] bg-[#FBFDFF] px-6 py-10 text-center">
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
          SVG, PNG, JPG, MP4 or GIF (max 800x400px)
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {gallery.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className="overflow-hidden rounded-[1rem] border border-[#D7E0F1] bg-[#F7F9FF] shadow-[0_10px_20px_rgba(15,32,86,0.05)]"
          >
            <img
              src={image}
              alt={`Property preview ${index + 1}`}
              className="h-20 w-20 object-cover"
            />
          </div>
        ))}
      </div>

      <label className="mt-5 flex items-start gap-2 text-sm text-slate-500">
        <input type="checkbox" className="mt-1 size-4 accent-[#18399F]" />
        <span>
          I agree to all policies and confirm the property media is ready for publication.
        </span>
      </label>
    </Panel>
  );
}

function CompletedStep() {
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
        <button
          type="button"
          className="mt-6 inline-flex items-center gap-2 rounded-[0.9rem] bg-[#18399F] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(24,57,159,0.24)] transition hover:bg-[#102A74]"
        >
          <span>Post</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </Panel>
  );
}

export default function LandlordDashboardView() {
  const { logout, updateUser, user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const { data } = landlordDashboardResponse;
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
  const isAddPropertyView = activeItemLabel === "Add Property";
  const isActiveSectionExpanded =
    activeSection?.id && activeSection.id !== "preferences"
      ? Boolean(expandedSections[activeSection.id])
      : true;

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
    setIsProfileModalOpen(false);
  };

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

  const handleNextStep = () => {
    setActiveStep((currentStep) => Math.min(currentStep + 1, data.steps.length - 1));
  };

  const contentByStep = [
    <DetailsStep key="details" details={data.propertyDetails} />,
    <PricingStep key="pricing" pricing={data.pricing} />,
    <ImageStep key="image" gallery={data.gallery} />,
    <CompletedStep key="completed" />,
  ];

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
            {isAddPropertyView ? (
              <AddPropertyView
                activeStep={activeStep}
                contentByStep={contentByStep}
                data={data}
                onNextStep={handleNextStep}
                onOpenProfileModal={handleOpenProfileModal}
                onResetStep={() => setActiveStep(0)}
                preview={data.preview}
                setActiveStep={setActiveStep}
              />
            ) : (
              <EmptyDashboardView title={activeItemLabel} />
            )}
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
