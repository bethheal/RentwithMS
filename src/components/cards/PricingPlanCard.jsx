import { Check } from 'lucide-react'
import { classNames } from '../../utils/classNames.js'

function formatCurrencyValue(value) {
  return Number(value ?? 0).toLocaleString()
}

function formatMonthlyEquivalent(yearlyPrice) {
  const monthlyEquivalent = Number(yearlyPrice ?? 0) / 12

  if (Number.isInteger(monthlyEquivalent)) {
    return monthlyEquivalent.toFixed(0)
  }

  return monthlyEquivalent.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')
}

export default function PricingPlanCard({ plan, billingMode = 'monthly' }) {
  const isYearly = billingMode === 'yearly'
  const displayPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice
  const billingSuffix = isYearly ? 'yr' : 'mo'
  const pricingNote = isYearly
    ? `Equivalent to $${formatMonthlyEquivalent(plan.yearlyPrice)}/mo`
    : plan.pricingNote ?? 'Billed monthly per landlord workspace'

  return (
    <article className="relative w-full pt-12">
      <div
        className={classNames(
          'absolute left-7 top-0 z-20 overflow-hidden text-white shadow-[0_18px_34px_rgba(12,44,134,0.18)]',
          plan.featured ? 'h-[5.2rem] w-[11rem]' : 'h-[4.55rem] w-[9.4rem]',
        )}
      >
        <div
          className={classNames(
            'h-full w-full pl-4 pt-3',
            plan.featured ? 'bg-[#4FA8F8]' : 'bg-[#18399F]',
          )}
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 74%, 0 100%)' }}
        >
          <div className="flex items-start gap-1">
            <span className="mt-1 text-xs font-semibold">*</span>
            <span
              className={classNames(
                'font-black leading-none',
                plan.featured ? 'text-[2.55rem]' : 'text-[2.15rem]',
              )}
            >
              {formatCurrencyValue(displayPrice)}
            </span>
            <span className="mt-auto pb-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em]">
              {billingSuffix}
            </span>
          </div>
        </div>
      </div>

      <div
        className={classNames(
          'relative overflow-hidden rounded-[2.2rem] px-8 pb-9 pt-12 shadow-[0_22px_48px_rgba(12,44,134,0.1)]',
          plan.featured
            ? 'border border-[#DCE7FF]/18 bg-[linear-gradient(180deg,#18399F_0%,#0C2C86_100%)] text-white'
            : 'border border-[#DCE7FF] bg-white text-[#0C2C86]',
        )}
      >
        <div
          className={classNames(
            'pointer-events-none absolute inset-0',
            plan.featured
              ? 'bg-[linear-gradient(180deg,rgba(232,238,255,0.14),rgba(255,255,255,0)_24%),radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_36%)]'
              : 'bg-[linear-gradient(180deg,rgba(24,57,159,0.04),rgba(255,255,255,0)_24%),radial-gradient(circle_at_top_left,rgba(79,168,248,0.06),transparent_36%)]',
          )}
          aria-hidden="true"
        />

        <div className="relative z-10 flex min-h-[30rem] flex-col">
          {plan.badge ? (
            <span
              className={classNames(
                'mx-auto inline-flex rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em]',
                plan.featured ? 'bg-white/14 text-white' : 'bg-[#E8EEFF] text-[#18399F]',
              )}
            >
              {plan.badge}
            </span>
          ) : null}

          <h3
            className={classNames(
              'mt-3 text-center font-sans tracking-[0.01em]',
              plan.featured
                ? 'text-[2.3rem] font-semibold text-white'
                : 'text-[2.1rem] font-semibold text-[#0C2C86]',
            )}
          >
            {plan.name}
          </h3>

          <div className="mt-4 text-center">
            <p
              className={classNames(
                'font-semibold leading-none',
                plan.featured ? 'text-[4rem] text-white' : 'text-[3.7rem] text-[#18399F]',
              )}
            >
              ${formatCurrencyValue(displayPrice)}
              <span
                className={classNames(
                  'ml-2 text-lg font-medium',
                  plan.featured ? 'text-white/76' : 'text-slate-400',
                )}
              >
                /{billingSuffix}
              </span>
            </p>
            <p
              className={classNames(
                'mt-3 text-sm font-semibold',
                plan.featured ? 'text-[#DCE7FF]' : 'text-[#18399F]/72',
              )}
            >
              {pricingNote}
            </p>
          </div>

          <p
            className={classNames(
              'mt-6 text-center text-[0.98rem] leading-7',
              plan.featured ? 'text-white/86' : 'text-slate-600',
            )}
          >
            {plan.description}
          </p>

          <div
            className={classNames(
              'mt-6 h-px w-full',
              plan.featured ? 'bg-[#DCE7FF]/30' : 'bg-[#DCE7FF]',
            )}
          />

          <ul className="mt-6 space-y-4">
            {plan.features.map((feature) => {
              return (
                <li
                  key={feature.label}
                  className={classNames(
                    'flex items-center gap-3 text-[0.88rem] font-medium',
                    plan.featured
                      ? feature.included
                        ? 'text-white/92'
                        : 'text-white/38'
                      : feature.included
                        ? 'text-slate-700'
                        : 'text-slate-400',
                  )}
                >
                  <span
                    className={classNames(
                      'inline-flex shrink-0 items-center justify-center',
                      feature.included
                        ? plan.featured
                          ? 'text-white'
                          : 'text-[#18399F]'
                        : 'text-slate-400',
                    )}
                    aria-hidden="true"
                  >
                    {feature.included ? (
                      <Check className="size-4 stroke-[2.75]" />
                    ) : (
                      <span className="size-1.5 rounded-full bg-current opacity-70" />
                    )}
                  </span>
                  <span>{feature.label}</span>
                </li>
              )
            })}
          </ul>

          <a
            href={plan.ctaHref ?? '#contact'}
            className={classNames(
              'mt-auto inline-flex h-12 w-full items-center justify-center rounded-xl border text-sm font-semibold transition-all duration-300',
              plan.featured
                ? 'border-transparent bg-white text-[#18399F] hover:bg-[#E8EEFF]'
                : 'border-[#18399F] bg-white text-[#18399F] hover:border-[#15338D] hover:bg-[#E8EEFF]',
            )}
          >
            {plan.ctaLabel ?? 'Choose Plan'}
          </a>
        </div>
      </div>
    </article>
  )
}
