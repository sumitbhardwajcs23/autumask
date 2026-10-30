export type IndustryType = 
  | 'ecommerce' 
  | 'real_estate' 
  | 'healthcare' 
  | 'education' 
  | 'services' 
  | 'saas';

export interface IndustryConfig {
  id: IndustryType;
  name: string;
  shortLabel: string;
  icon: string;
  themeColor: string;
  tagline: string;
  customerTerm: string;
  primaryAction: string;
  heroHeadline: string;
  heroSubheadline: string;
  botRole: string;
  botDescription: string;
  demoAccount: {
    workspaceName: string;
    userName: string;
    email: string;
    roleLabel: string;
    desc: string;
  };
  metrics: {
    stat1: { title: string; value: number | string; trend: string; icon: string; bg: string };
    stat2: { title: string; value: number | string; trend: string; icon: string; bg: string };
    stat3: { title: string; value: number | string; trend: string; icon: string; bg: string };
    stat4: { title: string; value: number | string; trend: string; icon: string; bg: string };
  };
  funnelTitle: string;
  funnelSubtitle: string;
  funnelStages: Array<{ stage: string; count: number; color: string }>;
  leadSources: Array<{ source: string; count: number; percent: number; color: string }>;
  features: Array<{ title: string; desc: string; badge: string }>;
  quickPrompts: string[];
}

export const INDUSTRIES: Record<IndustryType, IndustryConfig> = {
  ecommerce: {
    id: 'ecommerce',
    name: 'D2C & E-Commerce',
    shortLabel: 'D2C & Retail',
    icon: '🛍️',
    themeColor: 'from-pink-500 to-rose-600',
    tagline: 'Recover abandoned carts, verify COD & track orders on WhatsApp',
    customerTerm: 'Shoppers',
    primaryAction: 'Send Cart Recovery Discount',
    heroHeadline: 'Skyrocket Shopify & WooCommerce Sales with WhatsApp D2C Engine',
    heroSubheadline: 'Automated 1-click cart recovery, COD confirmation bots, instant order status, and personalized WhatsApp catalogs.',
    botRole: 'AI Shopping Concierge & COD Bot',
    botDescription: 'Answers product questions, size queries, tracks shipping, and issues discount coupon codes on WhatsApp.',
    demoAccount: {
      workspaceName: 'GlowAura Beauty D2C',
      userName: 'Neha Gupta',
      email: 'neha@glowaura.in',
      roleLabel: 'E-Commerce Growth Head',
      desc: 'Shopify integrated, 142 abandoned carts recovered this month',
    },
    metrics: {
      stat1: { title: 'Cart Abandoned Recovered', value: 142, trend: '↑ 24%', icon: 'ShoppingCart', bg: 'bg-emerald-500' },
      stat2: { title: 'Orders via WhatsApp', value: 289, trend: '↑ 19%', icon: 'PackageCheck', bg: 'bg-sky-500' },
      stat3: { title: 'COD Verified & Dispatched', value: 194, trend: '↑ 31%', icon: 'CheckCircle2', bg: 'bg-violet-600' },
      stat4: { title: 'WhatsApp Revenue', value: '₹5,42,800', trend: '↑ 28%', icon: 'TrendingUp', bg: 'bg-amber-500' },
    },
    funnelTitle: 'Cart to Delivered Order Pipeline',
    funnelSubtitle: 'Automated WhatsApp conversion & COD verification drop-off analysis',
    funnelStages: [
      { stage: 'Product Inquiries', count: 480, color: '#10b981' },
      { stage: 'Cart Abandoned', count: 320, color: '#38bdf8' },
      { stage: 'Recovery Link Sent', count: 285, color: '#3b82f6' },
      { stage: 'Checkout Re-opened', count: 192, color: '#818cf8' },
      { stage: 'COD Verified', count: 142, color: '#f472b6' },
      { stage: 'Delivered Orders', count: 128, color: '#fb923c' },
    ],
    leadSources: [
      { source: 'Shopify Store Widget', count: 210, percent: 44, color: '#10b981' },
      { source: 'Instagram Click-to-WhatsApp', count: 145, percent: 30, color: '#38bdf8' },
      { source: 'Facebook Ad Campaigns', count: 80, percent: 17, color: '#818cf8' },
      { source: 'Repeat VIP Customers', count: 45, percent: 9, color: '#fb923c' },
    ],
    features: [
      { title: 'Automated Abandoned Cart Ping', desc: 'Sends cart reminders with dynamic product images and 10% instant checkout coupons within 15 minutes.', badge: 'Revenue Booster' },
      { title: 'COD Verification Bot', desc: 'Reduces RTO (Return to Origin) by 42% via interactive One-Tap WhatsApp confirmation buttons.', badge: 'RTO Saver' },
      { title: 'Automated Courier Tracking', desc: 'Live Shiprocket / Delhivery tracking links delivered proactively to customer WhatsApp numbers.', badge: 'Self-Serve' },
    ],
    quickPrompts: [
      'Show me size chart for Serum X',
      'Where is my order #GA-8921?',
      'I want to confirm my Cash on Delivery order',
      'Do you have any active discount codes?'
    ],
  },

  real_estate: {
    id: 'real_estate',
    name: 'Real Estate & Builders',
    shortLabel: 'Real Estate',
    icon: '🏢',
    themeColor: 'from-amber-500 to-orange-600',
    tagline: 'Qualify property buyers, send PDF brochures & book VIP site visits',
    customerTerm: 'Property Buyers',
    primaryAction: 'Schedule Site Visit',
    heroHeadline: 'Turn WhatsApp Inquiries into High-Ticket Property Closures',
    heroSubheadline: 'Automatic budget & location qualification, instant high-res floor plan sharing, and seamless builder site visit appointments.',
    botRole: 'AI Real Estate Property Specialist',
    botDescription: 'Understands budget, 2BHK/3BHK preferences, provides floor plans, and schedules weekend builder site visits.',
    demoAccount: {
      workspaceName: 'UrbanNest Luxury Realty',
      userName: 'Vikram Oberoi',
      email: 'vikram@urbannest.com',
      roleLabel: 'Managing Director & Broker',
      desc: 'Supercharges site visits for premium high-rise villas and apartments',
    },
    metrics: {
      stat1: { title: 'New Property Enquiries', value: 312, trend: '↑ 18%', icon: 'Building2', bg: 'bg-emerald-500' },
      stat2: { title: 'Budget Qualified Buyers', value: 164, trend: '↑ 22%', icon: 'ShieldCheck', bg: 'bg-sky-500' },
      stat3: { title: 'Site Visits Scheduled', value: 58, trend: '↑ 35%', icon: 'Calendar', bg: 'bg-violet-600' },
      stat4: { title: 'Units Booked / Closed', value: 14, trend: '↑ 40%', icon: 'Award', bg: 'bg-amber-500' },
    },
    funnelTitle: 'Inquiry to Site Visit & Booking Funnel',
    funnelSubtitle: 'End-to-end luxury & residential property buyer journey',
    funnelStages: [
      { stage: 'Portal & Ad Leads', count: 312, color: '#10b981' },
      { stage: 'Budget Qualified', count: 215, color: '#38bdf8' },
      { stage: 'Brochure / Plans Shared', count: 164, color: '#3b82f6' },
      { stage: 'Site Visit Scheduled', count: 86, color: '#818cf8' },
      { stage: 'Site Visit Completed', count: 58, color: '#f472b6' },
      { stage: 'Token Unit Booked', count: 14, color: '#fb923c' },
    ],
    leadSources: [
      { source: '99acres & MagicBricks Sync', count: 135, percent: 43, color: '#10b981' },
      { source: 'Google Search Ads', count: 98, percent: 31, color: '#38bdf8' },
      { source: 'Site Signboard QR Scan', count: 52, percent: 17, color: '#818cf8' },
      { source: 'Direct Channel Partners', count: 27, percent: 9, color: '#fb923c' },
    ],
    features: [
      { title: 'Interactive Floor Plan Delivery', desc: 'Instantly dispatches PDF master plans, price sheets, and RERA certificates based on customer budget.', badge: 'Instant Docs' },
      { title: 'Site Visit Calendar Sync', desc: 'Interactive WhatsApp slot picker with GPS location pin and driver contact details sent automatically.', badge: 'VIP Experience' },
      { title: 'Channel Partner Broadcasts', desc: 'Bulk alert 500+ registered brokers with commission updates and new inventory releases.', badge: 'Broker Network' },
    ],
    quickPrompts: [
      'Send brochure and floor plan for 3 BHK',
      'What is the price breakdown for Tower B?',
      'Can I schedule a site visit this Sunday at 11 AM?',
      'Is this property RERA approved?'
    ],
  },

  healthcare: {
    id: 'healthcare',
    name: 'Healthcare & Clinics',
    shortLabel: 'Healthcare',
    icon: '🏥',
    themeColor: 'from-teal-500 to-emerald-600',
    tagline: 'Book doctor appointments, share lab reports & reduce clinic no-shows',
    customerTerm: 'Patients',
    primaryAction: 'Book Doctor Consultation',
    heroHeadline: 'Transform Patient Engagement & OPD Appointments via WhatsApp',
    heroSubheadline: 'Automated doctor consultation booking, instant PDF diagnostic report delivery, and interactive medication reminders.',
    botRole: 'AI Clinic Receptionist & Health Desk',
    botDescription: 'Handles doctor schedules, OPD timings, symptom triage questions, and delivers digital diagnostic reports securely.',
    demoAccount: {
      workspaceName: 'ApexCare Multi-Speciality Clinic',
      userName: 'Dr. Ananya Roy',
      email: 'ananya@apexcare.health',
      roleLabel: 'Chief Medical Director',
      desc: '195 OPD consultations & 138 lab reports dispatched monthly',
    },
    metrics: {
      stat1: { title: 'Patient Inquiries', value: 420, trend: '↑ 14%', icon: 'MessageSquare', bg: 'bg-emerald-500' },
      stat2: { title: 'Consultations Booked', value: 195, trend: '↑ 26%', icon: 'Calendar', bg: 'bg-sky-500' },
      stat3: { title: 'Lab Reports Dispatched', value: 138, trend: '↑ 18%', icon: 'FileText', bg: 'bg-violet-600' },
      stat4: { title: 'Completed Visits', value: 86, trend: '↑ 15%', icon: 'Activity', bg: 'bg-amber-500' },
    },
    funnelTitle: 'Patient Consultation & Care Journey',
    funnelSubtitle: 'Streamlined OPD appointments and post-visit medical care',
    funnelStages: [
      { stage: 'Symptom / OPD Inquiries', count: 420, color: '#10b981' },
      { stage: 'Doctor Selected', count: 310, color: '#38bdf8' },
      { stage: 'Appointment Slot Reserved', count: 240, color: '#3b82f6' },
      { stage: 'Token Issued & Confirmed', count: 195, color: '#818cf8' },
      { stage: 'Consultation Completed', count: 168, color: '#f472b6' },
      { stage: 'Lab Reports & Followup', count: 138, color: '#fb923c' },
    ],
    leadSources: [
      { source: 'Clinic Website & Practo', count: 185, percent: 44, color: '#10b981' },
      { source: 'Google Maps / Local Search', count: 130, percent: 31, color: '#38bdf8' },
      { source: 'Hospital Reception QR', count: 65, percent: 15, color: '#818cf8' },
      { source: 'Doctor Referral Network', count: 40, percent: 10, color: '#fb923c' },
    ],
    features: [
      { title: 'Interactive Doctor Slot Picker', desc: 'Patients choose morning or evening OPD slots directly in WhatsApp without waiting on phone calls.', badge: 'Zero Hold Time' },
      { title: 'Secure Lab Report Dispatch', desc: 'Securely matches phone numbers to deliver Blood Test / X-Ray PDF reports instantly when ready.', badge: 'HIPAA Safe' },
      { title: 'Pre-Visit Reminders & Fast-Track', desc: 'Reduces clinic no-shows by 60% with 2-hour automated WhatsApp reminder alerts.', badge: 'No-Show Drop' },
    ],
    quickPrompts: [
      'Book appointment with Dr. Sharma (Cardiology)',
      'What are your OPD timings today?',
      'Can I download my blood test report?',
      'How to prepare for Fasting Blood Sugar test?'
    ],
  },

  education: {
    id: 'education',
    name: 'Education & Institutes',
    shortLabel: 'Education',
    icon: '🎓',
    themeColor: 'from-emerald-500 to-teal-600',
    tagline: 'Student admission counseling, syllabus RAG bot & demo class bookings',
    customerTerm: 'Students & Parents',
    primaryAction: 'Book Demo Class',
    heroHeadline: 'Convert Student WhatsApp Queries into Confirmed Batch Admissions',
    heroSubheadline: 'Grounded RAG admissions counselor, instant course syllabus delivery, automated demo lectures, and fee installment reminders.',
    botRole: 'AI Admissions Counselor (Kota EdTech)',
    botDescription: 'Trained on institute prospectus, JEE/NEET/Board fees, faculty profiles, and scholarship entrance tests.',
    demoAccount: {
      workspaceName: 'Prakash Institute Kota',
      userName: 'Dr. Prakash Sharma',
      email: 'dr.prakash@prakashinstitute.edu.in',
      roleLabel: 'Founder & Director',
      desc: 'Leading JEE/NEET coaching institute with 2,400+ students',
    },
    metrics: {
      stat1: { title: 'New Student Enquiries', value: 248, trend: '↑ 12%', icon: 'MessageSquare', bg: 'bg-emerald-500' },
      stat2: { title: 'Qualified Student Leads', value: 186, trend: '↑ 18%', icon: 'Users', bg: 'bg-sky-500' },
      stat3: { title: 'Demo Classes Booked', value: 74, trend: '↑ 22%', icon: 'Calendar', bg: 'bg-violet-600' },
      stat4: { title: 'Admissions Confirmed', value: 28, trend: '↑ 27%', icon: 'GraduationCap', bg: 'bg-amber-500' },
    },
    funnelTitle: 'Student Admissions Conversion Funnel',
    funnelSubtitle: 'End-to-end coaching counseling and enrollment pipeline',
    funnelStages: [
      { stage: 'New Enquiries', count: 248, color: '#10b981' },
      { stage: 'Qualified Leads', count: 186, color: '#38bdf8' },
      { stage: 'Counseling Interested', count: 112, color: '#3b82f6' },
      { stage: 'Demo Class Booked', count: 74, color: '#818cf8' },
      { stage: 'Demo Attended', count: 52, color: '#f472b6' },
      { stage: 'Confirmed Admissions', count: 28, color: '#fb923c' },
    ],
    leadSources: [
      { source: 'Institute Website Widget', count: 104, percent: 42, color: '#10b981' },
      { source: 'Instagram Ads (JEE/NEET)', count: 68, percent: 27, color: '#38bdf8' },
      { source: 'Offline Study Center QR', count: 48, percent: 19, color: '#818cf8' },
      { source: 'Alumni Referrals', count: 28, percent: 12, color: '#fb923c' },
    ],
    features: [
      { title: 'Grounded RAG Syllabus Bot', desc: 'Answers questions strictly based on uploaded institute PDF syllabi, batch fees, and exam dates.', badge: 'No Hallucinations' },
      { title: 'Interactive Demo Seat Reservation', desc: 'Students book live demo lectures with calendar invites and reminder links sent on WhatsApp.', badge: 'High Conversion' },
      { title: 'Bulk Exam & Fee Broadcasts', desc: 'Broadcast test series schedules, admit card notifications, and fee installment reminders in 1 click.', badge: 'Mass Messaging' },
    ],
    quickPrompts: [
      'What are the fees for JEE 2027 Dropper Batch?',
      'Can I attend a free demo class this Saturday?',
      'Share the syllabus PDF and scholarship test details',
      'What is your past year selection ratio in NEET?'
    ],
  },

  services: {
    id: 'services',
    name: 'Professional Services',
    shortLabel: 'Legal & Consulting',
    icon: '⚖️',
    themeColor: 'from-blue-600 to-indigo-700',
    tagline: 'Legal, CA, consulting, document collection & strategy call booking',
    customerTerm: 'Clients',
    primaryAction: 'Schedule Strategy Call',
    heroHeadline: 'Automate High-Value Client Intake & Document Collection on WhatsApp',
    heroSubheadline: 'Zero back-and-forth appointment scheduling, KYC/document collection via WhatsApp chat, and retainer fee invoicing.',
    botRole: 'AI Client Intake & Document Desk',
    botDescription: 'Collects case facts, verifies corporate requirements, requests tax documents, and books initial partner consultation calls.',
    demoAccount: {
      workspaceName: 'Stratagem Global Advisory',
      userName: 'Karan Singhania',
      email: 'karan@stratagem.co',
      roleLabel: 'Senior Managing Partner',
      desc: 'Top corporate law & tax advisory firm handling 120+ client retainers',
    },
    metrics: {
      stat1: { title: 'Client Consult Inquiries', value: 175, trend: '↑ 16%', icon: 'Briefcase', bg: 'bg-emerald-500' },
      stat2: { title: 'Qualified Retainer Leads', value: 94, trend: '↑ 20%', icon: 'CheckCircle2', bg: 'bg-sky-500' },
      stat3: { title: 'Strategy Calls Booked', value: 46, trend: '↑ 25%', icon: 'PhoneCall', bg: 'bg-violet-600' },
      stat4: { title: 'Contracts Finalized', value: 22, trend: '↑ 19%', icon: 'Award', bg: 'bg-amber-500' },
    },
    funnelTitle: 'Client Intake to Retainer Contract Funnel',
    funnelSubtitle: 'Corporate advisory, audit, and legal onboarding pipeline',
    funnelStages: [
      { stage: 'Inbound Discovery', count: 175, color: '#10b981' },
      { stage: 'Requirements Scoped', count: 125, color: '#38bdf8' },
      { stage: 'Partner Call Scheduled', count: 94, color: '#3b82f6' },
      { stage: 'Proposal / Quote Sent', count: 68, color: '#818cf8' },
      { stage: 'Documents / KYC Verified', count: 42, color: '#f472b6' },
      { stage: 'Active Retainer Signed', count: 22, color: '#fb923c' },
    ],
    leadSources: [
      { source: 'LinkedIn Inbound Network', count: 78, percent: 45, color: '#10b981' },
      { source: 'Corporate Website Form', count: 52, percent: 30, color: '#38bdf8' },
      { source: 'Client Peer Referrals', count: 32, percent: 18, color: '#818cf8' },
      { source: 'Webinars & Podcasts', count: 13, percent: 7, color: '#fb923c' },
    ],
    features: [
      { title: 'Automated KYC & File Intake', desc: 'Clients upload GST certificates, contracts, and financial PDFs directly inside WhatsApp chat.', badge: 'Zero Paperwork' },
      { title: 'Partner Calendar Sync', desc: 'Synchronizes Google Calendar and Outlook to offer 30-minute consultation slots with zero booking conflict.', badge: 'Calendar Sync' },
      { title: 'Automated Invoice Reminders', desc: 'Dispatches Razorpay / Stripe payment links for retainers with automated gentle follow-ups.', badge: 'Fast Invoicing' },
    ],
    quickPrompts: [
      'We need company incorporation assistance in India',
      'Can I schedule a 30-min strategy consultation call?',
      'What documents are needed for GST audit?',
      'Please send your retainer fee quotation'
    ],
  },

  saas: {
    id: 'saas',
    name: 'SaaS & Tech Agencies',
    shortLabel: 'SaaS & Agencies',
    icon: '🚀',
    themeColor: 'from-purple-600 to-violet-700',
    tagline: 'Product demo booking, trial user onboarding & high-ticket B2B sales',
    customerTerm: 'Accounts & Leads',
    primaryAction: 'Book Product Walkthrough',
    heroHeadline: 'Convert Website Signups into High-Paying Software Subscribers',
    heroSubheadline: '24/7 AI Sales Development Rep (SDR) on WhatsApp that qualifies company size, tech stack, and books sales demos on Zoom.',
    botRole: 'AI Technical SDR & Onboarding Bot',
    botDescription: 'Qualifies company headcount, current tech stack, answers API pricing questions, and books product demos on Google Meet.',
    demoAccount: {
      workspaceName: 'ScaleOps Growth Agency',
      userName: 'Arjun Malhotra',
      email: 'arjun@scaleops.io',
      roleLabel: 'Head of Growth & Co-Founder',
      desc: 'B2B performance agency scaling $50K MRR client pipelines',
    },
    metrics: {
      stat1: { title: 'Product Demo Requests', value: 290, trend: '↑ 25%', icon: 'Sparkles', bg: 'bg-emerald-500' },
      stat2: { title: 'MQLs Scored & Qualified', value: 182, trend: '↑ 21%', icon: 'Target', bg: 'bg-sky-500' },
      stat3: { title: 'Live Product Demos', value: 68, trend: '↑ 32%', icon: 'Video', bg: 'bg-violet-600' },
      stat4: { title: 'Closed Won MRR', value: '₹9,80,000', trend: '↑ 42%', icon: 'DollarSign', bg: 'bg-amber-500' },
    },
    funnelTitle: 'MQL to Enterprise Closed-Won Funnel',
    funnelSubtitle: 'B2B SaaS product qualification and sales velocity pipeline',
    funnelStages: [
      { stage: 'Trial / Demo Inquiries', count: 290, color: '#10b981' },
      { stage: 'Budget & Role Qualified', count: 210, color: '#38bdf8' },
      { stage: 'Zoom Walkthrough Booked', count: 145, color: '#3b82f6' },
      { stage: 'Live Demo Completed', count: 96, color: '#818cf8' },
      { stage: 'Commercial Pilot Sent', count: 54, color: '#f472b6' },
      { stage: 'Annual Contract Won', count: 34, color: '#fb923c' },
    ],
    leadSources: [
      { source: 'Product Landing Page', count: 128, percent: 44, color: '#10b981' },
      { source: 'ProductHunt & Twitter', count: 84, percent: 29, color: '#38bdf8' },
      { source: 'Cold Email WhatsApp Drip', count: 52, percent: 18, color: '#818cf8' },
      { source: 'Partner Integration Directory', count: 26, percent: 9, color: '#fb923c' },
    ],
    features: [
      { title: 'Instant B2B Lead Qualification', desc: 'Asks 3 intelligent questions to detect company ARR, team size, and urgency before booking calendar slots.', badge: 'Smart SDR' },
      { title: 'Interactive Zoom / Meet Invites', desc: 'Sends calendar invites with direct Zoom links and automated 10-minute pre-call WhatsApp reminders.', badge: 'Show-Up Rate' },
      { title: 'Feature Request & Ticket Logger', desc: 'Integrates with Linear / Jira to log customer bugs and feedback straight from customer chats.', badge: 'Product Feedback' },
    ],
    quickPrompts: [
      'Book a live 20-min product walkthrough demo',
      'What are your pricing plans for 20+ team seats?',
      'Do you support webhook and REST API integrations?',
      'Can we get a 14-day enterprise trial extension?'
    ],
  },
};

export const DEFAULT_INDUSTRY: IndustryType = 'education';

export const getIndustryConfig = (type?: string): IndustryConfig => {
  if (!type) return INDUSTRIES[DEFAULT_INDUSTRY];
  const normalized = type.toLowerCase().trim();
  if (normalized.includes('ecom') || normalized.includes('d2c') || normalized.includes('retail')) return INDUSTRIES.ecommerce;
  if (normalized.includes('real') || normalized.includes('estate') || normalized.includes('property')) return INDUSTRIES.real_estate;
  if (normalized.includes('health') || normalized.includes('clinic') || normalized.includes('hospital') || normalized.includes('doctor')) return INDUSTRIES.healthcare;
  if (normalized.includes('service') || normalized.includes('law') || normalized.includes('legal') || normalized.includes('consult')) return INDUSTRIES.services;
  if (normalized.includes('saas') || normalized.includes('tech') || normalized.includes('agency')) return INDUSTRIES.saas;
  return INDUSTRIES.education;
};

