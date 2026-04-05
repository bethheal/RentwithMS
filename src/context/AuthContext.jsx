import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'rms-auth-user'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') {
      return null
    }

    const storedUser = window.localStorage.getItem(STORAGE_KEY)
    return storedUser ? JSON.parse(storedUser) : null
  })
  const isHydrated = true

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      return
    }

    window.localStorage.removeItem(STORAGE_KEY)
  }, [isHydrated, user])

  const login = ({ email }) => {
    const nextUser = {
      id: 'usr_demo_01',
      name: email.split('@')[0].replace(/[._-]/g, ' '),
      email,
      role: 'Landlord',
    }

    setUser(nextUser)
    return nextUser
  }

  const register = ({ fullName, email, role }) => {
    const nextUser = {
      id: 'usr_demo_02',
      name: fullName,
      email,
      role,
    }

    setUser(nextUser)
    return nextUser
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isHydrated,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
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
