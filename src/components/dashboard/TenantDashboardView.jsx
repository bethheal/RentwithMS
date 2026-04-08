import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  LogOut,
  Minus,
  Plus,
  Search,
  UserCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { tenantDashboardResponse } from "../../data/mockApi/tenantDashboard.js";
import { useAuth } from "../../context/AuthContext.jsx";
import TenantListingCard from "./TenantListingCard.jsx";

function CounterControl({ value }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE5F7] bg-white px-2 py-1 text-[#18399F] shadow-[0_10px_24px_rgba(15,32,86,0.05)]">
      <button type="button" className="grid size-5 place-items-center rounded-full bg-[#18399F] text-white">
        <Plus className="size-3" />
      </button>
      <span className="min-w-6 text-center text-xs font-semibold text-slate-500">{value}</span>
      <button type="button" className="grid size-5 place-items-center rounded-full bg-[#18399F] text-white">
        <Minus className="size-3" />
      </button>
    </div>
  );
}

export default function TenantDashboardView() {
  const { logout, user } = useAuth();
  const { filters, listings, map, navSections } = tenantDashboardResponse.data;
  const profileName = user?.name ?? tenantDashboardResponse.data.user.name;
  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? tenantDashboardResponse.data.user.initials;

  return (
    <div className="min-h-screen bg-white text-[#18399F]">
      <div className="grid min-h-screen lg:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#D6DFF1] bg-[#F4F4F4] lg:flex lg:flex-col">
          <div className="flex h-14 items-center border-b border-[#C9D4EC] px-8">
            <Link to="/" className="text-[1.05rem] font-black uppercase tracking-[0.08em] text-black">
              RMS
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto px-7 py-5">
            <div className="space-y-5">
              {navSections.map((section) => (
                <div key={section.title}>
                  <div className="flex items-center gap-1 text-[0.8rem] font-bold uppercase text-[#111827]">
                    <span>{section.title}</span>
                    <ChevronDown className="size-3" />
                  </div>
                  <div className="mt-1 space-y-1.5 pl-4">
                    {section.items.map((item) => (
                      <a
                        key={`${section.title}-${item}`}
                        href="#"
                        className={`block text-[0.84rem] transition-colors duration-300 ${
                          item === "Browse Homes" ? "font-semibold text-[#18399F]" : "text-[#3656B7] hover:text-[#18399F]"
                        }`}
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="flex h-14 items-center justify-between border-b border-[#C9D4EC] px-4 sm:px-6 lg:px-7">
            <Link to="/" className="text-[1rem] font-black uppercase tracking-[0.08em] text-black lg:hidden">
              RMS
            </Link>

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
            <div className="flex items-center gap-3 text-[#18399F]">
              <ArrowLeft className="size-5" />
              <span className="text-sm font-medium text-slate-400">
                {profileName}
              </span>
            </div>

            <div className="mt-4">
              <div className="relative max-w-[42rem]">
                <Search className="pointer-events-none absolute left-5 top-1/2 size-6 -translate-y-1/2 text-[#18399F]" />
                <input
                  type="text"
                  placeholder="Search for homes, neighborhoods, or landlords"
                  className="h-14 w-full rounded-[1rem] bg-[#D9D9D9] pl-14 pr-5 text-sm text-slate-700 outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="mt-7 grid gap-8 lg:grid-cols-[15.5rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)]">
              <section className="space-y-6">
                <div>
                  <div className="flex items-center gap-1 text-sm font-bold uppercase text-[#111827]">
                    <span>Filter By</span>
                    <ChevronDown className="size-4 text-[#18399F]" />
                  </div>
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
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="size-3.5 accent-[#18399F]" />
                        <span>Legon</span>
                      </label>
                      {filters.areas.map((area) => (
                        <label key={area} className="flex items-center gap-2">
                          <input type="checkbox" className="size-3.5 accent-[#18399F]" />
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
                          <input type="checkbox" className="size-3.5 accent-[#18399F]" />
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
                          <input type="checkbox" className="size-3.5 accent-[#18399F]" />
                          <span>{utility}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold text-[#18399F]">Bedroom</div>
                    <div className="mt-2 pl-4">
                      <CounterControl value={filters.bedrooms} />
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold text-[#18399F]">Bathrooms</div>
                    <div className="mt-2 pl-4">
                      <CounterControl value={filters.bathrooms} />
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
                        <div className="h-1.5 w-[38%] rounded-full bg-[#18399F]" />
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs text-[#3656B7]">
                        <button type="button" className="grid size-4 place-items-center rounded-[0.2rem] bg-[#18399F] text-white">
                          <Plus className="size-2.5" />
                        </button>
                        <span className="rounded-[0.2rem] bg-[#D9D9D9] px-2 py-1 text-slate-600">
                          {filters.budget.current}
                        </span>
                        <button type="button" className="grid size-4 place-items-center rounded-[0.2rem] bg-[#18399F] text-white">
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

                <div className="space-y-5">
                  {listings.map((listing) => (
                    <TenantListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
