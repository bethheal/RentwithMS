import { createContext, useContext, useEffect, useState } from 'react'
import {
  showInfoToast,
  showSuccessToast,
} from '../utils/toast.js'

const STORAGE_KEY = 'MS-auth-session'
const LEGACY_STORAGE_KEY = 'MS-auth-user'
const apiBaseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000').replace(/\/$/, '')
const AuthContext = createContext(null)
const LOGIN_FIELD_MESSAGES = new Set([
  'Please fill in all required fields',
  'Please enter your email',
  'Please enter your password',
])

function readStoredSession() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedSession = window.localStorage.getItem(STORAGE_KEY)

    if (!storedSession) {
      return null
    }

    const parsedSession = JSON.parse(storedSession)

    if (!parsedSession?.token || !parsedSession?.user) {
      return null
    }

    return parsedSession
  } catch {
    return null
  }
}

async function requestAuth(path, { body, method = 'GET', token } = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const responseText = await response.text()
  let payload = null

  if (responseText) {
    try {
      payload = JSON.parse(responseText)
    } catch {
      payload = null
    }
  }

  if (!response.ok || !payload?.success) {
    const details = payload?.errors ?? null
    const message =
      (Array.isArray(details)
        ? details.find((detail) => detail?.message)?.message
        : null) ??
      payload?.message ??
      'Something went wrong. Please try again.'
    const error = new Error(message)
    error.details = details
    error.status = response.status
    throw error
  }

  return payload.data
}

function normalizeLoginError(error) {
  const message =
    typeof error?.message === 'string' && error.message.trim()
      ? error.message.trim()
      : ''

  if (LOGIN_FIELD_MESSAGES.has(message)) {
    return error
  }

  if (error?.details?.reason === 'pending_verification') {
    return error
  }

  const normalizedError = new Error('Invalid email or password')
  normalizedError.details = []
  normalizedError.status = error?.status ?? 401
  return normalizedError
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession)
  const isHydrated = true
  const user = session?.user ?? null
  const token = session?.token ?? ''

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.removeItem(LEGACY_STORAGE_KEY)

    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      return
    }

    window.localStorage.removeItem(STORAGE_KEY)
  }, [session])

  const setAuthenticatedSession = (authData) => {
    const nextSession = {
      token: authData.token,
      user: authData.user,
    }

    setSession(nextSession)
    return nextSession.user
  }

  const login = async ({ email, password }) => {
    let authData

    try {
      authData = await requestAuth('/api/auth/login', {
        method: 'POST',
        body: {
          email,
          password,
        },
      })
    } catch (error) {
      throw normalizeLoginError(error)
    }

    showSuccessToast('Logged in successfully.')
    return setAuthenticatedSession(authData)
  }

  const register = async ({
    name,
    email,
    phoneNumber,
    password,
    confirmPassword,
    role,
    verificationMethod,
  }) => {
    const verificationData = await requestAuth('/api/auth/signup', {
      method: 'POST',
      body: {
        name,
        email,
        phoneNumber,
        password,
        confirmPassword,
        role,
        verificationMethod,
      },
    })

    showSuccessToast(
      verificationData.reusedPendingAccount
        ? "Your account is awaiting verification. We've sent you a new verification code."
        : 'Verification code sent.',
    )
    return verificationData
  }

  const verifySignup = async ({ userId, code, token: verificationToken }) => {
    const verifiedUser = await requestAuth('/api/auth/signup/verify', {
      method: 'POST',
      body: {
        userId,
        ...(verificationToken ? { token: verificationToken } : { code }),
      },
    })

    showSuccessToast('Account verified successfully. Please log in.')
    return verifiedUser
  }

  const getSignupVerification = async (userId) => {
    return requestAuth(`/api/auth/signup/status/${encodeURIComponent(userId)}`)
  }

  const resendSignupVerification = async ({ email, userId, verificationMethod }) => {
    const verificationData = await requestAuth('/api/auth/signup/resend', {
      method: 'POST',
      body: {
        email,
        userId,
        verificationMethod,
      },
    })

    showInfoToast('Verification code resent.')
    return verificationData
  }

  const deactivateAccount = async ({ password }) => {
    const updatedUser = await requestAuth('/api/auth/account/deactivate', {
      method: 'POST',
      token,
      body: {
        password,
      },
    })

    showInfoToast('Account deactivated. You can restore it by logging in within 30 days.')
    setSession(null)
    return updatedUser
  }

  const deleteAccount = async ({ password }) => {
    const updatedUser = await requestAuth('/api/auth/account/delete', {
      method: 'POST',
      token,
      body: {
        password,
      },
    })

    showSuccessToast('Account access permanently removed.')
    setSession(null)
    return updatedUser
  }

  const loginWithGoogle = async ({ idToken, role }) => {
    const authData = await requestAuth('/api/auth/google', {
      method: 'POST',
      body: {
        idToken,
        role,
      },
    })

    showSuccessToast('Google sign-in completed successfully.')
    return setAuthenticatedSession(authData)
  }

  const requestPasswordReset = async (email) => {
    const resetData = await requestAuth('/api/auth/forgot-password', {
      method: 'POST',
      body: {
        email,
      },
    })

    if (resetData?.resetUrl) {
      showInfoToast('Reset link created. Choose a new password to finish.')
      return resetData
    }

    showInfoToast('If an account exists, reset instructions are ready.')
    return resetData
  }

  const resetPassword = async ({ token, password, confirmPassword }) => {
    const responseData = await requestAuth('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token,
        password,
        confirmPassword,
      },
    })

    showSuccessToast('Password reset successfully.')
    return responseData
  }

  const logout = () => {
    if (session?.user) {
      showInfoToast('Signed out successfully.')
    }

    setSession(null)
  }

  const updateUser = (updates) => {
    setSession((currentSession) => {
      if (!currentSession?.user) {
        return currentSession
      }

      return {
        ...currentSession,
        user: {
          ...currentSession.user,
          ...updates,
        },
      }
    })
  }

  const refreshUser = async () => {
    if (!token) {
      return null
    }

    const currentUser = await requestAuth('/api/auth/me', {
      token,
    })

    setSession((currentSession) => {
      if (!currentSession) {
        return currentSession
      }

      return {
        ...currentSession,
        user: currentUser,
      }
    })

    return currentUser
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isHydrated,
        isAuthenticated: Boolean(user && token),
        login,
        register,
        verifySignup,
        getSignupVerification,
        resendSignupVerification,
        loginWithGoogle,
        deactivateAccount,
        deleteAccount,
        requestPasswordReset,
        resetPassword,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
