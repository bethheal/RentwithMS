import { useState } from "react";
import { ShieldCheck, Sparkles } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthFormField from "../../components/auth/AuthFormField.jsx";
import AuthModeShell from "../../components/auth/AuthModeShell.jsx";
import AuthRoleSelectionStep from "../../components/auth/AuthRoleSelectionStep.jsx";
import {
  authRoleContent,
  normalizeAuthRole,
} from "../../components/auth/authRoleConfig.js";
import { useAuth } from "../../context/AuthContext.jsx";

const emptyState = {
  email: "",
  password: "",
};

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
  const { login } = useAuth();
  const roleConfig = authRoleContent[roleKey];
  const [formValues, setFormValues] = useState(() => ({
    ...emptyState,
    email: roleConfig.defaultEmail,
    password: "password123",
  }));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCompleteLogin = ({ email }) => {
    login({
      email: email || roleConfig.defaultEmail,
      role: roleConfig.label,
    });

    navigate("/dashboard");
  };

  const handleGoogleLogin = () => {
    handleCompleteLogin({
      email: roleConfig.googleLoginEmail,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleCompleteLogin(formValues);
  };

  return (
    <AuthModeShell
      backAriaLabel="Back to role selection"
      backTo="/login"
      description={`Secure access to your ${roleConfig.label.toLowerCase()} workspace. Continue with Google or use your email credentials below.`}
      formId="login-form"
      googleLabel="Login with Google"
      modeLabel="Log In"
      onGoogleAction={handleGoogleLogin}
      roleKey={roleKey}
      roleLabel={roleConfig.label}
      submitLabel="Log In"
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
      <div className="mb-6 rounded-[1.4rem] border border-[#E2EAFA] bg-[linear-gradient(180deg,#F8FAFF_0%,#FFFFFF_100%)] p-4 shadow-[0_18px_40px_rgba(24,57,159,0.06)]">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-[1rem] bg-[#18399F] text-white shadow-[0_16px_28px_rgba(24,57,159,0.22)]">
            <ShieldCheck className="size-5" />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#18399F]">
              Private workspace access
            </p>
            <p className="text-sm leading-6 text-slate-500">
              Sign in as a {roleConfig.label.toLowerCase()} and continue where
              you left off with your saved activity and workspace settings.
            </p>
          </div>
        </div>
      </div>

      <form id="login-form" onSubmit={handleSubmit} className="space-y-5">
        <AuthFormField
          label="Email*"
          name="email"
          type="email"
          placeholder="name@eg.com"
          value={formValues.email}
          onChange={handleChange}
        />

        <AuthFormField
          label="Password*"
          name="password"
          type="password"
          placeholder="Min. 8 Character"
          value={formValues.password}
          onChange={handleChange}
        />

        <div className="flex items-center justify-between gap-4 rounded-[1.15rem] border border-[#E6EEFF] bg-[#F9FBFF] px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Sparkles className="size-4 text-[#18399F]" />
            <span>Demo password is already filled for quick access.</span>
          </div>
          <button
            type="button"
            className="text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:text-[#102A74]"
          >
            Forgot?
          </button>
        </div>
      </form>
    </AuthModeShell>
  );
}
