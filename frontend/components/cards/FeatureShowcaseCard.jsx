import { CheckCircle2 } from 'lucide-react'
import accountingArtwork from '../../assets/accounting.png'
import listingArtwork from '../../assets/listing.png'
import maintenanceArtwork from '../../assets/maintenace.png'
import paymentsArtwork from '../../assets/payment.png'
import { classNames } from '../../utils/classNames.js'

const artworkMap = {
  accounting: accountingArtwork,
  listing: listingArtwork,
  maintenance: maintenanceArtwork,
  payments: paymentsArtwork,
}

const artworkFrameClassMap = {
  accounting: 'items-center justify-center lg:justify-start',
  listing: 'items-end justify-center lg:justify-start',
  maintenance: 'items-center justify-center lg:justify-end',
  payments: 'items-center justify-center lg:justify-end',
}

const artworkImageClassMap = {
  accounting: 'w-full max-w-[38rem] object-contain lg:-translate-x-6',
  listing: 'max-h-[27rem] w-auto object-contain lg:translate-x-2 lg:translate-y-5',
  maintenance: 'w-full max-w-[38rem] object-contain lg:translate-x-10',
  payments: 'w-full max-w-[38rem] object-contain lg:translate-x-10',
}

export default function FeatureShowcaseCard({ feature }) {
  const artwork = artworkMap[feature.illustration]
  const bullets = feature.bullets?.filter(Boolean) ?? []

  return (
    <article
      id={`feature-panel-${feature.id}`}
      role="tabpanel"
      aria-labelledby={`feature-tab-${feature.id} feature-tab-${feature.id}-mobile`}
      className="relative overflow-hidden rounded-[2rem] bg-[#18399F] px-5 py-6 text-white shadow-[0_24px_50px_rgba(24,57,159,0.24)] sm:px-8 sm:py-8 lg:min-h-[30rem] lg:px-10 lg:py-10"
      style={{ animation: 'about-panel-switch 420ms ease' }}
    >
      <div
        className="pointer-events-none absolute -right-20 top-0 h-52 w-52 rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-0 h-56 w-56 rounded-full bg-[#8fa7ff]/18 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(320px,1.06fr)] lg:items-center">
        <div
          className={classNames(
            'order-2 flex min-h-[18rem] items-center justify-center overflow-hidden rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] p-4 shadow-[0_18px_42px_rgba(10,20,58,0.12)] lg:order-1 lg:min-h-[25rem] lg:p-6',
            artworkFrameClassMap[feature.illustration],
          )}
        >
          {artwork ? (
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[1.25rem] bg-white/95 p-3 shadow-[0_20px_45px_rgba(12,30,84,0.14)]">
              <img
                src={artwork}
                alt={`${feature.title} visual`}
                className={classNames(
                  'select-none',
                  artworkImageClassMap[feature.illustration],
                )}
              />
            </div>
          ) : null}
        </div>

        <div className="order-1 mx-auto flex max-w-[35rem] flex-col items-start gap-6 text-left lg:order-2">
          <div className="space-y-4">
            <h3 className="font-display text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl lg:text-[2.9rem]">
              {feature.title}
            </h3>
            {feature.description ? (
              <p className="max-w-xl text-sm leading-7 text-white/84 sm:text-base">
                {feature.description}
              </p>
            ) : null}
          </div>

          {bullets.length ? (
            <div className="grid w-full gap-3 sm:grid-cols-2">
              {bullets.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[1.2rem] bg-white/10 px-4 py-4 shadow-[0_12px_26px_rgba(10,20,58,0.09)]"
                >
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-white" />
                  <p className="text-sm leading-6 text-white/90">{item}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
