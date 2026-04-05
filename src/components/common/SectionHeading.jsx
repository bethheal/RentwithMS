import { classNames } from '../../utils/classNames.js'

export default function SectionHeading({
  align = 'left',
  className = '',
  description,
  eyebrow,
  title,
}) {
  const eyebrowClassName =
    'inline-flex items-center rounded-full border border-brand-900/15 bg-white px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-brand-700'

  return (
    <div
      className={classNames(
        'flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow && <span className={eyebrowClassName}>{eyebrow}</span>}
      {title && (
        <h2 className="max-w-3xl font-display text-3xl font-bold tracking-[-0.05em] text-brand-950 sm:text-4xl lg:text-5xl">
          {title}
        </h2>
      )}
      {description && (
        <p className="max-w-2xl text-sm leading-7 text-ink-700 sm:text-base">
          {description}
        </p>
      )}
    </div>
  )
}
