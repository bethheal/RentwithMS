import { classNames } from '../../utils/classNames.js'

export default function FaqAccordionItem({
  isOpen,
  item,
  onToggle,
}) {
  const panelId = `faq-panel-${item.id}`
  const buttonId = `faq-trigger-${item.id}`

  return (
    <div className="w-full">
      <button
        id={buttonId}
        type="button"
        onClick={() => onToggle(item.id)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={classNames(
          'relative z-10 flex w-full items-center justify-between gap-4 rounded-full border px-4 py-4 text-left transition-all duration-300 sm:px-5',
          isOpen
            ? 'border-[#C7D6FF] bg-white shadow-[0_16px_30px_rgba(24,57,159,0.12)]'
            : 'border-transparent bg-[#E5E7EB] shadow-[0_10px_22px_rgba(15,23,42,0.04)] hover:border-[#D4DEFF] hover:bg-white hover:shadow-[0_14px_26px_rgba(24,57,159,0.08)]',
        )}
      >
        <span
          className={classNames(
            'text-sm font-semibold leading-5 transition-colors duration-300 sm:text-[0.98rem]',
            isOpen ? 'text-[#18399F]' : 'text-slate-950',
          )}
        >
          {item.question}
        </span>

        <span
          className={classNames(
            'relative flex size-6 shrink-0 items-center justify-center rounded-full transition-all duration-300 sm:size-7',
            isOpen
              ? 'bg-[#18399F] shadow-[0_10px_20px_rgba(24,57,159,0.22)]'
              : 'bg-[#1D4ED8]',
          )}
        >
          <span className="absolute h-0.5 w-3 rounded-full bg-white sm:w-3.5" />
          <span
            className={classNames(
              'absolute h-3 w-0.5 rounded-full bg-white transition-all duration-300 sm:h-3.5',
              isOpen ? 'scale-y-0 opacity-0' : 'scale-y-100 opacity-100',
            )}
          />
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={classNames(
          'grid transition-[grid-template-rows,opacity,transform] duration-300 ease-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div
            className={classNames(
              'mx-2 -mt-2 rounded-[1.7rem] border px-4 pb-5 pt-7 shadow-[0_18px_34px_rgba(24,57,159,0.08)] transition-all duration-300 sm:px-5',
              isOpen
                ? 'translate-y-0 border-[#C7D6FF] bg-[linear-gradient(180deg,#FFFFFF_0%,#F7FAFF_100%)]'
                : '-translate-y-2 border-transparent bg-white',
            )}
          >
            <div className="mb-3 h-px w-full bg-[linear-gradient(90deg,rgba(24,57,159,0.22),rgba(24,57,159,0))]" aria-hidden="true" />
            <p className="text-sm leading-6 text-slate-600">
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
