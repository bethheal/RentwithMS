import AboutMissionSection from '../../components/sections/AboutMissionSection.jsx'
import BlogSection from '../../components/sections/BlogSection.jsx'
import FaqSection from '../../components/sections/FaqSection.jsx'
import FeaturesSection from '../../components/sections/FeaturesSection.jsx'
import FooterSection from '../../components/sections/FooterSection.jsx'
import HeroSection from '../../components/sections/HeroSection.jsx'

const landingPageContent = {
  hero: {
    eyebrow: 'Hero Section',
    titleLines: [
      ['SIMPLIFYING', 'RENTING', 'For'],
      ['Landlords', '&', 'Tenants'],
    ],
    description:
      'A seamless way to rent, list, and pay, all in one place.',
    primaryAction: {
      label: 'Find A Room',
      href: '#features',
    },
    secondaryAction: {
      label: 'Get Started',
      to: '/signup',
    },
    highlights: [
      'Smart listing tools',
      'Fast rental payments',
      'Shared property workflows',
    ],
  },
  mission: {
    tabs: [
      {
        id: 'mission',
        label: 'Our Mission',
        title: 'Mission: What we do and why.',
        description:
          'We simplify everyday rental experiences so landlords and tenants can handle listings, payments, and communication without friction.',
        points: [
          'Unified flows for listing, discovery, and onboarding',
          'Clear information hierarchy across mobile and desktop',
          'Design-ready sections built to connect with real backend APIs later',
        ],
      },
      {
        id: 'vision',
        label: 'Our Vision',
        title: 'Vision: Where we are going.',
        description:
          'We are shaping a calm, modern rental workspace where every action feels straightforward, from first search to final payment.',
        points: [
          'Reusable UI patterns that support long-term growth',
          'Smooth transitions and polished micro-interactions',
          'Scalable architecture that fits both marketing pages and app dashboards',
        ],
      },
      {
        id: 'audience',
        label: 'Target Audience',
        title: 'Built for landlords, tenants, and fast-moving property teams.',
        description:
          'The structure supports multi-role experiences, making it easy to tailor future journeys for admins, renters, and property managers.',
        points: [
          'Tenant-first discovery experiences',
          'Landlord-focused operational shortcuts',
          'Dashboard-ready modules for internal teams and admin users',
        ],
      },
    ],
    cta: {
      label: 'Learn More',
      href: '#features',
    },
  },
  features: {
    eyebrow: 'Features',
    title: 'All Features. One Platform.',
    description:
      'Each feature block is configurable and designed so the page stays maintainable as the product grows.',
    categories: [
      {
        id: 'listing',
        label: 'Listing',
        title: 'Listing',
        description:
          'Create standout property listings with clean details, photo-ready layouts, and guided steps for faster publishing.',
        bullets: [
          'Modular listing cards with reusable media blocks',
          'Configurable property facts, tags, and status chips',
          'Responsive experiences for browse and management screens',
        ],
        illustration: 'listing',
        imageAlign: 'left',
      },
      {
        id: 'accounting',
        label: 'Accounting',
        title: 'Accounting',
        description:
          'Track rent activity and organize property finances with a dashboard-friendly structure built for future integration.',
        bullets: [
          'Transaction summaries shaped for clean UI rendering',
          'Ready for invoices, fee breakdowns, and export actions',
          'Reusable stat cards for dashboard and reporting views',
        ],
        illustration: 'accounting',
        imageAlign: 'right',
      },
      {
        id: 'payments',
        label: 'Payments',
        title: 'Payments',
        description:
          'Keep payment flows simple and trustworthy with clear calls to action, status feedback, and role-based messaging.',
        bullets: [
          'Clear payment states and action-focused layouts',
          'Mobile-friendly form patterns for billing steps',
          'Shared CTA components that remain configurable',
        ],
        illustration: 'payments',
        imageAlign: 'left',
      },
      {
        id: 'maintenance',
        label: 'Maintenance',
        title: 'Maintenance',
        description:
          'Organize repair requests, task status, and property updates inside a UI system that is ready for operational workflows.',
        bullets: [
          'Structured cards for issue details and assignments',
          'Status-driven interactions with scalable variants',
          'Future-friendly dashboard modules for service tracking',
        ],
        illustration: 'maintenance',
        imageAlign: 'right',
      },
    ],
    actions: [
      { label: 'Login As Tenant', to: '/login', variant: 'ghost' },
      { label: 'Login As Landlord', to: '/login', variant: 'light' },
    ],
  },
  blog: {
    eyebrow: 'Blog',
    title: "What's New?",
    description:
      'A simple editorial section that can later connect to CMS or API content without refactoring your page layout.',
    posts: [
      {
        id: 'post-01',
        title: 'Housing in Accra has never made easy',
        date: '13 January 2026',
        readingTime: '4 mins read',
        summary:
          'Discover how a structured rental experience can reduce back-and-forth and make listings easier to trust.',
        category: 'Tenant Guide',
      },
      {
        id: 'post-02',
        title: 'Designing a better owner dashboard from day one',
        date: '18 February 2026',
        readingTime: '6 mins read',
        summary:
          'Learn how reusable UI blocks make it easier to ship reporting, alerts, and payment insights later.',
        category: 'Product',
      },
      {
        id: 'post-03',
        title: 'How structured content speeds up frontend delivery',
        date: '09 March 2026',
        readingTime: '5 mins read',
        summary:
          'Organize page content clearly now so future integrations become a small swap instead of a redesign.',
        category: 'Engineering',
      },
    ],
  },
  faq: {
    eyebrow: 'Frequently Asked Questions',
    title: "FAQ's",
    description:
      'A reusable accordion component with accessible controls, clean defaults, and room for richer content later.',
    items: [
      {
        id: 'faq-01',
        question: 'How can landlords manage listings from one place?',
        answer:
          'The UI groups property data, CTA actions, and status details into reusable sections so the listing flow stays consistent across pages.',
      },
      {
        id: 'faq-02',
        question: 'Will this structure support backend integration later?',
        answer:
          'Yes. The content shape is clean and consistent, so connecting live data later will be straightforward.',
      },
      {
        id: 'faq-03',
        question: 'Is the layout responsive for tablets and mobile?',
        answer:
          'Yes. The page uses responsive grids, flexible spacing, collapsible navigation, and mobile-first interaction patterns.',
      },
      {
        id: 'faq-04',
        question: 'Why use reusable components instead of one large page?',
        answer:
          'Smaller components are easier to maintain, test, redesign, and share between landing pages, auth flows, and dashboards.',
      },
    ],
  },
  footer: {
    brandName: 'RMS',
    tagline:
      'Scalable frontend architecture for modern rental experiences.',
    linkGroups: [
      {
        title: 'Useful Links',
        links: ['Home', 'About', 'Features', 'Pricing'],
      },
      {
        title: 'Careers',
        links: ['Blog', 'Help Center', 'Privacy Policy', 'Terms'],
      },
    ],
    socialLinks: ['linkedin', 'instagram', 'facebook'],
    newsletterPlaceholder: 'Join our community to receive updates',
    legalLinks: ['Privacy Policy', 'Terms & Conditions', 'Cookie Policy'],
  },
}

export default function HomePage() {
  const { blog, faq, features, footer, hero, mission } = landingPageContent

  return (
    <>
      <HeroSection hero={hero} />
      <AboutMissionSection mission={mission} />
      <FeaturesSection features={features} />
      <BlogSection blog={blog} />
      <FaqSection faq={faq} />
      <FooterSection footer={footer} />
    </>
  )
}
