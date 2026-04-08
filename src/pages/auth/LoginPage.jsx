import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PrimaryButton from "../../components/common/PrimaryButton.jsx";
import TextInput from "../../components/common/TextInput.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const initialState = {
  email: "demo@MS.app",
  password: "password123",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formValues, setFormValues] = useState(initialState);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    login(formValues);
    navigate("/dashboard");
  };

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col justify-center">
      <div className="space-y-4">
        <span className="inline-flex items-center rounded-full border border-brand-900/15 bg-white px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-brand-700">
          Login
        </span>
        <h2 className="font-display text-4xl font-bold tracking-[-0.05em] text-slate-900">
          Sign in to continue.
        </h2>
        <p className="text-sm leading-7 text-slate-600 sm:text-base">
          This form uses controlled inputs today. If validation or field count
          grows, moving it to `react-hook-form` would be a strong next step.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <TextInput
          label="Email address"
          name="email"
          type="email"
          value={formValues.email}
          onChange={handleChange}
          helperText="Use any email to enter the mocked dashboard."
        />
        <TextInput
          label="Password"
          name="password"
          type="password"
          value={formValues.password}
          onChange={handleChange}
        />
        <PrimaryButton type="submit" variant="brand" className="w-full">
          Sign In
        </PrimaryButton>
      </form>

      <p className="mt-6 text-sm text-slate-500">
        Need an account?{" "}
        <Link to="/signup" className="font-semibold text-brand-700">
          Create one
        </Link>
      </p>
    </div>
  );
}
