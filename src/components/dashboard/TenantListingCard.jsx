import { ArrowRight, Play, Phone } from "lucide-react";

export default function TenantListingCard({ listing }) {
  return (
    <article className="grid gap-4 rounded-[1.8rem] border border-[#DCE5F7] bg-white p-4 shadow-[0_18px_36px_rgba(15,32,86,0.06)] md:grid-cols-[11rem_minmax(0,1fr)]">
      <div className="overflow-hidden rounded-[1.35rem] bg-[#EEF3FF]">
        <img
          src={listing.image}
          alt={listing.title}
          className="h-full min-h-[9.5rem] w-full object-cover"
        />
      </div>

      <div className="flex flex-col justify-between gap-4">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_9rem]">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#16327E]">{listing.title}</h3>
            <p className="text-sm leading-7 text-slate-500">{listing.description}</p>
          </div>

          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-slate-400">Location</dt>
              <dd className="font-medium text-slate-600">{listing.location}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Amount</dt>
              <dd className="font-semibold text-[#16327E]">{listing.amount}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-medium italic text-slate-400 transition-colors duration-300 hover:text-[#18399F]"
          >
            <span>Learn More</span>
            <ArrowRight className="size-4" />
          </a>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-4 py-2 text-xs font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
          >
            <Play className="size-3.5" />
            <span>Video Tour</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-4 py-2 text-xs font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
          >
            <Phone className="size-3.5" />
            <span>Contact Landlord</span>
          </button>
        </div>
      </div>
    </article>
  );
}
