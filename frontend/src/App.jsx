import { useEffect, useState } from "react";

const BASE = "https://enterprise-trip-management-system-1.onrender.com";

const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("token")}`
});

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');
  @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #f4f4f7; }
  .app { min-height: 100vh; }

  /* ── AUTH ── */
  .auth-wrap {
    min-height: 100vh; display: flex; align-items: center;
    justify-content: center; padding: 2rem; background: #f4f4f7;
  }
  .auth-card {
    background: #fff; border: 1px solid #e5e5e8; border-radius: 20px;
    padding: 2.5rem; width: 100%; max-width: 400px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  }
  .auth-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: #1a1a2e; color: #e94560;
    font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 600;
    letter-spacing: 2px; text-transform: uppercase;
    padding: 6px 14px; border-radius: 20px; margin-bottom: 1.5rem;
  }
  .logo-dot { width: 8px; height: 8px; border-radius: 50%; background: #e94560; display: inline-block; }
  .auth-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 700; color: #1a1a2e; margin-bottom: 0.4rem; }
  .auth-sub { font-size: 14px; color: #888; margin-bottom: 2rem; }
  .auth-toggle { text-align: center; margin-top: 1.2rem; font-size: 13px; color: #888; }
  .auth-toggle span { color: #e94560; cursor: pointer; font-weight: 600; }
  .field-wrap { margin-bottom: 1rem; }
  .field-label { font-size: 12px; font-weight: 500; color: #888; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px; display: block; }
  .field-input {
    width: 100%; padding: 10px 14px; border: 1px solid #e0e0e5; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; color: #1a1a2e;
    background: #fafafa; outline: none; transition: border 0.2s;
  }
  .field-input:focus { border-color: #e94560; background: #fff; }
  .btn-primary {
    width: 100%; padding: 12px; background: #1a1a2e; color: #fff; border: none;
    border-radius: 10px; font-family: 'Syne', sans-serif; font-size: 14px;
    font-weight: 600; letter-spacing: 0.5px; cursor: pointer;
    transition: opacity 0.2s, transform 0.1s; margin-top: 0.5rem;
  }
  .btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .error-msg { background: #fee2e2; color: #991b1b; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 14px; }

  /* ── DASHBOARD LAYOUT ── */
  .dash-wrap { display: flex; gap: 0; min-height: 100vh; }
  .sidebar {
    width: 230px; min-height: 100vh; background: #1a1a2e;
    padding: 1.5rem 1rem; display: flex; flex-direction: column; flex-shrink: 0;
    position: sticky; top: 0; height: 100vh; overflow-y: auto;
  }
  .sidebar-logo {
    font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700;
    color: #fff; margin-bottom: 2rem; display: flex; align-items: center;
    gap: 8px; padding: 0 0.5rem;
  }
  .nav-label {
    font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
    color: rgba(255,255,255,0.3); margin: 1rem 0.5rem 0.4rem; font-weight: 500;
  }
  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 9px 12px;
    border-radius: 10px; font-size: 13.5px; font-weight: 400;
    color: rgba(255,255,255,0.6); cursor: pointer; transition: all 0.15s; margin-bottom: 2px;
    border: none; background: none; width: 100%; text-align: left;
  }
  .nav-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
  .nav-item.active { background: #e94560; color: #fff; font-weight: 500; }
  .nav-item i { font-size: 17px; }
  .sidebar-bottom { margin-top: auto; padding-top: 1rem; }
  .user-pill {
    display: flex; align-items: center; gap: 10px; padding: 10px 12px;
    background: rgba(255,255,255,0.07); border-radius: 10px;
  }
  .avatar {
    width: 32px; height: 32px; border-radius: 50%; background: #e94560;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
  }
  .user-name { font-size: 13px; color: #fff; font-weight: 500; flex: 1; }
  .user-role { font-size: 11px; color: rgba(255,255,255,0.4); }
  .btn-logout {
    background: none; border: none; color: rgba(255,255,255,0.4);
    cursor: pointer; font-size: 17px; padding: 4px; border-radius: 6px; display: flex; align-items: center;
    transition: color 0.15s;
  }
  .btn-logout:hover { color: #e94560; }

  /* ── MAIN ── */
  .main { flex: 1; overflow-x: hidden; background: #f4f4f7; }
  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.25rem 1.75rem; background: #fff; border-bottom: 1px solid #e8e8ec;
    position: sticky; top: 0; z-index: 10;
  }
  .page-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: #1a1a2e; }
  .page-sub { font-size: 13px; color: #888; margin-top: 2px; }
  .date-chip { font-size: 12px; color: #888; background: #f4f4f7; padding: 6px 12px; border-radius: 20px; border: 1px solid #e8e8ec; }
  .content { padding: 1.75rem; }

  /* ── STATS ── */
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 1.75rem; }
  .stat-card { background: #fff; border-radius: 12px; padding: 1rem 1.25rem; border: 1px solid #e8e8ec; }
  .stat-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .stat-value { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 700; color: #1a1a2e; }
  .stat-delta { font-size: 11px; color: #22c55e; margin-top: 3px; display: flex; align-items: center; gap: 3px; }

  /* ── TWO COL ── */
  .two-col { display: flex; gap: 16px; align-items: flex-start; }
  .col-form { flex: 0 0 320px; }
  .col-list { flex: 1; min-width: 0; }
  .section-head { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }

  /* ── PANEL ── */
  .panel { background: #fff; border: 1px solid #e8e8ec; border-radius: 14px; overflow: hidden; margin-bottom: 16px; }
  .panel-head { padding: 1rem 1.25rem; border-bottom: 1px solid #e8e8ec; display: flex; align-items: center; gap: 8px; }
  .panel-title { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; color: #1a1a2e; display: flex; align-items: center; gap: 8px; }
  .panel-title i { font-size: 16px; color: #e94560; }
  .panel-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 12px; }
  .form-field { display: flex; flex-direction: column; gap: 5px; }
  .form-label { font-size: 11px; font-weight: 500; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
  .form-input {
    padding: 9px 12px; border: 1px solid #e0e0e5; border-radius: 8px;
    font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: #1a1a2e;
    background: #fafafa; outline: none; transition: border 0.15s;
  }
  .form-input:focus { border-color: #e94560; background: #fff; }
  .form-select {
    padding: 9px 12px; border: 1px solid #e0e0e5; border-radius: 8px;
    font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: #1a1a2e;
    background: #fafafa; outline: none; width: 100%;
  }
  .form-footer { padding: 1rem 1.25rem; border-top: 1px solid #e8e8ec; display: flex; justify-content: flex-end; gap: 8px; }
  .btn-submit {
    display: flex; align-items: center; gap: 7px; padding: 9px 20px;
    background: #e94560; color: #fff; border: none; border-radius: 8px;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-submit:hover { opacity: 0.88; transform: translateY(-1px); }
  .btn-submit i { font-size: 15px; }
  .btn-outline {
    display: flex; align-items: center; gap: 7px; padding: 9px 20px;
    background: #fff; color: #1a1a2e; border: 1px solid #e0e0e5; border-radius: 8px;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-outline:hover { border-color: #e94560; color: #e94560; }

  /* ── CHECKBOXES ── */
  .check-row { display: flex; gap: 1rem; flex-wrap: wrap; }
  .check-item { display: flex; align-items: center; gap: 7px; font-size: 13px; color: #1a1a2e; cursor: pointer; }
  .check-item input[type=checkbox] { accent-color: #e94560; width: 15px; height: 15px; cursor: pointer; }

  /* ── DATA CARDS ── */
  .cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .data-card {
    background: #fff; border: 1px solid #e8e8ec; border-radius: 14px;
    padding: 1rem 1.25rem; position: relative; overflow: hidden;
    display: flex; flex-direction: column; gap: 8px;
  }
  .data-card::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px; background: #e94560;
  }
  .data-card-name { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; color: #1a1a2e; padding-right: 28px; }
  .data-card-meta { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
  .meta-chip {
    font-size: 11.5px; color: #666; background: #f4f4f7;
    padding: 3px 10px; border-radius: 20px; border: 1px solid #e8e8ec;
    display: flex; align-items: center; gap: 4px;
  }
  .meta-chip i { font-size: 13px; }
  .status-chip { font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px; }
  .status-active { background: #dcfce7; color: #15803d; }
  .status-pending { background: #fef3c7; color: #b45309; }
  .status-completed { background: #dbeafe; color: #1e40af; }
  .status-default { background: #f4f4f7; color: #888; }
  .card-actions { display: flex; gap: 6px; margin-top: 4px; }
  .action-btn {
    display: flex; align-items: center; gap: 5px; padding: 5px 12px;
    border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer;
    border: 1px solid #e8e8ec; background: #f9f9f9; color: #555; transition: all 0.15s;
  }
  .action-btn:hover { border-color: #e94560; color: #e94560; background: #fff5f7; }
  .action-btn.danger:hover { border-color: #ef4444; color: #ef4444; background: #fff5f5; }
  .action-btn i { font-size: 13px; }
  .delete-btn {
    position: absolute; top: 10px; right: 10px; background: none; border: none;
    cursor: pointer; color: #ccc; font-size: 15px; padding: 4px; border-radius: 6px;
    transition: all 0.15s; display: flex; align-items: center;
  }
  .delete-btn:hover { color: #e94560; background: #fce7eb; }

  /* ── DOCUMENTS TABLE ── */
  .doc-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 14px; overflow: hidden; border: 1px solid #e8e8ec; }
  .doc-table th { text-align: left; padding: 12px 16px; background: #f9f9fb; font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e8e8ec; }
  .doc-table td { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-size: 13.5px; color: #1a1a2e; }
  .doc-table tr:last-child td { border-bottom: none; }
  .doc-table tr:hover td { background: #fafafa; }

  /* ── EMAIL SETTINGS ── */
  .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
  .toggle-label { font-size: 13.5px; color: #1a1a2e; font-weight: 500; }
  .toggle-sub { font-size: 12px; color: #888; margin-top: 2px; }

  /* ── MISC ── */
  .list-empty {
    text-align: center; padding: 2.5rem; color: #aaa; font-size: 13px;
    border: 1.5px dashed #e0e0e5; border-radius: 14px;
  }
  .list-empty i { font-size: 30px; display: block; margin-bottom: 8px; color: #ccc; }
  .bool-yes { color: #16a34a; font-weight: 500; }
  .bool-no { color: #aaa; }
  .toast {
    position: fixed; bottom: 24px; right: 24px; background: #1a1a2e; color: #fff;
    padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 500;
    display: flex; align-items: center; gap: 8px; z-index: 9999;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2); animation: slideIn 0.3s ease;
  }
  .toast.success { border-left: 3px solid #22c55e; }
  .toast.error { border-left: 3px solid #e94560; }
  @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .badge-pill {
    display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px;
    border-radius: 20px; font-size: 12px; font-weight: 500;
  }
  .pill-invoice { background: #ede9fe; color: #6d28d9; }
  .pill-delivery { background: #d1fae5; color: #065f46; }
  .pill-freight { background: #dbeafe; color: #1e40af; }
  .loading-wrap { display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: 'Syne', sans-serif; font-size: 18px; color: #1a1a2e; gap: 12px; }
  .spinner { width: 20px; height: 20px; border: 2px solid #e8e8ec; border-top-color: #e94560; border-radius: 50%; animation: spin 0.6s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export default function App() {
  const [trips, setTrips] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fees, setFees] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [emailSettings, setEmailSettings] = useState([]);
  const [emailConfigs, setEmailConfigs] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("trips");
  const [toast, setToast] = useState(null);

  const [isSignup, setIsSignup] = useState(false);
  const [authUsername, setAuthUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [driverName, setDriverName] = useState("");
  const [totalGallons, setTotalGallons] = useState("");
  const [totalStops, setTotalStops] = useState("");
  const [tripStatus, setTripStatus] = useState("Active");

  const [customerName, setCustomerName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [vendorName, setVendorName] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");

  const [categoryName, setCategoryName] = useState("");
  const [productName, setProductName] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");

  const [feeName, setFeeName] = useState("");
  const [feeRate, setFeeRate] = useState("");

  const [taxName, setTaxName] = useState("");
  const [taxPercentage, setTaxPercentage] = useState("");

  const [documentType, setDocumentType] = useState("invoice");
  const [showFees, setShowFees] = useState(false);
  const [showTaxes, setShowTaxes] = useState(false);
  const [showLogo, setShowLogo] = useState(false);

  const [emailProvider, setEmailProvider] = useState("gmail");
  const [emailAddress, setEmailAddress] = useState("");
  const [emailToken, setEmailToken] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [sendDocType, setSendDocType] = useState("invoice");
  const [sendDestEmail, setSendDestEmail] = useState("");

  const [user, setUser] = useState(
    () => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } }
  );

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const h = { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } };
      const [t, c, v, p, cat, f, tx, tpl, es, ec] = await Promise.all([
        fetch(`${BASE}/trips`, h).then(r => r.json()),
        fetch(`${BASE}/customers`, h).then(r => r.json()),
        fetch(`${BASE}/vendors`, h).then(r => r.json()),
        fetch(`${BASE}/products`, h).then(r => r.json()),
        fetch(`${BASE}/product-categories`, h).then(r => r.json()),
        fetch(`${BASE}/fees`, h).then(r => r.json()),
        fetch(`${BASE}/taxes`, h).then(r => r.json()),
        fetch(`${BASE}/document-templates`, h).then(r => r.json()),
        fetch(`${BASE}/email-settings`, h).then(r => r.json()),
        fetch(`${BASE}/email-send-configurations`, h).then(r => r.json()),
      ]);
      setTrips(Array.isArray(t) ? t : []);
      setCustomers(Array.isArray(c) ? c : []);
      setVendors(Array.isArray(v) ? v : []);
      setProducts(Array.isArray(p) ? p : []);
      setCategories(Array.isArray(cat) ? cat : []);
      setFees(Array.isArray(f) ? f : []);
      setTaxes(Array.isArray(tx) ? tx : []);
      setTemplates(Array.isArray(tpl) ? tpl : []);
      setEmailSettings(Array.isArray(es) ? es : []);
      setEmailConfigs(Array.isArray(ec) ? ec : []);
      loadDocuments();
    } catch { setError("Failed to load data"); }
    setLoading(false);
  };

  const loadDocuments = () => {
    const docs = [];
    const stored = localStorage.getItem("generated_docs");
    if (stored) { try { docs.push(...JSON.parse(stored)); } catch {} }
    setDocuments(docs);
  };

  useEffect(() => { if (user) loadAll(); }, [user]);

  const authAction = async () => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const body = isSignup
        ? { username: authUsername, email, password }
        : { email, password };
      const r = await fetch(`${BASE}/${isSignup ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const d = await r.json();
      if (isSignup) {
        if (d.user) {
          showToast("Account created! Please sign in.");
          setIsSignup(false);
        } else {
          setAuthError(d.detail || "Signup failed");
        }
      } else {
        if (d.access_token) {
          setUser(d.user);
          localStorage.setItem("user", JSON.stringify(d.user));
          localStorage.setItem("token", d.access_token);
        } else {
          setAuthError(d.detail || "Login failed");
        }
      }
    } catch { setAuthError("Connection error"); }
    setAuthLoading(false);
  };

  const del = async (endpoint, id, setter) => {
    await fetch(`${BASE}/${endpoint}/${id}`, { method: "DELETE", headers: authHeaders() });
    setter(prev => prev.filter(x => x.id !== id));
    showToast("Deleted successfully");
  };

  const post = async (endpoint, body, setter) => {
    const r = await fetch(`${BASE}/${endpoint}`, {
      method: "POST", headers: authHeaders(), body: JSON.stringify(body)
    });
    const d = await r.json();
    if (d.id || d.trip) {
      setter(prev => [...prev, d.trip || d]);
      showToast("Created successfully");
      return true;
    } else {
      showToast(d.detail || "Something went wrong", "error");
      return false;
    }
  };

  const createTrip = async () => {
    const ok = await post("trips", { driver_name: driverName, total_gallons: Number(totalGallons), total_stops: Number(totalStops), status: tripStatus }, setTrips);
    if (ok) { setDriverName(""); setTotalGallons(""); setTotalStops(""); setTripStatus("Active"); }
  };

  const createCustomer = async () => {
    const ok = await post("customers", { name: customerName, billing_address: billingAddress, email: customerEmail }, setCustomers);
    if (ok) { setCustomerName(""); setBillingAddress(""); setCustomerEmail(""); }
  };

  const createVendor = async () => {
    const ok = await post("vendors", { name: vendorName, address: vendorAddress, email: vendorEmail }, setVendors);
    if (ok) { setVendorName(""); setVendorAddress(""); setVendorEmail(""); }
  };

  const createCategory = async () => {
    const ok = await post("product-categories", { name: categoryName }, setCategories);
    if (ok) setCategoryName("");
  };

  const createProduct = async () => {
    const ok = await post("products", { name: productName, product_category_id: Number(productCategoryId) }, setProducts);
    if (ok) { setProductName(""); setProductCategoryId(""); }
  };

  const createFee = async () => {
    const ok = await post("fees", { name: feeName, default_rate: Number(feeRate) }, setFees);
    if (ok) { setFeeName(""); setFeeRate(""); }
  };

  const createTax = async () => {
    const ok = await post("taxes", { name: taxName, percentage: Number(taxPercentage) }, setTaxes);
    if (ok) { setTaxName(""); setTaxPercentage(""); }
  };

  const createTemplate = async () => {
    const ok = await post("document-templates", { document_type: documentType, show_fees: showFees, show_taxes: showTaxes, show_logo: showLogo }, setTemplates);
    if (ok) { setDocumentType("invoice"); setShowFees(false); setShowTaxes(false); setShowLogo(false); }
  };

  const createEmailSettings = async () => {
    const ok = await post("email-settings", {
      provider: emailProvider, email: emailAddress,
      oauth_token: emailToken || null, smtp_host: smtpHost || null,
      smtp_port: smtpPort ? Number(smtpPort) : null, smtp_password: smtpPassword || null,
      is_active: true
    }, setEmailSettings);
    if (ok) { setEmailAddress(""); setEmailToken(""); setSmtpHost(""); setSmtpPort(""); setSmtpPassword(""); }
  };

  const createEmailConfig = async () => {
    const ok = await post("email-send-configurations", { document_type: sendDocType, destination_email: sendDestEmail, is_active: true }, setEmailConfigs);
    if (ok) { setSendDestEmail(""); }
  };

  const generatePDF = async (type, id) => {
    const endpoints = { invoice: `generate-invoice/${id}`, delivery: `generate-delivery-ticket/${id}`, freight: `generate-freight-invoice/${id}` };
    const endpoint = endpoints[type];
    try {
      const r = await fetch(`${BASE}/${endpoint}`, { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } });
      if (r.ok) {
        const blob = await r.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `${type}_${id}.pdf`; a.click();
        const newDoc = { id: Date.now(), type, ref_id: id, generated_at: new Date().toISOString(), status: "Generated" };
        const existing = JSON.parse(localStorage.getItem("generated_docs") || "[]");
        existing.unshift(newDoc);
        localStorage.setItem("generated_docs", JSON.stringify(existing.slice(0, 50)));
        setDocuments(existing.slice(0, 50));
        showToast("PDF downloaded successfully");
      } else {
        showToast("Failed to generate PDF", "error");
      }
    } catch { showToast("Error generating PDF", "error"); }
  };

  const logout = () => { localStorage.removeItem("user"); localStorage.removeItem("token"); setUser(null); };

  const initials = user ? (user.username || "U").substring(0, 2).toUpperCase() : "";
  const today = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const statusClass = (s) => {
    const l = (s || "").toLowerCase();
    if (l === "active") return "status-chip status-active";
    if (l === "pending") return "status-chip status-pending";
    if (l === "completed") return "status-chip status-completed";
    return "status-chip status-default";
  };

  const navSections = [
    { label: "Operations", items: [
      { key: "trips", icon: "ti-route", label: "Trips" },
      { key: "customers", icon: "ti-users", label: "Customers" },
      { key: "vendors", icon: "ti-building-store", label: "Vendors" },
    ]},
    { label: "Catalogue", items: [
      { key: "products", icon: "ti-package", label: "Products" },
      { key: "fees", icon: "ti-receipt", label: "Fees" },
      { key: "taxes", icon: "ti-percentage", label: "Taxes" },
    ]},
    { label: "Documents", items: [
      { key: "templates", icon: "ti-file-description", label: "Templates" },
      { key: "documents", icon: "ti-files", label: "Generated Docs" },
    ]},
    { label: "Settings", items: [
      { key: "email", icon: "ti-mail", label: "Email Settings" },
    ]},
  ];

  const pageTitles = {
    trips: { title: "Trips", sub: "Manage your fleet trips" },
    customers: { title: "Customers", sub: "Manage client accounts" },
    vendors: { title: "Vendors", sub: "Manage vendor partners" },
    products: { title: "Products & Categories", sub: "Manage your product catalogue" },
    fees: { title: "Fees", sub: "Configure fee structures" },
    taxes: { title: "Taxes", sub: "Configure tax rates" },
    templates: { title: "Document Templates", sub: "Configure PDF templates" },
    documents: { title: "Generated Documents", sub: "View and download generated PDFs" },
    email: { title: "Email Settings", sub: "Configure email delivery" },
  };

  if (!user) return (
    <>
      <style>{styles}</style>
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-badge"><span className="logo-dot"></span> TripOS</div>
          <div className="auth-title">{isSignup ? "Create account" : "Welcome back"}</div>
          <div className="auth-sub">{isSignup ? "Sign up for your enterprise dashboard" : "Sign in to your enterprise dashboard"}</div>
          {authError && <div className="error-msg">{authError}</div>}
          {isSignup && (
            <div className="field-wrap">
              <label className="field-label">Username</label>
              <input className="field-input" type="text" placeholder="johndoe" value={authUsername} onChange={e => setAuthUsername(e.target.value)} />
            </div>
          )}
          <div className="field-wrap">
            <label className="field-label">Email address</label>
            <input className="field-input" type="email" placeholder="admin@company.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="field-wrap">
            <label className="field-label">Password</label>
            <input className="field-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && authAction()} />
          </div>
          <button className="btn-primary" onClick={authAction} disabled={authLoading}>
            {authLoading ? "Please wait…" : isSignup ? "Create account →" : "Sign in →"}
          </button>
          <div className="auth-toggle">
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <span onClick={() => { setIsSignup(!isSignup); setAuthError(""); }}>{isSignup ? "Sign in" : "Sign up"}</span>
          </div>
        </div>
      </div>
    </>
  );

  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="loading-wrap"><div className="spinner"></div> Loading dashboard…</div>
    </>
  );

  if (error) return (
    <>
      <style>{styles}</style>
      <div className="loading-wrap" style={{ color: "#e94560" }}>{error}</div>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      {toast && <div className={`toast ${toast.type}`}><i className={`ti ${toast.type === "success" ? "ti-check" : "ti-x"}`}></i> {toast.msg}</div>}

      <div className="dash-wrap">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sidebar-logo"><span className="logo-dot"></span> TripOS</div>
          {navSections.map(section => (
            <div key={section.label}>
              <div className="nav-label">{section.label}</div>
              {section.items.map(({ key, icon, label }) => (
                <button key={key} className={`nav-item${activeTab === key ? " active" : ""}`} onClick={() => setActiveTab(key)}>
                  <i className={`ti ${icon}`}></i> {label}
                </button>
              ))}
            </div>
          ))}
          <div className="sidebar-bottom">
            <div className="user-pill">
              <div className="avatar">{initials}</div>
              <div>
                <div className="user-name">{user.username}</div>
                <div className="user-role">Administrator</div>
              </div>
              <button className="btn-logout" onClick={logout} title="Logout">
                <i className="ti ti-logout"></i>
              </button>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main">
          <div className="topbar">
            <div>
              <div className="page-title">{pageTitles[activeTab]?.title}</div>
              <div className="page-sub">{pageTitles[activeTab]?.sub}</div>
            </div>
            <div className="date-chip">{today}</div>
          </div>

          <div className="content">

            {/* ── STATS ── */}
            <div className="stats-grid">
              {[
                { label: "Total Trips", value: trips.length, delta: "Active fleet" },
                { label: "Customers", value: customers.length, delta: "Client base" },
                { label: "Vendors", value: vendors.length, delta: "Partners" },
                { label: "Documents", value: documents.length, delta: "Generated PDFs" },
              ].map(s => (
                <div className="stat-card" key={s.label}>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-delta">↑ {s.delta}</div>
                </div>
              ))}
            </div>

            {/* ── TRIPS ── */}
            {activeTab === "trips" && (
              <div className="two-col">
                <div className="col-form">
                  <div className="panel">
                    <div className="panel-head"><div className="panel-title"><i className="ti ti-plus"></i> New Trip</div></div>
                    <div className="panel-body">
                      {[
                        { label: "Driver Name", val: driverName, set: setDriverName, ph: "Full name", type: "text" },
                        { label: "Total Gallons", val: totalGallons, set: setTotalGallons, ph: "0", type: "number" },
                        { label: "Total Stops", val: totalStops, set: setTotalStops, ph: "0", type: "number" },
                      ].map(f => (
                        <div className="form-field" key={f.label}>
                          <label className="form-label">{f.label}</label>
                          <input className="form-input" type={f.type} placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)} />
                        </div>
                      ))}
                      <div className="form-field">
                        <label className="form-label">Status</label>
                        <select className="form-select" value={tripStatus} onChange={e => setTripStatus(e.target.value)}>
                          <option>Active</option>
                          <option>Pending</option>
                          <option>Completed</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-footer">
                      <button className="btn-submit" onClick={createTrip}><i className="ti ti-route"></i> Add Trip</button>
                    </div>
                  </div>
                </div>
                <div className="col-list">
                  <div className="section-head">{trips.length} trip{trips.length !== 1 ? "s" : ""} recorded</div>
                  {trips.length ? (
                    <div className="cards-grid">
                      {trips.map(t => (
                        <div className="data-card" key={t.id}>
                          <button className="delete-btn" onClick={() => del("trips", t.id, setTrips)}><i className="ti ti-trash"></i></button>
                          <div className="data-card-name">{t.driver_name}</div>
                          <div className="data-card-meta">
                            <span className="meta-chip"><i className="ti ti-droplet"></i> {t.total_gallons} gal</span>
                            <span className="meta-chip"><i className="ti ti-map-pin"></i> {t.total_stops} stops</span>
                            <span className={statusClass(t.status)}>{t.status || "—"}</span>
                          </div>
                          <div className="card-actions">
                            <button className="action-btn" onClick={() => generatePDF("invoice", t.id)}><i className="ti ti-file-invoice"></i> Invoice</button>
                            <button className="action-btn" onClick={() => generatePDF("delivery", t.id)}><i className="ti ti-truck"></i> Delivery</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="list-empty"><i className="ti ti-route"></i>No trips yet. Add your first trip.</div>
                  )}
                </div>
              </div>
            )}

            {/* ── CUSTOMERS ── */}
            {activeTab === "customers" && (
              <div className="two-col">
                <div className="col-form">
                  <div className="panel">
                    <div className="panel-head"><div className="panel-title"><i className="ti ti-user-plus"></i> New Customer</div></div>
                    <div className="panel-body">
                      <div className="form-field"><label className="form-label">Customer Name</label><input className="form-input" placeholder="Full name" value={customerName} onChange={e => setCustomerName(e.target.value)} /></div>
                      <div className="form-field"><label className="form-label">Billing Address</label><input className="form-input" placeholder="Street, City" value={billingAddress} onChange={e => setBillingAddress(e.target.value)} /></div>
                      <div className="form-field"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="customer@email.com" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} /></div>
                    </div>
                    <div className="form-footer">
                      <button className="btn-submit" onClick={createCustomer}><i className="ti ti-plus"></i> Add Customer</button>
                    </div>
                  </div>
                </div>
                <div className="col-list">
                  <div className="section-head">{customers.length} customer{customers.length !== 1 ? "s" : ""}</div>
                  {customers.length ? (
                    <div className="cards-grid">
                      {customers.map(c => (
                        <div className="data-card" key={c.id}>
                          <button className="delete-btn" onClick={() => del("customers", c.id, setCustomers)}><i className="ti ti-trash"></i></button>
                          <div className="data-card-name">{c.name}</div>
                          <div className="data-card-meta">
                            <span className="meta-chip"><i className="ti ti-map-pin"></i> {c.billing_address || "—"}</span>
                            <span className="meta-chip"><i className="ti ti-mail"></i> {c.email || "—"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="list-empty"><i className="ti ti-users"></i>No customers yet.</div>
                  )}
                </div>
              </div>
            )}

            {/* ── VENDORS ── */}
            {activeTab === "vendors" && (
              <div className="two-col">
                <div className="col-form">
                  <div className="panel">
                    <div className="panel-head"><div className="panel-title"><i className="ti ti-building-plus"></i> New Vendor</div></div>
                    <div className="panel-body">
                      <div className="form-field"><label className="form-label">Vendor Name</label><input className="form-input" placeholder="Company name" value={vendorName} onChange={e => setVendorName(e.target.value)} /></div>
                      <div className="form-field"><label className="form-label">Address</label><input className="form-input" placeholder="Street, City" value={vendorAddress} onChange={e => setVendorAddress(e.target.value)} /></div>
                      <div className="form-field"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="vendor@email.com" value={vendorEmail} onChange={e => setVendorEmail(e.target.value)} /></div>
                    </div>
                    <div className="form-footer">
                      <button className="btn-submit" onClick={createVendor}><i className="ti ti-plus"></i> Add Vendor</button>
                    </div>
                  </div>
                  <div className="panel">
                    <div className="panel-head"><div className="panel-title"><i className="ti ti-file-invoice"></i> Freight Invoice</div></div>
                    <div className="panel-body">
                      <div className="form-field">
                        <label className="form-label">Select Vendor</label>
                        <select className="form-select" onChange={e => generatePDF("freight", e.target.value)}>
                          <option value="">— Generate freight invoice —</option>
                          {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-list">
                  <div className="section-head">{vendors.length} vendor{vendors.length !== 1 ? "s" : ""}</div>
                  {vendors.length ? (
                    <div className="cards-grid">
                      {vendors.map(v => (
                        <div className="data-card" key={v.id}>
                          <button className="delete-btn" onClick={() => del("vendors", v.id, setVendors)}><i className="ti ti-trash"></i></button>
                          <div className="data-card-name">{v.name}</div>
                          <div className="data-card-meta">
                            <span className="meta-chip"><i className="ti ti-map-pin"></i> {v.address || "—"}</span>
                            <span className="meta-chip"><i className="ti ti-mail"></i> {v.email || "—"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="list-empty"><i className="ti ti-building-store"></i>No vendors yet.</div>
                  )}
                </div>
              </div>
            )}

            {/* ── PRODUCTS ── */}
            {activeTab === "products" && (
              <div className="two-col">
                <div className="col-form">
                  <div className="panel">
                    <div className="panel-head"><div className="panel-title"><i className="ti ti-category"></i> New Category</div></div>
                    <div className="panel-body">
                      <div className="form-field"><label className="form-label">Category Name</label><input className="form-input" placeholder="e.g. ULSD, DEF" value={categoryName} onChange={e => setCategoryName(e.target.value)} /></div>
                    </div>
                    <div className="form-footer">
                      <button className="btn-submit" onClick={createCategory}><i className="ti ti-plus"></i> Add Category</button>
                    </div>
                  </div>
                  <div className="panel">
                    <div className="panel-head"><div className="panel-title"><i className="ti ti-package"></i> New Product</div></div>
                    <div className="panel-body">
                      <div className="form-field"><label className="form-label">Product Name</label><input className="form-input" placeholder="e.g. Diesel Fuel" value={productName} onChange={e => setProductName(e.target.value)} /></div>
                      <div className="form-field">
                        <label className="form-label">Category</label>
                        <select className="form-select" value={productCategoryId} onChange={e => setProductCategoryId(e.target.value)}>
                          <option value="">— Select category —</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-footer">
                      <button className="btn-submit" onClick={createProduct}><i className="ti ti-plus"></i> Add Product</button>
                    </div>
                  </div>
                </div>
                <div className="col-list">
                  <div className="section-head">{categories.length} categories</div>
                  {categories.length ? (
                    <div className="cards-grid" style={{ marginBottom: 16 }}>
                      {categories.map(c => (
                        <div className="data-card" key={c.id}>
                          <button className="delete-btn" onClick={() => del("product-categories", c.id, setCategories)}><i className="ti ti-trash"></i></button>
                          <div className="data-card-name">{c.name}</div>
                          <div className="data-card-meta"><span className="meta-chip"><i className="ti ti-tag"></i> Category</span></div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="list-empty" style={{ marginBottom: 16 }}><i className="ti ti-category"></i>No categories yet.</div>}
                  <div className="section-head">{products.length} products</div>
                  {products.length ? (
                    <div className="cards-grid">
                      {products.map(p => (
                        <div className="data-card" key={p.id}>
                          <button className="delete-btn" onClick={() => del("products", p.id, setProducts)}><i className="ti ti-trash"></i></button>
                          <div className="data-card-name">{p.name}</div>
                          <div className="data-card-meta">
                            <span className="meta-chip"><i className="ti ti-category"></i> {categories.find(c => c.id === p.product_category_id)?.name || "—"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="list-empty"><i className="ti ti-package"></i>No products yet.</div>}
                </div>
              </div>
            )}

            {/* ── FEES ── */}
            {activeTab === "fees" && (
              <div className="two-col">
                <div className="col-form">
                  <div className="panel">
                    <div className="panel-head"><div className="panel-title"><i className="ti ti-receipt"></i> New Fee</div></div>
                    <div className="panel-body">
                      <div className="form-field"><label className="form-label">Fee Name</label><input className="form-input" placeholder="e.g. Environmental Fee" value={feeName} onChange={e => setFeeName(e.target.value)} /></div>
                      <div className="form-field"><label className="form-label">Default Rate ($)</label><input className="form-input" type="number" placeholder="0.00" value={feeRate} onChange={e => setFeeRate(e.target.value)} /></div>
                    </div>
                    <div className="form-footer">
                      <button className="btn-submit" onClick={createFee}><i className="ti ti-plus"></i> Add Fee</button>
                    </div>
                  </div>
                </div>
                <div className="col-list">
                  <div className="section-head">{fees.length} fee{fees.length !== 1 ? "s" : ""} configured</div>
                  {fees.length ? (
                    <div className="cards-grid">
                      {fees.map(f => (
                        <div className="data-card" key={f.id}>
                          <button className="delete-btn" onClick={() => del("fees", f.id, setFees)}><i className="ti ti-trash"></i></button>
                          <div className="data-card-name">{f.name}</div>
                          <div className="data-card-meta">
                            <span className="meta-chip"><i className="ti ti-currency-dollar"></i> ${f.default_rate?.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="list-empty"><i className="ti ti-receipt"></i>No fees configured yet.</div>}
                </div>
              </div>
            )}

            {/* ── TAXES ── */}
            {activeTab === "taxes" && (
              <div className="two-col">
                <div className="col-form">
                  <div className="panel">
                    <div className="panel-head"><div className="panel-title"><i className="ti ti-percentage"></i> New Tax</div></div>
                    <div className="panel-body">
                      <div className="form-field"><label className="form-label">Tax Name</label><input className="form-input" placeholder="e.g. Sales Tax" value={taxName} onChange={e => setTaxName(e.target.value)} /></div>
                      <div className="form-field"><label className="form-label">Percentage (%)</label><input className="form-input" type="number" placeholder="0.00" value={taxPercentage} onChange={e => setTaxPercentage(e.target.value)} /></div>
                    </div>
                    <div className="form-footer">
                      <button className="btn-submit" onClick={createTax}><i className="ti ti-plus"></i> Add Tax</button>
                    </div>
                  </div>
                </div>
                <div className="col-list">
                  <div className="section-head">{taxes.length} tax{taxes.length !== 1 ? "es" : ""} configured</div>
                  {taxes.length ? (
                    <div className="cards-grid">
                      {taxes.map(t => (
                        <div className="data-card" key={t.id}>
                          <button className="delete-btn" onClick={() => del("taxes", t.id, setTaxes)}><i className="ti ti-trash"></i></button>
                          <div className="data-card-name">{t.name}</div>
                          <div className="data-card-meta">
                            <span className="meta-chip"><i className="ti ti-percentage"></i> {t.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="list-empty"><i className="ti ti-percentage"></i>No taxes configured yet.</div>}
                </div>
              </div>
            )}

            {/* ── TEMPLATES ── */}
            {activeTab === "templates" && (
              <div className="two-col">
                <div className="col-form">
                  <div className="panel">
                    <div className="panel-head"><div className="panel-title"><i className="ti ti-file-plus"></i> New Template</div></div>
                    <div className="panel-body">
                      <div className="form-field">
                        <label className="form-label">Document Type</label>
                        <select className="form-select" value={documentType} onChange={e => setDocumentType(e.target.value)}>
                          <option value="invoice">Invoice</option>
                          <option value="delivery_ticket">Delivery Ticket</option>
                          <option value="freight_invoice">Freight Invoice</option>
                        </select>
                      </div>
                      <div className="check-row">
                        <label className="check-item"><input type="checkbox" checked={showFees} onChange={e => setShowFees(e.target.checked)} /> Show Fees</label>
                        <label className="check-item"><input type="checkbox" checked={showTaxes} onChange={e => setShowTaxes(e.target.checked)} /> Show Taxes</label>
                        <label className="check-item"><input type="checkbox" checked={showLogo} onChange={e => setShowLogo(e.target.checked)} /> Show Logo</label>
                      </div>
                    </div>
                    <div className="form-footer">
                      <button className="btn-submit" onClick={createTemplate}><i className="ti ti-file-description"></i> Save Template</button>
                    </div>
                  </div>
                </div>
                <div className="col-list">
                  <div className="section-head">{templates.length} template{templates.length !== 1 ? "s" : ""}</div>
                  {templates.length ? (
                    <div className="cards-grid">
                      {templates.map(t => (
                        <div className="data-card" key={t.id}>
                          <button className="delete-btn" onClick={() => del("document-templates", t.id, setTemplates)}><i className="ti ti-trash"></i></button>
                          <div className="data-card-name">{t.document_type}</div>
                          <div className="data-card-meta">
                            <span className="meta-chip">Fees: <span className={t.show_fees ? "bool-yes" : "bool-no"}>{t.show_fees ? "Yes" : "No"}</span></span>
                            <span className="meta-chip">Taxes: <span className={t.show_taxes ? "bool-yes" : "bool-no"}>{t.show_taxes ? "Yes" : "No"}</span></span>
                            <span className="meta-chip">Logo: <span className={t.show_logo ? "bool-yes" : "bool-no"}>{t.show_logo ? "Yes" : "No"}</span></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="list-empty"><i className="ti ti-file-description"></i>No templates yet.</div>}
                </div>
              </div>
            )}

            {/* ── DOCUMENTS ── */}
            {activeTab === "documents" && (
              <div>
                {documents.length ? (
                  <table className="doc-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Reference ID</th>
                        <th>Generated At</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map(doc => (
                        <tr key={doc.id}>
                          <td>
                            <span className={`badge-pill ${doc.type === "invoice" ? "pill-invoice" : doc.type === "delivery" ? "pill-delivery" : "pill-freight"}`}>
                              <i className={`ti ${doc.type === "invoice" ? "ti-file-invoice" : doc.type === "delivery" ? "ti-truck" : "ti-file-description"}`}></i>
                              {doc.type}
                            </span>
                          </td>
                          <td>#{doc.ref_id}</td>
                          <td>{new Date(doc.generated_at).toLocaleString()}</td>
                          <td><span className="status-chip status-active">{doc.status}</span></td>
                          <td>
                            <button className="action-btn" onClick={() => generatePDF(doc.type, doc.ref_id)}>
                              <i className="ti ti-download"></i> Re-download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="list-empty"><i className="ti ti-files"></i>No documents generated yet. Go to Trips or Vendors to generate PDFs.</div>
                )}
              </div>
            )}

            {/* ── EMAIL SETTINGS ── */}
            {activeTab === "email" && (
              <div className="settings-grid">
                <div>
                  <div className="panel">
                    <div className="panel-head"><div className="panel-title"><i className="ti ti-mail-cog"></i> Email Provider</div></div>
                    <div className="panel-body">
                      <div className="form-field">
                        <label className="form-label">Provider</label>
                        <select className="form-select" value={emailProvider} onChange={e => setEmailProvider(e.target.value)}>
                          <option value="gmail">Gmail</option>
                          <option value="smtp">SMTP</option>
                        </select>
                      </div>
                      <div className="form-field"><label className="form-label">Email Address</label><input className="form-input" type="email" placeholder="sender@gmail.com" value={emailAddress} onChange={e => setEmailAddress(e.target.value)} /></div>
                      {emailProvider === "gmail" && (
                        <div className="form-field"><label className="form-label">App Password / OAuth Token</label><input className="form-input" type="password" placeholder="••••••••" value={emailToken} onChange={e => setEmailToken(e.target.value)} /></div>
                      )}
                      {emailProvider === "smtp" && (<>
                        <div className="form-field"><label className="form-label">SMTP Host</label><input className="form-input" placeholder="smtp.yourserver.com" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} /></div>
                        <div className="form-field"><label className="form-label">SMTP Port</label><input className="form-input" type="number" placeholder="587" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} /></div>
                        <div className="form-field"><label className="form-label">SMTP Password</label><input className="form-input" type="password" placeholder="••••••••" value={smtpPassword} onChange={e => setSmtpPassword(e.target.value)} /></div>
                      </>)}
                    </div>
                    <div className="form-footer">
                      <button className="btn-submit" onClick={createEmailSettings}><i className="ti ti-device-floppy"></i> Save Settings</button>
                    </div>
                  </div>
                  <div className="panel">
                    <div className="panel-head"><div className="panel-title"><i className="ti ti-send"></i> Send Configuration</div></div>
                    <div className="panel-body">
                      <div className="form-field">
                        <label className="form-label">Document Type</label>
                        <select className="form-select" value={sendDocType} onChange={e => setSendDocType(e.target.value)}>
                          <option value="invoice">Invoice</option>
                          <option value="delivery_ticket">Delivery Ticket</option>
                          <option value="freight_invoice">Freight Invoice</option>
                        </select>
                      </div>
                      <div className="form-field"><label className="form-label">Destination Email</label><input className="form-input" type="email" placeholder="billing@customer.com" value={sendDestEmail} onChange={e => setSendDestEmail(e.target.value)} /></div>
                    </div>
                    <div className="form-footer">
                      <button className="btn-submit" onClick={createEmailConfig}><i className="ti ti-plus"></i> Add Config</button>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="section-head">Active email providers</div>
                  {emailSettings.length ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                      {emailSettings.map(s => (
                        <div className="data-card" key={s.id}>
                          <button className="delete-btn" onClick={() => del("email-settings", s.id, setEmailSettings)}><i className="ti ti-trash"></i></button>
                          <div className="data-card-name">{s.email}</div>
                          <div className="data-card-meta">
                            <span className="meta-chip"><i className="ti ti-server"></i> {s.provider}</span>
                            <span className={`status-chip ${s.is_active ? "status-active" : "status-default"}`}>{s.is_active ? "Active" : "Inactive"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="list-empty" style={{ marginBottom: 16 }}><i className="ti ti-mail"></i>No email providers configured.</div>}
                  <div className="section-head">Send configurations</div>
                  {emailConfigs.length ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {emailConfigs.map(c => (
                        <div className="data-card" key={c.id}>
                          <button className="delete-btn" onClick={() => del("email-send-configurations", c.id, setEmailConfigs)}><i className="ti ti-trash"></i></button>
                          <div className="data-card-name">{c.destination_email}</div>
                          <div className="data-card-meta">
                            <span className="meta-chip"><i className="ti ti-file"></i> {c.document_type}</span>
                            <span className={`status-chip ${c.is_active ? "status-active" : "status-default"}`}>{c.is_active ? "Active" : "Inactive"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="list-empty"><i className="ti ti-send"></i>No send configurations yet.</div>}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}