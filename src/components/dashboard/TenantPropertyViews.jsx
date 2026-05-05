import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Wallet,
  X,
} from "lucide-react";
import { formatPropertyDate } from "../../utils/propertyRecords.js";

function PropertyStatusPill({ status }) {
  const toneClassName =
    status === "Active"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Inactive"
        ? "bg-rose-50 text-rose-700"
        : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ${toneClassName}`}
    >
      {status}
    </span>
  );
}

export function TenantMyPropertiesView({ onViewDetails, properties }) {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-[#DCE5F7] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FAFF_100%)] p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
          Tenant Workspace
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[#102A74] sm:text-[2rem]">
          My Properties
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
          Review every property currently assigned to you. Landlord updates appear
          automatically whenever a published property changes.
        </p>
      </div>

      {properties.length > 0 ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {properties.map((property) => (
            <article
              key={property.id}
              className="overflow-hidden rounded-[1.8rem] border border-[#DCE5F7] bg-white shadow-[0_18px_36px_rgba(15,32,86,0.08)]"
            >
              <div className="overflow-hidden bg-[#EEF3FF]">
                <img
                  src={property.image}
                  alt={property.title}
                  className="h-52 w-full object-cover"
                />
              </div>

              <div className="space-y-5 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <PropertyStatusPill status={property.status} />
                    <div>
                      <h2 className="text-2xl font-semibold text-[#102A74]">
                        {property.title}
                      </h2>
                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="size-4 text-[#5C7BD9]" />
                        <span>{property.location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[1.2rem] bg-[#F7FAFF] px-4 py-4">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                      Rent
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#102A74]">
                      {property.amount}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.2rem] border border-[#E2EAF8] bg-[#FBFDFF] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                      Move-In Date
                    </p>
                    <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#102A74]">
                      <CalendarDays className="size-4 text-[#18399F]" />
                      <span>
                        {property.moveInDate
                          ? formatPropertyDate(property.moveInDate)
                          : "Move-in date not set"}
                      </span>
                    </p>
                  </div>

                  <div className="rounded-[1.2rem] border border-[#E2EAF8] bg-[#FBFDFF] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                      Last Updated
                    </p>
                    <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#102A74]">
                      <Clock3 className="size-4 text-[#18399F]" />
                      <span>{formatPropertyDate(property.updatedAt)}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onViewDetails(property)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#C9D4EC] bg-white px-4 py-2.5 text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
                >
                  <ArrowRight className="size-4" />
                  <span>View Details</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.8rem] border border-dashed border-[#C9D4EC] bg-[#F9FBFF] px-6 py-12 text-center">
          <p className="text-lg font-semibold text-[#102A74]">
            No published properties assigned yet
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            A property will appear here once your landlord assigns it to you and
            publishes the listing.
          </p>
        </div>
      )}
    </section>
  );
}

export function TenantPropertyDetailsModal({ onClose, property }) {
  if (!property) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-[#07163F]/45"
        aria-label="Close assigned property details"
      />

      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[1.9rem] border border-[#DCE5F7] bg-white shadow-[0_24px_48px_rgba(13,29,76,0.22)]">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="bg-[#EEF3FF]">
            <img
              src={property.image}
              alt={property.title}
              className="h-full min-h-[18rem] w-full object-cover"
            />
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
                  Assigned Property
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#102A74]">
                  {property.title}
                </h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="size-4 text-[#5C7BD9]" />
                  <span>{property.location}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="grid size-9 place-items-center rounded-full border border-[#C9D4EC] text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
                aria-label="Close assigned property details"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <PropertyStatusPill status={property.status} />
              <span className="inline-flex items-center gap-2 rounded-full bg-[#EEF3FF] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#3656B7]">
                {property.propertyType}
              </span>
            </div>

            <div className="mt-5 rounded-[1.2rem] bg-[#F7FAFF] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Rent Amount
              </p>
              <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-[#102A74]">
                <Wallet className="size-4 text-[#18399F]" />
                <span>{property.amount}</span>
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.2rem] bg-[#FBFDFF] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                  Move-In Date
                </p>
                <p className="mt-3 text-sm font-semibold text-[#102A74]">
                  {property.moveInDate
                    ? formatPropertyDate(property.moveInDate)
                    : "Move-in date not set"}
                </p>
              </div>

              <div className="rounded-[1.2rem] bg-[#FBFDFF] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                  Landlord
                </p>
                <p className="mt-3 text-sm font-semibold text-[#102A74]">
                  {property.landlordName}
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-500">
              {property.description || "No additional property notes were shared yet."}
            </p>

            <div className="mt-5 rounded-[1.2rem] bg-[#FBFDFF] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Amenities
              </p>
              <p className="mt-3 text-sm text-slate-600">
                {property.amenities.length > 0
                  ? property.amenities.join(", ")
                  : "No amenities added yet"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
