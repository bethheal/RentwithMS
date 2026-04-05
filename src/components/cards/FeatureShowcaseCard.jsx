import {
  Building2,
  CreditCard,
  FileSpreadsheet,
  Wrench,
} from 'lucide-react'
import featureAccounting from '../../assets/illustrations/feature-accounting.svg'
import featureListing from '../../assets/illustrations/feature-listing.svg'
import featureMaintenance from '../../assets/illustrations/feature-maintenance.svg'
import featurePayments from '../../assets/illustrations/feature-payments.svg'
import PrimaryButton from '../common/PrimaryButton.jsx'

const artworkMap = {
  accounting: featureAccounting,
  listing: featureListing,
  maintenance: featureMaintenance,
  payments: featurePayments,
}

const iconMap = {
  accounting: FileSpreadsheet,
  listing: Building2,
  maintenance: Wrench,
  payments: CreditCard,
}

export default function FeatureShowcaseCard({ actions, feature }) {
  const artwork = artworkMap[feature.illustration]
  const Icon = iconMap[feature.illustration]
  const imageFirst = feature.imageAlign === 'left'

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-brand-900 p-5 text-white shadow-hero sm:p-8">
      <div
        className={`grid items-center gap-8 lg:grid-cols-[1.1fr_1fr] ${
          imageFirst ? '' : 'lg:[&>*:first-child]:order-2'
        }`}
      >
        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <div className="absolute -left-10 top-6 size-28 rounded-full bg-brand-300/20 blur-2xl" />
          <img
            src={artwork}
            alt={`${feature.title} illustration`}
            className="relative mx-auto w-full max-w-[28rem] animate-float-soft"
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-3 text-brand-100">
            <span className="rounded-full border border-white/15 bg-white/10 p-2">
              <Icon className="size-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.3em]">
              {feature.label}
            </span>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-3xl font-bold uppercase tracking-[-0.05em] sm:text-4xl">
              {feature.title}
            </h3>
            <p className="max-w-xl text-sm leading-7 text-brand-100 sm:text-base">
              {feature.description}
            </p>
          </div>

          <ul className="space-y-3 text-sm leading-7 text-brand-100">
            {feature.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3">
                <span className="mt-2 size-2 rounded-full bg-brand-200" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 sm:flex-row">
            {actions.map((action) => (
              <PrimaryButton
                key={action.label}
                to={action.to}
                variant={action.variant}
              >
                {action.label}
              </PrimaryButton>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
