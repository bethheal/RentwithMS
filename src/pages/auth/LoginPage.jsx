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

        <div >
          <div className="flex items-center gap-2 text-sm text-slate-500">
         
          </div>
          <button
            type="button"
            className="text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:text-[#102A74]"
          >
            Forgotten Password?
          </button>
        </div>
      </form>
    </AuthModeShell>
  );
}
