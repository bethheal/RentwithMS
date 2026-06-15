import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import AuthFormField from "../../components/auth/AuthFormField.jsx";
import AuthModeShell from "../../components/auth/AuthModeShell.jsx";
import { ROUTES } from "../../routes/routePaths.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { showErrorToast } from "../../utils/toast.js";

const requestInitialState = {
  email: "",
};

const resetInitialState = {
  password: "",
  confirmPassword: "",
};

function getForgotPasswordValidationMessage(email) {
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    return "Please enter your email";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(normalizedEmail)) {
    return "Please provide a valid email address.";
  }

  return "";
}

function getResetPasswordValidationMessage({ password, confirmPassword }) {
  const normalizedPassword = password.trim();
  const normalizedConfirmPassword = confirmPassword.trim();

  if (!normalizedPassword || !normalizedConfirmPassword) {
    return "Please fill in all required fields";
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

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { requestPasswordReset, resetPassword } = useAuth();
  const token = searchParams.get("token")?.trim() ?? "";
  const emailQuery = searchParams.get("email")?.trim() ?? "";
  const isResetMode = Boolean(token);
  const [requestValues, setRequestValues] = useState(() => ({
    ...requestInitialState,
    email: emailQuery,
  }));
  const [resetValues, setResetValues] = useState(resetInitialState);
  const [formError, setFormError] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    () => location.state?.statusMessage ?? "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isResetMode) {
      return;
    }

    setRequestValues((current) => ({
      ...current,
      email: emailQuery,
    }));
  }, [emailQuery, isResetMode]);

  useEffect(() => {
    if (!location.state?.statusMessage) {
      return;
    }

    setStatusMessage(location.state.statusMessage);
  }, [location.state]);

  const handleRequestChange = (event) => {
    const { name, value } = event.target;
    setRequestValues((current) => ({
      ...current,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const handleResetChange = (event) => {
    const { name, value } = event.target;
    setResetValues((current) => ({
      ...current,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const handleRequestSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = getForgotPasswordValidationMessage(
      requestValues.email,
    );

    if (validationMessage) {
      setFormError(validationMessage);
      showErrorToast(validationMessage);
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");
      setStatusMessage("");

      const resetData = await requestPasswordReset(requestValues.email);

      if (resetData?.resetToken) {
        const nextSearchParams = new URLSearchParams();
        nextSearchParams.set("token", resetData.resetToken);

        if (requestValues.email.trim()) {
          nextSearchParams.set("email", requestValues.email.trim());
        }

        navigate(`/reset-password?${nextSearchParams.toString()}`, {
          replace: true,
          state: {
            statusMessage: "Reset link ready. Choose a new password below.",
          },
        });
        return;
      }

      setStatusMessage(
        "If an account exists for that email, reset instructions are ready.",
      );
    } catch (error) {
      const nextMessage =
        error.message || "Password reset could not be started.";
      setFormError(nextMessage);
      showErrorToast(error, "Password reset could not be started.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = getResetPasswordValidationMessage(resetValues);

    if (validationMessage) {
      setFormError(validationMessage);
      showErrorToast(validationMessage);
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");

      await resetPassword({
        token,
        password: resetValues.password,
        confirmPassword: resetValues.confirmPassword,
      });

      navigate(ROUTES.LOGIN, { replace: true });
    } catch (error) {
      const nextMessage = error.message || "Password could not be reset.";
      setFormError(nextMessage);
      showErrorToast(error, "Password could not be reset.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modeLabel = isResetMode ? "Reset Password" : "Forgot Password";
  const formId = isResetMode ? "reset-password-form" : "forgot-password-form";
  const submitLabel = isSubmitting
    ? isResetMode
      ? "Saving..."
      : "Preparing..."
    : isResetMode
      ? "Save Password"
      : "Continue";
  const description = isResetMode
    ? "Create a new password for your account. Your reset link is valid for a short time only."
    : "Enter your account email and we will prepare a secure password reset link for you right away.";

  return (
    <AuthModeShell
      backAriaLabel="Back to login"
      backTo={ROUTES.LOGIN}
      description={description}
      formId={formId}
      modeLabel={modeLabel}
      roleKey="password-reset"
      roleLabel="Password Reset"
      submitDisabled={isSubmitting}
      submitLabel={submitLabel}
      footer={
        <p className="text-sm text-slate-500">
          Remembered your password?{" "}
          <Link
            to={ROUTES.LOGIN}
            className="font-semibold text-[#18399F] underline underline-offset-4"
          >
            Return to login
          </Link>
        </p>
      }
    >
      {isResetMode ? (
        <form id={formId} onSubmit={handleResetSubmit} className="space-y-5">
          {statusMessage ? (
            <p
              aria-live="polite"
              className="rounded-[1.1rem] border border-[#B9D8C2] bg-[#F3FFF6] px-4 py-3 text-sm text-[#1D6A36]"
            >
              {statusMessage}
            </p>
          ) : null}

          {emailQuery ? (
            <AuthFormField
              label="Account Email"
              name="email"
              type="email"
              value={emailQuery}
              readOnly
              inputClassName="cursor-not-allowed bg-slate-100 text-slate-500"
            />
          ) : null}

          <AuthFormField
            label="New Password*"
            name="password"
            type="password"
            placeholder="Min. 8 Character"
            value={resetValues.password}
            autoComplete="new-password"
            onChange={handleResetChange}
          />

          <AuthFormField
            label="Confirm Password*"
            name="confirmPassword"
            type="password"
            placeholder="Min. 8 Character"
            value={resetValues.confirmPassword}
            autoComplete="new-password"
            onChange={handleResetChange}
          />

          {formError ? (
            <p
              aria-live="polite"
              className="rounded-[1.1rem] border border-[#F3C9BF] bg-[#FFF4F1] px-4 py-3 text-sm text-[#9A3D2A]"
            >
              {formError}
            </p>
          ) : null}
        </form>
      ) : (
        <form id={formId} onSubmit={handleRequestSubmit} className="space-y-5">
          {statusMessage ? (
            <p
              aria-live="polite"
              className="rounded-[1.1rem] border border-[#B9D8C2] bg-[#F3FFF6] px-4 py-3 text-sm text-[#1D6A36]"
            >
              {statusMessage}
            </p>
          ) : null}

          <AuthFormField
            label="Email*"
            name="email"
            type="email"
            placeholder="name@eg.com"
            value={requestValues.email}
            autoComplete="email"
            onChange={handleRequestChange}
          />

          {formError ? (
            <p
              aria-live="polite"
              className="rounded-[1.1rem] border border-[#F3C9BF] bg-[#FFF4F1] px-4 py-3 text-sm text-[#9A3D2A]"
            >
              {formError}
            </p>
          ) : null}
        </form>
      )}
    </AuthModeShell>
  );
}
