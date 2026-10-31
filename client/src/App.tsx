import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { SharedInboxView } from './components/inbox/SharedInboxView';
import { LeadsView } from './components/leads/LeadsView';
import { AutomationView } from './components/automation/AutomationView';
import { AIAssistantView } from './components/ai/AIAssistantView';
import { BookingsView } from './components/bookings/BookingsView';
import { BillingView } from './components/billing/BillingView';
import { SettingsView } from './components/settings/SettingsView';
import { ContactsView } from './components/contacts/ContactsView';
import { WorkflowsView } from './components/workflows/WorkflowsView';
import { WorkflowCanvasView } from './components/workflows/WorkflowCanvasView';
import { TeamView } from './components/team/TeamView';
import { RolesPermissionsView } from './components/team/RolesPermissionsView';
import { IntegrationsView } from './components/integrations/IntegrationsView';
import { WhatsAppPhoneSimulator } from './components/simulator/WhatsAppPhoneSimulator';
import { AddLeadModal } from './components/leads/AddLeadModal';
import { BroadcastModal } from './components/dashboard/BroadcastModal';
import { BroadcastTemplatesView } from './components/broadcast/BroadcastTemplatesView';
import { BroadcastWizardView } from './components/broadcast/BroadcastWizardView';
import { AIAssistantConfigView } from './components/ai/AIAssistantConfigView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { SupportGrantModal } from './components/layout/SupportGrantModal';
import { BusinessProfileModal } from './components/layout/BusinessProfileModal';
import { LandingPage } from './components/landing/LandingPage';
import { UserLoginPage } from './components/auth/UserLoginPage';
import { PlatformAdminLoginPage } from './components/auth/PlatformAdminLoginPage';
import { PlatformConsoleView } from './components/platform/PlatformConsoleView';
import { authApi } from './services/api';
import { 
  TabType, 
  Conversation, 
  AutomationRule, 
  UsageQuota, 
  Lead, 
  LeadStatus, 
  KnowledgeItem,
  Slot,
  Appointment,
  User,
  UserRole,
  Contact
} from './types';
import { 
  dashboardApi, 
  conversationsApi, 
  leadsApi, 
  automationsApi, 
  knowledgeApi, 
  bookingsApi, 
  whatsappApi,
  contactsApi,
  setApiAuthContext,
  ApiError
} from './services/api';
import { 
  USERS_BY_ROLE, 
  INITIAL_CONVERSATIONS, 
  INITIAL_RULES, 
  INITIAL_LEADS, 
  INITIAL_KNOWLEDGE_ITEMS, 
  INITIAL_SLOTS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_USAGE,
  INITIAL_CONTACTS
} from './services/fixtures';
import { Loader2, RefreshCw, CheckCircle2, AlertCircle, Wifi, WifiOff } from 'lucide-react';

export type PageView = 'landing' | 'user-login' | 'admin-login' | 'app';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('automask_token');
  });

  const [activeView, setActiveView] = useState<PageView>(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const token = localStorage.getItem('automask_token');

    // Only allow entering 'app' if token exists
    if ((view === 'app' || view === 'admin' || view === 'platform') && token) {
      return 'app';
    }
    if (view === 'user-login' || view === 'admin-login') {
      return view as PageView;
    }
    // If not authenticated, default to user-login (or landing)
    return token ? 'app' : 'user-login';
  });

  // Verify existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('automask_token');
    if (token) {
      authApi.getMe().then((res) => {
        if (res?.user) {
          setCurrentUser(res.user);
          setIsAuthenticated(true);
          if (res.workspace) {
            setActiveWorkspace(res.workspace);
          }
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('automask_token');
          setActiveView('user-login');
        }
      }).catch(() => {
        setIsAuthenticated(false);
        localStorage.removeItem('automask_token');
        setActiveView('user-login');
      });
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const role = params.get('role');
    if (view === 'admin' || view === 'platform' || role === 'platform_admin') {
      return USERS_BY_ROLE.platform_admin;
    }
    if (role && (USERS_BY_ROLE as any)[role]) {
      return (USERS_BY_ROLE as any)[role];
    }
    return USERS_BY_ROLE.admin;
  });
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isSupportGrantModalOpen, setIsSupportGrantModalOpen] = useState(false);
  const [isBusinessProfileModalOpen, setIsBusinessProfileModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Network & Sync status
  const [apiConnected, setApiConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Core application states initialized with isolated fixtures and hydrated from API
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(INITIAL_CONVERSATIONS[0]);
  const [rules, setRules] = useState<AutomationRule[]>(INITIAL_RULES);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS as Contact[]);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>(INITIAL_KNOWLEDGE_ITEMS);
  const [slots, setSlots] = useState<Slot[]>(INITIAL_SLOTS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [usage, setUsage] = useState<UsageQuota>(INITIAL_USAGE);
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<any>({
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Prakash Institute Kota',
    businessName: 'Prakash Institute Kota',
    industry: 'EDUCATION',
    customerTerm: 'Students',
  });

  const handleUpdateWorkspace = (updated: Partial<any>) => {
    setActiveWorkspace((prev: any) => ({
      ...prev,
      ...updated,
      name: updated.businessName || prev.name,
    }));
  };

  // Centralized fetcher that hydrates UI from backend REST endpoints
  const fetchAllData = useCallback(async (role?: UserRole) => {
    const activeRole = role || currentUser.role;
    setIsSyncing(true);
    setSyncError(null);

    try {
      // 1. Dashboard & Workspace Metrics
      try {
        const dash = await dashboardApi.getDashboard();
        if (dash.metrics) setDashboardMetrics(dash.metrics);
        if (dash.workspace) setActiveWorkspace(dash.workspace);
        if (dash.usage) setUsage(dash.usage);
      } catch (err: any) {
        console.warn('Dashboard fetch notice:', err?.message);
      }

      // 2. Real Conversations list
      try {
        const convRes = await conversationsApi.list();
        if (convRes.conversations && convRes.conversations.length > 0) {
          setConversations(convRes.conversations);
          setSelectedConversation(prev => {
            if (!prev) return convRes.conversations[0];
            const found = convRes.conversations.find(c => c.id === prev.id);
            return found || convRes.conversations[0];
          });
        }
      } catch (err: any) {
        console.warn('Conversations fetch notice:', err?.message);
      }

      // 3. Leads CRM
      try {
        const leadsRes = await leadsApi.list();
        if (leadsRes.leads && leadsRes.leads.length > 0) {
          setLeads(leadsRes.leads);
        }
      } catch (err: any) {
        console.warn('Leads fetch notice:', err?.message);
      }

      // 4. Contacts CRM
      try {
        const contactsRes = await contactsApi.list();
        if (contactsRes.contacts && contactsRes.contacts.length > 0) {
          setContacts(contactsRes.contacts);
        }
      } catch (err: any) {
        console.warn('Contacts fetch notice:', err?.message);
      }

      // 5. Automation Rules (Owner & Admin only, agents 403)
      if (activeRole !== 'agent') {
        try {
          const rulesRes = await automationsApi.list();
          if (rulesRes.rules && rulesRes.rules.length > 0) {
            setRules(rulesRes.rules);
          }
        } catch (err: any) {
          console.warn('Rules fetch notice:', err?.message);
        }
      }

      // 6. Knowledge Base
      try {
        const kbRes = await knowledgeApi.list();
        if (kbRes.knowledgeItems && kbRes.knowledgeItems.length > 0) {
          setKnowledgeItems(kbRes.knowledgeItems);
        }
      } catch (err: any) {
        console.warn('Knowledge fetch notice:', err?.message);
      }

      // 7. Bookings & Slots
      try {
        const bookingsRes = await bookingsApi.list();
        if (bookingsRes.slots) setSlots(bookingsRes.slots);
        if (bookingsRes.appointments) setAppointments(bookingsRes.appointments);
      } catch (err: any) {
        console.warn('Bookings fetch notice:', err?.message);
      }

      setApiConnected(true);
    } catch (err: any) {
      console.error('API Sync Error:', err);
      setApiConnected(false);
      setSyncError(err?.message || 'Failed to connect to AutoMask API server');
    } finally {
      setIsSyncing(false);
    }
  }, [currentUser.role]);

  // Sync API auth context on initial mount and when user role changes
  useEffect(() => {
    setApiAuthContext({
      role: currentUser.role,
      userId: currentUser.id,
      workspaceId: '11111111-1111-4111-8111-111111111111',
    });
    fetchAllData(currentUser.role);
  }, [currentUser, fetchAllData]);

  const handleRoleChange = (newRole: UserRole) => {
    const user = USERS_BY_ROLE[newRole];
    setCurrentUser(user);
    setApiAuthContext({
      role: user.role,
      userId: user.id,
      workspaceId: '11111111-1111-4111-8111-111111111111',
    });
    fetchAllData(newRole);
  };

  // 1. Toggle automation rule via API
  const handleToggleRule = async (ruleId: string) => {
    try {
      const res = await automationsApi.toggle(ruleId);
      setRules(prev => prev.map(r => (r.id === ruleId ? res.rule : r)));
    } catch (err: any) {
      alert(`Cannot toggle rule: ${err.message}`);
    }
  };

  // 1b. Update rule via API
  const handleUpdateRule = async (ruleId: string, updates: Partial<AutomationRule>) => {
    try {
      const res = await automationsApi.update(ruleId, updates);
      if (res.rule) {
        setRules(prev => prev.map(r => (r.id === ruleId ? res.rule : r)));
      }
    } catch (err: any) {
      alert(`Cannot update rule: ${err.message}`);
    }
  };

  // 1c. Delete rule via API
  const handleDeleteRule = async (ruleId: string) => {
    try {
      await automationsApi.delete(ruleId);
      setRules(prev => prev.filter(r => r.id !== ruleId));
    } catch (err: any) {
      alert(`Cannot delete rule: ${err.message}`);
    }
  };

  // 2. Toggle human takeover via API
  const handleToggleTakeover = async (convId: string) => {
    try {
      const conv = conversations.find(c => c.id === convId);
      const targetState = conv ? !conv.takeoverActive : true;
      const res = await conversationsApi.toggleTakeover(convId, targetState);
      
      setConversations(prev =>
        prev.map(c => (c.id === convId ? { ...c, takeoverActive: res.takeoverActive } : c))
      );
      if (selectedConversation && selectedConversation.id === convId) {
        setSelectedConversation(prev => prev ? { ...prev, takeoverActive: res.takeoverActive } : null);
      }
    } catch (err: any) {
      alert(`Cannot toggle takeover: ${err.message}`);
    }
  };

  // 3. Update lead status via API
  const handleUpdateLeadStatus = async (phone: string, newStatus: LeadStatus) => {
    try {
      const cleanPhone = phone.replace(/\s+/g, '');
      const lead = leads.find(l => l.phone.replace(/\s+/g, '') === cleanPhone);
      if (lead) {
        const res = await leadsApi.updateStatus(lead.id, newStatus);
        setLeads(prev => prev.map(l => (l.id === lead.id ? res.lead : l)));
      }
      setConversations(prev =>
        prev.map(c => (c.phone.replace(/\s+/g, '') === cleanPhone ? { ...c, leadStatus: newStatus } : c))
      );
    } catch (err: any) {
      alert(`Cannot update lead status: ${err.message}`);
    }
  };

  // 4. Create new lead via API
  const handleAddLead = async (newLeadData: Partial<Lead>) => {
    try {
      const res = await leadsApi.create(newLeadData);
      setLeads(prev => [res.lead, ...prev]);
      setIsAddLeadModalOpen(false);
    } catch (err: any) {
      alert(`Failed to add lead: ${err.message}`);
    }
  };

  // 5. Create new rule via API
  const handleAddRule = async (newRuleData: Partial<AutomationRule>) => {
    try {
      const res = await automationsApi.create(newRuleData);
      setRules(prev => [...prev, res.rule]);
    } catch (err: any) {
      alert(`Failed to create rule: ${err.message}`);
    }
  };

  // 6. Create demo slot via API
  const handleAddSlot = async (newSlotData: Partial<Slot>) => {
    try {
      const res = await bookingsApi.addSlot(newSlotData);
      setSlots(prev => [res.slot, ...prev]);
    } catch (err: any) {
      alert(`Failed to add demo slot: ${err.message}`);
    }
  };

  // 6b. Book student appointment into slot via API
  const handleBookAppointment = async (data: {
    slotId: string;
    studentName: string;
    phone: string;
    course?: string;
  }) => {
    try {
      const res = await bookingsApi.bookAppointment(data);
      if (res.appointment) {
        setAppointments(prev => [res.appointment, ...prev]);
        setSlots(prev => prev.map(s => {
          if (s.id === data.slotId) {
            return { ...s, bookedCount: s.bookedCount + 1 };
          }
          return s;
        }));
      }
    } catch (err: any) {
      alert(`Booking failed: ${err.message}`);
    }
  };

  // 7. Add knowledge document via API
  const handleAddKnowledge = async (item: Partial<KnowledgeItem>) => {
    try {
      const res = await knowledgeApi.add(item);
      setKnowledgeItems(prev => [...prev, res.item]);
    } catch (err: any) {
      alert(`Failed to add knowledge item: ${err.message}`);
    }
  };

  // 7b. Delete knowledge document via API
  const handleDeleteKnowledge = async (id: string) => {
    try {
      await knowledgeApi.delete(id);
      setKnowledgeItems(prev => prev.filter(k => k.id !== id));
    } catch (err: any) {
      alert(`Failed to delete knowledge item: ${err.message}`);
    }
  };

  // 8. Jump to conversation in Shared Inbox from Contacts View
  const handleSelectContactForChat = (contactPhone: string) => {
    const cleanTarget = contactPhone.replace(/\s+/g, '');
    const existing = conversations.find(c => c.phone.replace(/\s+/g, '') === cleanTarget);

    if (existing) {
      setSelectedConversation(existing);
    } else {
      const contactInfo = contacts.find(c => c.phone.replace(/\s+/g, '') === cleanTarget);
      const newConv: Conversation = {
        id: `conv-auto-${Date.now()}`,
        workspaceId: '11111111-1111-4111-8111-111111111111',
        contactId: contactInfo?.id || `ct-${Date.now()}`,
        contactName: contactInfo?.name || 'Student',
        phone: contactPhone,
        status: 'OPEN',
        lastMessage: 'Ready to start WhatsApp conversation',
        lastMessageAt: 'Just now',
        unreadCount: 0,
        leadStatus: 'NEW',
        leadCourse: 'JEE Dropper',
        takeoverActive: false,
        windowExpiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        tags: ['New Lead', 'Direct Chat'],
      };
      setConversations(prev => [newConv, ...prev]);
      setSelectedConversation(newConv);
    }

    setCurrentTab('inbox');
  };

  // 9. Sync simulator messages with dashboard in real time
  const handleNewMessageSimulated = (data: any) => {
    if (data?.conversation) {
      setConversations(prev => {
        const existingIdx = prev.findIndex(c => c.id === data.conversation.id || c.phone === data.conversation.phone);
        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], ...data.conversation };
          return updated;
        }
        return [data.conversation, ...prev];
      });
      if (selectedConversation && (selectedConversation.id === data.conversation.id || selectedConversation.phone === data.conversation.phone)) {
        setSelectedConversation(data.conversation);
      }
    }
    // Refresh dashboard counters dynamically
    fetchAllData();
  };

  const handleLoginSuccess = (user: User, token: string, workspace?: any) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    if (workspace) {
      setActiveWorkspace((prev: any) => ({
        ...prev,
        ...workspace,
        category: workspace.category || prev?.category,
      }));
    }
    if (token) {
      localStorage.setItem('automask_token', token);
    }
    setApiAuthContext({
      token: token || localStorage.getItem('automask_token') || undefined,
      role: user.role,
      userId: user.id,
      workspaceId: workspace?.id || '11111111-1111-4111-8111-111111111111',
    });
    setActiveView('app');
    fetchAllData(user.role);
  };

  // Handle Google OAuth redirect callback (?code=... or ?token=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const token = params.get('token');
    const login = params.get('login');

    if (token) {
      window.history.replaceState({}, document.title, window.location.pathname);
      authApi.getMe().then((res) => {
        if (res?.user) {
          handleLoginSuccess(res.user, token, res.workspace);
        }
      }).catch(console.error);
    } else if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      authApi.loginWithGoogle({
        code,
        redirectUri: window.location.origin,
      }).then((res) => {
        if (res?.user && res?.token) {
          handleLoginSuccess(res.user, res.token, res.workspace);
        }
      }).catch((err) => {
        console.error('Google OAuth URL code exchange error:', err);
      });
    } else if (login === 'google_success') {
      window.history.replaceState({}, document.title, window.location.pathname);
      authApi.getMe().then((res) => {
        if (res?.user) {
          handleLoginSuccess(res.user, '', res.workspace);
        }
      }).catch(console.error);
    }
  }, []);

  const handleLaunchDemo = () => {
    // Strictly protect dashboard: require authentication via UserLoginPage
    setActiveView('user-login');
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore
    }
    setIsAuthenticated(false);
    localStorage.removeItem('automask_token');
    setActiveView('user-login');
  };

  // Strict Auth Guard: Nobody can access 'app' without being authenticated!
  if (!isAuthenticated && activeView === 'app') {
    return (
      <UserLoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigateToAdminLogin={() => setActiveView('admin-login')}
        onBackToHome={() => setActiveView('user-login')}
      />
    );
  }

  // Top-Level Page Views
  if (activeView === 'landing') {
    return (
      <LandingPage
        onNavigateToUserLogin={() => setActiveView('user-login')}
        onNavigateToAdminLogin={() => setActiveView('admin-login')}
        onLaunchDemo={handleLaunchDemo}
      />
    );
  }

  if (activeView === 'user-login') {
    return (
      <UserLoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigateToAdminLogin={() => setActiveView('admin-login')}
        onBackToHome={() => setActiveView('landing')}
      />
    );
  }

  if (activeView === 'admin-login') {
    return (
      <PlatformAdminLoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigateToUserLogin={() => setActiveView('user-login')}
        onBackToHome={() => setActiveView('landing')}
      />
    );
  }

  // Layer 1: Platform Operations Console for internal AutoMask staff (platform_admin, platform_support, platform_billing)
  if (currentUser.role.startsWith('platform_')) {
    return (
      <PlatformConsoleView
        currentUser={currentUser}
        onSwitchToWorkspace={(workspaceId) => {
          // Switch to workspace inspection mode (Dr. Prakash Owner)
          handleRoleChange('owner');
        }}
        onLogout={handleLogout}
        onRoleChange={(newRole) => handleRoleChange(newRole)}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6fa]">
      {/* Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        unreadCount={conversations.filter(c => c.unreadCount > 0).reduce((acc, c) => acc + c.unreadCount, 0)}
        userRole={currentUser.role}
        workspace={activeWorkspace}
        onOpenBusinessProfile={() => setIsBusinessProfileModalOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area: starts immediately after sidebar */}
      <div className={`flex-1 flex flex-col h-screen min-w-0 overflow-x-hidden ${currentTab === 'inbox' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {/* Top Header: consistent h-16, sticky */}
        <Header
          currentUser={currentUser}
          onRoleChange={handleRoleChange}
          onToggleSimulator={() => setIsSimulatorOpen(prev => !prev)}
          isSimulatorOpen={isSimulatorOpen}
          onOpenSupportGrantModal={() => setIsSupportGrantModalOpen(true)}
          onLogout={handleLogout}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        />

        {/* Live Backend Connection & Sync Pill */}
        <div className="w-full max-w-[1680px] mx-auto px-6 sm:px-8 lg:px-10 pt-5 pb-0 flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${apiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="font-semibold text-slate-700">
              Backend API: <code className="text-slate-600 font-mono text-xs">http://localhost:5000/api/v1</code>
            </span>
            <span className={`px-2.5 py-0.5 rounded-md font-bold text-xs ${
              apiConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {apiConnected ? 'REST Connected' : 'Offline / Error'}
            </span>
            {syncError && (
              <span className="text-rose-600 font-medium truncate max-w-xs text-xs">({syncError})</span>
            )}
          </div>

          <button
            onClick={() => fetchAllData()}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Server'}</span>
          </button>
        </div>

        {/* Dynamic Tab Body */}
        <main className={`flex-1 min-h-0 ${currentTab === 'inbox' ? 'flex flex-col overflow-hidden' : ''}`}>
          {currentTab === 'dashboard' && (
            <DashboardView
              conversations={conversations}
              rules={rules}
              usage={usage}
              metrics={dashboardMetrics}
              currentUser={currentUser}
              workspace={activeWorkspace}
              onSelectConversation={(conv) => {
                setSelectedConversation(conv);
                setCurrentTab('inbox');
              }}
              onToggleRule={handleToggleRule}
              onNavigate={setCurrentTab}
              onOpenAddLeadModal={() => setIsAddLeadModalOpen(true)}
              onOpenBroadcastModal={() => setIsBroadcastModalOpen(true)}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
            />
          )}

          {currentTab === 'inbox' && (
            <SharedInboxView
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
              onSendMessage={(convId, body, senderName) => {
                const activeSender = senderName || currentUser.fullName;
                setConversations(prev =>
                  prev.map(c => (c.id === convId ? { 
                    ...c, 
                    lastMessage: body, 
                    lastMessageAt: 'Just now',
                    assignedToName: activeSender 
                  } : c))
                );
              }}
              onToggleTakeover={handleToggleTakeover}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              currentUser={currentUser}
            />
          )}

          {currentTab === 'leads' && (
            <LeadsView
              leads={leads}
              onUpdateStatus={(leadId, newStatus) => {
                const targetLead = leads.find(l => l.id === leadId);
                if (targetLead) {
                  handleUpdateLeadStatus(targetLead.phone, newStatus);
                }
              }}
              onOpenAddModal={() => setIsAddLeadModalOpen(true)}
              userRole={currentUser.role}
            />
          )}

          {currentTab === 'automation' && (
            <AutomationView
              rules={rules}
              onToggleRule={handleToggleRule}
              onAddRule={handleAddRule}
              onUpdateRule={handleUpdateRule}
              onDeleteRule={handleDeleteRule}
              userRole={currentUser.role}
            />
          )}

          {currentTab === 'ai' && (
            <AIAssistantConfigView
              knowledgeItems={knowledgeItems}
              userRole={currentUser.role}
            />
          )}

          {currentTab === 'bookings' && (
            <BookingsView
              slots={slots}
              appointments={appointments}
              onAddSlot={handleAddSlot}
              onBookAppointment={handleBookAppointment}
            />
          )}

          {currentTab === 'contacts' && (
            <ContactsView
              contacts={contacts}
              onSelectContactForChat={handleSelectContactForChat}
              onRefreshContacts={() => fetchAllData()}
              userRole={currentUser.role}
            />
          )}

          {currentTab === 'workflows' && (
            <WorkflowCanvasView
              userRole={currentUser.role}
              onOpenPhoneSimulator={() => setIsSimulatorOpen(true)}
            />
          )}

          {currentTab === 'team' && (
            <TeamView
              currentUserRole={currentUser.role}
              currentUserId={currentUser.id}
              onUpdateMemberAllowedTabs={(memberId, allowedTabs) => {
                setCurrentUser(prev => {
                  if (prev.id === memberId) {
                    return { ...prev, allowedTabs };
                  }
                  return prev;
                });
                Object.values(USERS_BY_ROLE).forEach(u => {
                  if (u.id === memberId) {
                    u.allowedTabs = allowedTabs;
                  }
                });
              }}
            />
          )}

          {currentTab === 'roles' && (
            currentUser.role !== 'owner' ? (
              <div className="p-10 max-w-2xl mx-auto text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
                  <span className="text-2xl font-bold font-['Outfit']">🔒</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 font-['Outfit']">
                  Role Management Restricted
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Only the workspace <strong>Owner</strong> can create custom roles, edit granular permission overrides, and configure resource access scopes.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handleRoleChange('owner')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                  >
                    👑 Switch to Owner Role (Dr. Prakash)
                  </button>
                </div>
              </div>
            ) : (
              <RolesPermissionsView
                currentUserRole={currentUser.role}
                currentUserId={currentUser.id}
                onRefreshTeam={() => fetchAllData()}
              />
            )
          )}

          {currentTab === 'integrations' && (
            <IntegrationsView
              userRole={currentUser.role}
            />
          )}

          {currentTab === 'templates' && (
            <BroadcastTemplatesView
              usage={usage}
              leads={leads}
              onBroadcastSent={(name, count) => {
                setUsage(prev => ({
                  ...prev,
                  templateMessagesUsed: Math.min(prev.templateMessagesUsed + count, prev.templateMessagesLimit),
                }));
              }}
            />
          )}

          {currentTab === 'broadcast' && (
            <BroadcastWizardView
              usage={usage}
              leads={leads}
              userRole={currentUser.role}
              workspace={activeWorkspace}
              onCampaignCreated={() => fetchAllData()}
            />
          )}

          {currentTab === 'audit_logs' && (
            <AuditLogsView
              userRole={currentUser.role}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView usage={usage} />
          )}

          {currentTab === 'billing' && (
            currentUser.role === 'agent' || currentUser.role === 'admin' ? (
              <div className="p-10 max-w-2xl mx-auto text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
                  <span className="text-2xl font-bold font-['Outfit']">🔒</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 font-['Outfit']">
                  Billing Access Restricted
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  According to <strong>SRS Section 3 (User Roles and Permissions Matrix)</strong>, only the workspace <strong>Owner</strong> can view and manage subscription plans, payment methods, and invoices.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handleRoleChange('owner')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                  >
                    👑 Switch to Owner Role (Dr. Prakash)
                  </button>
                </div>
              </div>
            ) : (
              <BillingView usage={usage} />
            )
          )}

          {currentTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Floating Interactive WhatsApp Simulator */}
      <WhatsAppPhoneSimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onNewMessageSimulated={handleNewMessageSimulated}
        workspace={activeWorkspace}
      />

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        onAddLead={handleAddLead}
      />

      {/* Broadcast Modal */}
      <BroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        onSend={(name, count) => {
          alert(`Successfully scheduled broadcast "${name}" to ${count} recipients!`);
        }}
      />

      {/* SRS Line 615 Privacy Safeguard Support Grant Modal */}
      <SupportGrantModal
        isOpen={isSupportGrantModalOpen}
        onClose={() => setIsSupportGrantModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Multi-Industry Business Profile Modal */}
      <BusinessProfileModal
        isOpen={isBusinessProfileModalOpen}
        onClose={() => setIsBusinessProfileModalOpen(false)}
        workspace={activeWorkspace}
        onSaveWorkspace={handleUpdateWorkspace}
      />
    </div>
  );
};
