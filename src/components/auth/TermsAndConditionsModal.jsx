import { FileText, X } from 'lucide-react'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock.js'

const termsSections = [
  {
    title: 'Use of RMS',
    body: 'RMS helps tenants and landlords manage listings, rentals, payments, and communication inside one workspace. Demo data is for preview use only.',
  },
  {
    title: 'Account responsibility',
    body: 'You are responsible for the details you provide, the activity performed with your account, and keeping your login information private.',
  },
  {
    title: 'Respectful platform use',
    body: 'Do not upload misleading listings, abusive content, or anything that breaks applicable rental or privacy laws.',
  },
  {
    title: 'Service updates',
    body: 'RMS may adjust demo features, interface flows, and content structures as the product evolves.',
  },
]

export default function TermsAndConditionsModal({
  isOpen,
  onAgree,
  onClose,
  onDisagree,
}) {
  useBodyScrollLock(isOpen)

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-[#07163F]/60 backdrop-blur-[2px]"
        aria-label="Close terms and conditions modal"
      />

      <section className="relative z-10 w-full max-w-[42rem] overflow-hidden rounded-[2rem] border border-[#D8E4FF] bg-white shadow-[0_28px_70px_rgba(10,24,76,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#E2EAFA] bg-[linear-gradient(180deg,#F8FAFF_0%,#FFFFFF_100%)] px-5 py-5 sm:px-7">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-[1rem] bg-[#18399F] text-white shadow-[0_16px_30px_rgba(24,57,159,0.2)]">
              <FileText className="size-5" />
            </span>
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#18399F]">
                Rental Agreement
              </p>
              <h2 className="mt-2 text-xl font-bold text-[#102A74] sm:text-2xl">
                Terms and Conditions
              </h2>
              <p className="mt-2 max-w-[28rem] text-sm leading-6 text-slate-500">
                Please review the terms below before continuing with your RMS
                account setup.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-[#D8E4FF] text-[#18399F] transition-colors duration-300 hover:bg-[#F4F7FF]"
            aria-label="Close terms and conditions"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
          {termsSections.map((section) => (
            <article
              key={section.title}
              className="rounded-[1.35rem] border border-[#E5EDFF] bg-[#F9FBFF] px-4 py-4"
            >
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#18399F]">
                {section.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {section.body}
              </p>
            </article>
          ))}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#E2EAFA] px-5 py-5 sm:flex-row sm:justify-end sm:px-7">
          <button
            type="button"
            onClick={onDisagree}
            className="inline-flex items-center justify-center rounded-full border border-[#D7E2F4] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#18399F] transition-colors duration-300 hover:bg-[#F6F8FF]"
          >
            Disagree
          </button>
          <button
            type="button"
            onClick={onAgree}
            className="inline-flex items-center justify-center rounded-full bg-[#18399F] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:bg-[#102A74]"
          >
            I Agree
          </button>
        </div>
      </section>
    </div>
  )
}
