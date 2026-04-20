import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  Mail,
  MapPin,
  Phone,
  Search,
  Star,
} from "lucide-react";
import { classNames } from "../../utils/classNames.js";
import { getRatingSummary, formatTrustDate } from "../../utils/landlordTrust.js";
import {
  RatingSummary,
  ReviewFeed,
  VerificationBadgeList,
  VerifiedLandlordBadge,
} from "./LandlordTrustShared.jsx";

function ProfileStat({ label, value, hint }) {
  return (
    <article className="rounded-[1.4rem] border border-[#DCE5F7] bg-[#FBFDFF] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
        {label}
      </p>
      <p className="mt-3 text-lg font-semibold text-[#102A74]">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </article>
  );
}

function StarInput({ rating, onChange }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 5 }).map((_, index) => {
        const value = index + 1;

        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className="text-amber-500 transition-transform duration-300 hover:scale-105"
            aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
          >
            <Star
              className={classNames(
                "size-5",
                value <= rating ? "fill-current" : "text-slate-200"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

function ReviewComposer({
  landlords,
  landlordId,
  listings,
  onSubmit,
  submitLabel = "Submit Review",
  tenantName,
  title = "Leave a review",
}) {
  const [selectedLandlordId, setSelectedLandlordId] = useState(
    landlordId ?? landlords[0]?.id ?? ""
  );
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    listings[0]?.id ?? ""
  );
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const availableListings = useMemo(
    () =>
      listings.filter((listing) =>
        selectedLandlordId ? listing.landlordId === selectedLandlordId : true
      ),
    [listings, selectedLandlordId]
  );

  useEffect(() => {
    if (landlordId) {
      setSelectedLandlordId(landlordId);
    }
  }, [landlordId]);

  useEffect(() => {
    setSelectedPropertyId(availableListings[0]?.id ?? "");
  }, [availableListings]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!selectedLandlordId || !selectedPropertyId || !comment.trim()) {
      return;
    }

    onSubmit({
      landlordId: selectedLandlordId,
      propertyId: selectedPropertyId,
      rating,
      comment: comment.trim(),
      tenantName,
    });
    setRating(5);
    setComment("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.6rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_12px_26px_rgba(15,32,86,0.05)]"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C7BD9]">
        {title}
      </p>
      <p className="mt-2 text-sm text-slate-500">
        New reviews appear instantly in the landlord profile and property rating
        summaries.
      </p>

      <div className="mt-5 space-y-4">
        {landlords.length > 1 ? (
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Landlord
            </span>
            <select
              value={selectedLandlordId}
              onChange={(event) => setSelectedLandlordId(event.target.value)}
              className="h-11 w-full rounded-[1rem] border border-[#DCE5F7] bg-[#FBFDFF] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
            >
              {landlords.map((landlord) => (
                <option key={landlord.id} value={landlord.id}>
                  {landlord.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            Property
          </span>
          <select
            value={selectedPropertyId}
            onChange={(event) => setSelectedPropertyId(event.target.value)}
            className="h-11 w-full rounded-[1rem] border border-[#DCE5F7] bg-[#FBFDFF] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
          >
            {availableListings.map((listing) => (
              <option key={listing.id} value={listing.id}>
                {listing.title}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            Rating
          </span>
          <StarInput rating={rating} onChange={setRating} />
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            Comment
          </span>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Share what the renting experience was like."
            className="min-h-[8rem] w-full rounded-[1rem] border border-[#DCE5F7] bg-[#FBFDFF] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={!selectedLandlordId || !selectedPropertyId || !comment.trim()}
        className={classNames(
          "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white transition-colors duration-300",
          selectedLandlordId && selectedPropertyId && comment.trim()
            ? "bg-[#18399F] hover:bg-[#102A74]"
            : "cursor-not-allowed bg-[#B8C7F3]"
        )}
      >
        <span>{submitLabel}</span>
        <ArrowRight className="size-4" />
      </button>
    </form>
  );
}

function LandlordListCard({
  isActive,
  landlord,
  onSelect,
  reviewSummary,
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={classNames(
        "w-full rounded-[1.4rem] border p-4 text-left transition-all duration-300",
        isActive
          ? "border-[#18399F] bg-[#F4F8FF] shadow-[0_16px_28px_rgba(24,57,159,0.12)]"
          : "border-[#DCE5F7] bg-white hover:border-[#BFD2FF]"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-[#102A74]">{landlord.name}</p>
          <p className="mt-1 text-sm text-slate-500">{landlord.location}</p>
        </div>
        <VerifiedLandlordBadge className="shrink-0" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <RatingSummary
          average={reviewSummary.average}
          count={reviewSummary.count}
        />
        <span className="rounded-full border border-[#DCE5F7] bg-[#FBFDFF] px-3 py-1.5 text-xs font-semibold text-[#3656B7]">
          {landlord.propertiesCount} properties
        </span>
      </div>
    </button>
  );
}

export function TenantVerifiedLandlordsView({
  landlords,
  listings,
  onOpenReviewsPage,
  onSelectLandlord,
  onSubmitReview,
  reviews,
  selectedLandlordId,
  tenantName,
}) {
  const [searchValue, setSearchValue] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");

  const locations = useMemo(
    () => ["all", ...new Set(landlords.map((landlord) => landlord.location))],
    [landlords]
  );

  const filteredLandlords = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return landlords.filter((landlord) => {
      const matchesSearch =
        !normalizedSearch ||
        landlord.name.toLowerCase().includes(normalizedSearch);
      const matchesLocation =
        locationFilter === "all" || landlord.location === locationFilter;

      return matchesSearch && matchesLocation;
    });
  }, [landlords, locationFilter, searchValue]);

  useEffect(() => {
    if (!selectedLandlordId && filteredLandlords[0]) {
      onSelectLandlord(filteredLandlords[0].id);
    }
  }, [filteredLandlords, onSelectLandlord, selectedLandlordId]);

  const activeLandlord =
    filteredLandlords.find((landlord) => landlord.id === selectedLandlordId) ??
    filteredLandlords[0] ??
    null;

  const activeLandlordListings = listings.filter(
    (listing) => listing.landlordId === activeLandlord?.id
  );
  const activeLandlordReviews = reviews
    .filter((review) => review.landlordId === activeLandlord?.id)
    .sort((left, right) => new Date(right.date) - new Date(left.date));
  const activeSummary = getRatingSummary(activeLandlordReviews);
  const listingsById = Object.fromEntries(
    listings.map((listing) => [listing.id, listing])
  );

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-[#DCE5F7] bg-[linear-gradient(135deg,#FFFFFF_0%,#F3F8FF_100%)] p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
          Trusted Directory
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#102A74] sm:text-[2rem]">
          Verified Landlords
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
          Browse only verified landlords, review their credentials, and compare
          real tenant feedback before requesting a viewing.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="space-y-4 rounded-[1.8rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_16px_32px_rgba(15,32,86,0.06)]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#18399F]" />
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search landlord name"
              className="h-11 w-full rounded-full border border-[#DCE5F7] bg-[#FBFDFF] pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
            />
          </label>

          <select
            value={locationFilter}
            onChange={(event) => setLocationFilter(event.target.value)}
            className="h-11 w-full rounded-full border border-[#DCE5F7] bg-[#FBFDFF] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
          >
            <option value="all">All locations</option>
            {locations
              .filter((location) => location !== "all")
              .map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
          </select>

          <div className="space-y-3">
            {filteredLandlords.map((landlord) => {
              const reviewSummary = getRatingSummary(
                reviews.filter((review) => review.landlordId === landlord.id)
              );

              return (
                <LandlordListCard
                  key={landlord.id}
                  landlord={landlord}
                  isActive={activeLandlord?.id === landlord.id}
                  onSelect={() => onSelectLandlord(landlord.id)}
                  reviewSummary={reviewSummary}
                />
              );
            })}

            {!filteredLandlords.length ? (
              <div className="rounded-[1.4rem] border border-dashed border-[#C9D4EC] bg-[#F9FBFF] px-4 py-8 text-center text-sm text-slate-500">
                No verified landlords match the current search.
              </div>
            ) : null}
          </div>
        </aside>

        {activeLandlord ? (
          <div className="space-y-6">
            <section className="rounded-[1.8rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_16px_32px_rgba(15,32,86,0.06)] sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl space-y-3">
                  <VerifiedLandlordBadge />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C7BD9]">
                      Landlord Profile
                    </p>
                    <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#102A74]">
                      {activeLandlord.name}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      {activeLandlord.bio}
                    </p>
                  </div>
                </div>
                <RatingSummary
                  average={activeSummary.average}
                  count={activeSummary.count}
                  emphasis
                />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <ProfileStat
                  label="Main Listing Area"
                  value={activeLandlord.location}
                  hint={activeLandlord.responseTime}
                />
                <ProfileStat
                  label="Properties"
                  value={activeLandlord.propertiesCount}
                  hint="Verified homes in this landlord portfolio"
                />
                <ProfileStat
                  label="Verified On"
                  value={formatTrustDate(activeLandlord.dateVerified)}
                  hint="Trust credentials approved by the platform"
                />
              </div>

              <VerificationBadgeList
                verification={activeLandlord.verification}
                className="mt-6"
              />

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={`mailto:${activeLandlord.email}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#C9D4EC] bg-white px-4 py-2.5 text-sm font-semibold text-[#18399F]"
                >
                  <Mail className="size-4" />
                  <span>Email landlord</span>
                </a>
                <a
                  href={`tel:${activeLandlord.phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#C9D4EC] bg-[#F8FBFF] px-4 py-2.5 text-sm font-semibold text-[#18399F]"
                >
                  <Phone className="size-4" />
                  <span>Call landlord</span>
                </a>
                <button
                  type="button"
                  onClick={onOpenReviewsPage}
                  className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <ArrowRight className="size-4" />
                  <span>See review feed</span>
                </button>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <section className="space-y-6 rounded-[1.8rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_16px_32px_rgba(15,32,86,0.06)] sm:p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C7BD9]">
                    Listed Homes
                  </p>
                  <h4 className="mt-2 text-xl font-semibold text-[#102A74]">
                    Verified properties by {activeLandlord.name}
                  </h4>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {activeLandlordListings.map((listing) => {
                    const listingReviewSummary = getRatingSummary(
                      reviews.filter((review) => review.propertyId === listing.id)
                    );

                    return (
                      <article
                        key={listing.id}
                        className="rounded-[1.4rem] border border-[#E5ECF8] bg-[#FBFDFF] p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-[#102A74]">
                              {listing.title}
                            </p>
                            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                              <MapPin className="size-4 text-[#5C7BD9]" />
                              <span>{listing.location}</span>
                            </p>
                          </div>
                          <RatingSummary
                            average={listingReviewSummary.average}
                            count={listingReviewSummary.count}
                          />
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C7BD9]">
                        Tenant Reviews
                      </p>
                      <h4 className="mt-2 text-xl font-semibold text-[#102A74]">
                        What renters are saying
                      </h4>
                    </div>
                    <span className="rounded-full bg-[#F8FBFF] px-3 py-1.5 text-sm font-semibold text-[#18399F]">
                      {activeLandlordReviews.length} review
                      {activeLandlordReviews.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <ReviewFeed
                    reviews={activeLandlordReviews}
                    listingsById={listingsById}
                    className="mt-5"
                    scrollable
                  />
                </div>
              </section>

              <ReviewComposer
                landlords={[activeLandlord]}
                landlordId={activeLandlord.id}
                listings={activeLandlordListings}
                onSubmit={onSubmitReview}
                submitLabel="Publish Review"
                tenantName={tenantName}
                title="Add your experience"
              />
            </div>
          </div>
        ) : (
          <section className="grid min-h-[28rem] place-items-center rounded-[1.8rem] border border-dashed border-[#C9D4EC] bg-[#F9FBFF] p-6 text-center">
            <div className="max-w-md space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5C7BD9]">
                Verified Landlords
              </p>
              <h3 className="text-2xl font-semibold text-[#102A74]">
                No landlord profile to show
              </h3>
              <p className="text-sm leading-7 text-slate-500">
                Try clearing the filters or selecting another verified landlord
                from the directory.
              </p>
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

export function TenantLandlordReviewsView({
  landlords,
  listings,
  onOpenVerifiedLandlords,
  onSelectLandlord,
  onSubmitReview,
  reviews,
  tenantName,
}) {
  const [searchValue, setSearchValue] = useState("");
  const [landlordFilter, setLandlordFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const listingsById = Object.fromEntries(
    listings.map((listing) => [listing.id, listing])
  );
  const landlordOptions = landlords;

  const filteredReviews = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return [...reviews]
      .filter((review) => {
        const landlord = landlords.find(
          (item) => item.id === review.landlordId
        );
        const listing = listingsById[review.propertyId];
        const searchableText = [
          landlord?.name,
          listing?.title,
          listing?.location,
          review.comment,
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !normalizedSearch || searchableText.includes(normalizedSearch);
        const matchesLandlord =
          landlordFilter === "all" || review.landlordId === landlordFilter;
        const matchesRating =
          ratingFilter === "all" || Number(review.rating) >= Number(ratingFilter);

        return matchesSearch && matchesLandlord && matchesRating;
      })
      .sort((left, right) => new Date(right.date) - new Date(left.date));
  }, [landlordFilter, landlords, listingsById, ratingFilter, reviews, searchValue]);

  const reviewSummary = getRatingSummary(reviews);
  const reviewedPropertiesCount = new Set(
    reviews.map((review) => review.propertyId)
  ).size;

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-[#DCE5F7] bg-[linear-gradient(135deg,#FFFFFF_0%,#F3F8FF_100%)] p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
          Review Center
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#102A74] sm:text-[2rem]">
          Landlord Reviews
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
          Review trusted landlords by real tenant experiences, compare ratings
          across properties, and add your own feedback instantly.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ProfileStat
          label="Average Rating"
          value={reviewSummary.count ? reviewSummary.average.toFixed(1) : "New"}
          hint="Calculated dynamically from all submitted reviews"
        />
        <ProfileStat
          label="Total Reviews"
          value={reviews.length}
          hint="Tenant feedback linked to landlord and property"
        />
        <ProfileStat
          label="Reviewed Properties"
          value={reviewedPropertiesCount}
          hint="Homes with at least one visible review"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="rounded-[1.8rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_16px_32px_rgba(15,32,86,0.06)] sm:p-6">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(11rem,0.8fr)_minmax(10rem,0.6fr)]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#18399F]" />
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search reviews, landlords, or properties"
                className="h-11 w-full rounded-full border border-[#DCE5F7] bg-[#FBFDFF] pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              />
            </label>

            <select
              value={landlordFilter}
              onChange={(event) => setLandlordFilter(event.target.value)}
              className="h-11 rounded-full border border-[#DCE5F7] bg-[#FBFDFF] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
            >
              <option value="all">All landlords</option>
              {landlordOptions.map((landlord) => (
                <option key={landlord.id} value={landlord.id}>
                  {landlord.name}
                </option>
              ))}
            </select>

            <select
              value={ratingFilter}
              onChange={(event) => setRatingFilter(event.target.value)}
              className="h-11 rounded-full border border-[#DCE5F7] bg-[#FBFDFF] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
            >
              <option value="all">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4+ stars</option>
              <option value="3">3+ stars</option>
            </select>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
                Review Feed
              </p>
              <h3 className="mt-2 text-xl font-semibold text-[#102A74]">
                {filteredReviews.length} visible review
                {filteredReviews.length === 1 ? "" : "s"}
              </h3>
            </div>

            {landlordFilter !== "all" ? (
              <button
                type="button"
                onClick={() => {
                  onSelectLandlord(landlordFilter);
                  onOpenVerifiedLandlords();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#C9D4EC] bg-white px-4 py-2.5 text-sm font-semibold text-[#18399F]"
              >
                <Building2 className="size-4" />
                <span>Open landlord profile</span>
              </button>
            ) : null}
          </div>

          <ReviewFeed
            reviews={filteredReviews}
            listingsById={listingsById}
            className="mt-5"
            scrollable
          />
        </section>

        <ReviewComposer
          landlords={landlords}
          listings={listings}
          onSubmit={onSubmitReview}
          tenantName={tenantName}
          title="Submit a new review"
        />
      </div>
    </section>
  );
}
