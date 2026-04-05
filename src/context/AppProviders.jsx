import { AppShellProvider } from './AppShellContext.jsx'
import { AuthProvider } from './AuthContext.jsx'

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <AppShellProvider>{children}</AppShellProvider>
    </AuthProvider>
  )
}
