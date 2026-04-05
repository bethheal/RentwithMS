import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import TextInput from '../../components/common/TextInput.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const initialState = {
  fullName: '',
  email: '',
  role: 'Landlord',
}

export default function SignupPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formValues, setFormValues] = useState(initialState)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    register({
      ...formValues,
      fullName: formValues.fullName || 'New User',
      email: formValues.email || 'newuser@rms.app',
    })

    navigate('/dashboard')
  }

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col justify-center">
      <div className="space-y-4">
        <span className="inline-flex items-center rounded-full border border-brand-900/15 bg-white px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-brand-700">
          Signup
        </span>
        <h2 className="font-display text-4xl font-bold tracking-[-0.05em] text-slate-900">
          Create your workspace.
        </h2>
        <p className="text-sm leading-7 text-slate-600 sm:text-base">
          The signup flow is prepared for future role-specific onboarding once
          backend auth and profile APIs are introduced.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <TextInput
          label="Full name"
          name="fullName"
          value={formValues.fullName}
          onChange={handleChange}
          placeholder="Ada Mensah"
        />
        <TextInput
          label="Email address"
          name="email"
          type="email"
          value={formValues.email}
          onChange={handleChange}
          placeholder="you@example.com"
        />
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">Account role</span>
          <select
            name="role"
            value={formValues.role}
            onChange={handleChange}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
          >
            <option>Landlord</option>
            <option>Tenant</option>
            <option>Property Manager</option>
          </select>
        </label>
        <PrimaryButton type="submit" variant="brand" className="w-full">
          Create Account
        </PrimaryButton>
      </form>

      <p className="mt-6 text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-700">
          Sign in
        </Link>
      </p>
    </div>
  )
}
