import React, { useEffect, useState, useCallback } from 'react';
import { api, getUser, clearAuthSession, setAuthSession } from './api';

// Components
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import CommandPalette from './components/common/CommandPalette';
import Toast from './components/common/Toast';
import StatCard from './components/common/StatCard';
import AnalyticsCharts from './components/analytics/AnalyticsCharts';
import AuthView from './components/auth/AuthView';

// Modals
import NewTripModal from './components/trips/NewTripModal';
import CustomerModal from './components/customers/CustomerModal';

// Views
import TripsView from './components/trips/TripsView';
import CustomersView from './components/customers/CustomersView';
import ShipToView from './components/shipto/ShipToView';
import VendorsView from './components/vendors/VendorsView';
import ProductsAndPricingView from './components/products/ProductsAndPricingView';
import InvoiceConfigView from './components/invoice/InvoiceConfigView';
import FreightConfigView from './components/invoice/FreightConfigView';
import TemplateBuilderView from './components/templates/TemplateBuilderView';
import DocumentArchiveView from './components/documents/DocumentArchiveView';
import EmailCenterView from './components/email/EmailCenterView';
import CompanyProfileView from './components/company/CompanyProfileView';

export default function App() {
  // Authentication State
  const [user, setUser] = useState(() => getUser());
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Primary Data Collections
  const [trips, setTrips] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fees, setFees] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [shiptos, setShiptos] = useState([]);
  const [invoiceConfigs, setInvoiceConfigs] = useState([]);
  const [freightConfigs, setFreightConfigs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [emailSettings, setEmailSettings] = useState([]);
  const [emailConfigs, setEmailConfigs] = useState([]);
  const [companySettings, setCompanySettings] = useState([]);
  const [documents, setDocuments] = useState([]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [generatingId, setGeneratingId] = useState(null);

  // Modals & Navigation Helpers
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [targetCustomerIdForShipTo, setTargetCustomerIdForShipTo] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3800);
  };

  // Fetch all collections
  const loadAllData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const [
        t,
        c,
        v,
        p,
        cat,
        f,
        tx,
        st,
        ic,
        fc,
        tpl,
        es,
        ec,
        cs,
      ] = await Promise.all([
        api.getTrips(),
        api.getCustomers(),
        api.getVendors(),
        api.getProducts(),
        api.getCategories(),
        api.getFees(),
        api.getTaxes(),
        api.getShipTos(),
        api.getInvoiceConfigs(),
        api.getFreightConfigs(),
        api.getTemplates(),
        api.getEmailSettings(),
        api.getEmailConfigs(),
        api.getCompanySettings(),
      ]);

      setTrips(t);
      setCustomers(c);
      setVendors(v);
      setProducts(p);
      setCategories(cat);
      setFees(f);
      setTaxes(tx);
      setShiptos(st);
      setInvoiceConfigs(ic);
      setFreightConfigs(fc);
      setTemplates(tpl);
      setEmailSettings(es);
      setEmailConfigs(ec);
      setCompanySettings(cs);

      // Load Document archive history from localStorage
      const storedDocs = localStorage.getItem('generated_docs');
      if (storedDocs) {
        try {
          setDocuments(JSON.parse(storedDocs));
        } catch {
          setDocuments([]);
        }
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
      showToast('Failed to sync data from backend server', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user, loadAllData]);

  // Global Keyboard Shortcuts (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auth Actions
  const handleLogin = async (email, password) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const data = await api.login(email, password);
      if (data.access_token && data.user) {
        setAuthSession(data.access_token, data.user);
        setUser(data.user);
        showToast('Logged in successfully!');
      } else {
        setAuthError(data.detail || 'Invalid login credentials');
      }
    } catch (err) {
      setAuthError(err.message || 'Login connection failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (username, email, password) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const data = await api.signup(username, email, password);
      if (data.user) {
        showToast('Account created! Signing in...');
        try {
          const loginData = await api.login(email, password);
          if (loginData.access_token && loginData.user) {
            setAuthSession(loginData.access_token, loginData.user);
            setUser(loginData.user);
            showToast(`Welcome, ${loginData.user.username}!`);
            return;
          }
        } catch {
          // If auto login fails, user can sign in manually
        }
        showToast('Account registered! Please sign in with your credentials.');
      } else {
        setAuthError(data.detail || 'Signup failed');
      }
    } catch (err) {
      setAuthError(err.message || 'Signup failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const data = await api.googleLogin(credentialResponse.credential);
      if (data.access_token && data.user) {
        setAuthSession(data.access_token, data.user);
        setUser(data.user);
        showToast('Authenticated with Google!');
      } else {
        setAuthError(data.detail || 'Google authentication failed');
      }
    } catch (err) {
      setAuthError(err.message || 'Google login error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    showToast('Signed out successfully');
  };

  // PDF Generation Helper
  const handleGeneratePdf = async (type, id) => {
    setGeneratingId(`${type}-${id}`);
    const endpoints = {
      invoice: `generate-invoice/${id}`,
      delivery: `generate-delivery-ticket/${id}`,
      freight: `generate-freight-invoice/${id}`,
      'invoice-config': `generate-invoice-from-config/${id}`,
      'delivery-config': `generate-delivery-ticket-from-config/${id}`,
    };

    const endpoint = endpoints[type];
    if (!endpoint) {
      showToast('Unknown PDF template type', 'error');
      setGeneratingId(null);
      return;
    }

    try {
      const filename = `${type}_${id}.pdf`;
      await api.downloadPdf(endpoint, filename);

      const newDoc = {
        id: Date.now(),
        type,
        ref_id: id,
        generated_at: new Date().toISOString(),
        status: 'Generated',
      };

      const existingDocs = JSON.parse(localStorage.getItem('generated_docs') || '[]');
      const updated = [newDoc, ...existingDocs.filter((d) => !(d.type === type && d.ref_id === id))].slice(0, 60);
      localStorage.setItem('generated_docs', JSON.stringify(updated));
      setDocuments(updated);

      showToast('PDF generated and downloaded successfully!');
    } catch (err) {
      console.error('PDF error:', err);
      showToast(`PDF generation error: ${err.message}`, 'error');
    } finally {
      setGeneratingId(null);
    }
  };

  // Action Handlers
  const handleCreateTrip = async (tripData) => {
    try {
      const created = await api.createTrip(tripData);
      setTrips((prev) => [created.trip || created, ...prev]);
      showToast('New fleet trip dispatched!');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const handleDeleteTrip = async (id) => {
    try {
      await api.deleteTrip(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
      showToast('Trip record deleted');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateOrUpdateCustomer = async (customerData) => {
    try {
      if (editingCustomer) {
        const updated = await api.updateCustomer(editingCustomer.id, customerData);
        setCustomers((prev) => prev.map((c) => (c.id === editingCustomer.id ? updated : c)));
        showToast('Customer account updated');
      } else {
        const created = await api.createCustomer(customerData);
        setCustomers((prev) => [created, ...prev]);
        showToast('Customer account created');
      }
      setEditingCustomer(null);
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const handleDeleteCustomer = async (id) => {
    try {
      await api.deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      showToast('Customer account deleted');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateVendor = async (vendorData) => {
    try {
      const created = await api.createVendor(vendorData);
      setVendors((prev) => [created, ...prev]);
      showToast('Supply vendor registered');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const handleDeleteVendor = async (id) => {
    try {
      await api.deleteVendor(id);
      setVendors((prev) => prev.filter((v) => v.id !== id));
      showToast('Vendor deleted');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateShipTo = async (shiptoData) => {
    try {
      const created = await api.createShipTo(shiptoData);
      setShiptos((prev) => [created, ...prev]);
      showToast('Delivery terminal registered');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const handleDeleteShipTo = async (id) => {
    try {
      await api.deleteShipTo(id);
      setShiptos((prev) => prev.filter((s) => s.id !== id));
      showToast('Delivery terminal deleted');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateCategory = async (data) => {
    try {
      const created = await api.createCategory(data);
      setCategories((prev) => [created, ...prev]);
      showToast('Product category added');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast('Category deleted');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateProduct = async (data) => {
    try {
      const created = await api.createProduct(data);
      setProducts((prev) => [created, ...prev]);
      showToast('Product added to catalogue');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('Product deleted');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateFee = async (data) => {
    try {
      const created = await api.createFee(data);
      setFees((prev) => [created, ...prev]);
      showToast('Fee structure added');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const handleDeleteFee = async (id) => {
    try {
      await api.deleteFee(id);
      setFees((prev) => prev.filter((f) => f.id !== id));
      showToast('Fee structure deleted');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateTax = async (data) => {
    try {
      const created = await api.createTax(data);
      setTaxes((prev) => [created, ...prev]);
      showToast('Tax rule added');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const handleDeleteTax = async (id) => {
    try {
      await api.deleteTax(id);
      setTaxes((prev) => prev.filter((t) => t.id !== id));
      showToast('Tax rule deleted');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateInvoiceConfig = async (data) => {
    try {
      const created = await api.createInvoiceConfig(data);
      setInvoiceConfigs((prev) => [created, ...prev]);
      showToast('Invoice configuration saved!');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const handleDeleteInvoiceConfig = async (id) => {
    try {
      await api.deleteInvoiceConfig(id);
      setInvoiceConfigs((prev) => prev.filter((c) => c.id !== id));
      showToast('Invoice configuration deleted');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateFreightConfig = async (data) => {
    try {
      const created = await api.createFreightConfig(data);
      setFreightConfigs((prev) => [created, ...prev]);
      showToast('Freight matrix configuration saved!');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const handleDeleteFreightConfig = async (id) => {
    try {
      await api.deleteFreightConfig(id);
      setFreightConfigs((prev) => prev.filter((c) => c.id !== id));
      showToast('Freight configuration deleted');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateTemplate = async (data) => {
    try {
      const created = await api.createTemplate(data);
      setTemplates((prev) => [created, ...prev]);
      showToast('Template preset configuration saved!');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const handleCreateEmailSettings = async (data) => {
    try {
      const created = await api.createEmailSettings(data);
      setEmailSettings((prev) => [created, ...prev]);
      showToast('Email provider credentials registered!');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const handleDeleteEmailSettings = async (id) => {
    try {
      await api.deleteEmailSettings(id);
      setEmailSettings((prev) => prev.filter((s) => s.id !== id));
      showToast('Email provider settings removed');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateEmailConfig = async (data) => {
    try {
      const created = await api.createEmailConfig(data);
      setEmailConfigs((prev) => [created, ...prev]);
      showToast('Automated routing rule saved!');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const handleDeleteEmailConfig = async (id) => {
    try {
      await api.deleteEmailConfig(id);
      setEmailConfigs((prev) => prev.filter((c) => c.id !== id));
      showToast('Routing rule deleted');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSendEmail = async (payload) => {
    try {
      const res = await api.sendEmail(payload);
      showToast(res.message || 'Email dispatched successfully!');
      return true;
    } catch (err) {
      showToast(err.message || 'Failed to dispatch email', 'error');
      return false;
    }
  };

  const handleSaveCompanySettings = async (data, editingId) => {
    try {
      if (editingId) {
        const updated = await api.updateCompanySettings(editingId, data);
        setCompanySettings((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
        showToast('Company branding profile updated!');
      } else {
        const created = await api.createCompanySettings(data);
        setCompanySettings((prev) => [created, ...prev]);
        showToast('Company profile registered!');
      }
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const handleDeleteCompanySettings = async (id) => {
    try {
      await api.deleteCompanySettings(id);
      setCompanySettings((prev) => prev.filter((s) => s.id !== id));
      showToast('Company profile deleted');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Jump from Customer row directly to Ship-To view pre-filtered
  const handleJumpToShipTo = (custId) => {
    setTargetCustomerIdForShipTo(String(custId));
    setActiveTab('shipto');
  };

  // Navigation Items
  const navItems = [
    { key: 'dashboard', icon: 'dashboard', label: 'Executive Dashboard', count: null },
    { key: 'trips', icon: 'local_shipping', label: 'Fleet Trips', count: trips.length },
    { key: 'customers', icon: 'groups', label: 'Customer Accounts', count: customers.length },
    { key: 'shipto', icon: 'pin_drop', label: 'Ship-To Terminals', count: shiptos.length },
    { key: 'vendors', icon: 'storefront', label: 'Vendor Directory', count: vendors.length },
    { key: 'products', icon: 'inventory_2', label: 'Products & Pricing', count: products.length },
    { key: 'invoice-config', icon: 'receipt_long', label: 'Invoice Configs', count: invoiceConfigs.length },
    { key: 'freight-config', icon: 'local_shipping', label: 'Freight Matrix', count: freightConfigs.length },
    { key: 'templates', icon: 'description', label: 'Document Templates', count: templates.length },
    { key: 'documents', icon: 'folder_open', label: 'Document Archive', count: documents.length },
    { key: 'email', icon: 'mail', label: 'Email Automation', count: emailSettings.length },
    { key: 'company', icon: 'business', label: 'Company Profile', count: companySettings.length },
  ];

  // Auth Guard
  if (!user) {
    return (
      <>
        <Toast toast={toast} onClose={() => setToast(null)} />
        <AuthView
          onLogin={handleLogin}
          onSignup={handleSignup}
          onGoogleSuccess={handleGoogleSuccess}
          authLoading={authLoading}
          authError={authError}
          setAuthError={setAuthError}
        />
      </>
    );
  }

  // Initial Fullscreen Loading
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg-dark)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: 'var(--accent-indigo)',
            borderRadius: '50%',
            animation: 'spinSlow 0.8s linear infinite',
          }}
        />
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
          Loading Enterprise Logistics Workspace...
        </div>
      </div>
    );
  }

  const totalGallonsDispatched = trips.reduce((acc, t) => acc + (Number(t.total_gallons) || 0), 0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        navItems={navItems}
        onSelectTab={(tabKey) => setActiveTab(tabKey)}
        trips={trips}
        customers={customers}
        documents={documents}
      />

      {/* Dispatch New Trip Modal */}
      <NewTripModal
        isOpen={showNewTripModal}
        onClose={() => setShowNewTripModal(false)}
        onSubmit={handleCreateTrip}
      />

      {/* Customer Create/Edit Modal */}
      <CustomerModal
        isOpen={showCustomerModal}
        onClose={() => {
          setShowCustomerModal(false);
          setEditingCustomer(null);
        }}
        onSubmit={handleCreateOrUpdateCustomer}
        editingCustomer={editingCustomer}
      />

      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navItems={navItems}
        onOpenNewTripModal={() => setShowNewTripModal(true)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Workspace Frame */}
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Sticky Top Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          activeTabTitle={navItems.find((n) => n.key === activeTab)?.label}
          user={user}
          onLogout={handleLogout}
          onRefreshData={() => loadAllData(true)}
          isRefreshing={isRefreshing}
        />

        {/* Dynamic Tab Main Content Area */}
        <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
              {/* Executive Fleet Command Deck Hero */}
              <div
                className="glass-panel"
                style={{
                  padding: '26px 30px',
                  marginBottom: 26,
                  background: 'linear-gradient(135deg, rgba(20, 28, 52, 0.85) 0%, rgba(10, 14, 26, 0.9) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 0 30px rgba(99, 102, 241, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 20,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div
                      style={{
                        padding: '4px 12px',
                        borderRadius: 99,
                        background: 'rgba(99, 102, 241, 0.2)',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                        fontSize: 11,
                        fontWeight: 800,
                        color: 'var(--accent-indigo-light)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Fleet Command Deck
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#34d399', fontWeight: 700 }}>
                      <span className="status-dot" style={{ background: '#34d399' }}></span>
                      Live Telemetry Stream
                    </div>
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                    Welcome back, {user?.username || 'Fleet Administrator'}
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Automated fuel logistics pipelines, real-time trip dispatches, and document billing telemetry.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button
                    className="ghost-btn"
                    style={{ padding: '10px 16px' }}
                    onClick={() => setIsCommandPaletteOpen(true)}
                  >
                    <span className="ms18" style={{ color: 'var(--accent-indigo-light)' }}>
                      terminal
                    </span>
                    <span>Quick Switcher (⌘K)</span>
                  </button>
                  <button
                    className="glow-btn"
                    style={{ padding: '10px 20px' }}
                    onClick={() => setShowNewTripModal(true)}
                  >
                    <span className="ms18">add_circle</span>
                    <span>Dispatch Trip</span>
                  </button>
                </div>
              </div>

              {/* 4 Main Stat Cards with Sparklines */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 18,
                  marginBottom: 26,
                }}
              >
                <StatCard
                  label="Active Fleet Trips"
                  value={trips.length.toLocaleString()}
                  sub="+12.4% fleet velocity"
                  icon="local_shipping"
                  gradient="var(--accent-gradient)"
                  color="#6366f1"
                  sparklineData={[10, 15, 12, 22, 18, 28, 24, 35]}
                  changeType="positive"
                />
                <StatCard
                  label="Gallons Dispatched"
                  value={`${totalGallonsDispatched.toLocaleString()} gal`}
                  sub="Optimal hauling volume"
                  icon="local_gas_station"
                  gradient="var(--cyan-gradient)"
                  color="#06b6d4"
                  sparklineData={[20, 24, 30, 28, 38, 45, 42, 55]}
                  changeType="positive"
                />
                <StatCard
                  label="Customer Accounts"
                  value={customers.length}
                  sub={`${shiptos.length} delivery sites`}
                  icon="groups"
                  gradient="var(--emerald-gradient)"
                  color="#10b981"
                  sparklineData={[5, 8, 12, 14, 18, 20, 25, 30]}
                  changeType="positive"
                />
                <StatCard
                  label="PDF Documents"
                  value={documents.length}
                  sub="100% automated delivery"
                  icon="description"
                  gradient="var(--amber-gradient)"
                  color="#f59e0b"
                  sparklineData={[8, 12, 16, 14, 22, 28, 32, 40]}
                  changeType="positive"
                />
              </div>

              {/* Interactive Visual Analytics (SVG Charts & Status Breakdown) */}
              <AnalyticsCharts trips={trips} customers={customers} documents={documents} />

              {/* Recent Fleet Trips & Automation Dispatch Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
                {/* Recent Trips Table Panel */}
                <div className="glass-panel" style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>
                      Recent Fleet Dispatches
                    </div>
                    <button
                      className="ghost-btn"
                      style={{ padding: '4px 10px', fontSize: 12, color: 'var(--accent-indigo-light)' }}
                      onClick={() => setActiveTab('trips')}
                    >
                      View All Trips <span className="ms14">arrow_forward</span>
                    </button>
                  </div>

                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Driver</th>
                        <th>Status</th>
                        <th>Volume</th>
                        <th>Stops</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trips.slice(0, 6).map((t) => (
                        <tr key={t.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  background: 'rgba(99, 102, 241, 0.15)',
                                  border: '1px solid rgba(99, 102, 241, 0.3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 11,
                                  fontWeight: 800,
                                  color: 'var(--accent-indigo-light)',
                                }}
                              >
                                {(t.driver_name || 'D').substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#ffffff' }}>
                                  {t.driver_name}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                  #TRP-{String(t.id).padStart(4, '0')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`status-pill ${
                                (t.status || '').toLowerCase() === 'active' || (t.status || '').toLowerCase() === 'completed'
                                  ? 'status-active'
                                  : 'status-pending'
                              }`}
                            >
                              <span className="status-dot"></span>
                              {t.status || 'Active'}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                            {(Number(t.total_gallons) || 0).toLocaleString()} gal
                          </td>
                          <td>
                            <span style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                              {t.total_stops || 0} stops
                            </span>
                          </td>
                        </tr>
                      ))}
                      {!trips.length && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            No fleet trips dispatched yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Right Automation & Quick Actions Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div className="glass-panel" style={{ padding: 22 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <span className="ms18" style={{ color: 'var(--accent-indigo)' }}>
                        schedule
                      </span>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>Automation Engine</div>
                    </div>

                    <div
                      style={{
                        background: 'rgba(8, 12, 22, 0.75)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 10,
                        padding: 16,
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                          SCHEDULER STATUS
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span className="status-dot" style={{ background: '#34d399' }}></span> Active
                        </span>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                        Nightly Sync: 08:00 AM
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                        Automated invoice compilation & batch email delivery
                      </div>
                    </div>

                    {[
                      { l: 'Active Email Routing Rules', v: emailConfigs.length },
                      { l: 'Configured Carrier Matrices', v: freightConfigs.length },
                      { l: 'API Health / Response', v: '28ms', green: true },
                    ].map((item) => (
                      <div
                        key={item.l}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px 0',
                          borderBottom: '1px solid var(--border-subtle)',
                          fontSize: 13,
                        }}
                      >
                        <span style={{ color: 'var(--text-secondary)' }}>{item.l}</span>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: item.green ? '#34d399' : '#ffffff' }}>
                          {item.v}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="glass-panel" style={{ padding: 22 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 14 }}>
                      Quick Operational Actions
                    </div>
                    {[
                      { l: 'Dispatch New Trip', icon: 'local_shipping', action: () => setShowNewTripModal(true) },
                      { l: 'Add Customer Profile', icon: 'person_add', action: () => setShowCustomerModal(true) },
                      { l: 'Configure Customer Invoices', icon: 'receipt_long', action: () => setActiveTab('invoice-config') },
                      { l: 'Configure Carrier Freight', icon: 'alt_route', action: () => setActiveTab('freight-config') },
                    ].map((item) => (
                      <button
                        key={item.l}
                        className="ghost-btn"
                        style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8, padding: '10px 14px' }}
                        onClick={item.action}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="ms18" style={{ color: 'var(--accent-indigo-light)' }}>
                            {item.icon}
                          </span>
                          <span>{item.l}</span>
                        </div>
                        <span className="ms16" style={{ color: 'var(--text-muted)' }}>
                          chevron_right
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TRIPS VIEW */}
          {activeTab === 'trips' && (
            <TripsView
              trips={trips}
              searchQuery={searchQuery}
              onOpenNewTripModal={() => setShowNewTripModal(true)}
              onGeneratePdf={handleGeneratePdf}
              onDeleteTrip={handleDeleteTrip}
              generatingId={generatingId}
            />
          )}

          {/* CUSTOMERS VIEW */}
          {activeTab === 'customers' && (
            <CustomersView
              customers={customers}
              shiptos={shiptos}
              searchQuery={searchQuery}
              onOpenCustomerModal={() => {
                setEditingCustomer(null);
                setShowCustomerModal(true);
              }}
              onEditCustomer={(cust) => {
                setEditingCustomer(cust);
                setShowCustomerModal(true);
              }}
              onDeleteCustomer={handleDeleteCustomer}
              onJumpToShipTo={handleJumpToShipTo}
            />
          )}

          {/* SHIP-TO VIEW */}
          {activeTab === 'shipto' && (
            <ShipToView
              shiptos={shiptos}
              customers={customers}
              searchQuery={searchQuery}
              onCreateShipTo={handleCreateShipTo}
              onDeleteShipTo={handleDeleteShipTo}
              initialCustomerId={targetCustomerIdForShipTo}
            />
          )}

          {/* VENDORS VIEW */}
          {activeTab === 'vendors' && (
            <VendorsView
              vendors={vendors}
              searchQuery={searchQuery}
              onCreateVendor={handleCreateVendor}
              onDeleteVendor={handleDeleteVendor}
            />
          )}

          {/* PRODUCTS & PRICING VIEW */}
          {activeTab === 'products' && (
            <ProductsAndPricingView
              products={products}
              categories={categories}
              fees={fees}
              taxes={taxes}
              onCreateCategory={handleCreateCategory}
              onDeleteCategory={handleDeleteCategory}
              onCreateProduct={handleCreateProduct}
              onDeleteProduct={handleDeleteProduct}
              onCreateFee={handleCreateFee}
              onDeleteFee={handleDeleteFee}
              onCreateTax={handleCreateTax}
              onDeleteTax={handleDeleteTax}
            />
          )}

          {/* INVOICE CONFIG VIEW */}
          {activeTab === 'invoice-config' && (
            <InvoiceConfigView
              customers={customers}
              shiptos={shiptos}
              vendors={vendors}
              products={products}
              fees={fees}
              taxes={taxes}
              invoiceConfigs={invoiceConfigs}
              onCreateInvoiceConfig={handleCreateInvoiceConfig}
              onDeleteInvoiceConfig={handleDeleteInvoiceConfig}
              onGeneratePdf={handleGeneratePdf}
              generatingId={generatingId}
            />
          )}

          {/* FREIGHT CONFIG VIEW */}
          {activeTab === 'freight-config' && (
            <FreightConfigView
              vendors={vendors}
              categories={categories}
              fees={fees}
              freightConfigs={freightConfigs}
              onCreateFreightConfig={handleCreateFreightConfig}
              onDeleteFreightConfig={handleDeleteFreightConfig}
              onGeneratePdf={handleGeneratePdf}
              generatingId={generatingId}
            />
          )}

          {/* TEMPLATES VIEW */}
          {activeTab === 'templates' && (
            <TemplateBuilderView
              templates={templates}
              companySettings={companySettings}
              onCreateTemplate={handleCreateTemplate}
            />
          )}

          {/* DOCUMENTS ARCHIVE VIEW */}
          {activeTab === 'documents' && (
            <DocumentArchiveView
              documents={documents}
              searchQuery={searchQuery}
              onGeneratePdf={handleGeneratePdf}
              onSendEmail={handleSendEmail}
              generatingId={generatingId}
            />
          )}

          {/* EMAIL SETTINGS & ROUTING VIEW */}
          {activeTab === 'email' && (
            <EmailCenterView
              emailSettings={emailSettings}
              emailConfigs={emailConfigs}
              onCreateEmailSettings={handleCreateEmailSettings}
              onDeleteEmailSettings={handleDeleteEmailSettings}
              onCreateEmailConfig={handleCreateEmailConfig}
              onDeleteEmailConfig={handleDeleteEmailConfig}
            />
          )}

          {/* COMPANY SETTINGS VIEW */}
          {activeTab === 'company' && (
            <CompanyProfileView
              companySettings={companySettings}
              onSaveCompanySettings={handleSaveCompanySettings}
              onDeleteCompanySettings={handleDeleteCompanySettings}
            />
          )}
        </main>
      </div>
    </div>
  );
}
