import { useEffect, useState } from "react";
import { CheckCircle2, Mail, Smartphone, XCircle } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import AuthFormField from "../../components/auth/AuthFormField.jsx";
import AuthModeShell from "../../components/auth/AuthModeShell.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROUTES } from "../../routes/routePaths.js";
import { showErrorToast } from "../../utils/toast.js";

function buildVerifyPath(userId, roleKey) {
  const params = new URLSearchParams();
  if (userId) params.set("userId", userId);
  if (roleKey) params.set("role", roleKey);
  return `${ROUTES.VERIFY_ACCOUNT}?${params.toString()}`;
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
  const token = searchParams.get("token");
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

        if (token) {
          const verifiedUser = await verifySignup({ token });
          if (!isMounted) return;
          setVerification({
            userId: verifiedUser.id,
            email: verifiedUser.email,
            phoneNumber: verifiedUser.phoneNumber,
            emailVerified: verifiedUser.emailVerified,
            phoneVerified: verifiedUser.phoneVerified,
            accountStatus: verifiedUser.accountStatus,
          });
          setNotice("Email verified. Your status has been updated.");
          navigate(buildVerifyPath(verifiedUser.id, roleKey), { replace: true });
          return;
        }

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
  }, [getSignupVerification, navigate, roleKey, token, userIdFromQuery, verifySignup]);

  const handleSend = async (verificationMethod) => {
    if (!verification?.userId || cooldownSeconds > 0) return;

    try {
      setLoadingMethod(verificationMethod);
      setFormError("");
      const nextVerification = await resendSignupVerification({
        userId: verification.userId,
        verificationMethod,
      });
      setVerification((current) => ({ ...current, ...nextVerification }));
      setCooldownSeconds(nextVerification?.cooldownSeconds ?? 60);
      setOtpCode("");
      setNotice(
        verificationMethod === "email"
          ? "We've sent a verification link to your email. Please click the link to verify your account."
          : "A verification code has been sent to your phone.",
      );
    } catch (error) {
      const message = error.message || "Verification could not be sent.";
      setFormError(message);
      showErrorToast(error, "Verification could not be sent.");
    } finally {
      setLoadingMethod("");
    }
  };

  const handlePhoneVerify = async (event) => {
    event.preventDefault();

    if (!verification?.userId) return;

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
      setNotice("Phone verified. Your status has been updated.");
    } catch (error) {
      const message = error.message || "Phone verification failed.";
      setFormError(message);
      showErrorToast(error, "Phone verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  const isEmailVerified = Boolean(verification?.emailVerified);
  const isPhoneVerified = Boolean(verification?.phoneVerified);
  const isActive = verification?.accountStatus === "active";

  return (
    <AuthModeShell
      backAriaLabel="Back to login"
      backTo={ROUTES.LOGIN}
      formId="phone-verification-form"
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
            Choose email, phone, or both depending on what is still pending.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <VerificationStatus
              verified={isEmailVerified}
              label={isEmailVerified ? "Email Verified" : "Email Not Verified"}
            />
            <VerificationStatus
              verified={isPhoneVerified}
              label={isPhoneVerified ? "Phone Verified" : "Phone Not Verified"}
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
          onAction={() => handleSend("email")}
        >
          <p>{verification?.email || "Loading email address..."}</p>
          {cooldownSeconds > 0 ? (
            <p className="mt-1">You can resend in {cooldownSeconds}s.</p>
          ) : null}
        </VerificationCard>

        <VerificationCard
          Icon={Smartphone}
          title="Verify by Phone"
          actionLabel="Send Phone Code"
          disabled={!verification?.userId || isPhoneVerified || cooldownSeconds > 0}
          isLoading={loadingMethod === "phone"}
          onAction={() => handleSend("phone")}
        >
          <p>{verification?.phoneNumber || "Loading phone number..."}</p>
          {verification?.verificationMethod === "phone" &&
          verification?.verificationCode ? (
            <p className="mt-2 rounded-[0.9rem] border border-[#CFE0FF] bg-[#F7FAFF] px-3 py-2 font-semibold text-[#18399F]">
              Phone code: {verification.verificationCode}
            </p>
          ) : null}
        </VerificationCard>

        <form
          id="phone-verification-form"
          onSubmit={handlePhoneVerify}
          className="space-y-4"
        >
          <AuthFormField
            label="Phone Verification Code*"
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
            disabled={isVerifying || !verification?.userId || isPhoneVerified}
            className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#18399F] px-6 text-sm font-extrabold uppercase tracking-[0.2em] text-white shadow-[0_18px_32px_rgba(24,57,159,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#102A74] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#6F89D4] disabled:shadow-none"
          >
            <span>{isVerifying ? "Verifying..." : "Submit Phone Code"}</span>
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
