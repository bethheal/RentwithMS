import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthFormField from '../../components/auth/AuthFormField.jsx'
import AuthModeShell from '../../components/auth/AuthModeShell.jsx'
import AuthRoleSelectionStep from '../../components/auth/AuthRoleSelectionStep.jsx'
import TermsAndConditionsModal from '../../components/auth/TermsAndConditionsModal.jsx'
import {
  authRoleContent,
  normalizeAuthRole,
} from '../../components/auth/authRoleConfig.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { requestGoogleIdToken } from '../../utils/googleAuth.js'
import { showErrorToast } from '../../utils/toast.js'

const initialState = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
}
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

export default function SignupPage() {
  const [searchParams] = useSearchParams()
  const roleKey = normalizeAuthRole(searchParams.get('role'))

  if (!roleKey) {
    return <AuthRoleSelectionStep mode="signup" />
  }

  return <SignupRoleForm key={roleKey} roleKey={roleKey} />
}

function SignupRoleForm({ roleKey }) {
  const navigate = useNavigate()
  const { loginWithGoogle, register } = useAuth()
  const roleConfig = authRoleContent[roleKey]
  const [formValues, setFormValues] = useState(initialState)
  const [formError, setFormError] = useState('')
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target

    if (name === "acceptedTerms" && checked) {
      setFormError('')
    }

    setFormValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }))

    if (formError && name !== 'acceptedTerms') {
      setFormError('')
    }
  }

  const handleGoogleSignup = async () => {
    if (!formValues.acceptedTerms) {
      setFormError('Please agree to the terms and conditions to continue.')
      showErrorToast('Please agree to the terms and conditions to continue.')
      return
    }

    try {
      setIsGoogleLoading(true)
      setFormError('')

      const idToken = await requestGoogleIdToken(googleClientId)
      await loginWithGoogle({
        idToken,
        role: roleKey,
      })

      navigate('/dashboard')
    } catch (error) {
      const nextMessage = error.message || 'Google signup could not be completed.'
      setFormError(nextMessage)
      showErrorToast(error, 'Google signup could not be completed.')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (formValues.password !== formValues.confirmPassword) {
      setFormError('Passwords do not match yet.')
      showErrorToast('Passwords do not match yet.')
      return
    }

    if (!formValues.acceptedTerms) {
      setFormError('Please agree to the terms and conditions to continue.')
      showErrorToast('Please agree to the terms and conditions to continue.')
      return
    }

    try {
      setIsSubmitting(true)
      setFormError('')

      await register({
        name: formValues.fullName,
        email: formValues.email,
        password: formValues.password,
        confirmPassword: formValues.confirmPassword,
        role: roleKey,
      })

      navigate('/dashboard')
    } catch (error) {
      const nextMessage = error.message || 'Signup failed.'
      setFormError(nextMessage)
      showErrorToast(error, 'Signup failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAgreeToTerms = () => {
    setFormValues((current) => ({
      ...current,
      acceptedTerms: true,
    }))
    setFormError('')
    setIsTermsModalOpen(false)
  }

  const handleDisagreeToTerms = () => {
    setFormValues((current) => ({
      ...current,
      acceptedTerms: false,
    }))
    setIsTermsModalOpen(false)
  }

  return (
    <>
      <AuthModeShell
        backAriaLabel="Back to role selection"
        backTo="/signup"
        formId="signup-form"
        googleDisabled={isSubmitting || isGoogleLoading}
        googleLabel="Sign up with Google"
        isGoogleLoading={isGoogleLoading}
        modeLabel="Signup"
        onGoogleAction={handleGoogleSignup}
        roleKey={roleKey}
        roleLabel={roleConfig.label}
        submitDisabled={isSubmitting || isGoogleLoading}
        submitLabel={isSubmitting ? 'Signing Up...' : 'Sign Up'}
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
  )
}
