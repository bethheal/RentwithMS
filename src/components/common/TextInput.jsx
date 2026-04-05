import { classNames } from '../../utils/classNames.js'

export default function TextInput({
  className = '',
  helperText,
  label,
  ...props
}) {
  return (
    <label className="flex w-full flex-col gap-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        className={classNames(
          'h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100',
          className,
        )}
        {...props}
      />
      {helperText && (
        <span className="text-xs leading-6 text-slate-500">{helperText}</span>
      )}
    </label>
  )
}
