import AppToaster from '../components/common/AppToaster.jsx'
import { AppShellProvider } from './AppShellContext.jsx'
import { AuthProvider } from './AuthContext.jsx'
import { PropertyStoreProvider } from './PropertyStoreContext.jsx'

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <PropertyStoreProvider>
        <AppShellProvider>
          {children}
          <AppToaster />
        </AppShellProvider>
      </PropertyStoreProvider>
    </AuthProvider>
  )
}
