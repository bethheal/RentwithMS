import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthFormField from "../../components/auth/AuthFormField.jsx";
import AuthModeShell from "../../components/auth/AuthModeShell.jsx";
import AuthRoleSelectionStep from "../../components/auth/AuthRoleSelectionStep.jsx";
import TermsAndConditionsModal from "../../components/auth/TermsAndConditionsModal.jsx";
import { ROUTES } from "../../routes/routePaths.js";
import {
  authRoleContent,
  normalizeAuthRole,
} from "../../components/auth/authRoleConfig.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { requestGoogleIdToken } from "../../utils/googleAuth.js";
import { showErrorToast } from "../../utils/toast.js";

const initialState = {
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
const isEmailVerificationEnabled =
  import.meta.env.VITE_EMAIL_VERIFICATION_ENABLED !== "false";

function getSignupValidationMessage({
  fullName,
  email,
  phoneNumber,
  password,
  confirmPassword,
}) {
  const normalizedName = fullName.trim();
  const normalizedEmail = email.trim();
  const normalizedPhone = phoneNumber.trim();
  const normalizedPassword = password.trim();
  const normalizedConfirmPassword = confirmPassword.trim();

  if (
    !normalizedName ||
    !normalizedEmail ||
    !normalizedPhone ||
    !normalizedPassword ||
    !normalizedConfirmPassword
  ) {
    return "Please fill in all required fields";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(normalizedEmail)) {
    return "Please provide a valid email address.";
  }

  const normalizedPhoneDigits = normalizedPhone.replace(/[\s().-]/g, "");
  const phonePattern = /^(\+?233|0)\d{9}$/;
  if (!phonePattern.test(normalizedPhoneDigits)) {
    return "Please provide a valid phone number.";
  }

  if (normalizedPassword.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  if (!/[A-Za-z]/.test(normalizedPassword) || !/\d/.test(normalizedPassword)) {
    return "Password must include at least one letter and one number.";
  }

  if (normalizedPassword !== normalizedConfirmPassword) {
    return "Passwords do not match.";
  }

  return "";
}

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const roleKey = normalizeAuthRole(searchParams.get("role"));

  if (!roleKey) {
    return <AuthRoleSelectionStep mode="signup" />;
  }

  return <SignupRoleForm key={roleKey} roleKey={roleKey} />;
}

function SignupRoleForm({ roleKey }) {
  const navigate = useNavigate();
  const { loginWithGoogle, register, resendSignupVerification, verifySignup } =
    useAuth();
  const roleConfig = authRoleContent[roleKey];
  const [formValues, setFormValues] = useState(initialState);
  const [verificationState, setVerificationState] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [formError, setFormError] = useState("");
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const selectedVerificationMethod = "email";
  const didDeliveryFail = verificationState?.deliveryStatus === "failed";
  const verificationDestination = verificationState?.email || formValues.email;

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [cooldownSeconds]);

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;

    if (name === "acceptedTerms" && checked) {
      setFormError("");
    }

    setFormValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (formError && name !== "acceptedTerms") {
      setFormError("");
    }
  };

  const handleGoogleSignup = async () => {
    if (!formValues.acceptedTerms) {
      setFormError("Please agree to the terms and conditions to continue.");
      showErrorToast("Please agree to the terms and conditions to continue.");
      return;
    }

    try {
      setIsGoogleLoading(true);
      setFormError("");

      const idToken = await requestGoogleIdToken(googleClientId);
      await loginWithGoogle({
        idToken,
        role: roleKey,
      });

      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      const nextMessage =
        error.message || "Google signup could not be completed.";
      setFormError(nextMessage);
      showErrorToast(error, "Google signup could not be completed.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = getSignupValidationMessage(formValues);

    if (validationMessage) {
      setFormError(validationMessage);
      showErrorToast(validationMessage);
      return;
    }

    if (!formValues.acceptedTerms) {
      setFormError("Please agree to the terms and conditions to continue.");
      showErrorToast("Please agree to the terms and conditions to continue.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");

      const verificationData = await register({
        name: formValues.fullName,
        email: formValues.email,
        phoneNumber: formValues.phoneNumber,
        password: formValues.password,
        confirmPassword: formValues.confirmPassword,
        role: roleKey,
        verificationMethod: "email",
      });

      if (verificationData.verificationRequired === false) {
        navigate(`/login?role=${roleKey}&email=${encodeURIComponent(formValues.email)}`, {
          replace: true,
        });
        return;
      }

      navigate(
        `${ROUTES.VERIFY_ACCOUNT}?userId=${encodeURIComponent(
          verificationData.userId,
        )}&role=${encodeURIComponent(roleKey)}`,
        {
          replace: true,
          state: { verification: verificationData },
        },
      );
    } catch (error) {
      const nextMessage = error.message || "Signup failed.";
      setFormError(nextMessage);
      showErrorToast(error, "Signup failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifySubmit = async (event) => {
    event.preventDefault();

    if (!verificationState?.userId) {
      setFormError("Start signup again to request a new verification code.");
      return;
    }

    if (!/^\d{6}$/.test(otpCode.trim())) {
      setFormError("Enter the 6-digit verification code.");
      showErrorToast("Enter the 6-digit verification code.");
      return;
    }

    try {
      setIsVerifying(true);
      setFormError("");

      await verifySignup({
        userId: verificationState.userId,
        code: otpCode.trim(),
      });

      navigate(`/login?role=${roleKey}`, { replace: true });
    } catch (error) {
      const nextMessage = error.message || "Verification failed.";
      setFormError(nextMessage);
      showErrorToast(error, "Verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationState?.userId || cooldownSeconds > 0) {
      return;
    }

    try {
      setIsResending(true);
      setFormError("");

      const nextVerificationState = await resendSignupVerification({
        email: verificationState.email || formValues.email,
        userId: verificationState.userId,
        verificationMethod: selectedVerificationMethod,
      });

      setVerificationState(nextVerificationState);
      setCooldownSeconds(nextVerificationState?.cooldownSeconds ?? 45);
      setOtpCode("");
    } catch (error) {
      const nextMessage =
        error.message || "Could not resend verification code.";
      const retryAfterSeconds = error.details?.retryAfterSeconds;
      if (error.details?.reason === "resend_cooldown" && retryAfterSeconds) {
        setCooldownSeconds(retryAfterSeconds);
      }
      setFormError(nextMessage);
      showErrorToast(error, "Could not resend verification code.");
    } finally {
      setIsResending(false);
    }
  };

  const handleAgreeToTerms = () => {
    setFormValues((current) => ({
      ...current,
      acceptedTerms: true,
    }));
    setFormError("");
    setIsTermsModalOpen(false);
  };

  const handleDisagreeToTerms = () => {
    setFormValues((current) => ({
      ...current,
      acceptedTerms: false,
    }));
    setIsTermsModalOpen(false);
  };

  return (
    <>
      <AuthModeShell
        backAriaLabel="Back to role selection"
        backTo={ROUTES.SIGNUP}
        formId="signup-form"
        googleDisabled={isSubmitting || isGoogleLoading}
        googleLabel="Sign up with Google"
        isGoogleLoading={isGoogleLoading}
        modeLabel="Signup"
        onGoogleAction={handleGoogleSignup}
        roleKey={roleKey}
        roleLabel={roleConfig.label}
        submitDisabled={isSubmitting || isGoogleLoading || isVerifying}
        submitLabel={
          verificationState
            ? null
            : isSubmitting
              ? "Sending Code..."
              : "Sign Up"
        }
        footer={
          <p className="text-[0.72rem] uppercase tracking-[0.34em] text-[#7C86A6]">
            already have an account{" "}
            <Link
              to={`/login?role=${roleKey}`}
              className="font-bold text-[#18399F] underline underline-offset-4"
            >
              LOGIN
            </Link>
          </p>
        }
      >
        <form
          id="signup-form"
          onSubmit={verificationState ? handleVerifySubmit : handleSubmit}
          className="space-y-5"
        >
          {verificationState ? (
            <div className="rounded-[1.25rem] border border-[#CFE0FF] bg-[#F7FAFF] px-4 py-4 text-sm text-[#18399F]">
              <p className="font-semibold">Verify your account</p>
              <p className="mt-2 leading-6 text-[#3656B7]">
                {didDeliveryFail
                  ? "We could not send the email code to "
                  : "We sent a 6-digit code to "}
                {verificationDestination}. Complete this step before logging in.
              </p>
              {didDeliveryFail ? (
                <p className="mt-3 rounded-[0.9rem] border border-[#F3C9BF] bg-white px-3 py-2 font-semibold text-[#9A3D2A]">
                  Email delivery is not configured yet. Check the Resend API key
                  and sender domain, then resend the code.
                </p>
              ) : null}
            </div>
          ) : null}

          {!verificationState ? (
            <>
              <AuthFormField
                label={roleConfig.signupNameLabel}
                name="fullName"
                placeholder={roleConfig.signupNamePlaceholder}
                value={formValues.fullName}
                onChange={handleChange}
              />

              <AuthFormField
                label="Email*"
                name="email"
                type="email"
                placeholder="name@eg.com"
                value={formValues.email}
                autoComplete="email"
                onChange={handleChange}
              />

              <AuthFormField
                label="Phone Number*"
                name="phoneNumber"
                type="tel"
                placeholder="+233 55 000 0000"
                value={formValues.phoneNumber}
                autoComplete="tel"
                onChange={handleChange}
              />

              <AuthFormField
                label="Password*"
                name="password"
                type="password"
                placeholder="Min. 8 Character"
                value={formValues.password}
                autoComplete="new-password"
                onChange={handleChange}
              />

              <AuthFormField
                label="Confirm Password*"
                name="confirmPassword"
                type="password"
                placeholder="Min. 8 Character"
                value={formValues.confirmPassword}
                autoComplete="new-password"
                onChange={handleChange}
              />

              {isEmailVerificationEnabled ? (
                <p className="rounded-[1.1rem] border border-[#D7E2F4] bg-[#F7FAFF] px-4 py-3 text-sm font-semibold text-[#18399F]">
                  We will verify your account with a 6-digit email code.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <AuthFormField
                label="Verification Code*"
                name="otpCode"
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit code"
                value={otpCode}
                autoComplete="one-time-code"
                onChange={(event) => {
                  setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                  if (formError) {
                    setFormError("");
                  }
                }}
              />

              <button
                type="submit"
                disabled={isVerifying}
                className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#18399F] px-6 text-sm font-extrabold uppercase tracking-[0.2em] text-white shadow-[0_18px_32px_rgba(24,57,159,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#102A74] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#6F89D4] disabled:shadow-none"
              >
                <span>{isVerifying ? "Verifying..." : "Submit Code"}</span>
                <CheckCircle2 className="size-4" />
              </button>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.1rem] border border-[#D7E0F1] bg-white px-4 py-3">
                <p className="text-sm text-slate-500">
                  {cooldownSeconds > 0
                    ? `You can resend a code in ${cooldownSeconds}s.`
                    : "Did not receive the code?"}
                </p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={cooldownSeconds > 0 || isResending}
                  className="rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:border-[#18399F] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isResending ? "Resending..." : "Resend Code"}
                </button>
              </div>
            </>
          )}

          {!verificationState ? (
            <div className="flex items-start gap-3 pt-1 text-[0.72rem] uppercase tracking-[0.08em] text-[#18399F]">
              <input
                name="acceptedTerms"
                type="checkbox"
                checked={formValues.acceptedTerms}
                onChange={handleChange}
                className="mt-0.5 size-4 rounded-[0.22rem] border border-[#18399F] accent-[#18399F]"
              />
              <div className="space-y-1.5">
                <span>I agree to the </span>
                <button
                  type="button"
                  onClick={() => setIsTermsModalOpen(true)}
                  className="font-bold text-[#102A74] underline decoration-[#102A74] underline-offset-4"
                >
                  Terms and Conditions
                </button>
              </div>
            </div>
          ) : null}

          {formError ? (
            <p
              aria-live="polite"
              className="rounded-[1.1rem] border border-[#F3C9BF] bg-[#FFF4F1] px-4 py-3 text-sm text-[#9A3D2A]"
            >
              {formError}
            </p>
          ) : null}
        </form>
      </AuthModeShell>

      <TermsAndConditionsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAgree={handleAgreeToTerms}
        onDisagree={handleDisagreeToTerms}
      />
    </>
  );
}
