import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AuthGoogleMark from "./AuthGoogleMark.jsx";
import AuthRoleArtwork from "./AuthRoleArtwork.jsx";

export default function AuthModeShell({
  backAriaLabel,
  backTo,
  children,
  description,
  footer,
  formId,
  googleDisabled,
  googleLabel,
  isGoogleLoading,
  modeLabel,
  onGoogleAction,
  roleKey,
  roleLabel,
  submitDisabled,
  submitLabel,
}) {
  const hasGoogleAction = Boolean(onGoogleAction && googleLabel);

  return (
    <div className="grid min-h-screen bg-[linear-gradient(180deg,#F6F8FF_0%,#FFFFFF_58%)] lg:grid-cols-[minmax(22rem,0.42fr)_minmax(0,0.58fr)]">
      <section className="relative flex flex-col overflow-hidden px-5 py-6 sm:px-8 lg:px-14 lg:py-10">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,rgba(79,168,248,0.14),transparent_58%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(24,57,159,0.06),transparent_70%)]"
          aria-hidden="true"
        />

        <div className="relative z-10 flex items-center justify-between">
          <Link
            to={backTo}
            className="inline-flex size-11 items-center justify-center rounded-full border border-transparent text-[#18399F] transition-all duration-300 hover:border-[#DCE7FF] hover:bg-white hover:shadow-[0_14px_32px_rgba(24,57,159,0.08)]"
            aria-label={backAriaLabel}
          >
            <ArrowLeft className="size-5" />
          </Link>

          <span className="rounded-full border border-[#D9E2F4] bg-white/92 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[#18399F] shadow-[0_12px_28px_rgba(24,57,159,0.08)] lg:hidden">
            {roleLabel}
          </span>
        </div>

        <div className="relative z-10 flex flex-1 items-center py-8 sm:py-10">
          <div className="mx-auto w-full max-w-[28rem] rounded-[2rem] border border-[#E2EAFA] bg-white/88 px-6 py-7 shadow-[0_34px_70px_rgba(24,57,159,0.1)] backdrop-blur-md sm:px-8 sm:py-8 lg:mx-0">
            <div className="space-y-5">
              <h1 className="text-center text-[2rem] font-extrabold uppercase tracking-[0.28em] text-[#18399F] sm:text-[2.25rem]">
                {modeLabel}
              </h1>
              {description ? (
                <p className="text-center text-sm leading-7 text-slate-500">
                  {description}
                </p>
              ) : null}

              {hasGoogleAction ? (
                <>
                  <button
                    type="button"
                    onClick={onGoogleAction}
                    disabled={googleDisabled}
                    className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-[#D7E2F4] bg-[#F8FAFF] px-5 text-sm font-medium text-[#18399F] shadow-[0_12px_24px_rgba(24,57,159,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#BFD2FF] hover:bg-white hover:shadow-[0_18px_32px_rgba(24,57,159,0.1)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:border-[#D7E2F4] disabled:hover:bg-[#F8FAFF] disabled:hover:shadow-[0_12px_24px_rgba(24,57,159,0.05)]"
                  >
                    <span className="grid size-8 place-items-center rounded-full bg-white shadow-[0_10px_22px_rgba(24,57,159,0.08)]">
                      <AuthGoogleMark className="size-[1.125rem]" />
                    </span>
                    <span>{isGoogleLoading ? 'Connecting to Google...' : googleLabel}</span>
                  </button>

                  <div className="flex items-center gap-3 text-[0.72rem] font-medium text-slate-400">
                    <span className="h-px flex-1 bg-[#D6DCEB]" />
                    <span>{`or ${modeLabel} with Email`}</span>
                    <span className="h-px flex-1 bg-[#D6DCEB]" />
                  </div>
                </>
              ) : null}
            </div>

            <div className="mt-7 rounded-[1.6rem] bg-[linear-gradient(135deg,#173B9F_0%,#214CB7_100%)] px-5 py-4 text-white shadow-[0_22px_44px_rgba(24,57,159,0.22)] lg:hidden">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white/76">
                    Role
                  </p>
                  <p className="mt-2 text-lg font-semibold uppercase tracking-[0.16em]">
                    {roleLabel}
                  </p>
                </div>
                <AuthRoleArtwork roleKey={roleKey} compact />
              </div>
            </div>

            <div className="mt-8">{children}</div>

            {formId && submitLabel ? (
              <div className="mt-8 lg:hidden">
                <button
                  type="submit"
                  form={formId}
                  disabled={submitDisabled}
                  className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#18399F] px-6 text-sm font-extrabold uppercase tracking-[0.24em] text-white shadow-[0_18px_32px_rgba(24,57,159,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#102A74] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#6F89D4] disabled:shadow-none"
                >
                  <span>{submitLabel}</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            ) : null}

            {footer ? <div className="mt-8">{footer}</div> : null}
          </div>
        </div>
      </section>

      <section className="relative hidden overflow-hidden bg-[linear-gradient(160deg,#2047B5_0%,#18399F_48%,#10286C_100%)] text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-y-[-8%] left-[-28%] w-[54%] rounded-full border-[3px] border-[#4FA8F8] bg-[#F7FAFF]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-white/8 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-[-5rem] left-10 h-72 w-72 rounded-full bg-[#4FA8F8]/16 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex w-full flex-col px-10 py-10 xl:px-14 xl:py-12">
          <div className="flex justify-end">
            <Link
              to="/"
              className="text-[1.15rem] font-extrabold uppercase tracking-[0.36em] text-white transition-opacity duration-300 hover:opacity-85"
            >
              RMS
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="ml-auto flex w-full max-w-[24rem] flex-col items-center gap-8 pr-4 text-center xl:pr-8">
              <span className="text-[1.95rem] font-semibold uppercase tracking-[0.28em] text-white">
                {roleLabel}
              </span>

              <div className="grid min-h-[21rem] w-full max-w-[23rem] place-items-center rounded-[2.2rem] border border-white/8 bg-white/6 px-10 py-10 shadow-[0_30px_70px_rgba(6,19,67,0.34)] backdrop-blur-[2px]">
                <AuthRoleArtwork roleKey={roleKey} />
              </div>
            </div>
          </div>

          {formId && submitLabel ? (
            <div className="flex justify-end">
              <button
                type="submit"
                form={formId}
                disabled={submitDisabled}
                className="inline-flex items-center gap-3 rounded-full bg-white px-10 py-4 text-sm font-extrabold uppercase tracking-[0.24em] text-[#18399F] shadow-[0_20px_34px_rgba(10,24,76,0.26)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#EEF4FF] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-white/75 disabled:text-[#5B70B2] disabled:shadow-none"
              >
                <span>{submitLabel}</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
