import {
  BadgeCheck,
  MailCheck,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";
import { classNames } from "../../utils/classNames.js";
import { formatTrustDate } from "../../utils/landlordTrust.js";

const verificationItems = [
  {
    key: "id",
    label: "ID Verified",
    icon: ShieldCheck,
    activeClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    key: "phone",
    label: "Phone Verified",
    icon: Phone,
    activeClassName: "border-sky-200 bg-sky-50 text-sky-700",
  },
  {
    key: "email",
    label: "Email Verified",
    icon: MailCheck,
    activeClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
];

export function VerifiedLandlordBadge({ className = "" }) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[0.72rem] font-semibold text-emerald-700",
        className
      )}
    >
      <BadgeCheck className="size-3.5" />
      <span>Verified Landlord</span>
    </span>
  );
}

export function VerificationBadgeList({
  verification,
  className = "",
  compact = false,
}) {
  return (
    <div className={classNames("flex flex-wrap gap-2", className)}>
      {verificationItems.map((item) => {
        const Icon = item.icon;
        const isActive = Boolean(verification?.[item.key]);

        return (
          <span
            key={item.key}
            className={classNames(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
              isActive
                ? item.activeClassName
                : "border-slate-200 bg-slate-50 text-slate-400",
              compact && "px-2.5 py-1 text-[0.68rem]"
            )}
          >
            <Icon className={compact ? "size-3" : "size-3.5"} />
            <span>{item.label}</span>
          </span>
        );
      })}
    </div>
  );
}

export function RatingSummary({
  average,
  count,
  className = "",
  emphasis = false,
}) {
  if (!count) {
    return (
      <span
        className={classNames(
          "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-500",
          className
        )}
      >
        <Star className="size-4" />
        <span>No reviews yet</span>
      </span>
    );
  }

  return (
    <span
      className={classNames(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold",
        emphasis
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-[#DCE5F7] bg-[#F8FBFF] text-[#16327E]",
        className
      )}
    >
      <Star className={classNames("size-4", count ? "fill-current" : "")} />
      <span>
        {average.toFixed(1)} ({count} review{count === 1 ? "" : "s"})
      </span>
    </span>
  );
}

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-1 text-amber-500">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={`${rating}-${index}`}
          className={classNames(
            "size-4",
            index < Math.round(rating) ? "fill-current" : "text-slate-200"
          )}
        />
      ))}
    </div>
  );
}

export function ReviewFeed({
  reviews,
  listingsById,
  emptyMessage = "No reviews yet.",
  className = "",
  scrollable = false,
}) {
  if (!reviews.length) {
    return (
      <div
        className={classNames(
          "rounded-[1.4rem] border border-dashed border-[#C9D4EC] bg-[#F9FBFF] px-5 py-10 text-center text-sm text-slate-500",
          className
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={classNames(
        "space-y-3",
        scrollable && "max-h-[28rem] overflow-y-auto pr-1",
        className
      )}
    >
      {reviews.map((review) => {
        const listing = listingsById?.[review.propertyId];

        return (
          <article
            key={review.id}
            className="rounded-[1.4rem] border border-[#DCE5F7] bg-white p-4 shadow-[0_12px_26px_rgba(15,32,86,0.05)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#102A74]">
                  {review.tenantName}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatTrustDate(review.date)}
                </p>
              </div>
              <StarRow rating={review.rating} />
            </div>

            {listing ? (
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#5C7BD9]">
                {listing.title}
              </p>
            ) : null}

            <p className="mt-3 text-sm leading-7 text-slate-500">
              {review.comment}
            </p>
          </article>
        );
      })}
    </div>
  );
}
