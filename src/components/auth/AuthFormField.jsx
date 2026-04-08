import { classNames } from "../../utils/classNames.js";

export default function AuthFormField({
  label,
  className = "",
  inputClassName = "",
  ...props
}) {
  return (
    <label className={classNames("flex flex-col gap-2.5", className)}>
      <span className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#2347A1]">
        {label}
      </span>
      <input
        className={classNames(
          "h-14 rounded-[1.1rem] border border-[#D7E2F4] bg-[#FBFCFF] px-4 text-sm text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#18399F] focus:bg-white focus:ring-4 focus:ring-[#18399F]/10",
          inputClassName,
        )}
        {...props}
      />
    </label>
  );
}
