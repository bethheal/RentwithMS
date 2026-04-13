import AboutMissionSection from "../../components/sections/AboutMissionSection.jsx";
import aboutImage from "../../assets/aboutbg.png";
import accountingImage from "../../assets/accounting.png";
import heroImage from "../../assets/hero.png";
import listingImage from "../../assets/listing.png";
import maintenanceImage from "../../assets/maintenace.png";
import paymentImage from "../../assets/payment.png";
import faqSceneIllustration from "../../assets/illustrations/faq-scene.svg";
import featureAccountingIllustration from "../../assets/illustrations/feature-accounting.svg";
import featureMaintenanceIllustration from "../../assets/illustrations/feature-maintenance.svg";
import heroPeopleIllustration from "../../assets/illustrations/hero-people.svg";
import BlogSection from "../../components/sections/BlogSection.jsx";
import FaqSection from "../../components/sections/FaqSection.jsx";
import FeaturesSection from "../../components/sections/FeaturesSection.jsx";
import FooterSection from "../../components/sections/FooterSection.jsx";
import HeroSection from "../../components/sections/HeroSection.jsx";
import PricingSection from "../../components/sections/PricingSection.jsx";

export const landingPageContent = {
  hero: {
    eyebrow: "Hero Section",
    titleLines: [
      ["SIMPLIFYING", "RENTING", "For"],
      ["Landlords", "&", "Tenants"],
    ],
    description: "A seamless way to rent, list, and pay, all in one place.",
    primaryAction: {
      label: "Find A Room",
      href: "#features",
    },
    secondaryAction: {
      label: "Get Started",
      to: "/signup",
    },
    highlights: [
      "Smart listing tools",
      "Fast rental payments",
      "Shared property workflows",
    ],
  },
  mission: {
    tabs: [
      {
        id: "mission",
        label: "Our Mission",
        title: "Mission: What we do and why.",
        description:
          "We simplify everyday rental experiences so landlords and tenants can handle listings, payments, and communication without friction.",
        points: [
          "Unified flows for listing, discovery, and onboarding",
          "Clear information hierarchy across mobile and desktop",
          "Design-ready sections built to connect with real backend APIs later",
        ],
      },
      {
        id: "vision",
        label: "Our Vision",
        title: "Vision: Where we are going.",
        description:
          "We are shaping a calm, modern rental workspace where every action feels straightforward, from first search to final payment.",
        points: [
          "Reusable UI patterns that support long-term growth",
          "Smooth transitions and polished micro-interactions",
          "Scalable architecture that fits both marketing pages and app dashboards",
        ],
      },
      {
        id: "audience",
        label: "Target Audience",
        title: "Built for landlords, tenants, and fast-moving property teams.",
        description:
          "The structure supports multi-role experiences, making it easy to tailor future journeys for admins, renters, and property managers.",
        points: [
          "Tenant-first discovery experiences",
          "Landlord-focused operational shortcuts",
          "Dashboard-ready modules for internal teams and admin users",
        ],
      },
    ],
    cta: {
      label: "Learn More",
      href: "#features",
    },
  },
  features: {
    eyebrow: "Features",
    title: "All Features. One Platform.",

    categories: [
      {
        id: "listing",
        label: "Listing",
        title: "Listing",
        description:
          "Create standout property listings with clean details, photo-ready layouts, and guided steps for faster publishing.",
        bullets: [
          "Modular listing cards with reusable media blocks",
          "Configurable property facts, tags, and status chips",
          "Responsive experiences for browse and management screens",
        ],
        illustration: "listing",
        imageAlign: "left",
      },
      {
        id: "accounting",
        label: "Accounting",
        title: "Accounting",
        description:
          "Track rent activity and organize property finances with a dashboard-friendly structure built for future integration.",
        bullets: [
          "Transaction summaries shaped for clean UI rendering",
          "Ready for invoices, fee breakdowns, and export actions",
          "Reusable stat cards for dashboard and reporting views",
        ],
        illustration: "accounting",
        imageAlign: "right",
      },
      {
        id: "payments",
        label: "Payments",
        title: "Payments",
        description:
          "Keep payment flows simple and trustworthy with clear calls to action, status feedback, and role-based messaging.",
        bullets: [
          "Clear payment states and action-focused layouts",
          "Mobile-friendly form patterns for billing steps",
          "Shared CTA components that remain configurable",
        ],
        illustration: "payments",
        imageAlign: "left",
      },
      {
        id: "maintenance",
        label: "Maintenance",
        title: "Maintenance",
        description:
          "Organize repair requests, task status, and property updates inside a UI system that is ready for operational workflows.",
        bullets: [
          "Structured cards for issue details and assignments",
          "Status-driven interactions with scalable variants",
          "Future-friendly dashboard modules for service tracking",
        ],
        illustration: "maintenance",
        imageAlign: "right",
      },
    ],
    actions: [
      { label: "Login As Tenant", to: "/login?role=tenant", variant: "ghost" },
      { label: "Login As Landlord", to: "/login?role=landlord", variant: "light" },
    ],
  },
  pricing: {
    eyebrow: "Pricing",
    title: "The right landlord plan for every property business",
    description:
      "MS pricing is built for landlords and property managers. Tenants can browse listings, submit requests, and pay rent inside an active MS workspace without buying a separate plan.",
    landlordNote:
      "Choose the plan that fits your portfolio size, rent collection needs, and level of reporting.",
    monthlyLabel: "Monthly",
    yearlyLabel: "Yearly",
    plans: [
      {
        id: "basic",
        name: "Basic",
        badge: "Starter",
        monthlyPrice: 19,
        yearlyPrice: 190,
        pricingNote: "Billed monthly per landlord workspace",
        ctaHref: "#contact",
        description:
          "Best for first-time landlords managing a small number of active units.",
        features: [
          { label: "Up to 5 active listings", included: true },
          { label: "Rent collection reminders", included: true },
          { label: "Basic tenant messaging", included: true },
          { label: "Maintenance workflows", included: false },
          { label: "Owner performance reports", included: false },
        ],
      },
      {
        id: "standard",
        name: "Standard",
        badge: "Most Popular",
        monthlyPrice: 70,
        yearlyPrice: 700,
        pricingNote: "For growing landlords with multiple units",
        featured: true,
        ctaHref: "#contact",
        description:
          "Ideal for landlords who want rent tracking, maintenance flow, and stronger reporting in one place.",
        features: [
          { label: "Up to 25 active listings", included: true },
          { label: "Owner analytics dashboard", included: true },
          { label: "Maintenance request tracking", included: true },
          { label: "Priority landlord support", included: true },
          { label: "Team permissions", included: false },
        ],
      },
      {
        id: "premium",
        name: "Premium",
        badge: "Portfolio",
        monthlyPrice: 82,
        yearlyPrice: 820,
        pricingNote: "For portfolio landlords and property teams",
        ctaHref: "#contact",
        description:
          "Built for larger landlord teams that need deeper visibility across payments, tenants, and operations.",
        features: [
          { label: "Unlimited active listings", included: true },
          { label: "Owner analytics dashboard", included: true },
          { label: "Maintenance request tracking", included: true },
          { label: "Team permissions", included: true },
          { label: "Portfolio reporting exports", included: true },
        ],
      },
    ],
  },
  blog: {
    eyebrow: "Blog",
    title: "What's New?",
    description:
      "Explore articles, videos, talks, and radio-style updates on house rentals.",
    activeFilter: "our-blogs",
    filters: [
      {
        id: "our-blogs",
        label: "Our Blogs",
        contentType: "blog",
        actionLabel: "Continue Reading",
        posts: [
          {
            id: "post-01",
            title: "Housing in Accra has never been easier",
            date: "02 Jan 23",
            readingTime: "2 Mins Read",
            summary:
              "Discover how a structured rental experience can reduce back-and-forth and make listings easier to trust.",
            category: "Tenant Guide",
            image: listingImage,
            imageAlt:
              "Apartment building exterior representing a rental guide article.",
          },
          {
            id: "post-02",
            title: "Designing a better owner dashboard from day one",
            date: "02 Jan 23",
            readingTime: "2 Mins Read",
            summary:
              "Learn how reusable UI blocks make it easier to ship reporting, alerts, and payment insights later.",
            category: "Product",
            image: accountingImage,
            imageAlt:
              "Dashboard-inspired illustration for a landlord product article.",
          },
          {
            id: "post-03",
            title: "How structured content speeds up frontend delivery",
            date: "02 Jan 23",
            readingTime: "2 Mins Read",
            summary:
              "Organize page content clearly now so future integrations become a small swap instead of a redesign.",
            category: "Engineering",
            image: aboutImage,
            imageAlt:
              "Collaborative workspace visual for a frontend engineering article.",
          },
          {
            id: "post-04",
            title: "Rental payments made simpler for busy tenants",
            date: "02 Jan 23",
            readingTime: "2 Mins Read",
            summary:
              "Clear billing states and focused calls to action help renters complete monthly payments without confusion.",
            category: "Payments",
            image: paymentImage,
            imageAlt: "Payment-focused visual for a tenant billing article.",
          },
          {
            id: "post-05",
            title: "Maintenance updates that keep owners in control",
            date: "02 Jan 23",
            readingTime: "2 Mins Read",
            summary:
              "Track requests, status changes, and service progress in one place with a calmer operational workflow.",
            category: "Operations",
            image: maintenanceImage,
            imageAlt: "Property maintenance image for an operations article.",
          },
        ],
      },
      {
        id: "videos",
        label: "Videos",
        contentType: "video",
        actionLabel: "Watch Video",
        posts: [
          {
            id: "video-01",
            title: "Video News: A quick tour of compact rental spaces in Accra",
            date: "06 Jan 23",
            readingTime: "4 Min Watch",
            summary:
              "A short visual update showing how renters compare layout, lighting, and neighborhood access before booking viewings.",
            category: "Video News",
            image: heroImage,
            imageAlt: "Property showcase thumbnail for a rental market video.",
          },
          {
            id: "video-02",
            title:
              "Market Update: What landlords are changing in new video listings",
            date: "09 Jan 23",
            readingTime: "3 Min Watch",
            summary:
              "See the latest presentation trends landlords are using to make listings clearer and easier for tenants to trust.",
            category: "Video News",
            image: listingImage,
            imageAlt:
              "Rental listing preview used as a landlord video thumbnail.",
          },
          {
            id: "video-03",
            title:
              "Walkthrough News: How verified amenities help videos convert faster",
            date: "12 Jan 23",
            readingTime: "5 Min Watch",
            summary:
              "This update covers how clean walkthrough clips and amenity callouts help renters decide faster.",
            category: "Walkthroughs",
            image: aboutImage,
            imageAlt:
              "Home walkthrough thumbnail for a rental amenities video.",
          },
          {
            id: "video-04",
            title:
              "Explainer Clip: Breaking down the rent-payment flow on screen",
            date: "14 Jan 23",
            readingTime: "3 Min Watch",
            summary:
              "A practical video explainer highlighting the steps tenants follow when paying rent through a modern dashboard.",
            category: "Explainers",
            image: paymentImage,
            imageAlt:
              "Payments dashboard thumbnail for a rent explainer video.",
          },
        ],
      },
      {
        id: "podcasts",
        label: "Podcasts",
        contentType: "podcast",
        actionLabel: "Listen",
        posts: [
          {
            id: "podcast-01",
            title:
              "Talks & Radio: Helping first-time renters ask better questions",
            date: "16 Jan 23",
            readingTime: "18 Min Listen",
            summary:
              "A conversation on the questions tenants should ask during viewings, from utility costs to move-in expectations.",
            category: "Talks",
            image: heroPeopleIllustration,
            imageAlt:
              "People illustration representing a podcast discussion for renters.",
          },
          {
            id: "podcast-02",
            title:
              "Radio Update: Why landlords are standardizing listing details",
            date: "18 Jan 23",
            readingTime: "22 Min Listen",
            summary:
              "This audio segment covers how better listing structure reduces confusion and saves time for both sides.",
            category: "Radio",
            image: featureAccountingIllustration,
            imageAlt:
              "Illustration for a radio segment about property listing organization.",
          },
          {
            id: "podcast-03",
            title:
              "Owner Talk: Building trust with clearer maintenance follow-ups",
            date: "20 Jan 23",
            readingTime: "20 Min Listen",
            summary:
              "A focused discussion on communication habits that help landlords keep maintenance workflows transparent.",
            category: "Talks",
            image: featureMaintenanceIllustration,
            imageAlt:
              "Maintenance illustration representing a podcast for landlords.",
          },
          {
            id: "podcast-04",
            title:
              "Community Radio: What renters really notice in payment reminders",
            date: "22 Jan 23",
            readingTime: "17 Min Listen",
            summary:
              "An audio roundup of reminder patterns that feel helpful instead of stressful for busy tenants.",
            category: "Radio",
            image: faqSceneIllustration,
            imageAlt:
              "Friendly audio-show artwork for a renters community radio update.",
          },
        ],
      },
    ],
    cta: {
      label: "Explore More",
      href: "#contact",
    },
  },
  faq: {
    eyebrow: "Frequently Asked Questions",
    title: "FAQ's",
    description:
      "A reusable accordion component with accessible controls, clean defaults, and room for richer content later.",
    items: [
      {
        id: "faq-01",
        question: "How can landlords manage listings from one place?",
        answer:
          "The UI groups property data, CTA actions, and status details into reusable sections so the listing flow stays consistent across pages.",
      },
      {
        id: "faq-02",
        question: "Will this structure support backend integration later?",
        answer:
          "Yes. The content shape is clean and consistent, so connecting live data later will be straightforward.",
      },
      {
        id: "faq-03",
        question: "Is the layout responsive for tablets and mobile?",
        answer:
          "Yes. The page uses responsive grids, flexible spacing, collapsible navigation, and mobile-first interaction patterns.",
      },
      {
        id: "faq-04",
        question: "Why use reusable components instead of one large page?",
        answer:
          "Smaller components are easier to maintain, test, redesign, and share between landing pages, auth flows, and dashboards.",
      },
    ],
  },
  cta: {
    title: "Launch your landlord workspace and start collecting rent with MS.",
    description:
      "Pick a landlord plan, onboard your properties, and give tenants a simple way to view listings, receive reminders, and pay rent inside your branded workflow.",
    primaryAction: {
      label: "Start as landlord",
      to: "/signup",
    },
    secondaryAction: {
      label: "See platform features",
      href: "#features",
    },
    preview: {
      navigationLabel: "Navigation",
      teamsLabel: "Your teams",
      searchPlaceholder: "Search projects...",
      listTitle: "All projects",
      navigationItems: [
        { label: "Projects", icon: "projects" },
        { label: "Deployments", icon: "deployments", active: true },
        { label: "Activity", icon: "activity" },
        { label: "Domains", icon: "domains" },
        { label: "Usage", icon: "usage" },
        { label: "Settings", icon: "settings" },
      ],
      teams: ["Landlord Ops", "Property Owners", "Finance Desk"],
      projects: [
        {
          team: "Rent Collection",
          name: "owner-dashboard",
          status: "pending",
          meta: "Syncing landlord billing rules - Initiated 1m 32s ago",
        },
        {
          team: "Tenant Billing",
          name: "mobile-api",
          status: "active",
          meta: "Rent payment flow deployed - 3m ago - 23s",
        },
        {
          team: "Listing Studio",
          name: "landlord-listings",
          status: "pending",
          meta: "Publishing new property showcase - 5m 45s ago - 3m",
        },
        {
          team: "Payments",
          name: "rent-ledger",
          status: "active",
          highlighted: true,
          meta: "Monthly statements generated - 8m ago - 1m 30s",
        },
        {
          team: "Maintenance",
          name: "service-desk",
          status: "active",
          meta: "Request board live - Deployed 12d ago - 5m 55s",
        },
      ],
    },
  },
  footer: {
    brandName: "MS",
    subscriptionText: "Join our community to receive updates",
    linkGroups: [
      {
        title: "Useful Links",
        links: ["Home", "About", "FAQ's", "Terms of Service", "Privacy Policy"],
      },
      {
        title: "Careers",
        links: ["Blog", "Support", "Help Center"],
      },
    ],
    socialLinks: ["facebook", "instagram", "youtube"],
    newsletterPlaceholder: "Enter your email",
    legalLinks: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
  },
};

export default function HomePage() {
  const { blog, cta, faq, features, footer, hero, mission, pricing } =
    landingPageContent;

  return (
    <>
      <HeroSection hero={hero} />
      <AboutMissionSection mission={mission} />
      <FeaturesSection features={features} />
      <BlogSection blog={blog} actionPath="/blog" />
      <FaqSection faq={faq} />
      <PricingSection pricing={pricing} cta={cta} />
      <FooterSection footer={footer} />
    </>
  );
}
