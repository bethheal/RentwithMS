import { ChevronDown } from 'lucide-react'
import { classNames } from '../../utils/classNames.js'

export default function FaqAccordionItem({
  isOpen,
  item,
  onToggle,
}) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-slate-900 sm:text-base">
          {item.question}
        </span>
        <ChevronDown
          className={classNames(
            'size-5 shrink-0 text-brand-700 transition-transform duration-300',
            isOpen ? 'rotate-180' : '',
          )}
        />
      </button>
      <div
        className={classNames(
          'grid transition-[grid-template-rows] duration-300',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-7 text-slate-600">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  )
}
