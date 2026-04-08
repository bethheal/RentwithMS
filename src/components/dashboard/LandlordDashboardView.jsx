import { useState } from "react";
import {
  ArrowRight,
  Bath,
  BedDouble,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Circle,
  ImageUp,
  Info,
  LogOut,
  Mail,
  MapPin,
  Plus,
  Send,
  UserCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { landlordDashboardResponse } from "../../data/mockApi/landlordDashboard.js";

const stepShape = {
  first:
    "polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%, 0 50%)",
  middle:
    "polygon(18px 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 18px 100%, 0 50%)",
  last:
    "polygon(18px 0, 100% 0, 100% 100%, 18px 100%, 0 50%)",
};

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

function LandlordSidebar({ navSections }) {
  const primarySections = navSections.slice(0, -1);
  const preferencesSection = navSections.at(-1);

  return (
    <aside className="hidden border-r border-[#D6DFF1] bg-[#F4F4F4] lg:flex lg:flex-col">
      <div className="flex h-14 items-center border-b border-[#C9D4EC] px-8">
        <Link to="/" className="text-[1.05rem] font-black uppercase tracking-[0.08em] text-black">
          RMS
        </Link>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex-1 px-7 py-5">
          <div className="space-y-5">
            {primarySections.map((section) => (
              <div key={section.title}>
                <div className="flex items-center gap-1 text-[0.8rem] font-bold uppercase text-[#111827]">
                  <span>{section.title}</span>
                  <ChevronDown className="size-3" />
                </div>

                <div className="mt-1 space-y-1.5 pl-4">
                  {section.items.map((item) => (
                    <button
                      key={`${section.title}-${item}`}
                      type="button"
                      className={`block text-[0.84rem] transition-colors duration-300 ${
                        item === "Add Property"
                          ? "font-semibold text-[#18399F]"
                          : "text-[#3656B7] hover:text-[#18399F]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {preferencesSection ? (
          <div className="border-t border-[#C9D4EC] px-7 py-5">
            <div className="flex items-center gap-1 text-[0.8rem] font-bold uppercase text-[#111827]">
              <span>{preferencesSection.title}</span>
              <ChevronDown className="size-3" />
            </div>
            <div className="mt-1 space-y-1.5 pl-4">
              {preferencesSection.items.map((item) => (
                <button
                  key={`${preferencesSection.title}-${item}`}
                  type="button"
                  className="block text-[0.84rem] text-[#3656B7] transition-colors duration-300 hover:text-[#18399F]"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
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
  const { logout, user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const { data } = landlordDashboardResponse;
  const profileName = user?.name ?? data.user.name;
  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? data.user.initials;

  const contentByStep = [
    <DetailsStep key="details" details={data.propertyDetails} />,
    <PricingStep key="pricing" pricing={data.pricing} />,
    <ImageStep key="image" gallery={data.gallery} />,
    <CompletedStep key="completed" />,
  ];

  return (
    <div className="min-h-screen bg-white text-[#18399F]">
      <div className="grid min-h-screen lg:grid-cols-[13.5rem_minmax(0,1fr)]">
        <LandlordSidebar navSections={data.navSections} />

        <div className="flex min-w-0 flex-col">
          <header className="flex h-14 items-center justify-between border-b border-[#C9D4EC] px-4 sm:px-6 lg:px-7">
            <Link to="/" className="text-[1rem] font-black uppercase tracking-[0.08em] text-black lg:hidden">
              RMS
            </Link>

            <div className="ml-auto flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-full bg-[#D9D9D9] text-xs font-bold text-[#18399F]">
                {initials}
              </span>
              <span className="hidden text-sm font-medium text-slate-400 sm:inline">
                {profileName}
              </span>
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

          <main className="flex-1 bg-[#FAFBFF] px-4 py-4 sm:px-6 lg:px-7 lg:py-5">
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
                    className="grid size-8 place-items-center rounded-full border border-[#CAD5ED] bg-white text-[#18399F]"
                  >
                    <Icon className="size-4" />
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setActiveStep(0)}
                  className="ml-2 rounded-[0.75rem] border border-[#CAD5ED] bg-white px-4 py-2 text-sm font-semibold text-[#18399F] transition hover:border-[#18399F]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveStep((currentStep) =>
                      Math.min(currentStep + 1, data.steps.length - 1),
                    )
                  }
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
                <PropertyPreviewCard preview={data.preview} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
