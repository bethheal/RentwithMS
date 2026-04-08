import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthFormField from "../../components/auth/AuthFormField.jsx";
import AuthModeShell from "../../components/auth/AuthModeShell.jsx";
import AuthRoleSelectionStep from "../../components/auth/AuthRoleSelectionStep.jsx";
import {
  authRoleContent,
  normalizeAuthRole,
} from "../../components/auth/authRoleConfig.js";
import { useAuth } from "../../context/AuthContext.jsx";

const initialState = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};

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
  const { register } = useAuth();
  const roleConfig = authRoleContent[roleKey];
  const [formValues, setFormValues] = useState(initialState);
  const [formError, setFormError] = useState("");

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;

    setFormValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const completeSignup = ({ fullName, email }) => {
    register({
      fullName: fullName || roleConfig.defaultName,
      email: email || roleConfig.defaultEmail,
      role: roleConfig.label,
    });

    navigate("/dashboard");
  };

  const handleGoogleSignup = () => {
    completeSignup({
      fullName: roleConfig.googleSignupName,
      email: roleConfig.googleSignupEmail,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (formValues.password !== formValues.confirmPassword) {
      setFormError("Passwords do not match yet.");
      return;
    }

    if (!formValues.acceptedTerms) {
      setFormError("Please agree to the terms and conditions to continue.");
      return;
    }

    setFormError("");

    completeSignup({
      fullName: formValues.fullName,
      email: formValues.email,
    });
  };

  return (
    <AuthModeShell
      backAriaLabel="Back to role selection"
      backTo="/signup"
      formId="signup-form"
      googleLabel="Sign up with Google"
      modeLabel="Signup"
      onGoogleAction={handleGoogleSignup}
      roleKey={roleKey}
      roleLabel={roleConfig.label}
      submitLabel="Sign Up"
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
      <form id="signup-form" onSubmit={handleSubmit} className="space-y-5">
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

        <AuthFormField
          label="Confirm Password*"
          name="confirmPassword"
          type="password"
          placeholder="Min. 8 Character"
          value={formValues.confirmPassword}
          onChange={handleChange}
        />

        <label className="flex items-start gap-3 pt-1 text-[0.72rem] uppercase tracking-[0.08em] text-[#18399F]">
          <input
            required
            name="acceptedTerms"
            type="checkbox"
            checked={formValues.acceptedTerms}
            onChange={handleChange}
            className="mt-0.5 size-4 rounded-[0.22rem] border border-[#18399F] accent-[#18399F]"
          />
          <span>I agree to the terms and conditions</span>
        </label>

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
  );
}
