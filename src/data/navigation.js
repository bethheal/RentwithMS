export const marketingNavigation = {
  left: [
    { label: 'Home', to: '/#home' },
    { label: 'About', to: '/#about' },
    { label: 'Features', to: '/#features' },
    { label: 'Pricing', to: '/#pricing' },
  ],
  right: [
    { label: 'Blog', to: '/blog' },
    { label: 'Contact', to: '/#contact' },
  ],
}

export const dashboardNavSections = [
  {
    title: 'Workspace',
    items: [
      { label: 'Overview', to: '/dashboard', icon: 'layout' },
      { label: 'Listings', to: '/dashboard', icon: 'building' },
      { label: 'Payments', to: '/dashboard', icon: 'wallet' },
      { label: 'Alerts', to: '/dashboard', icon: 'bell' },
      { label: 'Settings', to: '/dashboard', icon: 'settings' },
    ],
  },
]
