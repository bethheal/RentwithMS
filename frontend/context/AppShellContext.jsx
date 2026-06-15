import { createContext, useContext, useState } from 'react'

const AppShellContext = createContext(null)

export function AppShellProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const value = {
    isSidebarOpen,
    openSidebar: () => setIsSidebarOpen(true),
    closeSidebar: () => setIsSidebarOpen(false),
    toggleSidebar: () => setIsSidebarOpen((current) => !current),
  }

  return (
    <AppShellContext.Provider value={value}>
      {children}
    </AppShellContext.Provider>
  )
}

export function useAppShell() {
  const context = useContext(AppShellContext)

  if (!context) {
    throw new Error('useAppShell must be used within AppShellProvider')
  }

  return context
}
