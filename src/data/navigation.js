export const marketingNavigation = {
  left: [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
  ],
  right: [
    { label: 'Blog', href: '#blog' },
    { label: 'Contact', href: '#contact' },
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
