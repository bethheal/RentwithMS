import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";
import { classNames } from "../../utils/classNames.js";

export default function AuthFormField({
  label,
  className = "",
  inputClassName = "",
  type = "text",
  id,
  ...props
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const isPasswordField = type === "password";
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <label htmlFor={inputId} className={classNames("flex flex-col gap-2.5", className)}>
      <span className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#2347A1]">
        {label}
      </span>
      <span className="relative block">
        <input
          id={inputId}
          type={isPasswordField && isPasswordVisible ? "text" : type}
          className={classNames(
            "h-14 w-full rounded-[1.1rem] border border-[#D7E2F4] bg-[#FBFCFF] px-4 text-sm text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#18399F] focus:bg-white focus:ring-4 focus:ring-[#18399F]/10",
            isPasswordField && "pr-14",
            inputClassName,
          )}
          {...props}
        />
        {isPasswordField ? (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((current) => !current)}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            aria-pressed={isPasswordVisible}
            className="absolute inset-y-0 right-3 inline-flex items-center justify-center text-[#18399F] transition-colors duration-300 hover:text-[#102A74]"
          >
            {isPasswordVisible ? (
              <EyeOff className="size-5" strokeWidth={1.9} />
            ) : (
              <Eye className="size-5" strokeWidth={1.9} />
            )}
          </button>
        ) : null}
      </span>
    </label>
  );
}
