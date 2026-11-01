import React, { useState } from 'react';
import { 
  Bot, 
  Shield, 
  Zap, 
  MessageSquare, 
  Users, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ChevronDown, 
  ChevronRight, 
  Send, 
  Check, 
  BarChart3, 
  Clock, 
  Play, 
  Star, 
  GraduationCap, 
  Target, 
  Trophy, 
  BookOpen, 
  Building, 
  PhoneCall, 
  X, 
  FileText, 
  SlidersHorizontal, 
  Phone, 
  Laptop, 
  Languages, 
  Award, 
  CheckCircle,
  HelpCircle,
  ExternalLink,
  MessageCircle,
  Percent,
  Search,
  Filter,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  TrendingUp,
  UserCheck,
  ShoppingBag,
  Stethoscope,
  Briefcase,
  Home,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { UserRole } from '../../types';

interface LandingPageProps {
  onNavigateToUserLogin: () => void;
  onNavigateToAdminLogin: () => void;
  onLaunchDemo: (role?: UserRole) => void;
  isAuthenticated?: boolean;
  onNavigateToApp?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToUserLogin,
  onNavigateToAdminLogin,
  onLaunchDemo,
  isAuthenticated = false,
  onNavigateToApp,
}) => {
  // Navigation & Dropdown states
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  // Demo Modal State
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoFormData, setDemoFormData] = useState({
    fullName: '',
    businessName: '',
    phone: '',
    industry: 'D2C & E-Commerce',
    monthlyEnquiries: '500 - 2,000',
  });
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  // Business Industry Segments Tab State
  const [activeSegment, setActiveSegment] = useState<'d2c' | 'real-estate' | 'healthcare' | 'education' | 'services' | 'saas'>('d2c');

  // Dashboard Feature Tabs State
  const [activeDashboardTab, setActiveDashboardTab] = useState<'inbox' | 'leads' | 'bookings' | 'automation' | 'analytics'>('inbox');

  // Pricing Toggle
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // FAQ Accordion State (open question id)
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Hero WhatsApp Interactive Chat Simulator State
  const [heroChatMessages, setHeroChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string; chips?: string[] }>>([
    {
      sender: 'user',
      text: "Hi! I saw your recent launch. Can you share pricing and consultation slots?",
      time: '10:42 AM',
    },
    {
      sender: 'bot',
      text: "Namaste! 🙏 Welcome to AutoMask. We offer 24/7 AI-powered lead qualification, booking workflows, and instant customer support on WhatsApp.",
      time: '10:42 AM',
      chips: ['📅 Book a strategy demo', '💼 View business pricing', '👤 Speak to a sales consultant'],
    },
  ]);

  const handleHeroChipClick = (chipText: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user' as const, text: chipText, time: now };

    let botReply: { sender: 'user' | 'bot'; text: string; time: string; chips?: string[] } = {
      sender: 'bot',
      text: "Thank you for reaching out! A dedicated sales specialist will connect with you right away.",
      time: now,
      chips: ['Check integration details', 'View ROI calculator'],
    };

    if (chipText.includes('Book a strategy') || chipText.includes('demo')) {
      botReply = {
        sender: 'bot',
        text: "Super! 🎯 We have open slots tomorrow at 3:00 PM and 5:30 PM with our senior solutions architect. Reply CONFIRM to lock in your live walkthrough.",
        time: now,
        chips: ['CONFIRM 3:00 PM Slot', 'Check other dates'],
      };
    } else if (chipText.includes('pricing') || chipText.includes('business')) {
      botReply = {
        sender: 'bot',
        text: "⚡ Starter: ₹499/mo (for small teams) | Growth: ₹999/mo (Most Popular, 3,000 workflows) | Pro: ₹2,499/mo (Enterprise 10k workflows). Zero transaction fees on your sales!",
        time: now,
        chips: ['Book a strategy demo', 'Speak to a sales consultant'],
      };
    } else if (chipText.includes('consultant') || chipText.includes('Speak')) {
      botReply = {
        sender: 'bot',
        text: "Connecting you with Account Manager Rajesh right now. Human takeover active 🟢",
        time: now,
      };
    }

    setHeroChatMessages(prev => [...prev, userMsg, botReply]);
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitted(true);
  };

  // Business industry segment data mapping
  const segmentData = {
    'd2c': {
      title: 'Built for D2C Brands & E-Commerce Businesses',
      desc: 'Recover abandoned carts, send real-time order tracking, answer product specifications, and convert browsing shoppers into repeat buyers on WhatsApp.',
      points: [
        'Automated abandoned cart recovery with 1-click checkout links',
        'Instant product recommendations & catalog browsing',
        'COD confirmation & NDR (Non-Delivery Report) management',
        '24/7 post-purchase order tracking and return assistance',
        'Targeted broadcast promotions with 98% open rates',
      ],
      badge: 'Retail, Fashion & D2C Brands',
      image: '/business_workspace_team.jpg',
    },
    'real-estate': {
      title: 'Engineered for Real Estate Developers & Brokerages',
      desc: 'Qualify high-intent property buyers instantly. Share floor plans, brochures, pricing sheets, and automatically schedule site visits directly into your CRM.',
      points: [
        'Instant dispatch of project brochures, floor plans & rate cards',
        'Automated buyer qualification based on budget & location preference',
        'Frictionless site visit slot booking with calendar sync',
        'Automated reminder notifications to maximize site visit footfall',
        'Smart handover to territory sales managers with buyer dossiers',
      ],
      badge: 'Builders, Developers & Real Estate Brokers',
      image: '/business_workspace_team.jpg',
    },
    'healthcare': {
      title: 'Designed for Clinics, Hospitals & Diagnostics',
      desc: 'Manage doctor appointment bookings, send lab report download links, answer treatment queries, and provide round-the-clock patient assistance.',
      points: [
        'Self-service doctor appointment booking with real-time doctor slots',
        'Automated appointment reminders to reduce OPD no-shows',
        'Secure WhatsApp delivery of test reports & prescriptions',
        'Instant answers for clinic timings, doctor specializations & fees',
        'Zero manual errors with direct clinic management software sync',
      ],
      badge: 'Clinics, Dentists, Hospitals & Labs',
      image: '/business_workspace_team.jpg',
    },
    'education': {
      title: 'Proven for Coaching Institutes & Education Centers',
      desc: 'Handle high volumes of student & parent enquiries, share course fees, batch schedules, book demo masterclasses, and nurture leads until admission.',
      points: [
        'Instant answers to fees, batches, syllabus and hostel details',
        'Demo class booking with real-time seat availability',
        'Automated personalized follow-ups to increase admissions',
        'Human takeover for senior academic counsellors',
        'Complete lead tracking pipeline from enquiry to enrollment',
      ],
      badge: 'JEE, NEET, SSC, Coding & Skill Institutes',
      image: '/coaching_classroom_jee.jpg',
    },
    'services': {
      title: 'Tailored for Professional Services & Advisory Firms',
      desc: 'Streamline client onboarding for legal, financial, accounting, architecture, and consulting practices with automated qualifying intake forms.',
      points: [
        'Automated client discovery questionnaire on WhatsApp',
        'Paid and free consultation scheduling with Google Calendar sync',
        'Instant quotation & scope-of-work PDF distribution',
        'Client document submission and verification reminders',
        'Dedicated team inbox for multi-associate collaboration',
      ],
      badge: 'CA, Legal, Consulting & Financial Advisors',
      image: '/business_workspace_team.jpg',
    },
    'saas': {
      title: 'Optimized for SaaS Startups & Digital Agencies',
      desc: 'Qualify inbound website traffic in seconds. Book high-value discovery calls, answer integration questions, and retain clients with proactive notifications.',
      points: [
        'Speed-to-lead under 5 seconds for incoming website form fills',
        'Automated BANT qualification before booking discovery calls',
        'Interactive feature tour and API documentation previews',
        'Webhook triggers to automatically sync with HubSpot, Salesforce & CRMs',
        'Shared inbox with SLA tracking and agent response analytics',
      ],
      badge: 'Tech Startups, B2B SaaS & Digital Agencies',
      image: '/business_workspace_team.jpg',
    },
  };

  const currentSegment = segmentData[activeSegment];

  // FAQ items list
  const faqs = [
    {
      q: 'Can any type of business use AutoMask?',
      a: 'Yes, absolutely! AutoMask is built for modern businesses across industries — including D2C e-commerce, real estate, clinics & healthcare, coaching institutes, professional services, local retailers, and B2B SaaS. Any business that talks to customers can automate enquiries, appointments, and sales on WhatsApp.',
    },
    {
      q: 'How does AutoMask connect to my official WhatsApp number?',
      a: 'AutoMask connects directly via Meta’s official WhatsApp Cloud API (Graph API v21.0). You can link an existing WhatsApp Business number or register a new phone number through Meta’s secure embedded signup in under 5 minutes with zero technical setup.',
    },
    {
      q: 'Is there any risk of our WhatsApp number getting banned?',
      a: 'Zero risk. AutoMask uses 100% official Meta WhatsApp Cloud API credentials and strictly complies with Meta’s messaging policies, opt-in rules, and 24-hour service windows. Unlike risky unofficial scraping tools or third-party web hacks, your number is safe and eligible for the verified green badge.',
    },
    {
      q: 'Can multiple team members chat with customers at the same time?',
      a: 'Yes! AutoMask provides a unified Shared Team Inbox. Your sales representatives, support agents, and managers can log in simultaneously, assign conversations, view customer history, leave internal notes, and take over chats from the AI seamlessly.',
    },
    {
      q: 'How does the AI prevent inaccurate responses or hallucinations?',
      a: 'AutoMask utilizes Grounded Knowledge AI (Retrieval-Augmented Generation). The AI is strictly restricted to answer only from your uploaded catalogs, pricing sheets, brochures, and FAQs. If a customer asks a question outside your approved business knowledge, the AI politely offers to route them to a human agent.',
    },
    {
      q: 'Can AutoMask handle appointments and calendar bookings?',
      a: 'Yes! AutoMask has a built-in Smart Booking Engine. You can define service durations, available time slots, buffer times, and counselor/doctor assignments. Customers select their preferred slot right inside WhatsApp, and automated confirmation and reminder messages are sent automatically.',
    },
    {
      q: 'Who pays for WhatsApp messaging charges?',
      a: 'Meta charges standard per-conversation messaging rates directly through your Meta Business Manager. Free-form customer service replies within the 24-hour window are free or minimal cost. AutoMask manages your approved Meta templates to maximize efficiency and keep messaging costs negligible.',
    },
    {
      q: 'Can AutoMask integrate with my existing CRM, Shopify, or website?',
      a: 'Yes! AutoMask supports instant webhooks and integrations with Shopify, WooCommerce, HubSpot, Zoho, Google Sheets, and custom web APIs, allowing seamless bi-directional synchronization of leads, orders, and appointment bookings.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#059669] selection:text-white">
      {/* =========================================================================
          1. HEADER NAVBAR
          ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 h-20 lg:h-24 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-tr from-[#047857] to-[#10b981] p-0.5 shadow-md shadow-emerald-700/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#064e3b] rounded-[10px] flex items-center justify-center text-white">
                <Bot className="w-6 h-6 text-[#34d399]" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 font-['Outfit']">
                  Auto<span className="text-[#059669]">Mask</span>
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-10 text-base lg:text-lg xl:text-xl font-bold text-slate-700">
            <a href="#features" className="hover:text-[#059669] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#059669] transition-colors">How It Works</a>
            
            {/* Solutions Dropdown */}
            <div className="relative" onMouseLeave={() => setSolutionsOpen(false)}>
              <button 
                onClick={() => setSolutionsOpen(!solutionsOpen)}
                onMouseEnter={() => setSolutionsOpen(true)}
                className="flex items-center gap-1.5 hover:text-[#059669] transition-colors py-2"
              >
                <span>Solutions</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              {solutionsOpen && (
                <div className="absolute top-full left-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <a href="#solutions" onClick={() => { setActiveSegment('d2c'); setSolutionsOpen(false); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-[#047857] transition-colors">
                    <ShoppingBag className="w-5 h-5 text-pink-600 shrink-0" />
                    <div>
                      <div className="font-bold text-sm">D2C & E-Commerce</div>
                      <div className="text-xs text-slate-500">Cart recovery & order tracking</div>
                    </div>
                  </a>
                  <a href="#solutions" onClick={() => { setActiveSegment('real-estate'); setSolutionsOpen(false); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-[#047857] transition-colors">
                    <Home className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <div className="font-bold text-sm">Real Estate & Developers</div>
                      <div className="text-xs text-slate-500">Buyer qualification & site visits</div>
                    </div>
                  </a>
                  <a href="#solutions" onClick={() => { setActiveSegment('healthcare'); setSolutionsOpen(false); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-[#047857] transition-colors">
                    <Stethoscope className="w-5 h-5 text-cyan-600 shrink-0" />
                    <div>
                      <div className="font-bold text-sm">Healthcare & Clinics</div>
                      <div className="text-xs text-slate-500">Appointments & report dispatches</div>
                    </div>
                  </a>
                  <a href="#solutions" onClick={() => { setActiveSegment('education'); setSolutionsOpen(false); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-[#047857] transition-colors">
                    <GraduationCap className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold text-sm">Education & Institutes</div>
                      <div className="text-xs text-slate-500">Student admissions & demo classes</div>
                    </div>
                  </a>
                  <a href="#solutions" onClick={() => { setActiveSegment('services'); setSolutionsOpen(false); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-[#047857] transition-colors">
                    <Briefcase className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div>
                      <div className="font-bold text-sm">Professional Services</div>
                      <div className="text-xs text-slate-500">Client onboarding & consultation</div>
                    </div>
                  </a>
                  <a href="#solutions" onClick={() => { setActiveSegment('saas'); setSolutionsOpen(false); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-[#047857] transition-colors">
                    <Laptop className="w-5 h-5 text-purple-600 shrink-0" />
                    <div>
                      <div className="font-bold text-sm">SaaS & Agencies</div>
                      <div className="text-xs text-slate-500">Lead qualification & demo booking</div>
                    </div>
                  </a>
                </div>
              )}
            </div>

            <a href="#pricing" className="hover:text-[#059669] transition-colors">Pricing</a>
            <a href="#security" className="hover:text-[#059669] transition-colors">Security</a>

            {/* Resources Dropdown */}
            <div className="relative" onMouseLeave={() => setResourcesOpen(false)}>
              <button 
                onClick={() => setResourcesOpen(!resourcesOpen)}
                onMouseEnter={() => setResourcesOpen(true)}
                className="flex items-center gap-1.5 hover:text-[#059669] transition-colors py-2"
              >
                <span>Resources</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              {resourcesOpen && (
                <div className="absolute top-full left-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <a href="#how-it-works" onClick={() => setResourcesOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 text-slate-700 text-sm font-semibold transition-colors">
                    <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>WhatsApp Cloud API Guide</span>
                  </a>
                  <a href="#dashboard" onClick={() => setResourcesOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 text-slate-700 text-sm font-semibold transition-colors">
                    <SlidersHorizontal className="w-5 h-5 text-blue-600 shrink-0" />
                    <span>Interactive Console Tour</span>
                  </a>
                  <a href="#faq" onClick={() => setResourcesOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 text-slate-700 text-sm font-semibold transition-colors">
                    <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0" />
                    <span>Business Automation FAQs</span>
                  </a>
                </div>
              )}
            </div>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated && onNavigateToApp ? (
              <button
                id="nav-dashboard-btn"
                onClick={onNavigateToApp}
                className="flex items-center gap-2.5 px-5 py-2.5 lg:px-6 lg:py-3 text-base lg:text-lg font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm active:scale-98"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                id="nav-login-btn"
                onClick={onNavigateToUserLogin}
                className="px-5 py-2.5 text-base lg:text-lg font-bold text-slate-700 hover:text-[#047857] transition-colors"
              >
                Login
              </button>
            )}

            <button
              id="nav-book-demo-btn"
              onClick={() => setIsDemoModalOpen(true)}
              className="flex items-center gap-2.5 px-6 py-2.5 lg:px-8 lg:py-3.5 rounded-xl text-base lg:text-lg font-black text-white bg-[#065f46] hover:bg-[#047857] transition-all shadow-md hover:shadow-lg active:scale-98"
            >
              <span>Book a Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION
          ========================================================================= */}
      <section className="relative py-12 lg:py-16 xl:py-20 2xl:py-24 overflow-hidden bg-gradient-to-b from-[#f0fdf4]/60 via-white to-slate-50 border-b border-slate-200/80 min-h-[calc(100vh-80px)] flex items-center">
        
        {/* Soft Background Accents */}
        <div className="absolute top-10 left-1/4 w-[550px] h-[550px] bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-[450px] h-[450px] bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 2xl:gap-20 items-center w-full">
            
            {/* Left Column: Hero Content */}
            <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-7 space-y-7 xl:space-y-9 2xl:space-y-11">
              
              {/* Category Pill Badge */}
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] text-xs sm:text-sm lg:text-base font-black tracking-wide uppercase shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
                <span>AI-POWERED WHATSAPP AUTOMATION FOR MODERN BUSINESSES & ENTERPRISES</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl 2xl:text-[5.25rem] font-black text-slate-900 tracking-tight leading-[1.08] font-['Outfit']">
                Convert More Customers.<br />
                <span className="text-[#059669]">Automatically on WhatsApp.</span>
              </h1>

              {/* Subheading */}
              <p className="text-lg sm:text-xl md:text-2xl xl:text-2xl 2xl:text-3xl text-slate-600 leading-relaxed max-w-3xl xl:max-w-4xl 2xl:max-w-5xl font-normal">
                AutoMask helps businesses, D2C brands, real estate firms, clinics, and service providers 
                capture leads, answer product FAQs, book consultations, run automated follow-ups, and drive revenue — 
                all on WhatsApp, with the power of AI.
              </p>

              {/* 4 Feature Badge Cards (2x2 Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:gap-6 pt-2 w-full">
                {/* 1. 24/7 Instant Responses */}
                <div className="flex items-center gap-4 p-4 xl:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all">
                  <div className="w-11 h-11 xl:w-12 xl:h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 xl:w-6 xl:h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg xl:text-xl font-black text-slate-900">24/7 Instant Responses</h2>
                    <p className="text-xs sm:text-sm xl:text-base text-slate-600 mt-0.5">Never miss a lead or customer query</p>
                  </div>
                </div>

                {/* 2. Automated Bookings & Orders */}
                <div className="flex items-center gap-4 p-4 xl:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all">
                  <div className="w-11 h-11 xl:w-12 xl:h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 xl:w-6 xl:h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg xl:text-xl font-black text-slate-900">Automated Bookings & Orders</h2>
                    <p className="text-xs sm:text-sm xl:text-base text-slate-600 mt-0.5">Real-time calendar & catalog sync</p>
                  </div>
                </div>

                {/* 3. Smart Follow-ups */}
                <div className="flex items-center gap-4 p-4 xl:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-purple-400 hover:shadow-md transition-all">
                  <div className="w-11 h-11 xl:w-12 xl:h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 xl:w-6 xl:h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg xl:text-xl font-black text-slate-900">Smart Follow-ups</h2>
                    <p className="text-xs sm:text-sm xl:text-base text-slate-600 mt-0.5">Turn prospects into paying clients</p>
                  </div>
                </div>

                {/* 4. Human Takeover */}
                <div className="flex items-center gap-4 p-4 xl:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-orange-400 hover:shadow-md transition-all">
                  <div className="w-11 h-11 xl:w-12 xl:h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 xl:w-6 xl:h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg xl:text-xl font-black text-slate-900">Human Takeover</h2>
                    <p className="text-xs sm:text-sm xl:text-base text-slate-600 mt-0.5">Your sales & support team stays in control</p>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-5 pt-3">
                <button
                  id="hero-book-demo-btn"
                  onClick={() => setIsDemoModalOpen(true)}
                  className="flex items-center gap-3.5 px-8 py-4 sm:px-10 sm:py-5 rounded-2xl text-base sm:text-lg xl:text-xl 2xl:text-2xl font-black text-white bg-[#065f46] hover:bg-[#047857] transition-all shadow-xl shadow-emerald-900/20 hover:shadow-2xl active:scale-98"
                >
                  <span>Book a Free Demo</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  id="hero-see-how-btn"
                  onClick={() => {
                    const el = document.getElementById('dashboard');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-3 px-8 py-4 sm:px-10 sm:py-5 rounded-2xl text-base sm:text-lg xl:text-xl 2xl:text-2xl font-black text-slate-800 bg-white hover:bg-slate-50 border-2 border-slate-300 transition-all shadow-sm hover:shadow-md active:scale-98"
                >
                  <Play className="w-5 h-5 text-[#059669] fill-[#059669]" />
                  <span>See How It Works</span>
                </button>
              </div>

              {/* Trust Checkmarks */}
              <div className="flex flex-wrap items-center gap-6 xl:gap-10 pt-3 text-base sm:text-lg xl:text-xl font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-[#059669] stroke-[3]" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-[#059669] stroke-[3]" />
                  <span>Quick 20-minute demo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-[#059669] stroke-[3]" />
                  <span>Built for modern business growth</span>
                </div>
              </div>

            </div>

            {/* Right Column: Hero Visual - Smartphone + Dashboard Mockup */}
            <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-5 relative flex justify-center w-full">
              
              {/* Playful Hand-drawn Annotation Badge at Top-Right */}
              <div className="absolute -top-10 right-2 z-30 hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-emerald-300 shadow-lg">
                <span className="text-xs sm:text-sm font-bold text-[#047857] italic">
                  Lead enquiry to closed deal on WhatsApp ⚡
                </span>
                <span className="text-emerald-500 text-lg">↗</span>
              </div>

              {/* Layered Composition Container */}
              <div className="relative mx-auto w-full max-w-[540px] xl:max-w-[640px] 2xl:max-w-[720px]">
                
                {/* 1. Behind: Dashboard Preview Card */}
                <div className="absolute -top-8 -right-8 xl:-top-10 xl:-right-12 w-[98%] xl:w-[108%] bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-5 xl:p-6 hidden md:block z-10 transform rotate-1 transition-transform hover:rotate-0">
                  {/* Dashboard mini header */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      <span className="ml-2 font-bold text-slate-800">AutoMask Business Suite</span>
                    </div>
                    <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md">Live Sync</span>
                  </div>

                  {/* Dashboard stats mini row */}
                  <div className="grid grid-cols-4 gap-2.5 my-3.5">
                    <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                      <div className="text-xs text-slate-400 font-medium">Conversations</div>
                      <div className="text-base sm:text-lg font-black text-slate-800">1,846</div>
                      <div className="text-xs text-emerald-600 font-bold">+18%</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                      <div className="text-xs text-slate-400 font-medium">New Leads</div>
                      <div className="text-base sm:text-lg font-black text-slate-800">340</div>
                      <div className="text-xs text-blue-600 font-bold">+42 today</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                      <div className="text-xs text-slate-400 font-medium">Deals & Bookings</div>
                      <div className="text-base sm:text-lg font-black text-emerald-700">428</div>
                      <div className="text-xs text-emerald-600 font-bold">+24%</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                      <div className="text-xs text-slate-400 font-medium">Conv. Rate</div>
                      <div className="text-base sm:text-lg font-black text-purple-700">26.4%</div>
                      <div className="text-xs text-purple-600 font-bold">Top 5%</div>
                    </div>
                  </div>

                  {/* Recent conversations list preview */}
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center">RM</div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-slate-800">Rajesh Mittal</div>
                          <div className="text-xs text-slate-500">UrbanNest Realty • Site Visit</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Booked 3 PM</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">AS</div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-slate-800">Aman Singhania</div>
                          <div className="text-xs text-slate-500">Zenith D2C • Order #4082</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Cart Recovered</span>
                    </div>
                  </div>
                </div>

                {/* 2. Foreground: Smartphone Mockup showing WhatsApp chat */}
                <div className="relative z-20 w-[330px] sm:w-[370px] xl:w-[420px] 2xl:w-[460px] mx-auto bg-slate-900 rounded-[44px] xl:rounded-[50px] p-3 xl:p-3.5 shadow-2xl border-4 border-slate-800">
                  {/* Phone speaker notch */}
                  <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-2.5 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-slate-900/80 mr-3" />
                    <div className="w-12 h-1 bg-slate-700 rounded-full" />
                  </div>

                  {/* WhatsApp App Screen Container */}
                  <div className="bg-[#efeae2] rounded-[34px] xl:rounded-[40px] overflow-hidden flex flex-col h-[560px] sm:h-[600px] xl:h-[660px] 2xl:h-[720px] border border-slate-200 shadow-inner">
                    
                    {/* WhatsApp Top Header Bar */}
                    <div className="bg-[#075e54] text-white px-3.5 py-3 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-emerald-400 text-slate-900 font-bold text-xs flex items-center justify-center shadow-xs">
                            <Bot className="w-5 h-5 text-emerald-950" />
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-300 border border-[#075e54]" />
                        </div>
                        <div>
                          <div className="font-black text-sm sm:text-base xl:text-lg leading-tight flex items-center gap-1.5">
                            <span>AutoMask Business</span>
                            <span className="text-[10px] bg-emerald-500/40 text-emerald-200 px-1.5 py-0.2 rounded font-bold">Verified</span>
                          </div>
                          <div className="text-xs sm:text-sm text-emerald-100 font-medium">Sales & Support Assistant</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-white/90">
                        <PhoneCall className="w-4 h-4" />
                        <MoreVertical className="w-4 h-4" />
                      </div>
                    </div>

                    {/* WhatsApp Chat Area */}
                    <div className="flex-1 p-3.5 space-y-3 overflow-y-auto custom-scrollbar text-xs sm:text-sm">
                      <div className="text-center my-1">
                        <span className="bg-white/80 text-slate-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                          TODAY
                        </span>
                      </div>

                      {/* Chat Messages */}
                      {heroChatMessages.map((msg, idx) => (
                        <div 
                           key={idx}
                          className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                        >
                          <div 
                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm xl:text-base leading-relaxed shadow-xs ${
                              msg.sender === 'user' 
                                ? 'bg-[#dcf8c6] text-slate-900 rounded-tr-none' 
                                : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                            }`}
                          >
                            <p>{msg.text}</p>
                            <span className="text-[9px] text-slate-400 block text-right mt-1 font-medium">
                              {msg.time} {msg.sender === 'user' ? '✓✓' : ''}
                            </span>
                          </div>

                          {/* Quick Interactive Chips */}
                          {msg.chips && msg.chips.length > 0 && (
                            <div className="flex flex-col gap-1.5 mt-2 w-full max-w-[90%]">
                              {msg.chips.map((chip, cIdx) => (
                                <button
                                  key={cIdx}
                                  onClick={() => handleHeroChipClick(chip)}
                                  className="text-left bg-white hover:bg-emerald-50 border border-emerald-400/70 text-[#047857] text-xs sm:text-sm xl:text-base font-black px-4 py-3 rounded-xl shadow-2xs transition-colors flex items-center justify-between"
                                >
                                  <span>{chip}</span>
                                  <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* WhatsApp Input Bar */}
                    <div className="bg-[#f0f2f5] p-2.5 flex items-center gap-2 border-t border-slate-200">
                      <div className="flex-1 bg-white rounded-full px-3.5 py-2 flex items-center gap-2 border border-slate-200 shadow-2xs">
                        <Smile className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-400 flex-1 truncate">Type a message...</span>
                        <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                      <div className="w-9 h-9 rounded-full bg-[#00a884] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Mic className="w-4 h-4" />
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SOCIAL PROOF / TRUSTED BY LOGOS
          ========================================================================= */}
      <section className="py-12 lg:py-16 bg-white border-b border-slate-200/80">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 text-center">
          <p className="text-sm sm:text-base lg:text-lg font-black uppercase tracking-widest text-slate-500 mb-10">
            TRUSTED BY 500+ FAST-GROWING BUSINESSES & TEAMS ACROSS INDIA
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 xl:gap-12 items-center justify-center">
            {/* 1. UrbanNest Realty */}
            <div className="flex items-center justify-center gap-3 text-slate-700 hover:text-emerald-700 transition-colors">
              <Home className="w-6 h-6 text-slate-500" />
              <span className="font-black text-lg sm:text-xl xl:text-2xl tracking-tight font-['Outfit']">UrbanNest Realty</span>
            </div>

            {/* 2. Zenith Lifestyle */}
            <div className="flex items-center justify-center gap-3 text-slate-700 hover:text-emerald-700 transition-colors">
              <ShoppingBag className="w-6 h-6 text-slate-500" />
              <span className="font-black text-lg sm:text-xl xl:text-2xl tracking-tight font-['Outfit']">Zenith Lifestyle</span>
            </div>

            {/* 3. CarePlus Clinics */}
            <div className="flex items-center justify-center gap-3 text-slate-700 hover:text-emerald-700 transition-colors">
              <Stethoscope className="w-6 h-6 text-slate-500" />
              <span className="font-black text-lg sm:text-xl xl:text-2xl tracking-tight font-['Outfit']">CarePlus Clinics</span>
            </div>

            {/* 4. Apex Capital */}
            <div className="flex items-center justify-center gap-3 text-slate-700 hover:text-emerald-700 transition-colors">
              <Briefcase className="w-6 h-6 text-slate-500" />
              <span className="font-black text-lg sm:text-xl xl:text-2xl tracking-tight font-['Outfit']">Apex Capital</span>
            </div>

            {/* 5. Lakshya Academy */}
            <div className="flex items-center justify-center gap-3 text-slate-700 hover:text-emerald-700 transition-colors">
              <GraduationCap className="w-6 h-6 text-slate-500" />
              <span className="font-black text-lg sm:text-xl xl:text-2xl tracking-tight font-['Outfit']">Lakshya Academy</span>
            </div>

            {/* 6. NextWave Media */}
            <div className="flex items-center justify-center gap-3 text-slate-700 hover:text-emerald-700 transition-colors">
              <Laptop className="w-6 h-6 text-slate-500" />
              <span className="font-black text-lg sm:text-xl xl:text-2xl tracking-tight font-['Outfit']">NextWave Media</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. 5-PILLAR BENEFIT STRIP
          ========================================================================= */}
      <section className="py-10 lg:py-14 bg-slate-50/80 border-b border-slate-200">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 xl:gap-7">
            
            {/* 1. AI-Powered Responses */}
            <div className="flex items-start gap-4 p-5 xl:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg xl:text-xl font-black text-slate-900 leading-snug">AI-Powered Responses</h3>
                <p className="text-xs sm:text-sm xl:text-base text-slate-600 mt-1.5">Accurate answers from your business catalogs & docs</p>
              </div>
            </div>

            {/* 2. Smart Booking & Sales */}
            <div className="flex items-start gap-4 p-5 xl:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg xl:text-xl font-black text-slate-900 leading-snug">Smart Booking Engine</h3>
                <p className="text-xs sm:text-sm xl:text-base text-slate-600 mt-1.5">Real-time calendar slots & zero double-booking</p>
              </div>
            </div>

            {/* 3. Follow-up Sequences */}
            <div className="flex items-start gap-4 p-5 xl:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg xl:text-xl font-black text-slate-900 leading-snug">Follow-up Sequences</h3>
                <p className="text-xs sm:text-sm xl:text-base text-slate-600 mt-1.5">Automated personalized WhatsApp nurturing</p>
              </div>
            </div>

            {/* 4. Human Takeover */}
            <div className="flex items-start gap-4 p-5 xl:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg xl:text-xl font-black text-slate-900 leading-snug">Human Takeover</h3>
                <p className="text-xs sm:text-sm xl:text-base text-slate-600 mt-1.5">Seamless handover to your sales & support team</p>
              </div>
            </div>

            {/* 5. 100% Secure & Private */}
            <div className="flex items-start gap-4 p-5 xl:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg xl:text-xl font-black text-slate-900 leading-snug">100% Secure & Private</h3>
                <p className="text-xs sm:text-sm xl:text-base text-slate-600 mt-1.5">Enterprise-grade Meta Cloud API with tenant isolation</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          5. HOW IT WORKS SECTION
          ========================================================================= */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white border-b border-slate-200/80">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] text-xs sm:text-sm font-black tracking-wider uppercase mb-4">
            <span>HOW IT WORKS</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 tracking-tight font-['Outfit'] mb-16 lg:mb-20">
            Get started in minutes. Start converting in hours.
          </h2>

          {/* 4 Steps Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12 relative">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center relative group">
              <div className="w-20 h-20 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 mb-6 shadow-xs group-hover:scale-105 transition-transform">
                <MessageCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl sm:text-2xl xl:text-3xl font-black text-slate-900 mb-3">Connect WhatsApp</h3>
              <p className="text-base sm:text-lg xl:text-xl text-slate-600 leading-relaxed max-w-[320px]">
                Link your official WhatsApp Business number via Meta's secure embedded onboarding.
              </p>

              {/* Connecting arrow for md screens */}
              <div className="hidden md:block absolute top-10 -right-5 w-10 text-slate-300">
                <ArrowRight className="w-8 h-8 text-slate-300" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center relative group">
              <div className="w-20 h-20 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-600 mb-6 shadow-xs group-hover:scale-105 transition-transform">
                <FileText className="w-10 h-10" />
              </div>
              <h3 className="text-xl sm:text-2xl xl:text-3xl font-black text-slate-900 mb-3">Set up your Business</h3>
              <p className="text-base sm:text-lg xl:text-xl text-slate-600 leading-relaxed max-w-[320px]">
                Add products, services, pricing, FAQs, and appointment availability slots.
              </p>

              {/* Connecting arrow for md screens */}
              <div className="hidden md:block absolute top-10 -right-5 w-10 text-slate-300">
                <ArrowRight className="w-8 h-8 text-slate-300" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center relative group">
              <div className="w-20 h-20 rounded-2xl bg-purple-50 border-2 border-purple-200 flex items-center justify-center text-purple-600 mb-6 shadow-xs group-hover:scale-105 transition-transform">
                <Zap className="w-10 h-10" />
              </div>
              <h3 className="text-xl sm:text-2xl xl:text-3xl font-black text-slate-900 mb-3">Automate with AI</h3>
              <p className="text-base sm:text-lg xl:text-xl text-slate-600 leading-relaxed max-w-[320px]">
                Activate ready-made business workflows. AI answers customer queries 24/7 with zero hallucination.
              </p>

              {/* Connecting arrow for md screens */}
              <div className="hidden md:block absolute top-10 -right-5 w-10 text-slate-300">
                <ArrowRight className="w-8 h-8 text-slate-300" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-2xl bg-teal-50 border-2 border-teal-200 flex items-center justify-center text-teal-600 mb-6 shadow-xs group-hover:scale-105 transition-transform">
                <TrendingUp className="w-10 h-10" />
              </div>
              <h3 className="text-xl sm:text-2xl xl:text-3xl font-black text-slate-900 mb-3">Convert more customers</h3>
              <p className="text-base sm:text-lg xl:text-xl text-slate-600 leading-relaxed max-w-[320px]">
                Capture leads, book consultations, recover lost enquiries, and track ROI in one dashboard.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          6. BUILT FOR MODERN BUSINESSES (INDUSTRY SEGMENTS SHOWCASE)
          ========================================================================= */}
      <section id="solutions" className="py-20 lg:py-28 bg-slate-50 border-b border-slate-200/80">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] text-xs sm:text-sm font-black tracking-wider uppercase mb-4">
              <span>BUILT FOR MODERN BUSINESSES</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 tracking-tight font-['Outfit']">
              Perfect for every industry & business model
            </h2>
          </div>

          {/* Segment Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-3 lg:gap-4 mb-14">
            {[
              { id: 'd2c', label: 'D2C & E-Commerce' },
              { id: 'real-estate', label: 'Real Estate' },
              { id: 'healthcare', label: 'Healthcare & Clinics' },
              { id: 'education', label: 'Education & Institutes' },
              { id: 'services', label: 'Professional Services' },
              { id: 'saas', label: 'SaaS & Agencies' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSegment(tab.id as any)}
                className={`px-7 py-3.5 lg:px-9 lg:py-4 rounded-full text-base sm:text-lg xl:text-xl font-black transition-all ${
                  activeSegment === tab.id
                    ? 'bg-[#065f46] text-white shadow-lg shadow-emerald-900/20'
                    : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Segment Feature Content Box */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-center">
              
              {/* Left Column: High Quality Business / Education Photo */}
              <div className="lg:col-span-6 relative h-[380px] sm:h-[460px] lg:h-[540px] xl:h-[600px] overflow-hidden bg-slate-100">
                <img 
                  src={currentSegment.image} 
                  alt={currentSegment.title} 
                  className="w-full h-full object-cover object-center transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:hidden" />
                <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-slate-800 shadow-md">
                  📍 {currentSegment.badge}
                </div>
              </div>

              {/* Right Column: Segment Capabilities */}
              <div className="lg:col-span-6 p-8 sm:p-14 lg:p-16 space-y-7">
                <div>
                  <h3 className="text-3xl sm:text-4xl xl:text-5xl font-black text-slate-900 tracking-tight font-['Outfit'] mb-4 leading-tight">
                    {currentSegment.title}
                  </h3>
                  <p className="text-lg sm:text-xl xl:text-2xl text-slate-600 leading-relaxed">
                    {currentSegment.desc}
                  </p>
                </div>

                {/* Bullet Points */}
                <div className="space-y-4 pt-2">
                  {currentSegment.points.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-3.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center shrink-0 mt-1">
                        <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                      </div>
                      <span className="text-base sm:text-lg xl:text-xl font-bold text-slate-800 leading-snug">{pt}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="pt-4">
                  <button
                    onClick={() => setIsDemoModalOpen(true)}
                    className="flex items-center gap-3 px-8 py-4 sm:px-10 sm:py-4.5 rounded-xl text-base sm:text-lg font-black text-white bg-[#065f46] hover:bg-[#047857] transition-all shadow-md active:scale-98"
                  >
                    <span>Book a Demo for Your Business</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          7. "SIMPLE. POWERFUL. COMPLETE." - DASHBOARD PREVIEW
          ========================================================================= */}
      <section id="dashboard" className="py-20 lg:py-28 bg-white border-b border-slate-200/80">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] text-xs sm:text-sm font-black tracking-wider uppercase mb-4">
              <span>SIMPLE. POWERFUL. COMPLETE.</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 tracking-tight font-['Outfit']">
              Everything your business needs in one dashboard
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
            
            {/* Left Column: Interactive Feature Selector Cards */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* 1. Team Inbox */}
              <button
                onClick={() => setActiveDashboardTab('inbox')}
                className={`w-full text-left p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                  activeDashboardTab === 'inbox'
                    ? 'bg-emerald-50/80 border-[#059669] shadow-md ring-1 ring-[#059669]/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  activeDashboardTab === 'inbox' ? 'bg-[#065f46] text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl xl:text-2xl font-black text-slate-900">Shared Team Inbox</h3>
                  <p className="text-sm sm:text-base text-slate-600 mt-1">Manage customer chats with multi-agent assignment</p>
                </div>
              </button>

              {/* 2. Lead Management */}
              <button
                onClick={() => setActiveDashboardTab('leads')}
                className={`w-full text-left p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                  activeDashboardTab === 'leads'
                    ? 'bg-emerald-50/80 border-[#059669] shadow-md ring-1 ring-[#059669]/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  activeDashboardTab === 'leads' ? 'bg-[#065f46] text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl xl:text-2xl font-black text-slate-900">Lead & CRM Pipeline</h3>
                  <p className="text-sm sm:text-base text-slate-600 mt-1">Track enquiries from new lead to closed sale</p>
                </div>
              </button>

              {/* 3. Demo & Appointment Bookings */}
              <button
                onClick={() => setActiveDashboardTab('bookings')}
                className={`w-full text-left p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                  activeDashboardTab === 'bookings'
                    ? 'bg-emerald-50/80 border-[#059669] shadow-md ring-1 ring-[#059669]/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  activeDashboardTab === 'bookings' ? 'bg-[#065f46] text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl xl:text-2xl font-black text-slate-900">Appointments & Demos</h3>
                  <p className="text-sm sm:text-base text-slate-600 mt-1">Automated calendar slots & zero double-booking</p>
                </div>
              </button>

              {/* 4. Automation Rules */}
              <button
                onClick={() => setActiveDashboardTab('automation')}
                className={`w-full text-left p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                  activeDashboardTab === 'automation'
                    ? 'bg-emerald-50/80 border-[#059669] shadow-md ring-1 ring-[#059669]/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  activeDashboardTab === 'automation' ? 'bg-[#065f46] text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl xl:text-2xl font-black text-slate-900">Automation & Journeys</h3>
                  <p className="text-sm sm:text-base text-slate-600 mt-1">Keyword triggers, drip campaigns & RAG AI</p>
                </div>
              </button>

              {/* 5. Analytics & Reports */}
              <button
                onClick={() => setActiveDashboardTab('analytics')}
                className={`w-full text-left p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                  activeDashboardTab === 'analytics'
                    ? 'bg-emerald-50/80 border-[#059669] shadow-md ring-1 ring-[#059669]/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  activeDashboardTab === 'analytics' ? 'bg-[#065f46] text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl xl:text-2xl font-black text-slate-900">Analytics & Sales ROI</h3>
                  <p className="text-sm sm:text-base text-slate-600 mt-1">First response time, conversions & agent metrics</p>
                </div>
              </button>

              <div className="pt-2">
                <button
                  onClick={() => onLaunchDemo('admin')}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-sm sm:text-base font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <span>Launch Live Interactive Console Demo</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Right Column: Realistic High-Fidelity Dashboard Screen matching selected tab */}
            <div className="lg:col-span-8 bg-slate-900 rounded-2xl p-3 shadow-2xl border border-slate-800">
              
              {/* Window Controls Bar */}
              <div className="flex items-center justify-between pb-3 px-3 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-[11px] text-slate-400">automask-business.internal/inbox</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-semibold text-emerald-400">Meta Graph API v21.0 Online</span>
                </div>
              </div>

              {/* Tab: INBOX */}
              {activeDashboardTab === 'inbox' && (
                <div className="bg-slate-950 rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[460px] text-slate-100">
                  {/* Left Mini-nav list */}
                  <div className="md:col-span-5 border-r border-slate-800/80 p-3 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Inquiries (28)</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">Auto-AI On</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/40 cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">Rajesh Mittal</span>
                        <span className="text-[10px] text-emerald-400">Just now</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">Interested in 3BHK flat site visit...</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700/50">Real Estate</span>
                        <span className="text-[9px] bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded border border-blue-700/50">Visit Confirmed</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/40 hover:bg-slate-900 border border-slate-800 cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-300">Priya Bakshi</span>
                        <span className="text-[10px] text-slate-500">12m ago</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">Can you share the wholesale price catalog?</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] bg-amber-900/60 text-amber-300 px-1.5 py-0.5 rounded">Catalog Sent</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/40 hover:bg-slate-900 border border-slate-800 cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-300">Aman Singhania</span>
                        <span className="text-[10px] text-slate-500">34m ago</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">Need return assistance on order #4082</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded">D2C Support</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Chat Thread */}
                  <div className="md:col-span-7 flex flex-col justify-between p-4 bg-slate-900/60">
                    <div>
                      {/* Thread Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>Rajesh Mittal (+91 98765 43210)</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          </div>
                          <span className="text-[10px] text-slate-400">Source: Click-to-WhatsApp Ad • UrbanNest Palms</span>
                        </div>
                        <button className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-600/40 px-2.5 py-1 rounded-md">
                          <UserCheck className="w-3 h-3 text-emerald-400" />
                          <span>Human Takeover</span>
                        </button>
                      </div>

                      {/* Chat Bubbles */}
                      <div className="space-y-3 text-xs">
                        <div className="bg-slate-800 text-slate-200 p-2.5 rounded-xl max-w-[85%] text-[11px]">
                          "Hi, I'm interested in the 3BHK premium apartment in Whitefield. Can you share the brochure and arrange a site visit this Saturday?"
                        </div>
                        <div className="bg-emerald-950/80 border border-emerald-800/60 text-emerald-100 p-2.5 rounded-xl ml-auto max-w-[85%] text-[11px]">
                          <div className="text-[9px] text-emerald-400 font-bold mb-1 flex items-center gap-1">
                            <Bot className="w-3 h-3" /> AutoMask AI Grounded Response
                          </div>
                          "Namaste Rajesh ji! 🙏 Here is the digital brochure & floor plan for UrbanNest Palms. We have VIP site visit slots available this Saturday at 11:30 AM and 3:00 PM with our senior property advisor."
                        </div>
                        <div className="bg-slate-800 text-slate-200 p-2 rounded-xl max-w-[80%] text-[11px]">
                          "Please confirm Saturday 3:00 PM slot for 2 visitors."
                        </div>
                        <div className="bg-emerald-950/80 border border-emerald-800/60 text-emerald-100 p-2.5 rounded-xl ml-auto max-w-[85%] text-[11px]">
                          "Site visit confirmed! 🎉 Saturday, 3:00 PM. Location pin and your site coordinator's contact details have been dispatched to your WhatsApp."
                        </div>
                      </div>
                    </div>

                    {/* Quick input simulation */}
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value="Type reply or pick pre-approved Meta Template..." 
                        className="bg-slate-800 text-slate-400 text-xs px-3 py-2 rounded-lg flex-1 border border-slate-700 outline-none"
                      />
                      <button className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg text-xs font-bold">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: LEADS */}
              {activeDashboardTab === 'leads' && (
                <div className="bg-slate-950 rounded-xl p-4 min-h-[460px] text-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-300">Omnichannel Sales Pipeline (340 Leads)</span>
                    <span className="text-xs bg-emerald-600 text-white font-bold px-2 py-1 rounded-md">+ Add Lead</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="text-slate-400 text-[10px] font-bold uppercase mb-2">New Inbound Leads (84)</div>
                      <div className="space-y-2">
                        <div className="bg-slate-800/80 p-2 rounded border border-slate-700">
                          <div className="font-bold text-white text-[11px]">Kunal Verma</div>
                          <div className="text-[10px] text-slate-400">D2C Fashion • Just now</div>
                        </div>
                        <div className="bg-slate-800/80 p-2 rounded border border-slate-700">
                          <div className="font-bold text-white text-[11px]">Ananya Roy</div>
                          <div className="text-[10px] text-slate-400">Dental Consultation • 15m ago</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="text-emerald-400 text-[10px] font-bold uppercase mb-2">Meeting / Demo Set (46)</div>
                      <div className="space-y-2">
                        <div className="bg-slate-800/80 p-2 rounded border border-emerald-800/60">
                          <div className="font-bold text-emerald-200 text-[11px]">Rajesh Mittal</div>
                          <div className="text-[10px] text-slate-400">Saturday 3:00 PM • Site Visit</div>
                        </div>
                        <div className="bg-slate-800/80 p-2 rounded border border-emerald-800/60">
                          <div className="font-bold text-emerald-200 text-[11px]">Tanvi Dave</div>
                          <div className="text-[10px] text-slate-400">Tomorrow 5:00 PM • Consultation</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="text-blue-400 text-[10px] font-bold uppercase mb-2">Proposal Sent (32)</div>
                      <div className="space-y-2">
                        <div className="bg-slate-800/80 p-2 rounded border border-slate-700">
                          <div className="font-bold text-white text-[11px]">Rohan Sethi</div>
                          <div className="text-[10px] text-blue-300">Quotation ₹1,20,000 sent</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="text-purple-400 text-[10px] font-bold uppercase mb-2">Deal Won / Paid (28)</div>
                      <div className="space-y-2">
                        <div className="bg-slate-800/80 p-2 rounded border border-purple-800/60">
                          <div className="font-bold text-purple-200 text-[11px]">Shreya Gupta</div>
                          <div className="text-[10px] text-emerald-400 font-bold">Invoice Paid via WhatsApp</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: BOOKINGS */}
              {activeDashboardTab === 'bookings' && (
                <div className="bg-slate-950 rounded-xl p-4 min-h-[460px] text-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-300">Live Appointment & Booking Calendar</span>
                    <span className="text-[11px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">Google & Outlook Synced</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-900 rounded-lg border border-emerald-800/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-900 text-emerald-300 flex items-center justify-center font-bold">
                          DEMO
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">Enterprise Software Strategy Call</div>
                          <div className="text-slate-400 text-[11px]">Tomorrow @ 3:00 PM • Specialist: Aman Verma</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-400 font-bold">Confirmed via WhatsApp</div>
                        <div className="text-[10px] text-slate-400">Google Meet link sent</div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-900 text-blue-300 flex items-center justify-center font-bold">
                          SITE
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">Luxury Villa Site Tour & Inspection</div>
                          <div className="text-slate-400 text-[11px]">Saturday @ 11:30 AM • Lead: Vikram Singhal</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-400 font-bold">Location Dispatched</div>
                        <div className="text-[10px] text-slate-400">Auto SMS & WA Reminder</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: AUTOMATION */}
              {activeDashboardTab === 'automation' && (
                <div className="bg-slate-950 rounded-xl p-4 min-h-[460px] text-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-300">Live Business Triggers & AI Workflows</span>
                    <span className="text-xs bg-emerald-600 text-white font-bold px-2 py-1 rounded-md">+ New Trigger</span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">Trigger: Keyword "PRICE" / "CATALOG" / "BROCHURE"</div>
                        <div className="text-slate-400 text-[11px]">Action: Instant Grounded Knowledge Retrieval & Verified PDF Dispatch</div>
                      </div>
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">Active</span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">Trigger: Abandoned Cart or Checkout Drop (60 min)</div>
                        <div className="text-slate-400 text-[11px]">Action: Send Personalized Cart Summary + 5% Discount Voucher</div>
                      </div>
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">Active</span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">Trigger: 24h Post-Appointment Follow-up</div>
                        <div className="text-slate-400 text-[11px]">Action: Request Google Review + Send Next Action Steps</div>
                      </div>
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">Active</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: ANALYTICS */}
              {activeDashboardTab === 'analytics' && (
                <div className="bg-slate-950 rounded-xl p-4 min-h-[460px] text-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-300">Revenue & Conversion Dashboard</span>
                    <span className="text-xs text-slate-400">Last 30 Days</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center">
                      <div className="text-slate-400 text-[11px]">Avg Lead Response Time</div>
                      <div className="text-xl font-bold text-emerald-400 mt-1">3.2 seconds</div>
                      <div className="text-[10px] text-slate-500">vs 3.5 hours manual</div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center">
                      <div className="text-slate-400 text-[11px]">Lead-to-Booking Rate</div>
                      <div className="text-xl font-bold text-blue-400 mt-1">29.6%</div>
                      <div className="text-[10px] text-slate-500">+14% vs email/SMS</div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center">
                      <div className="text-slate-400 text-[11px]">WhatsApp Read Rate</div>
                      <div className="text-xl font-bold text-purple-400 mt-1">98.2%</div>
                      <div className="text-[10px] text-slate-500">Highest across channels</div>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-center text-slate-400">
                    🚀 ₹42.8 Lakhs in Revenue Directly Influenced via WhatsApp Automation
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          8. WHY CHOOSE AUTOMASK SECTION
          ========================================================================= */}
      <section className="py-20 lg:py-28 bg-slate-50 border-b border-slate-200/80">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] text-xs sm:text-sm font-black tracking-wider uppercase mb-4">
              <span>WHY CHOOSE AUTOMASK</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 tracking-tight font-['Outfit']">
              Built for real business growth & high conversion
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            
            {/* 1. More Revenue & Sales */}
            <div className="p-7 xl:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-105 transition-transform">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl xl:text-3xl font-black text-slate-900 mb-3">More Revenue & Sales</h3>
              <p className="text-sm sm:text-base xl:text-lg text-slate-600 leading-relaxed">
                Engage hot inbound prospects in seconds before they research your competitors.
              </p>
            </div>

            {/* 2. Save 70% Team Time */}
            <div className="p-7 xl:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-105 transition-transform">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl xl:text-3xl font-black text-slate-900 mb-3">Save 70% Team Time</h3>
              <p className="text-sm sm:text-base xl:text-lg text-slate-600 leading-relaxed">
                Automate FAQs, catalog questions, and scheduling so your sales team can focus on closing deals.
              </p>
            </div>

            {/* 3. Transparent & Affordable */}
            <div className="p-7 xl:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-amber-300 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-6 group-hover:scale-105 transition-transform">
                <Percent className="w-7 h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl xl:text-3xl font-black text-slate-900 mb-3">Transparent & Affordable</h3>
              <p className="text-sm sm:text-base xl:text-lg text-slate-600 leading-relaxed">
                Simple monthly plans with transparent limits. Zero hidden fees and zero cut of your sales revenue.
              </p>
            </div>

            {/* 4. Meta Official & Safe */}
            <div className="p-7 xl:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-teal-300 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-6 group-hover:scale-105 transition-transform">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl xl:text-3xl font-black text-slate-900 mb-3">100% Official & Compliant</h3>
              <p className="text-sm sm:text-base xl:text-lg text-slate-600 leading-relaxed">
                Built strictly on Meta’s official WhatsApp Cloud API. Safe from number bans with enterprise tenant privacy.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          9. TESTIMONIALS (LOVED BY BUSINESS LEADERS)
          ========================================================================= */}
      <section className="py-20 lg:py-28 bg-white border-b border-slate-200/80">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] text-xs sm:text-sm font-black tracking-wider uppercase mb-4">
              <span>LOVED BY GROWING BUSINESSES</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 tracking-tight font-['Outfit']">
              What our business partners say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Testimonial 1: Real Estate */}
            <div className="p-8 xl:p-10 rounded-3xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between shadow-xs hover:shadow-lg transition-shadow">
              <div className="space-y-5">
                <div className="flex items-center gap-1.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-base sm:text-lg xl:text-xl text-slate-700 leading-relaxed italic">
                  "AutoMask doubled our weekend site visit bookings. Hot property enquiries are instantly qualified and sent to our agents with complete buyer requirements."
                </p>
              </div>

              <div className="flex items-center gap-4 pt-6 mt-8 border-t border-slate-200">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-base shadow-xs">
                  RM
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Rajesh Mittal</h4>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">VP Sales, UrbanNest Realty</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2: Healthcare */}
            <div className="p-8 xl:p-10 rounded-3xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between shadow-xs hover:shadow-lg transition-shadow">
              <div className="space-y-5">
                <div className="flex items-center gap-1.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-base sm:text-lg xl:text-xl text-slate-700 leading-relaxed italic">
                  "Our patient consultation appointments run on autopilot. No missed calls, zero manual booking errors, and patient satisfaction has never been higher."
                </p>
              </div>

              <div className="flex items-center gap-4 pt-6 mt-8 border-t border-slate-200">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-base shadow-xs">
                  SK
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Dr. Sunita Kulkarni</h4>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">Founder & MD, CarePlus Clinics</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3: D2C E-Commerce */}
            <div className="p-8 xl:p-10 rounded-3xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between shadow-xs hover:shadow-lg transition-shadow">
              <div className="space-y-5">
                <div className="flex items-center gap-1.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-base sm:text-lg xl:text-xl text-slate-700 leading-relaxed italic">
                  "Our order confirmation and abandoned cart recovery on WhatsApp generate 32% more repeat revenue with practically zero extra headcount."
                </p>
              </div>

              <div className="flex items-center gap-4 pt-6 mt-8 border-t border-slate-200">
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-base shadow-xs">
                  AS
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Aman Singhania</h4>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">Co-founder, Zenith Lifestyle D2C</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          10. PRICING SECTION
          ========================================================================= */}
      <section id="pricing" className="py-20 lg:py-28 bg-slate-50 border-b border-slate-200/80">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] text-xs sm:text-sm font-black tracking-wider uppercase mb-4">
              <span>SIMPLE & TRANSPARENT PRICING</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 tracking-tight font-['Outfit'] mb-8">
              Plans for every stage of business growth
            </h2>

            {/* Monthly / Yearly Toggle */}
            <div className="inline-flex items-center bg-white border border-slate-200 p-1.5 rounded-full shadow-xs">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2.5 rounded-full text-sm sm:text-base font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-[#065f46] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm sm:text-base font-bold transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-[#065f46] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Yearly</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2 py-0.5 rounded-full">
                  2 months free
                </span>
              </button>
            </div>
          </div>

          {/* 4 Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-stretch">
            
            {/* Plan 1: Free */}
            <div className="p-8 xl:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div>
                <h3 className="text-2xl sm:text-3xl xl:text-4xl font-black text-slate-900 font-['Outfit']">Free</h3>
                <p className="text-sm text-slate-500 mt-1 mb-6 font-medium">Get started & test AutoMask</p>

                <div className="flex items-baseline gap-1.5 mb-8">
                  <span className="text-5xl sm:text-6xl xl:text-7xl font-black text-slate-900">₹0</span>
                  <span className="text-sm sm:text-base text-slate-500 font-bold">/month</span>
                </div>

                <div className="space-y-4 text-sm sm:text-base text-slate-700">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>1 team member</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>100 workflows / month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>50 AI replies / month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Basic shared inbox</span>
                  </div>
                </div>
              </div>

              <div className="pt-10">
                <button
                  onClick={() => onLaunchDemo('admin')}
                  className="w-full py-3.5 rounded-xl border border-slate-300 text-sm sm:text-base font-black text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Plan 2: Starter */}
            <div className="p-8 xl:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div>
                <h3 className="text-2xl sm:text-3xl xl:text-4xl font-black text-slate-900 font-['Outfit']">Starter</h3>
                <p className="text-sm text-slate-500 mt-1 mb-6 font-medium">For local businesses & clinics</p>

                <div className="flex items-baseline gap-1.5 mb-8">
                  <span className="text-5xl sm:text-6xl xl:text-7xl font-black text-slate-900">
                    ₹{billingCycle === 'monthly' ? '499' : '399'}
                  </span>
                  <span className="text-sm sm:text-base text-slate-500 font-bold">/month</span>
                </div>

                <div className="space-y-4 text-sm sm:text-base text-slate-700">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>2 team members</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>1,000 workflows / month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>500 AI replies / month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Follow-up sequences & tags</span>
                  </div>
                </div>
              </div>

              <div className="pt-10">
                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="w-full py-3.5 rounded-xl border-2 border-emerald-600 text-sm sm:text-base font-black text-emerald-700 hover:bg-emerald-50 transition-colors"
                >
                  Book a Demo
                </button>
              </div>
            </div>

            {/* Plan 3: Growth (Most Popular) */}
            <div className="relative p-8 xl:p-10 rounded-3xl bg-white border-2 border-[#059669] shadow-xl flex flex-col justify-between transform -translate-y-2">
              {/* Most Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#065f46] text-white text-xs font-black px-4 py-1 rounded-full shadow-md">
                Most Popular
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl xl:text-4xl font-black text-slate-900 font-['Outfit']">Growth</h3>
                <p className="text-sm text-slate-500 mt-1 mb-6 font-medium">For growing D2C & sales teams</p>

                <div className="flex items-baseline gap-1.5 mb-8">
                  <span className="text-5xl sm:text-6xl xl:text-7xl font-black text-slate-900">
                    ₹{billingCycle === 'monthly' ? '999' : '799'}
                  </span>
                  <span className="text-sm sm:text-base text-slate-500 font-bold">/month</span>
                </div>

                <div className="space-y-4 text-sm sm:text-base text-slate-700 font-medium">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>5 team members</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>3,000 workflows / month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>1,500 AI replies / month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Booking engine & custom CRM</span>
                  </div>
                </div>
              </div>

              <div className="pt-10">
                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="w-full py-3.5 rounded-xl bg-[#065f46] hover:bg-[#047857] text-sm sm:text-base font-black text-white transition-all shadow-md active:scale-98"
                >
                  Book a Demo
                </button>
              </div>
            </div>

            {/* Plan 4: Pro */}
            <div className="p-8 xl:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div>
                <h3 className="text-2xl sm:text-3xl xl:text-4xl font-black text-slate-900 font-['Outfit']">Pro</h3>
                <p className="text-sm text-slate-500 mt-1 mb-6 font-medium">For enterprises & high volume</p>

                <div className="flex items-baseline gap-1.5 mb-8">
                  <span className="text-5xl sm:text-6xl xl:text-7xl font-black text-slate-900">
                    ₹{billingCycle === 'monthly' ? '2,499' : '1,999'}
                  </span>
                  <span className="text-sm sm:text-base text-slate-500 font-bold">/month</span>
                </div>

                <div className="space-y-4 text-sm sm:text-base text-slate-700">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>10 team members</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>10,000 workflows / month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>4,000 AI replies / month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Dedicated account manager</span>
                  </div>
                </div>
              </div>

              <div className="pt-10">
                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="w-full py-3.5 rounded-xl border-2 border-emerald-600 text-sm sm:text-base font-black text-emerald-700 hover:bg-emerald-50 transition-colors"
                >
                  Book a Demo
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          11. FREQUENTLY ASKED QUESTIONS
          ========================================================================= */}
      <section id="faq" className="py-20 lg:py-28 bg-white border-b border-slate-200/80">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] text-xs sm:text-sm font-black tracking-wider uppercase mb-4">
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 tracking-tight font-['Outfit']">
              Still have questions?
            </h2>
          </div>

          {/* 2-Column Accordion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start max-w-6xl mx-auto">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen ? 'bg-slate-50 border-emerald-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4"
                  >
                    <span className="text-lg sm:text-xl xl:text-2xl font-black text-slate-900 leading-snug">
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 text-base sm:text-lg xl:text-xl text-slate-600 leading-relaxed border-t border-slate-150 animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          12. FINAL CALL TO ACTION BANNER
          ========================================================================= */}
      <section className="py-20 bg-white">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          
          <div className="relative rounded-3xl bg-[#064e3b] overflow-hidden p-10 sm:p-16 lg:p-20 text-white shadow-2xl">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
              
              {/* Left Column Text */}
              <div className="max-w-3xl space-y-4">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight font-['Outfit'] leading-tight">
                  Ready to convert more leads into paying customers?
                </h2>
                <p className="text-lg sm:text-xl xl:text-2xl 2xl:text-3xl text-emerald-100/90 leading-relaxed font-medium">
                  Join 500+ businesses and teams already growing with AutoMask. 
                  Book a free demo and see how it accelerates your sales.
                </p>

                {/* Checkmarks */}
                <div className="flex flex-wrap items-center gap-6 xl:gap-8 pt-4 text-base sm:text-lg xl:text-xl font-bold text-emerald-200">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-300 stroke-[3]" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-300 stroke-[3]" />
                    <span>Live 20-min walkthrough</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-300 stroke-[3]" />
                    <span>Get your business questions answered</span>
                  </div>
                </div>
              </div>

              {/* Right Column Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black text-lg sm:text-xl text-[#064e3b] bg-white hover:bg-emerald-50 transition-all shadow-xl active:scale-98"
                >
                  <span>Book a Free Demo</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('faq');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center justify-center gap-2.5 px-8 py-4.5 rounded-2xl font-bold text-base sm:text-lg text-white bg-white/10 hover:bg-white/15 border border-white/20 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  <span>Talk to Our Team</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          13. FOOTER
          ========================================================================= */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-20 pb-16 text-slate-600 text-sm sm:text-base">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-10 pb-16 border-b border-slate-200">
            
            {/* Brand column */}
            <div className="col-span-2 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#064e3b] flex items-center justify-center text-white">
                  <Bot className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-2xl font-black text-slate-900 tracking-tight font-['Outfit']">
                  Auto<span className="text-emerald-600">Mask</span>
                </span>
              </div>
              <p className="text-slate-500 leading-relaxed max-w-sm text-base">
                AI-powered WhatsApp automation for modern businesses, D2C brands, and service enterprises.
              </p>
              <div className="pt-2 flex items-center gap-3 text-slate-400">
                <span className="text-xs font-bold text-slate-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
                  Meta Official Cloud API Partner
                </span>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-3.5">
              <h5 className="font-black text-slate-900 uppercase tracking-wider text-xs">Product</h5>
              <ul className="space-y-2.5 font-medium">
                <li><a href="#features" className="hover:text-emerald-700">Features</a></li>
                <li><a href="#pricing" className="hover:text-emerald-700">Pricing</a></li>
                <li><a href="#security" className="hover:text-emerald-700">Security</a></li>
                <li><a href="#dashboard" className="hover:text-emerald-700">Integrations</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-700">Changelog</a></li>
              </ul>
            </div>

            {/* Solutions */}
            <div className="space-y-3.5">
              <h5 className="font-black text-slate-900 uppercase tracking-wider text-xs">Solutions</h5>
              <ul className="space-y-2.5 font-medium">
                <li><button onClick={() => { setActiveSegment('d2c'); document.getElementById('solutions')?.scrollIntoView(); }} className="hover:text-emerald-700 text-left">D2C & E-Commerce</button></li>
                <li><button onClick={() => { setActiveSegment('real-estate'); document.getElementById('solutions')?.scrollIntoView(); }} className="hover:text-emerald-700 text-left">Real Estate</button></li>
                <li><button onClick={() => { setActiveSegment('healthcare'); document.getElementById('solutions')?.scrollIntoView(); }} className="hover:text-emerald-700 text-left">Healthcare & Clinics</button></li>
                <li><button onClick={() => { setActiveSegment('education'); document.getElementById('solutions')?.scrollIntoView(); }} className="hover:text-emerald-700 text-left">Education & Institutes</button></li>
                <li><button onClick={() => { setActiveSegment('services'); document.getElementById('solutions')?.scrollIntoView(); }} className="hover:text-emerald-700 text-left">Professional Services</button></li>
                <li><button onClick={() => { setActiveSegment('saas'); document.getElementById('solutions')?.scrollIntoView(); }} className="hover:text-emerald-700 text-left">SaaS & Agencies</button></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-3.5">
              <h5 className="font-black text-slate-900 uppercase tracking-wider text-xs">Resources</h5>
              <ul className="space-y-2.5 font-medium">
                <li><a href="#how-it-works" className="hover:text-emerald-700">Blog</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-700">Help Center</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-700">Guides</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-700">API Docs</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-700">Case Studies</a></li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-3.5">
              <h5 className="font-black text-slate-900 uppercase tracking-wider text-xs">Company</h5>
              <ul className="space-y-2.5 font-medium">
                <li><a href="#how-it-works" className="hover:text-emerald-700">About Us</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-700">Careers</a></li>
                <li><a href="#security" className="hover:text-emerald-700">Privacy Policy</a></li>
                <li><a href="#security" className="hover:text-emerald-700">Terms of Service</a></li>
                <li><a href="#faq" className="hover:text-emerald-700">Contact Us</a></li>
                <li>
                  <button 
                    onClick={onNavigateToAdminLogin}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                  >
                    Super Admin Portal
                  </button>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 font-medium">
            <div>
              © 2026 AutoMask. All rights reserved.
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span>Made with</span>
              <span className="text-red-500">❤️</span>
              <span>in India</span>
            </div>
          </div>

        </div>
      </footer>

      {/* =========================================================================
          14. INTERACTIVE BOOK A DEMO MODAL
          ========================================================================= */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            
            <button
              onClick={() => { setIsDemoModalOpen(false); setDemoSubmitted(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!demoSubmitted ? (
              <div>
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Free 20-Minute Strategy Session</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 font-['Outfit']">
                    Book a Free Demo for Your Business
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    See how AutoMask can automate your lead qualification, appointment booking, and customer retention.
                  </p>
                </div>

                <form onSubmit={handleDemoSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Chandra"
                      value={demoFormData.fullName}
                      onChange={e => setDemoFormData({ ...demoFormData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Company / Business Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Enterprises / UrbanNest Living"
                      value={demoFormData.businessName}
                      onChange={e => setDemoFormData({ ...demoFormData, businessName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">WhatsApp Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={demoFormData.phone}
                        onChange={e => setDemoFormData({ ...demoFormData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Business Industry</label>
                      <select
                        value={demoFormData.industry}
                        onChange={e => setDemoFormData({ ...demoFormData, industry: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-slate-900 bg-white"
                      >
                        <option>D2C & E-Commerce</option>
                        <option>Real Estate & Construction</option>
                        <option>Healthcare, Doctors & Clinics</option>
                        <option>Education & Coaching</option>
                        <option>Financial & Legal Advisory</option>
                        <option>SaaS, IT & Digital Agency</option>
                        <option>Local Retail & Services</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Estimated Monthly Customer Enquiries</label>
                    <select
                      value={demoFormData.monthlyEnquiries}
                      onChange={e => setDemoFormData({ ...demoFormData, monthlyEnquiries: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-slate-900 bg-white"
                    >
                      <option>Under 200 enquiries / mo</option>
                      <option>200 - 1,000 enquiries / mo</option>
                      <option>1,000 - 5,000 enquiries / mo</option>
                      <option>5,000+ enquiries / mo</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 rounded-lg bg-[#065f46] hover:bg-[#047857] text-white font-bold text-sm shadow-md transition-all active:scale-98"
                    >
                      Schedule Free Business Strategy Demo
                    </button>
                  </div>

                  <p className="text-[11px] text-center text-slate-400">
                    No spam. We will send a WhatsApp invite for your 20-minute product tour.
                  </p>
                </form>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 font-['Outfit']">
                  Demo Request Confirmed!
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Thank you, <span className="font-bold text-slate-900">{demoFormData.fullName || 'Sir/Madam'}</span>! A senior automation strategist will reach out on WhatsApp at <span className="font-bold text-slate-900">{demoFormData.phone || 'your number'}</span> within 15 minutes.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setIsDemoModalOpen(false);
                      onLaunchDemo('admin');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Launch Interactive App Preview
                  </button>
                  <button
                    onClick={() => setIsDemoModalOpen(false)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
