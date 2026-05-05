import { createContext, useContext, useEffect, useState } from 'react'
import {
  showInfoToast,
  showSuccessToast,
} from '../utils/toast.js'

const STORAGE_KEY = 'MS-auth-session'
const LEGACY_STORAGE_KEY = 'MS-auth-user'
const DEFAULT_API_BASE_URL = 'http://localhost:5000'
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(
  /\/$/,
  ''
)
const AuthContext = createContext(null)

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

  const payload = await response.json().catch(() => null)

  if (!response.ok || !payload?.success) {
    const error = new Error(payload?.message ?? 'Authentication request failed.')
    error.details = payload?.errors ?? []
    throw error
  }

  return payload.data
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
    const authData = await requestAuth('/auth/login', {
      method: 'POST',
      body: {
        email,
        password,
      },
    })

    showSuccessToast('Logged in successfully.')
    return setAuthenticatedSession(authData)
  }

  const register = async ({ name, email, password, confirmPassword, role }) => {
    const authData = await requestAuth('/auth/signup', {
      method: 'POST',
      body: {
        name,
        email,
        password,
        confirmPassword,
        role,
      },
    })

    showSuccessToast('Account created successfully.')
    return setAuthenticatedSession(authData)
  }

  const loginWithGoogle = async ({ idToken, role }) => {
    const authData = await requestAuth('/auth/google', {
      method: 'POST',
      body: {
        idToken,
        role,
      },
    })

    showSuccessToast('Google sign-in completed successfully.')
    return setAuthenticatedSession(authData)
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

    const currentUser = await requestAuth('/auth/me', {
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
        loginWithGoogle,
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
