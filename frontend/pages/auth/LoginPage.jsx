import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthFormField from "../../components/auth/AuthFormField.jsx";
import AuthModeShell from "../../components/auth/AuthModeShell.jsx";
import { ROUTES } from "../../routes/routePaths.js";
import AuthRoleSelectionStep from "../../components/auth/AuthRoleSelectionStep.jsx";
import {
  authRoleContent,
  normalizeAuthRole,
} from "../../components/auth/authRoleConfig.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { requestGoogleIdToken } from "../../utils/googleAuth.js";
import { showErrorToast } from "../../utils/toast.js";

const emptyState = {
  email: "",
  password: "",
};
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

function getLoginValidationMessage({ email, password }) {
  const normalizedEmail = email.trim();
  const normalizedPassword = password.trim();

  if (!normalizedEmail && !normalizedPassword) {
    return "Please fill in all required fields";
  }

  if (!normalizedEmail) {
    return "Please enter your email";
  }

  if (!normalizedPassword) {
    return "Please enter your password";
  }

  return "";
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const roleKey = normalizeAuthRole(searchParams.get("role"));

  if (!roleKey) {
    return <AuthRoleSelectionStep mode="login" />;
  }

  return <LoginRoleForm key={roleKey} roleKey={roleKey} />;
}

function LoginRoleForm({ roleKey }) {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const roleConfig = authRoleContent[roleKey];
  const [formValues, setFormValues] = useState(() => ({
    ...emptyState,
  }));
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleForgotPassword = () => {
    const nextSearchParams = new URLSearchParams();

    if (formValues.email.trim()) {
      nextSearchParams.set("email", formValues.email.trim());
    }

    navigate(
      `/reset-password${nextSearchParams.toString() ? `?${nextSearchParams.toString()}` : ""}`,
    );
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const handleGoogleLogin = async () => {
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
        error.message || "Google login could not be completed.";
      setFormError(nextMessage);
      showErrorToast(error, "Google login could not be completed.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = getLoginValidationMessage(formValues);

    if (validationMessage) {
      setFormError(validationMessage);
      showErrorToast(validationMessage);
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");

      await login(formValues);
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      const nextMessage = error.message || "Login failed.";
      setFormError(nextMessage);
      showErrorToast(error, "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthModeShell
      backAriaLabel="Back to role selection"
      backTo={ROUTES.LOGIN}
      description={`Secure access to your ${roleConfig.label.toLowerCase()} workspace. Continue with Google or use your email credentials below.`}
      formId="login-form"
      googleDisabled={isSubmitting || isGoogleLoading}
      googleLabel="Login with Google"
      isGoogleLoading={isGoogleLoading}
      modeLabel="Log In"
      onGoogleAction={handleGoogleLogin}
      roleKey={roleKey}
      roleLabel={roleConfig.label}
      submitDisabled={isSubmitting || isGoogleLoading}
      submitLabel={isSubmitting ? "Logging In..." : "Log In"}
      footer={
        <p className="text-sm text-slate-500">
          New to RMS?{" "}
          <Link
            to={`/signup?role=${roleKey}`}
            className="font-semibold text-[#18399F] underline underline-offset-4"
          >
            Create a {roleConfig.label.toLowerCase()} account
          </Link>
        </p>
      }
    >
      <form id="login-form" onSubmit={handleSubmit} className="space-y-5">
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
          label="Password*"
          name="password"
          type="password"
          placeholder="Min. 8 Character"
          value={formValues.password}
          autoComplete="current-password"
          onChange={handleChange}
        />

        {formError ? (
          <p
            aria-live="polite"
            className="rounded-[1.1rem] border border-[#F3C9BF] bg-[#FFF4F1] px-4 py-3 text-sm text-[#9A3D2A]"
          >
            {formError}
          </p>
        ) : null}

        <div>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:text-[#102A74]"
          >
            Forgotten Password?
          </button>
        </div>
      </form>
    </AuthModeShell>
  );
}
