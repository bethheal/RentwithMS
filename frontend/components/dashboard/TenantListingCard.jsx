import {
  ArrowRight,
  Bath,
  BedDouble,
  CalendarDays,
  Heart,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";
import {
  RatingSummary,
  VerifiedLandlordBadge,
} from "./LandlordTrustShared.jsx";
import { classNames } from "../../utils/classNames.js";

export default function TenantListingCard({
  listing,
  isVerifiedLandlord = false,
  isSaved = false,
  landlordName = "",
  onContact,
  onRequestViewing,
  onToggleSave,
  onViewLandlordProfile,
  onViewDetails,
  ratingSummary = { average: 0, count: 0 },
  saveLabel = "Save",
  showRemoveButton = false,
  viewMode = "grid",
}) {
  const isListView = viewMode === "list";

  return (
    <article
      className={classNames(
        "overflow-hidden rounded-[1.8rem] border border-[#DCE5F7] bg-white shadow-[0_18px_36px_rgba(15,32,86,0.08)] transition-all duration-300 hover:-translate-y-0.5",
        isListView ? "h-full" : "h-full"
      )}
    >
      <div
        className={classNames(
          "grid gap-5 p-4 md:p-5",
          isListView ? "md:grid-cols-[15rem_minmax(0,1fr)]" : ""
        )}
      >
        <div className="relative overflow-hidden rounded-[1.35rem] bg-[#EEF3FF]">
          <img
            src={listing.image}
            alt={listing.title}
            className={classNames(
              "w-full object-cover",
              isListView ? "h-full min-h-[15rem]" : "h-[15rem]"
            )}
          />

          <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
            {listing.featured ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#18399F] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_10px_20px_rgba(24,57,159,0.2)]">
                <Sparkles className="size-3" />
                Featured
              </span>
            ) : null}
            <span className="rounded-full bg-white/92 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#18399F] shadow-[0_10px_20px_rgba(24,57,159,0.12)]">
              {listing.area}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleSave}
            className={classNames(
              "absolute right-3 top-3 grid size-10 place-items-center rounded-full border transition-colors duration-300",
              isSaved
                ? "border-[#18399F] bg-[#18399F] text-white"
                : "border-white/70 bg-white/90 text-[#18399F] hover:border-[#18399F]"
            )}
            aria-label={saveLabel}
            aria-pressed={isSaved}
          >
            <Heart className={classNames("size-4", isSaved ? "fill-current" : "")} />
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                <span className="rounded-full bg-[#EEF3FF] px-3 py-1">
                  {listing.houseType}
                </span>
                <span className="rounded-full bg-[#F4F7FF] px-3 py-1 text-slate-500">
                  {listing.region}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#16327E]">
                  {listing.title}
                </h3>
                <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                  <MapPin className="size-4 text-[#5C7BD9]" />
                  <span>{listing.location}</span>
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {isVerifiedLandlord ? <VerifiedLandlordBadge /> : null}
                  <RatingSummary
                    average={ratingSummary.average}
                    count={ratingSummary.count}
                  />
                  {landlordName ? (
                    <span className="rounded-full border border-[#DCE5F7] bg-[#FBFDFF] px-3 py-1.5 text-xs font-semibold text-[#3656B7]">
                      {landlordName}
                    </span>
                  ) : null}
                </div>
              </div>

              <p className="text-sm leading-7 text-slate-500">
                {listing.description}
              </p>
            </div>

            <div className="min-w-[10rem] rounded-[1.3rem] bg-[#F6F8FF] px-4 py-3 text-left">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Price
              </p>
              <p className="mt-2 text-lg font-semibold text-[#16327E]">
                {listing.amount}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E0E8F9] bg-[#F9FBFF] px-3 py-2">
              <BedDouble className="size-4 text-[#18399F]" />
              <span>
                {listing.bedrooms} bedroom{listing.bedrooms === 1 ? "" : "s"}
              </span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E0E8F9] bg-[#F9FBFF] px-3 py-2">
              <Bath className="size-4 text-[#18399F]" />
              <span>
                {listing.bathrooms} bathroom
                {listing.bathrooms === 1 ? "" : "s"}
              </span>
            </span>
            {listing.tags.slice(0, 2).map((tag) => (
              <span
                key={`${listing.id}-${tag}`}
                className="rounded-full bg-[#EEF3FF] px-3 py-2 text-xs font-medium text-[#3656B7]"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onViewDetails}
              className="inline-flex items-center gap-2 rounded-full border border-[#C9D4EC] bg-white px-4 py-2.5 text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
            >
              <ArrowRight className="size-4" />
              <span>View Details</span>
            </button>

            <button
              type="button"
              onClick={onRequestViewing}
              className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
            >
              <CalendarDays className="size-4" />
              <span>Request Viewing</span>
            </button>

            {onViewLandlordProfile ? (
              <button
                type="button"
                onClick={onViewLandlordProfile}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-colors duration-300 hover:bg-emerald-100"
              >
                <span>View Landlord</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={onContact}
              className="inline-flex items-center gap-2 rounded-full border border-[#C9D4EC] bg-[#F8FBFF] px-4 py-2.5 text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
            >
              <Phone className="size-4" />
              <span>Contact</span>
            </button>

            {showRemoveButton ? (
              <button
                type="button"
                onClick={onToggleSave}
                className="text-sm font-semibold text-slate-500 transition-colors duration-300 hover:text-[#18399F]"
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
