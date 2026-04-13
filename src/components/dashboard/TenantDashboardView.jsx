import { useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Compass,
  Droplets,
  FileText,
  FolderOpen,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquareText,
  MessagesSquare,
  Minus,
  Plus,
  Receipt,
  Search,
  Settings,
  ShieldAlert,
  Trash2,
  UserCircle2,
  Wallet,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { tenantDashboardResponse } from "../../data/mockApi/tenantDashboard.js";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { classNames } from "../../utils/classNames.js";
import TenantListingCard from "./TenantListingCard.jsx";

const defaultActiveItemLabel = "Browse Homes";

const navItemIconMap = {
  "My Home": Home,
  "Browse Homes": Compass,
  "All Homes": Building2,
  "Verified Landlords": BadgeCheck,
  "Flagged Landlords": ShieldAlert,
  "Landlords Reviews": MessageSquareText,
  "Pay Rent": Wallet,
  "Rent History": History,
  Receipts: Receipt,
  Electricity: Zap,
  "Water Bills": Droplets,
  Waste: Trash2,
  "Report Issue": Wrench,
  "My Requests": ClipboardList,
  Announcement: Megaphone,
  "Chat with Landlord": MessagesSquare,
  Dashboard: LayoutDashboard,
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

function CounterControl({ value, onIncrement, onDecrement }) {
  const canDecrement = value > 0;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE5F7] bg-white px-2 py-1 text-[#18399F] shadow-[0_10px_24px_rgba(15,32,86,0.05)]">
      <button
        type="button"
        onClick={onIncrement}
        className="grid size-5 place-items-center rounded-full bg-[#18399F] text-white transition-colors duration-300 hover:bg-[#102A74]"
        aria-label="Increase value"
      >
        <Plus className="size-3" />
      </button>
      <span className="min-w-6 text-center text-xs font-semibold text-slate-500">
        {value}
      </span>
      <button
        type="button"
        onClick={onDecrement}
        disabled={!canDecrement}
        className={classNames(
          "grid size-5 place-items-center rounded-full text-white transition-colors duration-300",
          canDecrement
            ? "bg-[#18399F] hover:bg-[#102A74]"
            : "bg-[#B8C7F3] cursor-not-allowed"
        )}
        aria-label="Decrease value"
      >
        <Minus className="size-3" />
      </button>
    </div>
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
        <Icon className="size-4" />
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

function TenantSidebarContent({
  activeItemId,
  expandedSections,
  mainNavSections,
  onClose,
  onSelectItem,
  onToggleSection,
  preferenceItems,
  showCloseButton = false,
}) {
  return (
    <>
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
  const { logout, user } = useAuth();
  const { filters, listings, map, navSections } = tenantDashboardResponse.data;
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
  const profileName = user?.name ?? tenantDashboardResponse.data.user.name;
  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? tenantDashboardResponse.data.user.initials;
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
  const [searchValue, setSearchValue] = useState("");
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedHouses, setSelectedHouses] = useState([]);
  const [selectedUtilities, setSelectedUtilities] = useState([]);
  const [bedrooms, setBedrooms] = useState(filters.bedrooms);
  const [bathrooms, setBathrooms] = useState(filters.bathrooms);
  const [budgetCurrent, setBudgetCurrent] = useState(filters.budget.current);

  useBodyScrollLock(isMobileNavOpen);

  const activeItem =
    allItems.find((item) => item.id === activeItemId) ?? allItems[0];

  const visibleListings = listings.filter((listing) => {
    const matchesSearch =
      !searchValue.trim() ||
      [listing.title, listing.description, listing.location, listing.area]
        .join(" ")
        .toLowerCase()
        .includes(searchValue.trim().toLowerCase());
    const matchesArea =
      selectedAreas.length === 0 || selectedAreas.includes(listing.area);
    const matchesHouse =
      selectedHouses.length === 0 || selectedHouses.includes(listing.houseType);
    const matchesUtilities =
      selectedUtilities.length === 0 ||
      selectedUtilities.every((utility) =>
        listing.utilities.includes(utility)
      );
    const matchesBedrooms = bedrooms === 0 || listing.bedrooms >= bedrooms;
    const matchesBathrooms = bathrooms === 0 || listing.bathrooms >= bathrooms;
    const matchesBudget = listing.amountValue <= budgetCurrent;

    return (
      matchesSearch &&
      matchesArea &&
      matchesHouse &&
      matchesUtilities &&
      matchesBedrooms &&
      matchesBathrooms &&
      matchesBudget
    );
  });

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

  const renderBrowseHomesView = () => (
    <>
      <div className="flex flex-wrap items-center gap-3 text-[#18399F]">
        <ArrowLeft className="size-5" />
        <span className="text-sm font-medium text-slate-400">{profileName}</span>
      </div>

      <div className="mt-4">
        <div className="relative max-w-[42rem]">
          <Search className="pointer-events-none absolute left-5 top-1/2 size-6 -translate-y-1/2 text-[#18399F]" />
          <input
            type="text"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search for homes, neighborhoods, or landlords"
            className="h-14 w-full rounded-[1rem] bg-[#D9D9D9] pl-14 pr-5 text-sm text-slate-700 outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="mt-7 grid gap-8 xl:grid-cols-[15.5rem_minmax(0,1fr)]">
        <section className="space-y-6">
          <div className="flex items-center gap-1 text-sm font-bold uppercase text-[#111827]">
            <span>Filter By</span>
            <ChevronDown className="size-4 text-[#18399F]" />
          </div>

          <div className="space-y-4 text-[0.9rem]">
            <div>
              <div className="flex items-center gap-1 font-semibold text-[#18399F]">
                <span>Location</span>
                <ChevronRight className="size-4" />
              </div>
              <div className="mt-1 pl-4 text-[#3656B7]">
                <div className="flex items-center gap-1">
                  <span>Map</span>
                </div>
              </div>
            </div>

            <div>
              <div className="font-semibold text-[#18399F]">Choose Area</div>
              <div className="mt-2 space-y-1.5 pl-4 text-[#3656B7]">
                {filters.areas.map((area) => (
                  <label key={area} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedAreas.includes(area)}
                      onChange={() =>
                        setSelectedAreas((current) => toggleValue(current, area))
                      }
                      className="size-3.5 accent-[#18399F]"
                    />
                    <span>{area}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="font-semibold text-[#18399F]">Houses</div>
              <div className="mt-2 space-y-1.5 pl-4 text-[#3656B7]">
                {filters.houses.map((house) => (
                  <label key={house} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedHouses.includes(house)}
                      onChange={() =>
                        setSelectedHouses((current) =>
                          toggleValue(current, house)
                        )
                      }
                      className="size-3.5 accent-[#18399F]"
                    />
                    <span>{house}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="font-semibold text-[#18399F]">Utilities</div>
              <div className="mt-2 space-y-1.5 pl-4 text-[#3656B7]">
                {filters.utilities.map((utility) => (
                  <label key={utility} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedUtilities.includes(utility)}
                      onChange={() =>
                        setSelectedUtilities((current) =>
                          toggleValue(current, utility)
                        )
                      }
                      className="size-3.5 accent-[#18399F]"
                    />
                    <span>{utility}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="font-semibold text-[#18399F]">Bedroom</div>
              <div className="mt-2 pl-4">
                <CounterControl
                  value={bedrooms}
                  onIncrement={() => setBedrooms((current) => current + 1)}
                  onDecrement={() =>
                    setBedrooms((current) => Math.max(0, current - 1))
                  }
                />
              </div>
            </div>

            <div>
              <div className="font-semibold text-[#18399F]">Bathrooms</div>
              <div className="mt-2 pl-4">
                <CounterControl
                  value={bathrooms}
                  onIncrement={() => setBathrooms((current) => current + 1)}
                  onDecrement={() =>
                    setBathrooms((current) => Math.max(0, current - 1))
                  }
                />
              </div>
            </div>

            <div>
              <div className="font-semibold text-[#18399F]">Budget</div>
              <div className="mt-2 rounded-[1rem] border border-[#DCE5F7] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,32,86,0.05)]">
                <div className="flex items-end justify-between text-xs text-[#3656B7]">
                  <div>
                    <p>GHS Min</p>
                    <p className="text-slate-400">{filters.budget.min}</p>
                  </div>
                  <div className="text-right">
                    <p>GHS Max</p>
                    <p className="text-slate-400">{filters.budget.max}</p>
                  </div>
                </div>
                <div className="mt-4 h-1.5 rounded-full bg-[#DCE5F7]">
                  <div
                    className="h-1.5 rounded-full bg-[#18399F]"
                    style={{
                      width: `${Math.max(
                        6,
                        (budgetCurrent / filters.budget.max) * 100
                      )}%`,
                    }}
                  />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[#3656B7]">
                  <button
                    type="button"
                    onClick={() =>
                      setBudgetCurrent((current) =>
                        Math.min(filters.budget.max, current + 500)
                      )
                    }
                    className="grid size-4 place-items-center rounded-[0.2rem] bg-[#18399F] text-white"
                    aria-label="Increase maximum budget"
                  >
                    <Plus className="size-2.5" />
                  </button>
                  <span className="rounded-[0.2rem] bg-[#D9D9D9] px-2 py-1 text-slate-600">
                    {budgetCurrent}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setBudgetCurrent((current) =>
                        Math.max(filters.budget.min, current - 500)
                      )
                    }
                    className="grid size-4 place-items-center rounded-[0.2rem] bg-[#18399F] text-white"
                    aria-label="Decrease maximum budget"
                  >
                    <Minus className="size-2.5" />
                  </button>
                  <span className="text-slate-400">/ Yr</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <article className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,#1C405D_0%,#213D54_36%,#0A224A_100%)] p-5 text-white shadow-[0_22px_44px_rgba(13,29,76,0.16)]">
            <div
              className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(122,190,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(122,190,255,0.12)_1px,transparent_1px)] [background-size:36px_36px]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,transparent,rgba(4,15,44,0.6))]"
              aria-hidden="true"
            />
            <div className="relative min-h-[13.5rem]">
              {map.labels.map((label) => (
                <span
                  key={label.name}
                  className="absolute text-sm font-semibold text-white/90"
                  style={{ top: label.top, left: label.left }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          </article>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-[#DCE5F7] bg-[#F9FBFF] px-4 py-3 text-sm text-slate-500">
            <span>Showing {visibleListings.length} home(s)</span>
            <button
              type="button"
              onClick={() => {
                setSearchValue("");
                setSelectedAreas([]);
                setSelectedHouses([]);
                setSelectedUtilities([]);
                setBedrooms(filters.bedrooms);
                setBathrooms(filters.bathrooms);
                setBudgetCurrent(filters.budget.current);
              }}
              className="font-semibold text-[#18399F] underline underline-offset-4"
            >
              Reset Filters
            </button>
          </div>

          <div className="space-y-5">
            {visibleListings.length > 0 ? (
              visibleListings.map((listing) => (
                <TenantListingCard key={listing.id} listing={listing} />
              ))
            ) : (
              <div className="rounded-[1.8rem] border border-dashed border-[#C9D4EC] bg-[#F9FBFF] px-6 py-12 text-center text-sm leading-7 text-slate-500">
                No homes match your current filters yet. Adjust the search,
                budget, or checkboxes to see more results.
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-white text-[#18399F]">
      <div className="grid min-h-screen lg:grid-cols-[14rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#D6DFF1] bg-[#F4F4F4] lg:flex lg:flex-col">
          <TenantSidebarContent
            activeItemId={activeItemId}
            expandedSections={expandedSections}
            mainNavSections={mainNavSections}
            onSelectItem={handleSelectItem}
            onToggleSection={handleSectionToggle}
            preferenceItems={preferenceSection?.items ?? []}
          />
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="flex h-14 items-center justify-between border-b border-[#C9D4EC] px-4 sm:px-6 lg:px-7">
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
              <span className="grid size-9 place-items-center rounded-full text-[#18399F]">
                <UserCircle2 className="size-7" />
              </span>
              <span className="grid size-9 place-items-center rounded-full bg-[#D9D9D9] text-sm font-bold text-[#18399F]">
                {initials}
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

          <main className="flex-1 px-4 py-4 sm:px-6 lg:px-7 lg:py-5">
            {activeItem?.label === defaultActiveItemLabel ? (
              renderBrowseHomesView()
            ) : (
              <EmptyDashboardView
                title={activeItem?.label ?? defaultActiveItemLabel}
              />
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
    </div>
  );
}
