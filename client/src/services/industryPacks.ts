import { InteractiveButton } from '../types';

export type BusinessSectorId = 
  | 'ALL'
  | 'GENERAL'
  | 'ECOMMERCE'
  | 'HEALTHCARE'
  | 'REAL_ESTATE'
  | 'HOSPITALITY'
  | 'AUTOMOTIVE'
  | 'EDUCATION'
  | 'FINANCIAL_SERVICES'
  | 'SERVICES';

export interface IndustryTemplatePreset {
  id: string;
  name: string;
  label: string;
  category: 'MARKETING' | 'UTILITY';
  industry: BusinessSectorId;
  headerText: string;
  bodyText: string;
  footerText: string;
  buttons: InteractiveButton[];
  defaultVar1: string;
  defaultVar2: string;
}

export interface BusinessSectorConfig {
  id: BusinessSectorId;
  label: string;
  shortName: string;
  iconName: string;
  badgeClass: string;
  sampleBrandName: string;
  customerTermSingle: string;
  customerTermPlural: string;
  description: string;
  recommendedTags: string[];
  presets: IndustryTemplatePreset[];
}

export const BUSINESS_SECTORS: Record<Exclude<BusinessSectorId, 'ALL'>, BusinessSectorConfig> = {
  GENERAL: {
    id: 'GENERAL',
    label: 'General Business & Enterprises',
    shortName: 'General',
    iconName: 'Briefcase',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    sampleBrandName: 'Nexus Global Enterprises',
    customerTermSingle: 'Customer',
    customerTermPlural: 'Customers',
    description: 'Any retail, corporate, B2B or consumer business delivering WhatsApp updates.',
    recommendedTags: ['VIP Client', 'High Value', 'New Lead', 'Active Customer', 'Follow-up Required', 'Wholesale Inquiry'],
    presets: [
      {
        id: 'gen-festive-promo',
        name: 'seasonal_privilege_offer',
        label: '✨ Seasonal Privilege Offer',
        category: 'MARKETING',
        industry: 'GENERAL',
        headerText: '✨ Exclusive Client Privilege',
        bodyText: 'Greetings {{1}}! As a valued partner, you are eligible for our exclusive annual upgrade offer valid until {{2}}. Choose an option below to proceed:',
        footerText: 'Official WhatsApp Desk • Verified Business',
        defaultVar1: 'Rajesh',
        defaultVar2: '31st October',
        buttons: [
          { id: 'btn-gen-claim', title: '🎁 Claim Offer', type: 'QUICK_REPLY', payload: 'Client requested seasonal offer claim details.' },
          { id: 'btn-gen-cat', title: '📄 View Catalog', type: 'URL', url: 'https://nexusenterprises.com/catalog' },
          { id: 'btn-gen-call', title: '📞 Speak to Advisor', type: 'CALL', phoneNumber: '+919876543210' },
        ],
      },
      {
        id: 'gen-meeting-reminder',
        name: 'consultation_scheduled_alert',
        label: '📅 Consultation Reminder',
        category: 'UTILITY',
        industry: 'GENERAL',
        headerText: '📅 Scheduled Business Session',
        bodyText: 'Hello {{1}}, this is a reminder for your confirmed business appointment on {{2}}. Please confirm your availability or request a reschedule:',
        footerText: 'Reply CONFIRM or RESCHEDULE',
        defaultVar1: 'Sunil',
        defaultVar2: 'Tomorrow at 3:00 PM',
        buttons: [
          { id: 'btn-gen-confirm', title: '✅ Confirm Session', type: 'QUICK_REPLY', payload: 'Appointment confirmed by client.' },
          { id: 'btn-gen-resched', title: '🔄 Reschedule Slot', type: 'QUICK_REPLY', payload: 'Client requested appointment reschedule.' },
        ],
      },
      {
        id: 'gen-auth-otp',
        name: 'secure_login_otp_alert',
        label: '🔐 Universal Security OTP',
        category: 'UTILITY',
        industry: 'GENERAL',
        headerText: '🔐 One-Time Security Code',
        bodyText: 'Your verification OTP for account authentication is {{1}}. Valid for {{2}} minutes. Please do not share this confidential code with anyone.',
        footerText: 'AutoMask Secure Authentication',
        defaultVar1: '849201',
        defaultVar2: '10',
        buttons: [
          { id: 'btn-gen-copy', title: '📋 Copy Security Code', type: 'QUICK_REPLY', payload: 'OTP verification confirmed by user.' },
        ],
      },
    ],
  },

  ECOMMERCE: {
    id: 'ECOMMERCE',
    label: 'E-Commerce, D2C & Retail',
    shortName: 'E-Commerce',
    iconName: 'ShoppingBag',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    sampleBrandName: 'LuxeCart D2C Store',
    customerTermSingle: 'Shopper',
    customerTermPlural: 'Shoppers / Buyers',
    description: 'Online stores, fashion brands, electronics, grocery, and direct-to-consumer businesses.',
    recommendedTags: ['Abandoned Cart', 'VIP Buyer', 'COD Verified', 'Flash Sale Lead', 'First Order', 'Repeat Customer', 'High AOV'],
    presets: [
      {
        id: 'ecom-flash-sale',
        name: 'weekend_mega_flash_sale',
        label: '🛍️ Weekend Flash Sale 40% Off',
        category: 'MARKETING',
        industry: 'ECOMMERCE',
        headerText: '🛍️ LuxeCart Flash Weekend Sale',
        bodyText: 'Namaste {{1}}! Exclusive 40% OFF on our best-selling collections until {{2}}. Enjoy free express shipping on all prepaid orders. Tap below to shop:',
        footerText: 'Limited Stock • Use Code FLASH40',
        defaultVar1: 'Pooja',
        defaultVar2: 'Sunday Midnight',
        buttons: [
          { id: 'btn-ecom-shop', title: '🛒 Shop Sale Now', type: 'URL', url: 'https://luxecart.in/flash-sale' },
          { id: 'btn-ecom-cat', title: '📄 Download Catalog', type: 'URL', url: 'https://luxecart.in/catalog.pdf' },
          { id: 'btn-ecom-chat', title: '💬 WhatsApp Support', type: 'QUICK_REPLY', payload: 'Customer inquiry for flash sale voucher.' },
        ],
      },
      {
        id: 'ecom-order-shipped',
        name: 'order_dispatched_tracking',
        label: '📦 Order Shipped & Delivery Tracking',
        category: 'UTILITY',
        industry: 'ECOMMERCE',
        headerText: '📦 Your Order is on the Way!',
        bodyText: 'Hello {{1}}! Good news! Your order #{{2}} has been dispatched via BlueDart Express and is scheduled for delivery today. Track live package status:',
        footerText: 'Thank you for shopping with LuxeCart',
        defaultVar1: 'Aarav',
        defaultVar2: 'LX-89211',
        buttons: [
          { id: 'btn-ecom-track', title: '🚚 Track Package Live', type: 'URL', url: 'https://luxecart.in/track/LX-89211' },
          { id: 'btn-ecom-mod', title: '🔄 Modify Delivery Time', type: 'QUICK_REPLY', payload: 'Customer requested delivery rescheduling.' },
          { id: 'btn-ecom-call', title: '📞 Courier Helpline', type: 'CALL', phoneNumber: '+919876543210' },
        ],
      },
      {
        id: 'ecom-cart-recovery',
        name: 'abandoned_cart_recovery_alert',
        label: '🛒 Abandoned Cart Recovery (10% Extra Off)',
        category: 'MARKETING',
        industry: 'ECOMMERCE',
        headerText: '🛒 Items Left in Your Cart',
        bodyText: 'Hi {{1}}, you left premium items in your shopping bag! Complete your checkout within {{2}} to unlock an additional 10% instant off discount:',
        footerText: 'Reserved Cart • AutoMask Smart Checkout',
        defaultVar1: 'Neha',
        defaultVar2: '3 hours',
        buttons: [
          { id: 'btn-ecom-checkout', title: '🛍️ Complete Checkout', type: 'URL', url: 'https://luxecart.in/checkout?coupon=SAVE10' },
          { id: 'btn-ecom-help', title: '💬 Ask a Question', type: 'QUICK_REPLY', payload: 'Customer requested assistance with cart payment.' },
        ],
      },
    ],
  },

  HEALTHCARE: {
    id: 'HEALTHCARE',
    label: 'Healthcare, Clinics & Hospitals',
    shortName: 'Healthcare',
    iconName: 'Stethoscope',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-300',
    sampleBrandName: 'CarePoint Super-Speciality Clinics',
    customerTermSingle: 'Patient',
    customerTermPlural: 'Patients',
    description: 'Hospitals, multi-speciality clinics, diagnostic labs, dentists, and wellness centers.',
    recommendedTags: ['Routine Checkup', 'Lab Reports Ready', 'Dental Care', 'Cardiology', 'Follow-up Due', 'VIP Wellness Plan', 'OPD Patient'],
    presets: [
      {
        id: 'health-camp-promo',
        name: 'preventive_health_camp_alert',
        label: '🩺 Preventive Health Camp (50% Off)',
        category: 'MARKETING',
        industry: 'HEALTHCARE',
        headerText: '🩺 CarePoint Annual Health Screening',
        bodyText: 'Dear {{1}}, CarePoint is organizing a comprehensive Preventive Health Camp on {{2}}. 65+ vital blood & cardiac parameters at 50% discount. Tap below to reserve your slot:',
        footerText: 'NABH Accredited Diagnostic Care',
        defaultVar1: 'Ramesh',
        defaultVar2: 'Saturday, 10 AM - 4 PM',
        buttons: [
          { id: 'btn-health-slot', title: '📅 Book Checkup Slot', type: 'QUICK_REPLY', payload: 'Patient requested slot booking for health camp.' },
          { id: 'btn-health-pkg', title: '📄 View Test Package', type: 'URL', url: 'https://carepoint.org/preventive-camp' },
          { id: 'btn-health-call', title: '📞 Hospital Desk', type: 'CALL', phoneNumber: '+919876543210' },
        ],
      },
      {
        id: 'health-appt-reminder',
        name: 'doctor_consultation_reminder',
        label: '📅 Doctor Consultation Reminder',
        category: 'UTILITY',
        industry: 'HEALTHCARE',
        headerText: '📅 Consultation Appointment Reminder',
        bodyText: 'Namaste {{1}}, your consultation with Dr. Sharma is confirmed for {{2}} at CarePoint City Clinic. Please confirm your attendance:',
        footerText: 'CarePoint Appointment Desk',
        defaultVar1: 'Ananya',
        defaultVar2: 'Tomorrow at 11:30 AM',
        buttons: [
          { id: 'btn-health-confirm', title: '✅ Confirm Visit', type: 'QUICK_REPLY', payload: 'Patient confirmed clinic appointment.' },
          { id: 'btn-health-resched', title: '🔄 Reschedule Slot', type: 'QUICK_REPLY', payload: 'Patient requested appointment rescheduling.' },
          { id: 'btn-health-dir', title: '📍 Clinic Directions', type: 'URL', url: 'https://maps.google.com/?q=CarePoint+Clinic' },
        ],
      },
      {
        id: 'health-lab-reports',
        name: 'lab_investigation_report_ready',
        label: '🧪 Diagnostic Reports Ready for Download',
        category: 'UTILITY',
        industry: 'HEALTHCARE',
        headerText: '🧪 Diagnostic Test Reports Ready',
        bodyText: 'Hello {{1}}, your laboratory test results for sample id #{{2}} are verified by our Chief Pathologist and ready for secure download:',
        footerText: 'Confidential Medical Record',
        defaultVar1: 'Sunita',
        defaultVar2: 'LAB-9921',
        buttons: [
          { id: 'btn-health-dl', title: '📄 Download Report PDF', type: 'URL', url: 'https://carepoint.org/reports/LAB-9921' },
          { id: 'btn-health-doc', title: '📞 Speak to Doctor', type: 'CALL', phoneNumber: '+919876543210' },
        ],
      },
    ],
  },

  REAL_ESTATE: {
    id: 'REAL_ESTATE',
    label: 'Real Estate & Properties',
    shortName: 'Real Estate',
    iconName: 'Building2',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-300',
    sampleBrandName: 'Skyline Properties & Residencies',
    customerTermSingle: 'Property Buyer',
    customerTermPlural: 'Buyers / Investors',
    description: 'Property developers, real estate brokers, channel partners, and housing societies.',
    recommendedTags: ['3BHK Luxury', 'Villa Buyer', 'High Budget', 'Site Visit Done', 'NRI Investor', 'Commercial Space', 'Pre-Launch Lead'],
    presets: [
      {
        id: 're-prelaunch-alert',
        name: 'luxury_apartments_prelaunch',
        label: '🏡 Ultra-Luxury 3BHK Pre-Launch',
        category: 'MARKETING',
        industry: 'REAL_ESTATE',
        headerText: '🏡 Skyline Smart Homes Pre-Launch',
        bodyText: 'Dear {{1}}, pre-launch bookings for 3 & 4 BHK Golf-Facing Residences in sector {{2}} are now live! Starting at 1.45 Cr with flexible 10:90 payment scheme. Tap below to book VIP walkthrough:',
        footerText: 'RERA Registered: UPRERA78291',
        defaultVar1: 'Vikram',
        defaultVar2: 'Sector 150',
        buttons: [
          { id: 'btn-re-visit', title: '🗓️ Book VIP Site Visit', type: 'QUICK_REPLY', payload: 'Buyer requested VIP site visit walkthrough.' },
          { id: 'btn-re-brochure', title: '📄 Floor Plans PDF', type: 'URL', url: 'https://skylinerealty.com/plans.pdf' },
          { id: 'btn-re-call', title: '📞 Call Sales Manager', type: 'CALL', phoneNumber: '+919876543210' },
        ],
      },
      {
        id: 're-sitevisit-confirm',
        name: 'property_site_visit_pass',
        label: '🚗 Site Visit Confirmation & GPS Pass',
        category: 'UTILITY',
        industry: 'REAL_ESTATE',
        headerText: '🚗 Property Walkthrough Confirmed',
        bodyText: 'Hello {{1}}! Your private site visit is scheduled for {{2}}. Dedicated relationship manager has been assigned to welcome you at the experience gallery:',
        footerText: 'Skyline Hospitality Desk',
        defaultVar1: 'Deepak',
        defaultVar2: 'Sunday at 2:00 PM',
        buttons: [
          { id: 'btn-re-map', title: '📍 Open GPS Location', type: 'URL', url: 'https://maps.google.com/?q=Skyline+Residencies' },
          { id: 'btn-re-resched', title: '🔄 Change Timings', type: 'QUICK_REPLY', payload: 'Buyer requested site visit time alteration.' },
          { id: 'btn-re-driver', title: '📞 Contact Executive', type: 'CALL', phoneNumber: '+919876543210' },
        ],
      },
    ],
  },

  HOSPITALITY: {
    id: 'HOSPITALITY',
    label: 'Hospitality, Dining & Hotels',
    shortName: 'Hospitality',
    iconName: 'UtensilsCrossed',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-300',
    sampleBrandName: 'Grand Oasis Resorts & Fine Dining',
    customerTermSingle: 'Guest',
    customerTermPlural: 'Guests / Diners',
    description: 'Hotels, resorts, cafes, fine dining restaurants, banquet halls, and travel operators.',
    recommendedTags: ['Weekend Stay', 'Table Booking', 'VIP Diner', 'Corporate Event', 'Banquet Lead', 'Loyalty Member'],
    presets: [
      {
        id: 'hosp-buffet-fest',
        name: 'weekend_gourmet_buffet_bogo',
        label: '🍽️ Buy 1 Get 1 Weekend Gourmet Buffet',
        category: 'MARKETING',
        industry: 'HOSPITALITY',
        headerText: '🍽️ Grand Oasis Weekend Gastronomy',
        bodyText: 'Hello {{1}}! Indulge in our lavish Chef Special 7-Course International Buffet this {{2}}. Buy 1 Get 1 Complimentary with live music. Tap below to reserve your table:',
        footerText: 'Valet Parking Available • Prior Booking Mandatory',
        defaultVar1: 'Varun',
        defaultVar2: 'Saturday & Sunday',
        buttons: [
          { id: 'btn-hosp-table', title: '🍷 Reserve Table Now', type: 'QUICK_REPLY', payload: 'Guest requested table reservation for weekend buffet.' },
          { id: 'btn-hosp-menu', title: '📜 View Special Menu', type: 'URL', url: 'https://grandoasis.in/buffet-menu' },
          { id: 'btn-hosp-call', title: '📞 Call Host Desk', type: 'CALL', phoneNumber: '+919876543210' },
        ],
      },
      {
        id: 'hosp-checkin-key',
        name: 'hotel_resort_checkin_pass',
        label: '🛎️ Hotel Check-In Confirmation & Keypass',
        category: 'UTILITY',
        industry: 'HOSPITALITY',
        headerText: '🛎️ Welcome to Grand Oasis Resorts',
        bodyText: 'Namaste {{1}}! Your luxury suite booking for {{2}} is confirmed. Skip the reception queue and complete your contactless express check-in on WhatsApp:',
        footerText: 'Grand Oasis Concierge Desk',
        defaultVar1: 'Manish',
        defaultVar2: '28th Oct - 30th Oct',
        buttons: [
          { id: 'btn-hosp-checkin', title: '✅ Express Check-In', type: 'URL', url: 'https://grandoasis.in/express-checkin' },
          { id: 'btn-hosp-dir', title: '📍 Resort Directions', type: 'URL', url: 'https://maps.google.com/?q=Grand+Oasis+Resort' },
          { id: 'btn-hosp-concierge', title: '📞 Concierge Desk', type: 'CALL', phoneNumber: '+919876543210' },
        ],
      },
    ],
  },

  AUTOMOTIVE: {
    id: 'AUTOMOTIVE',
    label: 'Automotive, Showrooms & Service',
    shortName: 'Automotive',
    iconName: 'Car',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-300',
    sampleBrandName: 'Apex Motors & Service Centers',
    customerTermSingle: 'Car Owner',
    customerTermPlural: 'Owners / Car Buyers',
    description: 'Automobile dealerships, bike showrooms, auto care workshops, and insurance renewals.',
    recommendedTags: ['Test Drive Scheduled', 'Periodic Service Due', 'Insurance Renewal', 'New SUV Launch', 'Warranty Expiring', 'Pre-Owned Car Lead'],
    presets: [
      {
        id: 'auto-test-drive',
        name: 'new_suv_test_drive_invitation',
        label: '🚘 All-New SUV Test Drive Experience',
        category: 'MARKETING',
        industry: 'AUTOMOTIVE',
        headerText: '🚘 The All-New Apex Titan 4x4',
        bodyText: 'Dear {{1}}, official test drives for the all-new Apex Titan Turbo SUV are now open until {{2}}. Experience Level-2 ADAS, panoramic sunroof, and 4WD drive modes. Book your drive:',
        footerText: 'Apex Motors Flagship Dealership',
        defaultVar1: 'Rohit',
        defaultVar2: 'Sunday 6 PM',
        buttons: [
          { id: 'btn-auto-drive', title: '🚗 Book Test Drive', type: 'QUICK_REPLY', payload: 'Customer requested test drive slot.' },
          { id: 'btn-auto-specs', title: '📄 Spec Sheet PDF', type: 'URL', url: 'https://apexmotors.com/titan-specs.pdf' },
          { id: 'btn-auto-call', title: '📞 Showroom Desk', type: 'CALL', phoneNumber: '+919876543210' },
        ],
      },
      {
        id: 'auto-service-due',
        name: 'periodic_maintenance_service_due',
        label: '🔧 10,000 KM Periodic Service Due',
        category: 'UTILITY',
        industry: 'AUTOMOTIVE',
        headerText: '🔧 Vehicle Maintenance Reminder',
        bodyText: 'Namaste {{1}}, your vehicle service is due on {{2}} to maintain peak engine efficiency and active warranty. Free doorstep pick-up & drop is available:',
        footerText: 'Authorized Service Center',
        defaultVar1: 'Sanjay',
        defaultVar2: '29th October',
        buttons: [
          { id: 'btn-auto-service', title: '📅 Book Service Bay', type: 'QUICK_REPLY', payload: 'Vehicle owner requested service booking.' },
          { id: 'btn-auto-loc', title: '📍 Workshop Map', type: 'URL', url: 'https://maps.google.com/?q=Apex+Service' },
          { id: 'btn-auto-advisor', title: '📞 Service Advisor', type: 'CALL', phoneNumber: '+919876543210' },
        ],
      },
    ],
  },

  FINANCIAL_SERVICES: {
    id: 'FINANCIAL_SERVICES',
    label: 'Banking, FinTech & Insurance',
    shortName: 'FinTech & Banking',
    iconName: 'TrendingUp',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-300',
    sampleBrandName: 'Zenith Wealth & Finance',
    customerTermSingle: 'Investor',
    customerTermPlural: 'Investors / Borrowers',
    description: 'Banking, NBFCs, business loans, health insurance, mutual funds, and wealth management.',
    recommendedTags: ['Home Loan', 'Mutual Funds', 'Insurance Expiring', 'High Net Worth', 'KYC Pending', 'Pre-Approved Credit'],
    presets: [
      {
        id: 'fin-loan-preapproved',
        name: 'preapproved_business_credit_line',
        label: '📈 Pre-Approved Business Loan at 8.49%',
        category: 'MARKETING',
        industry: 'FINANCIAL_SERVICES',
        headerText: '📈 Zenith Fast-Track Credit Line',
        bodyText: 'Dear {{1}}, your enterprise qualifies for pre-approved business loan up to 25 Lakhs at special rate 8.49% before {{2}}. 100% digital paperwork, disbursed in 2 hours:',
        footerText: 'RBI Regulated NBFC Partner',
        defaultVar1: 'Harish',
        defaultVar2: '31st October',
        buttons: [
          { id: 'btn-fin-check', title: '💼 Check Sanction', type: 'QUICK_REPLY', payload: 'Client requested loan sanction eligibility.' },
          { id: 'btn-fin-rates', title: '📄 View Rate Chart', type: 'URL', url: 'https://zenithfinance.com/rates' },
          { id: 'btn-fin-rm', title: '📞 Relationship Mgr', type: 'CALL', phoneNumber: '+919876543210' },
        ],
      },
      {
        id: 'fin-emi-reminder',
        name: 'monthly_emi_installment_due',
        label: '💳 Monthly EMI Payment Due Alert',
        category: 'UTILITY',
        industry: 'FINANCIAL_SERVICES',
        headerText: '💳 Monthly EMI Installment Alert',
        bodyText: 'Hello {{1}}, gentle reminder that your loan EMI of Rs. {{2}} is due for processing tomorrow. Ensure sufficient balance or pay directly via UPI:',
        footerText: 'Avoid late fee & credit score impact',
        defaultVar1: 'Arun',
        defaultVar2: '14,850',
        buttons: [
          { id: 'btn-fin-pay', title: '💳 Pay via UPI Now', type: 'URL', url: 'https://zenithfinance.com/quickpay' },
          { id: 'btn-fin-stmt', title: '📄 View Statement', type: 'URL', url: 'https://zenithfinance.com/statement' },
          { id: 'btn-fin-help', title: '📞 Loan Desk Support', type: 'CALL', phoneNumber: '+919876543210' },
        ],
      },
    ],
  },

  EDUCATION: {
    id: 'EDUCATION',
    label: 'Education, Coaching & EdTech',
    shortName: 'Education',
    iconName: 'GraduationCap',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-300',
    sampleBrandName: 'Prakash Institute Kota',
    customerTermSingle: 'Student',
    customerTermPlural: 'Students / Parents',
    description: 'Competitive exam coaching (JEE/NEET), schools, universities, colleges, and online EdTech.',
    recommendedTags: ['JEE 2027', 'NEET', 'Dropper Batch', 'Foundation', 'PSAT Scholarship', 'Class11', 'Class12', 'New Lead', 'High Intent'],
    presets: [
      {
        id: 'edu-admissions',
        name: 'jee_neet_admissions_2027',
        label: '🎓 JEE & NEET 2027 Batch Admissions',
        category: 'MARKETING',
        industry: 'EDUCATION',
        headerText: '🎓 Prakash Institute Admissions 2027',
        bodyText: 'Namaste {{1}}! Admissions for 2027 Dropper & Foundation batches are now open. Top ranker faculty & daily DPPs. Avail early-bird fee concession before {{2}}. Choose an option below:',
        footerText: 'Official WhatsApp Desk • Prakash Institute',
        defaultVar1: 'Amit',
        defaultVar2: 'Sunday 5:00 PM',
        buttons: [
          { id: 'btn-edu-fee', title: '💰 View Fee Details', type: 'QUICK_REPLY', payload: 'Fee details requested for 2027 batches.' },
          { id: 'btn-edu-syllabus', title: '📄 Syllabus PDF', type: 'URL', url: 'https://prakashinstitute.edu.in/jee-syllabus.pdf' },
          { id: 'btn-edu-call', title: '📞 Call Counsellor', type: 'CALL', phoneNumber: '+919876543210' },
        ],
      },
      {
        id: 'edu-demo-reminder',
        name: 'physics_demo_reminder',
        label: '📅 Free Masterclass Demo Reminder',
        category: 'UTILITY',
        industry: 'EDUCATION',
        headerText: '📅 Masterclass Session Reminder',
        bodyText: 'Hello {{1}}! This is a reminder for your Free Demo Masterclass in Physics on {{2}} with Dr. Prakash Sharma at Prakash Institute. Please confirm your attendance:',
        footerText: 'Reply CONFIRM or CANCEL',
        defaultVar1: 'Rhea',
        defaultVar2: 'Tomorrow at 10 AM',
        buttons: [
          { id: 'btn-edu-confirm', title: '✅ Confirm Seat', type: 'QUICK_REPLY', payload: 'Attendance confirmed for demo session.' },
          { id: 'btn-edu-resched', title: '🔄 Reschedule Slot', type: 'QUICK_REPLY', payload: 'Reschedule request sent to admissions desk.' },
        ],
      },
      {
        id: 'edu-scholarship',
        name: 'psat_scholarship_alert',
        label: '🏆 PSAT Scholarship Exam Alert',
        category: 'MARKETING',
        industry: 'EDUCATION',
        headerText: '🏆 Prakash Talent Search (PSAT)',
        bodyText: 'Dear {{1}}, Prakash Scholarship Admission Test (PSAT) will be held on {{2}}. Score above 85% to receive up to 50% tuition fee waiver. Tap below to register:',
        footerText: 'Strictly verified merit scholarship',
        defaultVar1: 'Karan',
        defaultVar2: 'Sunday 10:00 AM',
        buttons: [
          { id: 'btn-edu-psat-reg', title: '📝 Register for PSAT', type: 'QUICK_REPLY', payload: 'PSAT scholarship exam slot booked.' },
          { id: 'btn-edu-psat-rules', title: '🌐 View Syllabus', type: 'URL', url: 'https://prakashinstitute.edu.in/psat-syllabus' },
          { id: 'btn-edu-call2', title: '📞 Call Counsellor', type: 'CALL', phoneNumber: '+919876543210' },
        ],
      },
    ],
  },

  SERVICES: {
    id: 'SERVICES',
    label: 'IT, SaaS, Agencies & Consulting',
    shortName: 'IT & Services',
    iconName: 'Laptop',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-300',
    sampleBrandName: 'CloudScale Technologies & SaaS',
    customerTermSingle: 'Client',
    customerTermPlural: 'Clients / Accounts',
    description: 'Software development, digital marketing agencies, SaaS products, legal and consulting firms.',
    recommendedTags: ['Enterprise Demo', 'SaaS Renewal', 'Pilot Client', 'Agency Retainer', 'High Priority', 'Proposal Sent'],
    presets: [
      {
        id: 'srv-demo-book',
        name: 'enterprise_software_demo_invite',
        label: '🚀 Enterprise SaaS Platform Demo',
        category: 'MARKETING',
        industry: 'SERVICES',
        headerText: '🚀 CloudScale AI Automation Demo',
        bodyText: 'Hello {{1}}, see how CloudScale helps enterprises automate 85% of repetitive customer communications. Schedule your 15-minute live platform walkthrough before {{2}}:',
        footerText: 'SOC-2 Compliant Enterprise AI',
        defaultVar1: 'Sameer',
        defaultVar2: 'Friday',
        buttons: [
          { id: 'btn-srv-demo', title: '🗓️ Book 15-Min Demo', type: 'QUICK_REPLY', payload: 'Client requested enterprise product demo.' },
          { id: 'btn-srv-case', title: '📄 Case Studies PDF', type: 'URL', url: 'https://cloudscale.ai/cases.pdf' },
          { id: 'btn-srv-call', title: '📞 Speak to Architect', type: 'CALL', phoneNumber: '+919876543210' },
        ],
      },
      {
        id: 'srv-renewal-alert',
        name: 'subscription_annual_renewal_notice',
        label: '🔄 Annual Subscription Renewal',
        category: 'UTILITY',
        industry: 'SERVICES',
        headerText: '🔄 Service Subscription Renewal',
        bodyText: 'Dear {{1}}, your CloudScale Annual Enterprise Subscription is due for renewal on {{2}}. Renew early to retain grandfathered pricing:',
        footerText: 'CloudScale Account Services',
        defaultVar1: 'Dev',
        defaultVar2: '5th November',
        buttons: [
          { id: 'btn-srv-renew', title: '💳 Renew License Online', type: 'URL', url: 'https://cloudscale.ai/renew' },
          { id: 'btn-srv-rep', title: '📞 Call Account Mgr', type: 'CALL', phoneNumber: '+919876543210' },
        ],
      },
    ],
  },
};

export const ALL_SECTOR_KEYS: Exclude<BusinessSectorId, 'ALL'>[] = [
  'GENERAL',
  'ECOMMERCE',
  'HEALTHCARE',
  'REAL_ESTATE',
  'HOSPITALITY',
  'AUTOMOTIVE',
  'FINANCIAL_SERVICES',
  'EDUCATION',
  'SERVICES',
];

export const getAllIndustryPresets = (): IndustryTemplatePreset[] => {
  return ALL_SECTOR_KEYS.flatMap(key => BUSINESS_SECTORS[key].presets);
};
