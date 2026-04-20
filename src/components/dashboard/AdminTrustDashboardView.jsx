import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Building2,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldMinus,
  X,
} from "lucide-react";
import { landlordTrustResponse } from "../../data/mockApi/landlordTrust.js";
import { tenantDashboardResponse } from "../../data/mockApi/tenantDashboard.js";
import { classNames } from "../../utils/classNames.js";
import { getRatingSummary, formatTrustDate } from "../../utils/landlordTrust.js";
import {
  RatingSummary,
  ReviewFeed,
  VerificationBadgeList,
  VerifiedLandlordBadge,
} from "./LandlordTrustShared.jsx";

function MetricCard({ label, value, helper }) {
  return (
    <article className="rounded-[1.6rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_16px_32px_rgba(15,32,86,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C7BD9]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#102A74]">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </article>
  );
}

function propertyFilterMatches(filterValue, propertiesCount) {
  if (filterValue === "1-2") {
    return propertiesCount >= 1 && propertiesCount <= 2;
  }

  if (filterValue === "3-4") {
    return propertiesCount >= 3 && propertiesCount <= 4;
  }

  if (filterValue === "5+") {
    return propertiesCount >= 5;
  }

  return true;
}

function ProfileModal({
  landlord,
  listingsById,
  onClose,
  onRemoveVerification,
  reviews,
}) {
  if (!landlord) {
    return null;
  }

  const landlordReviews = reviews.filter(
    (review) => review.landlordId === landlord.id
  );
  const ratingSummary = getRatingSummary(landlordReviews);
  const listedHomes = landlord.listingIds
    .map((listingId) => listingsById[listingId])
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-[#07163F]/45"
        aria-label="Close landlord profile"
      />

      <div className="relative z-10 w-full max-w-4xl rounded-[2rem] border border-[#DCE5F7] bg-white p-6 shadow-[0_24px_48px_rgba(13,29,76,0.2)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <VerifiedLandlordBadge />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C7BD9]">
                Landlord Profile
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#102A74]">
                {landlord.name}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                {landlord.bio}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full border border-[#C9D4EC] text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
            aria-label="Close landlord profile"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Main Listing Area"
            value={landlord.location}
            helper={`${landlord.propertiesCount} properties`}
          />
          <MetricCard
            label="Date Verified"
            value={formatTrustDate(landlord.dateVerified)}
            helper="Verification managed by admin"
          />
          <MetricCard
            label="Review Score"
            value={ratingSummary.count ? ratingSummary.average.toFixed(1) : "New"}
            helper={`${ratingSummary.count} total review${ratingSummary.count === 1 ? "" : "s"}`}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-6">
            <section className="rounded-[1.6rem] border border-[#DCE5F7] bg-[#F9FBFF] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C7BD9]">
                Verification Status
              </p>
              <VerificationBadgeList
                verification={landlord.verification}
                className="mt-4"
              />
            </section>

            <section className="rounded-[1.6rem] border border-[#DCE5F7] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C7BD9]">
                    Tenant Reviews
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-[#102A74]">
                    Trust signals from real tenants
                  </h3>
                </div>
                <RatingSummary
                  average={ratingSummary.average}
                  count={ratingSummary.count}
                  emphasis
                />
              </div>

              <ReviewFeed
                reviews={landlordReviews}
                listingsById={listingsById}
                className="mt-5"
                scrollable
              />
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-[1.6rem] border border-[#DCE5F7] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C7BD9]">
                Contact
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <a
                  href={`mailto:${landlord.email}`}
                  className="flex items-center gap-2 rounded-[1rem] border border-[#DCE5F7] bg-[#F8FBFF] px-4 py-3 transition-colors duration-300 hover:border-[#18399F]"
                >
                  <Mail className="size-4 text-[#18399F]" />
                  <span className="truncate">{landlord.email}</span>
                </a>
                <a
                  href={`tel:${landlord.phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-2 rounded-[1rem] border border-[#DCE5F7] bg-[#F8FBFF] px-4 py-3 transition-colors duration-300 hover:border-[#18399F]"
                >
                  <Phone className="size-4 text-[#18399F]" />
                  <span>{landlord.phone}</span>
                </a>
              </div>
            </section>

            <section className="rounded-[1.6rem] border border-[#DCE5F7] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C7BD9]">
                Listed Homes
              </p>
              <div className="mt-4 space-y-3">
                {listedHomes.map((listing) => (
                  <div
                    key={listing.id}
                    className="rounded-[1rem] border border-[#E5ECF8] bg-[#FBFDFF] px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-[#102A74]">
                      {listing.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {listing.location}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <button
              type="button"
              onClick={() => onRemoveVerification(landlord.id)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition-colors duration-300 hover:bg-rose-100"
            >
              <ShieldMinus className="size-4" />
              <span>Remove Verification</span>
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function AdminTrustDashboardView() {
  const [verifiedLandlords, setVerifiedLandlords] = useState(
    landlordTrustResponse.data.verifiedLandlords
  );
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [selectedLandlordId, setSelectedLandlordId] = useState(null);
  const reviews = landlordTrustResponse.data.reviews;
  const listingsById = Object.fromEntries(
    tenantDashboardResponse.data.listings.map((listing) => [listing.id, listing])
  );

  const locationOptions = useMemo(
    () => ["all", ...new Set(verifiedLandlords.map((landlord) => landlord.location))],
    [verifiedLandlords]
  );

  const filteredLandlords = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return verifiedLandlords.filter((landlord) => {
      const matchesSearch =
        !normalizedSearch ||
        landlord.name.toLowerCase().includes(normalizedSearch);
      const matchesLocation =
        locationFilter === "all" || landlord.location === locationFilter;
      const matchesProperties = propertyFilterMatches(
        propertyFilter,
        landlord.propertiesCount
      );

      return matchesSearch && matchesLocation && matchesProperties;
    });
  }, [locationFilter, propertyFilter, searchValue, verifiedLandlords]);

  const selectedLandlord =
    verifiedLandlords.find((landlord) => landlord.id === selectedLandlordId) ??
    null;
  const totalProperties = verifiedLandlords.reduce(
    (sum, landlord) => sum + landlord.propertiesCount,
    0
  );
  const reviewSummary = getRatingSummary(reviews);

  useEffect(() => {
    if (!feedbackMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedbackMessage("");
    }, 2400);

    return () => window.clearTimeout(timeoutId);
  }, [feedbackMessage]);

  const handleRemoveVerification = (landlordId) => {
    const landlord = verifiedLandlords.find((item) => item.id === landlordId);

    if (!landlord) {
      return;
    }

    setVerifiedLandlords((current) =>
      current.filter((item) => item.id !== landlordId)
    );
    setSelectedLandlordId((current) =>
      current === landlordId ? null : current
    );
    setFeedbackMessage(`Verification removed for ${landlord.name}`);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF] px-4 py-4 sm:px-6 lg:px-7 lg:py-5">
      <div className="space-y-6">
      <section className="rounded-[2rem] border border-[#DCE5F7] bg-[linear-gradient(135deg,#FFFFFF_0%,#F3F8FF_100%)] p-6 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
              Admin Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#102A74] sm:text-[2.4rem]">
              Verified Landlords
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Review trusted landlords, confirm contact details, and manage
              verification status without exposing any flagged accounts.
            </p>
          </div>
          <VerifiedLandlordBadge className="self-start" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Verified Accounts"
            value={verifiedLandlords.length}
            helper="Landlords currently visible to tenants"
          />
          <MetricCard
            label="Properties Covered"
            value={totalProperties}
            helper="Total verified portfolio count"
          />
          <MetricCard
            label="Average Trust Score"
            value={reviewSummary.count ? reviewSummary.average.toFixed(1) : "New"}
            helper={`${reviewSummary.count} tenant review${reviewSummary.count === 1 ? "" : "s"} captured`}
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_16px_32px_rgba(15,32,86,0.06)] sm:p-6">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1.3fr)_minmax(10rem,0.7fr)_minmax(10rem,0.7fr)]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#18399F]" />
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search landlord name"
              className="h-12 w-full rounded-full border border-[#DCE5F7] bg-[#FBFDFF] pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
            />
          </label>

          <select
            value={locationFilter}
            onChange={(event) => setLocationFilter(event.target.value)}
            className="h-12 rounded-full border border-[#DCE5F7] bg-[#FBFDFF] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
          >
            <option value="all">All locations</option>
            {locationOptions
              .filter((location) => location !== "all")
              .map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
          </select>

          <select
            value={propertyFilter}
            onChange={(event) => setPropertyFilter(event.target.value)}
            className="h-12 rounded-full border border-[#DCE5F7] bg-[#FBFDFF] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
          >
            <option value="all">All portfolios</option>
            <option value="1-2">1-2 properties</option>
            <option value="3-4">3-4 properties</option>
            <option value="5+">5+ properties</option>
          </select>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_16px_32px_rgba(15,32,86,0.06)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
              Landlord Directory
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[#102A74]">
              {filteredLandlords.length} verified landlord
              {filteredLandlords.length === 1 ? "" : "s"}
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            Desktop uses a table view. Smaller screens switch to stacked cards.
          </p>
        </div>

        <div className="mt-6 hidden overflow-hidden rounded-[1.5rem] border border-[#DCE5F7] lg:block">
          <div className="grid grid-cols-[1.2fr_1.2fr_0.8fr_0.7fr_1.3fr_0.8fr_1.2fr] gap-4 bg-[#F8FBFF] px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            <span>Landlord Name</span>
            <span>Contact</span>
            <span>Location</span>
            <span>Properties</span>
            <span>Verification Status</span>
            <span>Date Verified</span>
            <span>Actions</span>
          </div>

          {filteredLandlords.map((landlord) => {
            const landlordReviews = reviews.filter(
              (review) => review.landlordId === landlord.id
            );
            const rating = getRatingSummary(landlordReviews);

            return (
              <div
                key={landlord.id}
                className="grid grid-cols-[1.2fr_1.2fr_0.8fr_0.7fr_1.3fr_0.8fr_1.2fr] gap-4 border-t border-[#EEF3FF] px-5 py-5 text-sm text-slate-600"
              >
                <div>
                  <p className="font-semibold text-[#102A74]">{landlord.name}</p>
                  <div className="mt-2">
                    <RatingSummary average={rating.average} count={rating.count} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p>{landlord.phone}</p>
                  <p className="truncate text-slate-500">{landlord.email}</p>
                </div>
                <div className="inline-flex items-center gap-2 text-[#16327E]">
                  <MapPin className="size-4 text-[#5C7BD9]" />
                  <span>{landlord.location}</span>
                </div>
                <div className="inline-flex items-center gap-2 text-[#16327E]">
                  <Building2 className="size-4 text-[#5C7BD9]" />
                  <span>{landlord.propertiesCount}</span>
                </div>
                <VerificationBadgeList
                  verification={landlord.verification}
                  compact
                />
                <p>{formatTrustDate(landlord.dateVerified)}</p>
                <div className="flex flex-col items-start gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLandlordId(landlord.id)}
                    className="text-sm font-semibold text-[#18399F] underline underline-offset-4"
                  >
                    View Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveVerification(landlord.id)}
                    className="text-sm font-semibold text-rose-600"
                  >
                    Remove Verification
                  </button>
                  <a
                    href={`mailto:${landlord.email}`}
                    className="text-sm font-semibold text-[#18399F]"
                  >
                    Contact Landlord
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 space-y-4 lg:hidden">
          {filteredLandlords.map((landlord) => {
            const landlordReviews = reviews.filter(
              (review) => review.landlordId === landlord.id
            );
            const rating = getRatingSummary(landlordReviews);

            return (
              <article
                key={landlord.id}
                className="rounded-[1.6rem] border border-[#DCE5F7] bg-[#FBFDFF] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-[#102A74]">
                      {landlord.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {landlord.location}
                    </p>
                  </div>
                  <RatingSummary average={rating.average} count={rating.count} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.2rem] border border-[#E5ECF8] bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                      Contact
                    </p>
                    <p className="mt-2 text-sm text-slate-600">{landlord.phone}</p>
                    <p className="mt-1 text-sm text-slate-500">{landlord.email}</p>
                  </div>
                  <div className="rounded-[1.2rem] border border-[#E5ECF8] bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                      Properties
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {landlord.propertiesCount} active properties
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Verified {formatTrustDate(landlord.dateVerified)}
                    </p>
                  </div>
                </div>

                <VerificationBadgeList
                  verification={landlord.verification}
                  className="mt-4"
                />

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedLandlordId(landlord.id)}
                    className="rounded-full border border-[#C9D4EC] bg-white px-4 py-2.5 text-sm font-semibold text-[#18399F]"
                  >
                    View Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveVerification(landlord.id)}
                    className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700"
                  >
                    Remove Verification
                  </button>
                  <a
                    href={`mailto:${landlord.email}`}
                    className="rounded-full bg-[#18399F] px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Contact Landlord
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {!filteredLandlords.length ? (
          <div className="mt-6 rounded-[1.6rem] border border-dashed border-[#C9D4EC] bg-[#F9FBFF] px-6 py-12 text-center">
            <p className="text-lg font-semibold text-[#102A74]">
              No verified landlords match the current filters
            </p>
            <p className="mt-3 text-sm text-slate-500">
              Try broadening the search, switching location filters, or opening
              the full verified directory again.
            </p>
          </div>
        ) : null}
      </section>

      <ProfileModal
        landlord={selectedLandlord}
        listingsById={listingsById}
        onClose={() => setSelectedLandlordId(null)}
        onRemoveVerification={handleRemoveVerification}
        reviews={reviews}
      />

      <div
        className={classNames(
          "fixed bottom-5 right-5 z-[90] rounded-full bg-[#102A74] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(13,29,76,0.24)] transition-all duration-300",
          feedbackMessage
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        )}
      >
        {feedbackMessage}
      </div>
      </div>
    </div>
  );
}
