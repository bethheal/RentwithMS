import { Link } from "react-router-dom";
import { classNames } from "../../utils/classNames.js";
import { ROUTES } from "../../routes/routePaths.js";

export default function BrandMark({
  className = "",
  theme = "dark",
  compact = false,
}) {
  const isLight = theme === "light";

  return (
    <Link
      to={ROUTES.HOME}
      className={classNames(
        "inline-flex items-center gap-3 transition-transform duration-300 hover:-translate-y-0.5",
        className,
      )}
      aria-label="MS home"
    >
      <span
        className={classNames(
          "grid size-11 place-items-center rounded-2xl text-sm font-extrabold tracking-[0.3em]",
          isLight ? "bg-white text-brand-900" : "bg-brand-900 text-white",
        )}
      >
        MS
      </span>
      {!compact && (
        <span
          className={classNames(
            "font-display text-lg font-bold tracking-[-0.04em]",
            isLight ? "text-white" : "text-brand-950",
          )}
        >
          MS
        </span>
      )}
    </Link>
  );
}
