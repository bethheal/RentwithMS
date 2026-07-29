import { useEffect, useState } from "react";
import { CheckCircle2, Mail, XCircle } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import AuthFormField from "../../components/auth/AuthFormField.jsx";
import AuthModeShell from "../../components/auth/AuthModeShell.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROUTES } from "../../routes/routePaths.js";
import { showErrorToast } from "../../utils/toast.js";

const isEmailVerificationEnabled =
  import.meta.env.VITE_EMAIL_VERIFICATION_ENABLED === "true";

function buildLoginPath(roleKey, email) {
  const params = new URLSearchParams();
  if (roleKey) params.set("role", roleKey);
  if (email) params.set("email", email);
  return `${ROUTES.LOGIN}?${params.toString()}`;
}

function VerificationStatus({ verified, label }) {
  const Icon = verified ? CheckCircle2 : XCircle;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] ${
        verified
          ? "border-[#BFE8D0] bg-[#F0FFF5] text-[#16713A]"
          : "border-[#F3C9BF] bg-[#FFF6F3] text-[#9A3D2A]"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </span>
  );
}

function VerificationCard({
  Icon,
  actionLabel,
  children,
  disabled,
  isLoading,
  onAction,
  title,
}) {
  return (
    <section className="space-y-4 rounded-[1.25rem] border border-[#D7E2F4] bg-white px-4 py-4">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#EEF4FF] text-[#18399F]">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#18399F]">
            {title}
          </h2>
          <div className="mt-2 text-sm leading-6 text-slate-500">
            {children}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onAction}
        disabled={disabled || isLoading}
        className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#C9D4EC] px-4 text-sm font-bold text-[#18399F] transition-colors duration-300 hover:border-[#18399F] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Sending..." : actionLabel}
      </button>
    </section>
  );
}




export default function VerificationPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const roleKey = searchParams.get("role") || "tenant";
  const userIdFromQuery = searchParams.get("userId");
  const {
    getSignupVerification,
    resendSignupVerification,
    verifySignup,
  } = useAuth();
  const [verification, setVerification] = useState(
    () => location.state?.verification ?? null,
  );
  const [otpCode, setOtpCode] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [notice, setNotice] = useState(() =>
    location.state?.verification?.reusedPendingAccount
      ? "Your account is awaiting verification. We've sent you a new verification code."
      : "",
  );
  const [formError, setFormError] = useState("");
  const [loadingMethod, setLoadingMethod] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [bypassSeconds, setBypassSeconds] = useState(5);
  const [hasRunBypass, setHasRunBypass] = useState(false);
  const isDevelopmentBypass =
    !isEmailVerificationEnabled ||
    verification?.activationRequirement === "none" ||
    verification?.verificationRequired === false;

  const completeDevelopmentBypass = async () => {
    if (!verification?.userId || hasRunBypass) {
      return;
    }

    try {
      setHasRunBypass(true);
      setIsVerifying(true);
      setFormError("");

      // Temporary development-only bypass. Re-enable verification before production.
      const verifiedUser = await verifySignup({
        userId: verification.userId,
        code: "",
      });

      setVerification((current) => ({
        ...current,
        emailVerified: true,
        phoneVerified: verifiedUser.phoneVerified,
        accountStatus: verifiedUser.accountStatus,
        email: verifiedUser.email ?? current?.email,
      }));
      setNotice("Verification skipped for development. Redirecting to login...");
    } catch (error) {
      const message = error.message || "Development verification bypass failed.";
      setFormError(message);
      showErrorToast(error, "Development verification bypass failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (!isDevelopmentBypass || bypassSeconds <= 0) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setBypassSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [bypassSeconds, isDevelopmentBypass]);

  useEffect(() => {
    if (isDevelopmentBypass && verification?.userId && !hasRunBypass) {
      completeDevelopmentBypass();
    }
  }, [hasRunBypass, isDevelopmentBypass, verification?.userId]);

  useEffect(() => {
    if (!isDevelopmentBypass || bypassSeconds > 0) {
      return;
    }

    navigate(buildLoginPath(roleKey, verification?.email), { replace: true });
  }, [bypassSeconds, isDevelopmentBypass, navigate, roleKey, verification?.email]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return undefined;
    const timerId = window.setTimeout(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearTimeout(timerId);
  }, [cooldownSeconds]);

  useEffect(() => {
    let isMounted = true;

    async function loadVerification() {
      try {
        setFormError("");

        if (userIdFromQuery) {
          const status = await getSignupVerification(userIdFromQuery);
          if (!isMounted) return;
          setVerification(status);
        }
      } catch (error) {
        if (!isMounted) return;
        const message = error.message || "Verification status could not be loaded.";
        setFormError(message);
        showErrorToast(error, "Verification status could not be loaded.");
      }
    }

    loadVerification();

    return () => {
      isMounted = false;
    };
  }, [getSignupVerification, userIdFromQuery]);

  const handleSend = async () => {
    if (!verification?.userId || cooldownSeconds > 0) return;

    if (isDevelopmentBypass) {
      await completeDevelopmentBypass();
      return;
    }

    try {
      setLoadingMethod("email");
      setFormError("");
      const nextVerification = await resendSignupVerification({
        email: verification.email,
        userId: verification.userId,
        verificationMethod: "email",
      });
      setVerification((current) => ({ ...current, ...nextVerification }));
      setCooldownSeconds(nextVerification?.cooldownSeconds ?? 60);
      setOtpCode("");
      if (nextVerification?.deliveryStatus === "failed") {
        setFormError(
          nextVerification.deliveryError ||
            "Email delivery failed. Check the Resend API key and sender domain, then try again.",
        );
        setNotice("");
        return;
      }
      setNotice(
        "We've sent a verification code to your email. Enter the code below to verify your account.",
      );
    } catch (error) {
      const message = error.message || "Verification could not be sent.";
      const retryAfterSeconds = error.details?.retryAfterSeconds;
      if (error.details?.reason === "resend_cooldown" && retryAfterSeconds) {
        setCooldownSeconds(retryAfterSeconds);
      }
      setFormError(message);
      showErrorToast(error, "Verification could not be sent.");
    } finally {
      setLoadingMethod("");
    }
  };

 const handleCodeVerify = async (event) => {
  event.preventDefault();

  if (!verification?.userId) return;

  if (isDevelopmentBypass) {
    await completeDevelopmentBypass();
    return;
  }

  if (!/^\d{6}$/.test(otpCode.trim())) {
    setFormError("Enter the 6-digit verification code.");
    return;
  }

  try {
    setIsVerifying(true);
    setFormError("");

    const verifiedUser = await verifySignup({
      userId: verification.userId,
      code: otpCode.trim(),
    });

    setVerification((current) => ({
      ...current,
      emailVerified: verifiedUser.emailVerified,
      phoneVerified: verifiedUser.phoneVerified,
      accountStatus: verifiedUser.accountStatus,
    }));

    setOtpCode("");

    if (verifiedUser.accountStatus === "active") {
      setNotice("Email verified successfully. Redirecting to login...");

      setTimeout(() => {
        navigate(
          buildLoginPath(roleKey, verifiedUser.email),
          { replace: true }
        );
      }, 5000);

      return;
    }

    setNotice("Email verified. Your status has been updated.");

  } catch (error) {
    const message = error.message || "Verification failed.";
    setFormError(message);
    showErrorToast(error, "Verification failed.");

  } finally {
    setIsVerifying(false);
  }
};

  const isEmailVerified = Boolean(verification?.emailVerified);
  const isActive = verification?.accountStatus === "active";

  if (isDevelopmentBypass) {
    const progressPercent = ((5 - bypassSeconds) / 5) * 100;

    return (
      <AuthModeShell
        backAriaLabel="Back to login"
        backTo={ROUTES.LOGIN}
        formId="verification-bypass"
        googleDisabled
        googleLabel="Sign up with Google"
        isGoogleLoading={false}
        modeLabel="Verification"
        roleKey={roleKey}
        roleLabel="Account"
        submitDisabled
        submitLabel={null}
        footer={
          <p className="text-sm text-slate-500">
            Ready to continue?{" "}
            <Link
              to={buildLoginPath(roleKey, verification?.email)}
              className="font-semibold text-[#18399F] underline underline-offset-4"
            >
              Log in
            </Link>
          </p>
        }
      >
        <section
          id="verification-bypass"
          className="space-y-5 rounded-[1.25rem] border border-[#CFE0FF] bg-[#F7FAFF] px-4 py-5 text-[#18399F]"
        >
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 animate-pulse place-items-center rounded-full bg-[#EAF2FF] text-[#18399F]">
              <CheckCircle2 className="size-5" />
            </span>
            <div>
              <h1 className="font-semibold">Verification skipped</h1>
              <p className="mt-2 text-sm leading-6 text-[#3656B7]">
                Development mode is active. Your account is being marked as
                verified and you will be sent to login in {bypassSeconds}s.
              </p>
            </div>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[#D7E2F4]">
            <div
              className="h-full rounded-full bg-[#18399F] transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {formError ? (
            <p
              aria-live="polite"
              className="rounded-[1.1rem] border border-[#F3C9BF] bg-[#FFF4F1] px-4 py-3 text-sm text-[#9A3D2A]"
            >
              {formError}
            </p>
          ) : null}
        </section>
      </AuthModeShell>
    );
  }

  return (
    <AuthModeShell
      backAriaLabel="Back to login"
      backTo={ROUTES.LOGIN}
      formId="verification-code-form"
      googleDisabled
      googleLabel="Sign up with Google"
      isGoogleLoading={false}
      modeLabel="Verification"
      roleKey={roleKey}
      roleLabel="Account"
      submitDisabled
      submitLabel={null}
      footer={
        <p className="text-sm text-slate-500">
          Ready to continue?{" "}
          <Link
            to={`/login?role=${roleKey}`}
            className="font-semibold text-[#18399F] underline underline-offset-4"
          >
            Log in
          </Link>
        </p>
      }
    >
      <div className="space-y-5">
        <section className="rounded-[1.25rem] border border-[#CFE0FF] bg-[#F7FAFF] px-4 py-4 text-sm text-[#18399F]">
          <h1 className="font-semibold">Verify Your Account</h1>
          <p className="mt-2 leading-6 text-[#3656B7]">
            Enter the 6-digit code sent to your email to activate your account.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <VerificationStatus
              verified={isEmailVerified}
              label={isEmailVerified ? "Email Verified" : "Email Not Verified"}
            />
          </div>
          {isActive ? (
            <p className="mt-4 rounded-[0.9rem] border border-[#BFE8D0] bg-white px-3 py-2 font-semibold text-[#16713A]">
              Your account is active. You can log in now.
            </p>
          ) : null}
        </section>

        {notice ? (
          <p className="rounded-[1.1rem] border border-[#D7E2F4] bg-white px-4 py-3 text-sm text-[#18399F]">
            {notice}
          </p>
        ) : null}

        <VerificationCard
          Icon={Mail}
          title="Verify by Email"
          actionLabel="Send Verification Email"
          disabled={!verification?.userId || isEmailVerified || cooldownSeconds > 0}
          isLoading={loadingMethod === "email"}
          onAction={handleSend}
        >
          <p>{verification?.email || "Loading email address..."}</p>
          {cooldownSeconds > 0 ? (
            <p className="mt-1">You can resend in {cooldownSeconds}s.</p>
          ) : null}
        </VerificationCard>

        <form
          id="verification-code-form"
          onSubmit={handleCodeVerify}
          className="space-y-4"
        >
          <AuthFormField
            label="Email Verification Code*"
            name="otpCode"
            type="text"
            inputMode="numeric"
            placeholder="Enter 6-digit code"
            value={otpCode}
            autoComplete="one-time-code"
            onChange={(event) => {
              setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6));
              if (formError) setFormError("");
            }}
          />
          <button
            type="submit"
            disabled={
              isVerifying ||
              !verification?.userId ||
              isEmailVerified
            }
            className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#18399F] px-6 text-sm font-extrabold uppercase tracking-[0.2em] text-white shadow-[0_18px_32px_rgba(24,57,159,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#102A74] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#6F89D4] disabled:shadow-none"
          >
            <span>{isVerifying ? "Verifying..." : "Submit Code"}</span>
            <CheckCircle2 className="size-4" />
          </button>
        </form>

        {formError ? (
          <p
            aria-live="polite"
            className="rounded-[1.1rem] border border-[#F3C9BF] bg-[#FFF4F1] px-4 py-3 text-sm text-[#9A3D2A]"
          >
            {formError}
          </p>
        ) : null}
      </div>
    </AuthModeShell>
  );
}
