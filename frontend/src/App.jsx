import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

const BASE = "https://enterprise-trip-management-system.onrender.com";
const authHeaders = () => ({ "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` });

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
  const [shiptos, setShiptos] = useState([]);
  const [invoiceConfigs, setInvoiceConfigs] = useState([]);
  const [companySettings, setCompanySettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [authUsername, setAuthUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } });
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
  const [showFees, setShowFees] = useState(true);
  const [showTaxes, setShowTaxes] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [showDeliveryTimestamp, setShowDeliveryTimestamp] = useState(false);
  const [showDueDate, setShowDueDate] = useState(true);
  const [emailProvider, setEmailProvider] = useState("gmail");
  const [emailAddress, setEmailAddress] = useState("");
  const [emailToken, setEmailToken] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [sendDocType, setSendDocType] = useState("invoice");
  const [sendDestEmail, setSendDestEmail] = useState("");
  const [shiptoCustomerId, setShiptoCustomerId] = useState("");
  const [shiptoName, setShiptoName] = useState("");
  const [shiptoAddress, setShiptoAddress] = useState("");
  const [invCustomerId, setInvCustomerId] = useState("");
  const [invShiptoId, setInvShiptoId] = useState("");
  const [invVendorId, setInvVendorId] = useState("");
  const [invShiptos, setInvShiptos] = useState([]);
  const [invProducts, setInvProducts] = useState([{ product_id: "", quantity: "", unit_price: "" }]);
  const [invFees, setInvFees] = useState([{ fee_id: "", quantity: "1", rate: "" }]);
  const [invTaxes, setInvTaxes] = useState([{ tax_id: "", basis: "" }]);
  const [invValidationMsg, setInvValidationMsg] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyPaymentTerms, setCompanyPaymentTerms] = useState("Net 30");
  const [editingCompanyId, setEditingCompanyId] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const loadAll = async () => {
    setLoading(true);
    const h = { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } };
    const safe = async (url) => { try { const r = await fetch(url, h); const d = await r.json(); return Array.isArray(d) ? d : []; } catch { return []; } };
    const [t, c, v, p, cat, f, tx, tpl, es, ec, st, ic, cs] = await Promise.all([
      safe(`${BASE}/trips`), safe(`${BASE}/customers`), safe(`${BASE}/vendors`), safe(`${BASE}/products`),
      safe(`${BASE}/product-categories`), safe(`${BASE}/fees`), safe(`${BASE}/taxes`), safe(`${BASE}/document-templates`),
      safe(`${BASE}/email-settings`), safe(`${BASE}/email-send-configurations`), safe(`${BASE}/shipto`),
      safe(`${BASE}/invoice-configurations`), safe(`${BASE}/company-settings`),
    ]);
    setTrips(t); setCustomers(c); setVendors(v); setProducts(p); setCategories(cat); setFees(f);
    setTaxes(tx); setTemplates(tpl); setEmailSettings(es); setEmailConfigs(ec); setShiptos(st);
    setInvoiceConfigs(ic); setCompanySettings(cs);
    const stored = localStorage.getItem("generated_docs");
    if (stored) { try { setDocuments(JSON.parse(stored)); } catch {} }
    setLoading(false);
  };

  useEffect(() => { if (user) loadAll(); }, [user]);

  const authAction = async () => {
    setAuthLoading(true); setAuthError("");
    try {
      const body = isSignup ? { username: authUsername, email, password } : { email, password };
      const r = await fetch(`${BASE}/${isSignup ? "signup" : "login"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (isSignup) { if (d.user) { showToast("Account created!"); setIsSignup(false); } else setAuthError(d.detail || "Signup failed"); }
      else { if (d.access_token) { setUser(d.user); localStorage.setItem("user", JSON.stringify(d.user)); localStorage.setItem("token", d.access_token); } else setAuthError(d.detail || "Login failed"); }
    } catch { setAuthError("Connection error"); }
    setAuthLoading(false);
  };

  const del = async (endpoint, id, setter) => { await fetch(`${BASE}/${endpoint}/${id}`, { method: "DELETE", headers: authHeaders() }); setter(prev => prev.filter(x => x.id !== id)); showToast("Deleted successfully"); };
  const post = async (endpoint, body, setter) => { const r = await fetch(`${BASE}/${endpoint}`, { method: "POST", headers: authHeaders(), body: JSON.stringify(body) }); const d = await r.json(); if (d.id || d.trip) { setter(prev => [...prev, d.trip || d]); showToast("Created successfully"); return d.trip || d; } else { showToast(d.detail || "Something went wrong", "error"); return null; } };
  const put = async (endpoint, id, body, setter) => { const r = await fetch(`${BASE}/${endpoint}/${id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(body) }); const d = await r.json(); if (d.id) { setter(prev => prev.map(x => x.id === id ? d : x)); showToast("Updated"); return d; } else { showToast(d.detail || "Error", "error"); return null; } };

  const createTrip = async () => { const ok = await post("trips", { driver_name: driverName, total_gallons: Number(totalGallons), total_stops: Number(totalStops), status: tripStatus }, setTrips); if (ok) { setDriverName(""); setTotalGallons(""); setTotalStops(""); setTripStatus("Active"); setShowNewTripModal(false); } };
  const createCustomer = async () => { const ok = await post("customers", { name: customerName, billing_address: billingAddress, email: customerEmail }, setCustomers); if (ok) { setCustomerName(""); setBillingAddress(""); setCustomerEmail(""); setShowCustomerModal(false); } };
  const createVendor = async () => { const ok = await post("vendors", { name: vendorName, address: vendorAddress, email: vendorEmail }, setVendors); if (ok) { setVendorName(""); setVendorAddress(""); setVendorEmail(""); } };
  const createCategory = async () => { const ok = await post("product-categories", { name: categoryName }, setCategories); if (ok) setCategoryName(""); };
  const createProduct = async () => { const ok = await post("products", { name: productName, product_category_id: Number(productCategoryId) }, setProducts); if (ok) { setProductName(""); setProductCategoryId(""); } };
  const createFee = async () => { const ok = await post("fees", { name: feeName, default_rate: Number(feeRate) }, setFees); if (ok) { setFeeName(""); setFeeRate(""); } };
  const createTax = async () => { const ok = await post("taxes", { name: taxName, percentage: Number(taxPercentage) }, setTaxes); if (ok) { setTaxName(""); setTaxPercentage(""); } };
  const createTemplate = async () => { const ok = await post("document-templates", { document_type: documentType, show_fees: showFees, show_taxes: showTaxes, show_logo: showLogo }, setTemplates); if (ok) { setDocumentType("invoice"); setShowFees(true); setShowTaxes(true); setShowLogo(true); } };
  const createEmailSettings = async () => { const ok = await post("email-settings", { provider: emailProvider, email: emailAddress, oauth_token: emailToken || null, smtp_host: smtpHost || null, smtp_port: smtpPort ? Number(smtpPort) : null, smtp_password: smtpPassword || null, is_active: true }, setEmailSettings); if (ok) { setEmailAddress(""); setEmailToken(""); } };
  const createEmailConfig = async () => { const ok = await post("email-send-configurations", { document_type: sendDocType, destination_email: sendDestEmail, is_active: true }, setEmailConfigs); if (ok) setSendDestEmail(""); };
  const createShipTo = async () => { if (!shiptoCustomerId || !shiptoName || !shiptoAddress) { showToast("Fill all fields", "error"); return; } const ok = await post("shipto", { customer_id: Number(shiptoCustomerId), name: shiptoName, address: shiptoAddress }, setShiptos); if (ok) { setShiptoName(""); setShiptoAddress(""); await loadAll(); } };
  const loadShiptosForCustomer = (cid) => { if (!cid) { setInvShiptos([]); setInvShiptoId(""); return; } setInvShiptos(shiptos.filter(s => s.customer_id === Number(cid))); setInvShiptoId(""); };

  const createInvoiceConfig = async () => {
    setInvValidationMsg("");
    if (!invCustomerId) { setInvValidationMsg("Please select a customer"); return; }
    if (!invShiptoId) { setInvValidationMsg("Please select a Ship To location"); return; }
    const vp = invProducts.filter(p => p.product_id && p.quantity && p.unit_price).map(p => ({ product_id: Number(p.product_id), quantity: Number(p.quantity), unit_price: Number(p.unit_price) }));
    if (!vp.length) { setInvValidationMsg("Add at least one product"); return; }
    const vf = invFees.filter(f => f.fee_id).map(f => ({ fee_id: Number(f.fee_id), quantity: Number(f.quantity) || 1, rate: Number(f.rate) || 0 }));
    const vt = invTaxes.filter(t => t.tax_id).map(t => ({ tax_id: Number(t.tax_id), basis: Number(t.basis) || 0 }));
    const ok = await post("invoice-configurations", { customer_id: Number(invCustomerId), shipto_id: Number(invShiptoId), vendor_id: invVendorId ? Number(invVendorId) : null, invoice_time: { hour: 8, minute: 0 }, products: vp, fees: vf, taxes: vt }, setInvoiceConfigs);
    if (ok) { setInvCustomerId(""); setInvShiptoId(""); setInvVendorId(""); setInvShiptos([]); setInvProducts([{ product_id: "", quantity: "", unit_price: "" }]); setInvFees([{ fee_id: "", quantity: "1", rate: "" }]); setInvTaxes([{ tax_id: "", basis: "" }]); setInvValidationMsg(""); }
  };

  const saveCompanySettings = async () => {
    const body = { company_name: companyName, address: companyAddress, phone: companyPhone, email: companyEmail, website: companyWebsite, payment_terms: companyPaymentTerms };
    if (editingCompanyId) { const ok = await put("company-settings", editingCompanyId, body, setCompanySettings); if (ok) setEditingCompanyId(null); } else await post("company-settings", body, setCompanySettings);
    setCompanyName(""); setCompanyAddress(""); setCompanyPhone(""); setCompanyEmail(""); setCompanyWebsite(""); setCompanyPaymentTerms("Net 30");
  };
  const editCompany = (s) => { setEditingCompanyId(s.id); setCompanyName(s.company_name || ""); setCompanyAddress(s.address || ""); setCompanyPhone(s.phone || ""); setCompanyEmail(s.email || ""); setCompanyWebsite(s.website || ""); setCompanyPaymentTerms(s.payment_terms || "Net 30"); setActiveTab("company"); };

  const generatePDF = async (type, id) => {
    const endpoints = { invoice: `generate-invoice/${id}`, delivery: `generate-delivery-ticket/${id}`, freight: `generate-freight-invoice/${id}`, "invoice-config": `generate-invoice-from-config/${id}`, "delivery-config": `generate-delivery-ticket-from-config/${id}` };
    try {
      const r = await fetch(`${BASE}/${endpoints[type]}`, { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } });
      if (r.ok) {
        const blob = await r.blob(); const url = window.URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${type}_${id}.pdf`; a.click();
        const newDoc = { id: Date.now(), type, ref_id: id, generated_at: new Date().toISOString(), status: "Generated" };
        const existing = JSON.parse(localStorage.getItem("generated_docs") || "[]"); existing.unshift(newDoc);
        localStorage.setItem("generated_docs", JSON.stringify(existing.slice(0, 50))); setDocuments(existing.slice(0, 50));
        showToast("PDF downloaded!");
      } else showToast("Failed to generate PDF", "error");
    } catch { showToast("Error generating PDF", "error"); }
  };

  const logout = () => { localStorage.removeItem("user"); localStorage.removeItem("token"); setUser(null); };
  const initials = user ? (user.username || "U").substring(0, 2).toUpperCase() : "";

  const statusBadge = (s) => {
    const l = (s || "").toLowerCase();
    const map = { active: ["#dcfce7","#16a34a","#bbf7d0"], completed: ["#dcfce7","#16a34a","#bbf7d0"], "in progress": ["#dbeafe","#2563eb","#bfdbfe"], pending: ["#fef9c3","#ca8a04","#fde68a"], cancelled: ["#fee2e2","#dc2626","#fecaca"] };
    const [bg, color, border] = map[l] || ["#f3f4f6","#6b7280","#e5e7eb"];
    return <span style={{ background: bg, color, border: `1px solid ${border}`, fontSize: 12, fontWeight: 500, padding: "2px 10px", borderRadius: 99, display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }}></span>{s || "—"}</span>;
  };

  const F = { // shared form styles
    label: { fontSize: 11, fontWeight: 600, color: "#76777d", letterSpacing: "0.08em", display: "block", marginBottom: 4 },
    input: { width: "100%", padding: "8px 10px", border: "1px solid #c6c6cd", borderRadius: 4, fontSize: 13, color: "#1b1b1d", background: "#fff", outline: "none" },
    select: { width: "100%", padding: "8px 10px", border: "1px solid #c6c6cd", borderRadius: 4, fontSize: 13, color: "#1b1b1d", background: "#fff", outline: "none" },
    panel: { background: "#fff", border: "1px solid #e4e2e4", borderRadius: 6, overflow: "hidden", marginBottom: 14 },
    panelHead: { padding: "13px 16px", borderBottom: "1px solid #e4e2e4", fontSize: 14, fontWeight: 600, color: "#1b1b1d" },
    panelBody: { padding: 16, display: "flex", flexDirection: "column", gap: 12 },
    panelFoot: { padding: "10px 16px", borderTop: "1px solid #e4e2e4", display: "flex", justifyContent: "flex-end", gap: 8 },
    btnPrimary: { padding: "8px 20px", background: "#1b1b1d", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 },
    btnGhost: { padding: "8px 16px", border: "1px solid #c6c6cd", borderRadius: 4, fontSize: 13, background: "#fff", cursor: "pointer", color: "#1b1b1d" },
    btnGreen: { padding: "8px 16px", background: "#16a34a", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 },
    th: { textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#76777d", letterSpacing: "0.08em", background: "#f6f3f5", borderBottom: "1px solid #e4e2e4" },
    td: { padding: "11px 16px", borderBottom: "1px solid #f0edef", fontSize: 13, color: "#1b1b1d" },
    chip: (bg, color) => ({ background: bg, color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4 }),
  };
  const navItems = [
    { key: "dashboard", icon: "dashboard", label: "Dashboard" },
    { key: "trips", icon: "local_shipping", label: "Trips" },
    { key: "customers", icon: "groups", label: "Customers" },
    { key: "vendors", icon: "storefront", label: "Vendors" },
    { key: "products", icon: "conveyor_belt", label: "Products & Fees" },
    { key: "templates", icon: "description", label: "Document Templates" },
    { key: "documents", icon: "folder_open", label: "Documents Archive" },
    { key: "invoice-config", icon: "receipt_long", label: "Invoice Config" },
    { key: "shipto", icon: "pin_drop", label: "Ship To" },
    { key: "email", icon: "mail", label: "Email Settings" },
    { key: "company", icon: "business", label: "Company Settings" },
  ];

  const CSS = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#f6f3f5}
    input,select,textarea,button{font-family:'Inter',sans-serif}
    input:focus,select:focus{border-color:#1b1b1d!important;outline:none;box-shadow:0 0 0 2px rgba(27,27,29,0.1)}
    .ms{font-family:'Material Symbols Outlined';font-size:20px;line-height:1;vertical-align:middle;user-select:none}
    .ms16{font-family:'Material Symbols Outlined';font-size:16px;line-height:1;vertical-align:middle;user-select:none}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#c6c6cd;border-radius:2px}
    tr:hover td{background:rgba(0,0,0,0.015)!important}
    @keyframes slideIn{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .nav-hover:hover{background:#f0edef!important;color:#1b1b1d!important}
    .row-btn:hover{background:#f0edef!important;border-color:#c6c6cd!important}
    .modal-bg{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;z-index:999}
    .toggle{width:44px;height:24px;background:#c6c6cd;border-radius:12px;position:relative;cursor:pointer;transition:background 0.2s;border:none;flex-shrink:0}
    .toggle.on{background:#1b1b1d}
    .toggle::after{content:'';position:absolute;width:18px;height:18px;background:white;border-radius:50%;top:3px;left:3px;transition:left 0.2s}
    .toggle.on::after{left:23px}
    .page-header{font-size:28px;font-weight:700;letter-spacing:-0.02em;color:#1b1b1d;margin-bottom:4px}
    .page-sub{font-size:14px;color:#76777d;margin-bottom:20px}
  `;

  if (!user) return (
    <div style={{ minHeight:"100vh", background:"#f6f3f5", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      <style>{CSS}</style>
      <div style={{ width:400 }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:22, fontWeight:700, color:"#1b1b1d", letterSpacing:"-0.01em" }}>Trip Summary System</div>
          <div style={{ fontSize:11, fontWeight:600, color:"#76777d", letterSpacing:"0.08em", marginTop:2 }}>LOGISTICS MANAGEMENT</div>
        </div>
        <div style={{ background:"#fff", border:"1px solid #c6c6cd", borderRadius:8, padding:28 }}>
          <div style={{ fontSize:18, fontWeight:600, color:"#1b1b1d", marginBottom:4 }}>{isSignup ? "Create account" : "Welcome back"}</div>
          <div style={{ fontSize:13, color:"#76777d", marginBottom:20 }}>Sign in to access your logistics dashboard</div>
          {authError && <div style={{ background:"#ffdad6", color:"#93000a", padding:"8px 12px", borderRadius:4, fontSize:13, marginBottom:14, border:"1px solid #ffb4ab" }}>{authError}</div>}
          {isSignup && <div style={{ marginBottom:14 }}><label style={F.label}>USERNAME</label><input style={F.input} placeholder="johndoe" value={authUsername} onChange={e=>setAuthUsername(e.target.value)}/></div>}
          <div style={{ marginBottom:14 }}><label style={F.label}>EMAIL ADDRESS</label><input style={F.input} type="email" placeholder="admin@company.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
          <div style={{ marginBottom:20 }}><label style={F.label}>PASSWORD</label><input style={F.input} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&authAction()}/></div>
          <button style={{ width:"100%", padding:"10px", background:"#1b1b1d", border:"none", borderRadius:4, fontSize:14, fontWeight:600, color:"#fff", cursor:"pointer" }} onClick={authAction} disabled={authLoading}>{authLoading?"Please wait…":isSignup?"Create Account":"Sign In"}</button>
          <div style={{ marginTop: 16 }}>
          <GoogleLogin
  onSuccess={async (credentialResponse) => {
    try {
      const response = await fetch(`${BASE}/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.detail || "Google login failed", "error");
        return;
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);

      showToast("Logged in with Google successfully!");

    } catch (err) {
      console.error(err);
      showToast("Connection error", "error");
    }
  }}
  onError={() => {
    showToast("Google Login Failed", "error");
  }}
/>
</div>
          <div style={{ textAlign:"center", marginTop:14, fontSize:13, color:"#76777d" }}>{isSignup?"Already have an account? ":"Don't have an account? "}<span style={{ color:"#1b1b1d", cursor:"pointer", fontWeight:600, textDecoration:"underline" }} onClick={()=>{setIsSignup(!isSignup);setAuthError("");}}>{isSignup?"Sign in":"Sign up"}</span></div>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#f6f3f5", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',sans-serif", color:"#45464d", gap:12 }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet"/>
      <div style={{ width:20, height:20, border:"2px solid #c6c6cd", borderTopColor:"#1b1b1d", borderRadius:"50%", animation:"spin 0.6s linear infinite" }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Loading Trip Summary System…
    </div>
  );
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#f6f3f5", fontFamily:"'Inter',sans-serif", color:"#1b1b1d" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      <style>{CSS}</style>

      {toast && <div style={{ position:"fixed", bottom:20, right:20, background:"#1b1b1d", color:"#fff", padding:"10px 16px", borderRadius:6, fontSize:13, fontWeight:500, display:"flex", alignItems:"center", gap:8, zIndex:9999, animation:"slideIn 0.25s ease", boxShadow:"0 4px 20px rgba(0,0,0,0.15)", borderLeft:`3px solid ${toast.type==="success"?"#16a34a":"#dc2626"}` }}>
        <span className="ms16" style={{ color:toast.type==="success"?"#16a34a":"#dc2626" }}>{toast.type==="success"?"check_circle":"error"}</span>{toast.msg}
      </div>}

      {showNewTripModal && <div className="modal-bg" onClick={()=>setShowNewTripModal(false)}>
        <div style={{ background:"#fff", borderRadius:8, padding:28, width:440, border:"1px solid #c6c6cd", boxShadow:"0 4px 24px rgba(0,0,0,0.12)" }} onClick={e=>e.stopPropagation()}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <div style={{ fontSize:18, fontWeight:600 }}>New Trip</div>
            <button style={{ background:"none", border:"none", cursor:"pointer", color:"#76777d" }} onClick={()=>setShowNewTripModal(false)}><span className="ms">close</span></button>
          </div>
          {[{l:"Driver Name",v:driverName,s:setDriverName,p:"Full name",t:"text"},{l:"Total Gallons",v:totalGallons,s:setTotalGallons,p:"0",t:"number"},{l:"Total Stops",v:totalStops,s:setTotalStops,p:"0",t:"number"}].map(f=>(
            <div key={f.l} style={{ marginBottom:14 }}><label style={F.label}>{f.l.toUpperCase()}</label><input style={F.input} type={f.t} placeholder={f.p} value={f.v} onChange={e=>f.s(e.target.value)}/></div>
          ))}
          <div style={{ marginBottom:20 }}><label style={F.label}>STATUS</label><select style={F.select} value={tripStatus} onChange={e=>setTripStatus(e.target.value)}><option>Active</option><option>Pending</option><option>Completed</option></select></div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button style={F.btnGhost} onClick={()=>setShowNewTripModal(false)}>Cancel</button>
            <button style={F.btnPrimary} onClick={createTrip}>Create Trip</button>
          </div>
        </div>
      </div>}

      {showCustomerModal && <div className="modal-bg" onClick={()=>setShowCustomerModal(false)}>
        <div style={{ background:"#fff", borderRadius:8, padding:28, width:480, border:"1px solid #c6c6cd", boxShadow:"0 4px 24px rgba(0,0,0,0.12)" }} onClick={e=>e.stopPropagation()}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <div style={{ fontSize:18, fontWeight:600 }}>Add Customer</div>
            <button style={{ background:"none", border:"none", cursor:"pointer", color:"#76777d" }} onClick={()=>setShowCustomerModal(false)}><span className="ms">close</span></button>
          </div>
          <div style={{ marginBottom:14 }}><label style={F.label}>CUSTOMER NAME</label><input style={F.input} placeholder="Global Transporters Inc." value={customerName} onChange={e=>setCustomerName(e.target.value)}/></div>
          <div style={{ marginBottom:14 }}><label style={F.label}>PRIMARY EMAIL</label><input style={F.input} type="email" placeholder="ops@company.com" value={customerEmail} onChange={e=>setCustomerEmail(e.target.value)}/></div>
          <div style={{ marginBottom:20 }}><label style={F.label}>BILLING ADDRESS</label><textarea style={{ ...F.input, resize:"vertical", minHeight:80 }} placeholder="100 Logistics Way, Chicago, IL 60601" value={billingAddress} onChange={e=>setBillingAddress(e.target.value)}/></div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button style={F.btnGhost} onClick={()=>setShowCustomerModal(false)}>Cancel</button>
            <button style={F.btnPrimary} onClick={createCustomer}>Save Changes</button>
          </div>
        </div>
      </div>}

      {/* SIDEBAR */}
      <aside style={{ width:240, background:"#fff", borderRight:"1px solid #e4e2e4", display:"flex", flexDirection:"column", position:"fixed", left:0, top:0, height:"100vh", zIndex:50, overflowY:"auto" }}>
        <div style={{ padding:"20px 16px 14px", borderBottom:"1px solid #e4e2e4" }}>
          <div style={{ fontSize:18, fontWeight:700, color:"#1b1b1d", letterSpacing:"-0.01em", lineHeight:1.2 }}>Trip Summary System</div>
          <div style={{ fontSize:11, fontWeight:600, color:"#76777d", letterSpacing:"0.08em", marginTop:3 }}>LOGISTICS MANAGEMENT</div>
        </div>
        <nav style={{ flex:1, padding:"8px 0" }}>
          {navItems.map(({key,icon,label})=>(
            <button key={key} className="nav-hover" onClick={()=>setActiveTab(key)} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 16px", width:"100%", textAlign:"left", border:"none", cursor:"pointer", fontSize:14, fontWeight:activeTab===key?600:400, color:activeTab===key?"#1b1b1d":"#45464d", borderLeft:activeTab===key?"3px solid #1b1b1d":"3px solid transparent", background:activeTab===key?"#f0edef":"transparent", transition:"all 0.1s" }}>
              <span className="ms16">{icon}</span>{label}
            </button>
          ))}
        </nav>
        <div style={{ padding:12, borderTop:"1px solid #e4e2e4" }}>
          <button style={{ ...F.btnPrimary, width:"100%", justifyContent:"center", padding:"10px" }} onClick={()=>setShowNewTripModal(true)}>
            <span className="ms16" style={{ color:"#fff" }}>add</span> New Trip
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 8px 0", marginTop:8 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"#1b1b1d", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0 }}>{initials}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#1b1b1d", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.username}</div>
              <div style={{ fontSize:11, color:"#76777d" }}>Global Admin</div>
            </div>
            <button style={{ background:"none", border:"none", cursor:"pointer", color:"#76777d" }} onClick={logout} title="Sign out"><span className="ms16">logout</span></button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex:1, marginLeft:240, display:"flex", flexDirection:"column" }}>
        <header style={{ height:60, padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"#fff", borderBottom:"1px solid #e4e2e4", position:"sticky", top:0, zIndex:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#f0edef", border:"1px solid #e4e2e4", borderRadius:99, padding:"6px 14px", width:340 }}>
            <span className="ms16" style={{ color:"#76777d" }}>search</span>
            <input style={{ border:"none", background:"transparent", fontSize:14, color:"#1b1b1d", flex:1, outline:"none" }} placeholder="Search trips, invoices, or customers..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <button style={{ background:"none", border:"none", cursor:"pointer", color:"#45464d" }}><span className="ms">notifications</span></button>
            <button style={{ background:"none", border:"none", cursor:"pointer", color:"#45464d" }}><span className="ms">help</span></button>
            <button style={{ background:"none", border:"none", cursor:"pointer", color:"#45464d" }}><span className="ms">settings</span></button>
            <div style={{ display:"flex", alignItems:"center", gap:10, paddingLeft:16, borderLeft:"1px solid #e4e2e4" }}>
              <div><div style={{ fontSize:13, fontWeight:600 }}>{user?.username||"Administrator"}</div><div style={{ fontSize:11, color:"#76777d" }}>System Operator</div></div>
              <div style={{ width:36, height:36, borderRadius:"50%", background:"#1b1b1d", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }} onClick={logout}>{initials}</div>
            </div>
          </div>
        </header>

        <main style={{ flex:1, overflowY:"auto", padding:24 }}>
          {/* DASHBOARD */}
          {activeTab==="dashboard" && <div>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:30, fontWeight:700, color:"#1b1b1d", letterSpacing:"-0.02em" }}>Welcome back, {user?.username||"Administrator"}.</div>
              <div style={{ fontSize:14, color:"#76777d", marginTop:4 }}>Here is the latest overview of your logistics and document automation status.</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
              {[
                {label:"TOTAL TRIPS (WEEK)", value:trips.length.toLocaleString(), sub:"+12% vs last week", icon:"trending_up"},
                {label:"GALLONS DELIVERED", value:trips.reduce((a,t)=>a+(t.total_gallons||0),0).toLocaleString(), sub:"↑ 4.2% efficiency gain", icon:"local_gas_station", green:true},
                {label:"DOCUMENTS GENERATED", value:documents.length, sub:"98% Auto-validated", icon:"description", badge:"TODAY"},
                {label:"EMAIL SUCCESS RATE", value:"99.4%", sub:"Optimal Performance", icon:"mail", green:true},
              ].map((s,i)=>(
                <div key={i} style={{ background:"#fff", border:"1px solid #e4e2e4", borderRadius:6, padding:20 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"#76777d", letterSpacing:"0.08em" }}>{s.label}</div>
                    <span className="ms16">{s.icon}</span>
                  </div>
                  <div style={{ fontSize:30, fontWeight:700, letterSpacing:"-0.02em", fontFamily:"'JetBrains Mono',monospace", marginBottom:4 }}>{s.value}</div>
                  {s.badge && <span style={F.chip("#dbeafe","#2563eb")}>{s.badge}</span>}
                  <div style={{ fontSize:12, color:s.green?"#16a34a":"#76777d", marginTop:3 }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16 }}>
              <div style={{ background:"#fff", border:"1px solid #e4e2e4", borderRadius:6, overflow:"hidden" }}>
                <div style={{ padding:"14px 20px", borderBottom:"1px solid #e4e2e4", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ fontSize:16, fontWeight:600 }}>Recent Trips</div>
                  <button style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"#45464d", display:"flex", alignItems:"center", gap:4 }} onClick={()=>setActiveTab("trips")}>VIEW ALL <span className="ms16">arrow_forward</span></button>
                </div>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead><tr>{["DRIVER","STATUS","GALLONS","ACTION"].map(h=><th key={h} style={F.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {trips.slice(0,5).map(t=>{
                      const in1=(t.driver_name||"??").split(" ").map(w=>w[0]).join("").substring(0,2).toUpperCase();
                      return <tr key={t.id} style={{ borderBottom:"1px solid #f0edef" }}>
                        <td style={F.td}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:34, height:34, borderRadius:"50%", background:"#e4e2e4", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#45464d", flexShrink:0 }}>{in1}</div>
                            <div><div style={{ fontSize:14, fontWeight:500 }}>{t.driver_name}</div><div style={{ fontSize:12, color:"#76777d" }}>Trip #{t.id}</div></div>
                          </div>
                        </td>
                        <td style={F.td}>{statusBadge(t.status)}</td>
                        <td style={{ ...F.td, fontFamily:"'JetBrains Mono',monospace", fontSize:13 }}>{(t.total_gallons||0).toLocaleString()} gal</td>
                        <td style={F.td}><button style={{ background:"none", border:"none", cursor:"pointer", color:"#45464d" }}><span className="ms16">more_vert</span></button></td>
                      </tr>;
                    })}
                    {!trips.length && <tr><td colSpan={4} style={{ padding:"32px 20px", textAlign:"center", color:"#76777d" }}>No trips yet.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div style={{ background:"#fff", border:"1px solid #e4e2e4", borderRadius:6, padding:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}><span className="ms16">schedule</span><div style={{ fontSize:15, fontWeight:600 }}>Automation Service</div></div>
                  <div style={{ background:"#f6f3f5", border:"1px solid #e4e2e4", borderRadius:4, padding:12, marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <div style={{ fontSize:11, fontWeight:600, color:"#76777d", letterSpacing:"0.08em" }}>SCHEDULER STATUS</div>
                      <span style={{ fontSize:11, fontWeight:600, color:"#16a34a", display:"flex", alignItems:"center", gap:4 }}><span style={{ width:6, height:6, background:"#16a34a", borderRadius:"50%", display:"inline-block" }}></span>Active</span>
                    </div>
                    <div style={{ fontSize:18, fontWeight:700, fontFamily:"'JetBrains Mono',monospace" }}>Next Run: 08:00 AM</div>
                    <div style={{ fontSize:12, color:"#76777d", marginTop:2 }}>Task: Nightly Dispatch Sync</div>
                  </div>
                  {[{l:"Emails Pending",v:"0"},{l:"API Latency",v:"42ms",green:true},{l:"Last Backup",v:"2h ago"}].map(item=>(
                    <div key={item.l} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #f0edef", fontSize:13 }}>
                      <span style={{ color:"#45464d" }}>{item.l}</span>
                      <span style={{ fontWeight:600, color:item.green?"#16a34a":"#1b1b1d", fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>{item.v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:"#fff", border:"1px solid #e4e2e4", borderRadius:6, padding:16 }}>
                  <div style={{ fontSize:15, fontWeight:600, marginBottom:12 }}>Quick Actions</div>
                  {[{l:"New Trip",icon:"add_circle",action:()=>setShowNewTripModal(true)},{l:"Configure Customer",icon:"manage_accounts",action:()=>setActiveTab("customers")},{l:"Generate PDF Now",icon:"picture_as_pdf",action:()=>setActiveTab("invoice-config")}].map(item=>(
                    <button key={item.l} className="row-btn" onClick={item.action} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px", border:"1px solid #e4e2e4", borderRadius:4, background:"#fff", cursor:"pointer", fontSize:14, marginBottom:8 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}><span className="ms16">{item.icon}</span>{item.l}</div>
                      <span className="ms16" style={{ color:"#76777d" }}>chevron_right</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginTop:16, background:"#1b1b1d", borderRadius:6, padding:"20px 24px", color:"#fff", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", right:20, top:"50%", transform:"translateY(-50%)", opacity:0.05 }}><span className="ms" style={{ fontSize:80 }}>warning</span></div>
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", color:"#c6c6cd", marginBottom:6 }}>SYSTEM ALERT</div>
              <div style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>API Maintenance Window</div>
              <div style={{ fontSize:13, color:"#c6c6cd", marginBottom:16 }}>The upstream fuel-pricing API will be undergoing scheduled maintenance this Saturday between 12:00 AM and 04:00 AM UTC.</div>
              <div style={{ display:"flex", gap:10 }}>
                <button style={{ padding:"8px 20px", background:"#fff", border:"none", borderRadius:4, fontSize:13, fontWeight:600, color:"#1b1b1d", cursor:"pointer" }}>Acknowledge</button>
                <button style={{ padding:"8px 20px", background:"transparent", border:"1px solid #76777d", borderRadius:4, fontSize:13, fontWeight:600, color:"#fff", cursor:"pointer" }}>Details</button>
              </div>
            </div>
          </div>}

          {/* TRIPS */}
          {activeTab==="trips" && <div>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
              <div><div className="page-header">Trips</div><div className="page-sub">Manage fleet logistics and fuel delivery summaries.</div></div>
              <button style={F.btnPrimary} onClick={()=>setShowNewTripModal(true)}><span className="ms16" style={{ color:"#fff" }}>add</span>New Trip</button>
            </div>
            <div style={{ display:"flex", gap:24, marginBottom:16 }}>
              <div><div style={{ fontSize:11, fontWeight:600, color:"#76777d", letterSpacing:"0.08em" }}>ACTIVE TRIPS</div><div style={{ fontSize:20, fontWeight:700, fontFamily:"'JetBrains Mono',monospace" }}>{trips.filter(t=>(t.status||"").toLowerCase()==="active").length}</div></div>
              <div style={{ width:1, background:"#e4e2e4" }}></div>
              <div><div style={{ fontSize:11, fontWeight:600, color:"#76777d", letterSpacing:"0.08em" }}>TOTAL GALLONS</div><div style={{ fontSize:20, fontWeight:700, fontFamily:"'JetBrains Mono',monospace" }}>{trips.reduce((a,t)=>a+(t.total_gallons||0),0).toLocaleString()}</div></div>
            </div>
            <div style={{ background:"#fff", border:"1px solid #e4e2e4", borderRadius:6, overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr>{["Trip ID","Driver","Total Gallons","Stops","Status","Actions"].map(h=><th key={h} style={F.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {trips.map(t=>{
                    const in1=(t.driver_name||"??").split(" ").map(w=>w[0]).join("").substring(0,2).toUpperCase();
                    return <tr key={t.id} style={{ borderBottom:"1px solid #f0edef" }}>
                      <td style={{ ...F.td, fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:"#45464d" }}>#TRP-{String(t.id).padStart(5,"0")}</td>
                      <td style={F.td}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:32, height:32, borderRadius:"50%", background:"#e4e2e4", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#45464d", flexShrink:0 }}>{in1}</div>
                          <span style={{ fontSize:14, fontWeight:500 }}>{t.driver_name}</span>
                        </div>
                      </td>
                      <td style={{ ...F.td, fontFamily:"'JetBrains Mono',monospace" }}>{(t.total_gallons||0).toLocaleString()}</td>
                      <td style={F.td}><span style={F.chip("#f0edef","#45464d")}>{String(t.total_stops||0).padStart(2,"0")}</span></td>
                      <td style={F.td}>{statusBadge(t.status)}</td>
                      <td style={F.td}>
                        <div style={{ display:"flex", gap:6 }}>
                          <button className="row-btn" style={{ padding:"4px 10px", border:"1px solid #e4e2e4", borderRadius:4, background:"#fff", cursor:"pointer", fontSize:12 }} onClick={()=>generatePDF("invoice",t.id)}>Invoice</button>
                          <button className="row-btn" style={{ padding:"4px 10px", border:"1px solid #e4e2e4", borderRadius:4, background:"#fff", cursor:"pointer", fontSize:12 }} onClick={()=>generatePDF("delivery",t.id)}>Delivery</button>
                          <button style={{ padding:"4px 8px", border:"1px solid #fecaca", borderRadius:4, background:"#fff", cursor:"pointer" }} onClick={()=>del("trips",t.id,setTrips)}><span className="ms16" style={{ color:"#dc2626", fontSize:14 }}>delete</span></button>
                        </div>
                      </td>
                    </tr>;
                  })}
                  {!trips.length && <tr><td colSpan={6} style={{ padding:"40px 16px", textAlign:"center", color:"#76777d" }}>No trips yet. Click "New Trip" to get started.</td></tr>}
                </tbody>
              </table>
              {trips.length>0 && <div style={{ padding:"10px 16px", borderTop:"1px solid #e4e2e4", fontSize:13, color:"#76777d" }}>Showing <strong>1-{trips.length}</strong> of <strong>{trips.length}</strong> trips</div>}
            </div>
          </div>}

          {/* CUSTOMERS */}
          {activeTab==="customers" && <div>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
              <div><div className="page-header">Customers</div><div className="page-sub">Manage client profiles, billing addresses, and delivery destinations.</div></div>
              <button style={F.btnPrimary} onClick={()=>setShowCustomerModal(true)}><span className="ms16" style={{ color:"#fff" }}>person_add</span>Add Customer</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16 }}>
              {[{icon:"groups",label:"Total Customers",value:customers.length,bg:"#dbeafe",ic:"#2563eb"},{icon:"pin_drop",label:"Ship-To Locations",value:shiptos.length,bg:"#dcfce7",ic:"#16a34a"},{icon:"bar_chart",label:"Active Contracts",value:`${customers.length>0?86:0}%`,bg:"#f0edef",ic:"#45464d"},{icon:"schedule",label:"Pending Reviews",value:0,bg:"#fee2e2",ic:"#dc2626"}].map((s,i)=>(
                <div key={i} style={{ background:"#fff", border:"1px solid #e4e2e4", borderRadius:6, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:6, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><span className="ms16" style={{ color:s.ic }}>{s.icon}</span></div>
                  <div><div style={{ fontSize:11, color:"#76777d", fontWeight:500 }}>{s.label}</div><div style={{ fontSize:20, fontWeight:700, fontFamily:"'JetBrains Mono',monospace" }}>{typeof s.value==="number"?s.value.toLocaleString():s.value}</div></div>
                </div>
              ))}
            </div>
            <div style={{ background:"#fff", border:"1px solid #e4e2e4", borderRadius:6, overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr>{["Customer Name","Primary Email","Ship-To Count","Billing Address","Actions"].map(h=><th key={h} style={F.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {customers.map(c=>{
                    const in1=(c.name||"??").split(" ").map(w=>w[0]).join("").substring(0,2).toUpperCase();
                    const stCount=shiptos.filter(s=>s.customer_id===c.id).length;
                    return <tr key={c.id} style={{ borderBottom:"1px solid #f0edef" }}>
                      <td style={F.td}><div style={{ display:"flex", alignItems:"center", gap:10 }}><div style={{ width:36, height:36, borderRadius:4, background:"#e4e2e4", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#45464d", flexShrink:0 }}>{in1}</div><div style={{ fontWeight:500 }}>{c.name}</div></div></td>
                      <td style={{ ...F.td, fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>{c.email||"—"}</td>
                      <td style={F.td}><span style={F.chip("#dbeafe","#2563eb")}>{stCount} Locations</span></td>
                      <td style={{ ...F.td, maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:"#45464d" }}>{c.billing_address||"—"}</td>
                      <td style={F.td}><button style={{ padding:"4px 8px", border:"1px solid #fecaca", borderRadius:4, background:"#fff", cursor:"pointer" }} onClick={()=>del("customers",c.id,setCustomers)}><span className="ms16" style={{ color:"#dc2626", fontSize:14 }}>delete</span></button></td>
                    </tr>;
                  })}
                  {!customers.length && <tr><td colSpan={5} style={{ padding:"40px 16px", textAlign:"center", color:"#76777d" }}>No customers yet.</td></tr>}
                </tbody>
              </table>
              {customers.length>0 && <div style={{ padding:"10px 16px", borderTop:"1px solid #e4e2e4", fontSize:13, color:"#76777d" }}>Showing <strong>1-{customers.length}</strong> of <strong>{customers.length}</strong> customers</div>}
            </div>
          </div>}
          {/* VENDORS */}
          {activeTab==="vendors" && <div>
            <div className="page-header">Vendors</div><div className="page-sub">Manage fuel supply vendors and freight partners.</div>
            <div style={{ display:"grid", gridTemplateColumns:"340px 1fr", gap:16 }}>
              <div style={F.panel}>
                <div style={F.panelHead}>Add Vendor</div>
                <div style={F.panelBody}>
                  {[{l:"Vendor Name",v:vendorName,s:setVendorName,p:"Company name"},{l:"Address",v:vendorAddress,s:setVendorAddress,p:"Street, City"},{l:"Email",v:vendorEmail,s:setVendorEmail,p:"vendor@email.com",t:"email"}].map(f=>(
                    <div key={f.l}><label style={F.label}>{f.l.toUpperCase()}</label><input style={F.input} type={f.t||"text"} placeholder={f.p} value={f.v} onChange={e=>f.s(e.target.value)}/></div>
                  ))}
                </div>
                <div style={F.panelFoot}><button style={F.btnPrimary} onClick={createVendor}>Add Vendor</button></div>
              </div>
              <div style={{ background:"#fff", border:"1px solid #e4e2e4", borderRadius:6, overflow:"hidden" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead><tr>{["Name","Address","Email","Actions"].map(h=><th key={h} style={F.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {vendors.map(v=><tr key={v.id} style={{ borderBottom:"1px solid #f0edef" }}>
                      <td style={{ ...F.td, fontWeight:500 }}>{v.name}</td>
                      <td style={F.td}>{v.address||"—"}</td>
                      <td style={{ ...F.td, fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>{v.email||"—"}</td>
                      <td style={F.td}><button style={{ padding:"4px 8px", border:"1px solid #fecaca", borderRadius:4, background:"#fff", cursor:"pointer" }} onClick={()=>del("vendors",v.id,setVendors)}><span className="ms16" style={{ color:"#dc2626", fontSize:14 }}>delete</span></button></td>
                    </tr>)}
                    {!vendors.length && <tr><td colSpan={4} style={{ padding:"40px 16px", textAlign:"center", color:"#76777d" }}>No vendors yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>}

          {/* PRODUCTS & FEES */}
          {activeTab==="products" && <div>
            <div className="page-header">Products & Fees</div><div className="page-sub">Configure your fuel product catalogue, categories, fees, and taxes.</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }}>
              <div style={F.panel}>
                <div style={F.panelHead}>Product Categories</div>
                <div style={F.panelBody}>
                  <div style={{ display:"flex", gap:8 }}>
                    <input style={{ ...F.input, flex:1 }} placeholder="e.g. ULSD, DEF" value={categoryName} onChange={e=>setCategoryName(e.target.value)}/>
                    <button style={F.btnPrimary} onClick={createCategory}>Add</button>
                  </div>
                  {categories.map(c=><div key={c.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f0edef", fontSize:13 }}><span>{c.name}</span><button style={{ background:"none", border:"none", cursor:"pointer" }} onClick={()=>del("product-categories",c.id,setCategories)}><span className="ms16" style={{ color:"#dc2626", fontSize:14 }}>delete</span></button></div>)}
                  {!categories.length && <div style={{ fontSize:13, color:"#76777d", textAlign:"center", padding:"12px 0" }}>No categories yet.</div>}
                </div>
              </div>
              <div style={F.panel}>
                <div style={F.panelHead}>Products</div>
                <div style={F.panelBody}>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <input style={{ ...F.input, flex:1, minWidth:120 }} placeholder="Product name" value={productName} onChange={e=>setProductName(e.target.value)}/>
                    <select style={{ ...F.select, flex:1, minWidth:120 }} value={productCategoryId} onChange={e=>setProductCategoryId(e.target.value)}><option value="">Category</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
                    <button style={F.btnPrimary} onClick={createProduct}>Add</button>
                  </div>
                  {products.map(p=><div key={p.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f0edef", fontSize:13 }}><div><span style={{ fontWeight:500 }}>{p.name}</span><span style={{ color:"#76777d", fontSize:11, marginLeft:8 }}>{categories.find(c=>c.id===p.product_category_id)?.name||"—"}</span></div><button style={{ background:"none", border:"none", cursor:"pointer" }} onClick={()=>del("products",p.id,setProducts)}><span className="ms16" style={{ color:"#dc2626", fontSize:14 }}>delete</span></button></div>)}
                  {!products.length && <div style={{ fontSize:13, color:"#76777d", textAlign:"center", padding:"12px 0" }}>No products yet.</div>}
                </div>
              </div>
              <div style={F.panel}>
                <div style={F.panelHead}>Fee Structures</div>
                <div style={F.panelBody}>
                  <div style={{ display:"flex", gap:8 }}>
                    <input style={{ ...F.input, flex:2 }} placeholder="Fee name" value={feeName} onChange={e=>setFeeName(e.target.value)}/>
                    <input style={{ ...F.input, width:100 }} type="number" placeholder="Rate $" value={feeRate} onChange={e=>setFeeRate(e.target.value)}/>
                    <button style={F.btnPrimary} onClick={createFee}>Add</button>
                  </div>
                  {fees.map(f=><div key={f.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f0edef", fontSize:13 }}><span>{f.name}</span><div style={{ display:"flex", gap:10, alignItems:"center" }}><span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:600 }}>${f.default_rate?.toFixed(2)}</span><button style={{ background:"none", border:"none", cursor:"pointer" }} onClick={()=>del("fees",f.id,setFees)}><span className="ms16" style={{ color:"#dc2626", fontSize:14 }}>delete</span></button></div></div>)}
                  {!fees.length && <div style={{ fontSize:13, color:"#76777d", textAlign:"center", padding:"12px 0" }}>No fees yet.</div>}
                </div>
              </div>
              <div style={F.panel}>
                <div style={F.panelHead}>Tax Configuration</div>
                <div style={F.panelBody}>
                  <div style={{ display:"flex", gap:8 }}>
                    <input style={{ ...F.input, flex:2 }} placeholder="Tax name" value={taxName} onChange={e=>setTaxName(e.target.value)}/>
                    <input style={{ ...F.input, width:100 }} type="number" placeholder="Rate %" value={taxPercentage} onChange={e=>setTaxPercentage(e.target.value)}/>
                    <button style={F.btnPrimary} onClick={createTax}>Add</button>
                  </div>
                  {taxes.map(t=><div key={t.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f0edef", fontSize:13 }}><span>{t.name}</span><div style={{ display:"flex", gap:10, alignItems:"center" }}><span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:600 }}>{t.percentage}%</span><button style={{ background:"none", border:"none", cursor:"pointer" }} onClick={()=>del("taxes",t.id,setTaxes)}><span className="ms16" style={{ color:"#dc2626", fontSize:14 }}>delete</span></button></div></div>)}
                  {!taxes.length && <div style={{ fontSize:13, color:"#76777d", textAlign:"center", padding:"12px 0" }}>No taxes yet.</div>}
                </div>
              </div>
            </div>
          </div>}

          {/* DOCUMENT TEMPLATES */}
          {activeTab==="templates" && <div>
            <div className="page-header">Template Configuration</div><div className="page-sub">Customize the output and structure of your logistics documents.</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div>
                <div style={F.panel}>
                  <div style={F.panelHead}>Document Type</div>
                  <div style={{ padding:"12px 16px" }}>
                    {[{val:"invoice",label:"Product Invoice",sub:"Standard customer billing template",icon:"receipt_long"},{val:"delivery_ticket",label:"Delivery Ticket",sub:"Proof of delivery for on-site confirmation",icon:"local_shipping"},{val:"freight_invoice",label:"Freight Invoice",sub:"Carrier reconciliation and shipping costs",icon:"description"}].map(opt=>(
                      <div key={opt.val} onClick={()=>setDocumentType(opt.val)} style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 14px", border:`1px solid ${documentType===opt.val?"#1b1b1d":"#e4e2e4"}`, borderRadius:4, marginBottom:8, cursor:"pointer", background:documentType===opt.val?"#f6f3f5":"#fff" }}>
                        <span className="ms16" style={{ color:documentType===opt.val?"#1b1b1d":"#76777d" }}>{opt.icon}</span>
                        <div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:documentType===opt.val?600:400 }}>{opt.label}</div><div style={{ fontSize:12, color:"#76777d" }}>{opt.sub}</div></div>
                        {documentType===opt.val && <span className="ms16" style={{ color:"#1b1b1d" }}>check_circle</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={F.panel}>
                  <div style={F.panelHead}>Fields & Display</div>
                  <div style={{ padding:"0 16px" }}>
                    {[{l:"Show Company Logo",sub:"Display company header logo",v:showLogo,s:setShowLogo},{l:"Show Taxes",sub:"Calculate and display line-item tax details",v:showTaxes,s:setShowTaxes},{l:"Show Fees",sub:"Include handling and administrative fees",v:showFees,s:setShowFees},{l:"Show Delivery Timestamp",sub:"Print exact date/time of drop-off",v:showDeliveryTimestamp,s:setShowDeliveryTimestamp},{l:"Show Due Date",sub:"Highlight payment deadline on header",v:showDueDate,s:setShowDueDate}].map(item=>(
                      <div key={item.l} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 0", borderBottom:"1px solid #f0edef" }}>
                        <div><div style={{ fontSize:14 }}>{item.l}</div><div style={{ fontSize:12, color:"#76777d" }}>{item.sub}</div></div>
                        <button className={`toggle${item.v?" on":""}`} onClick={()=>item.s(!item.v)}></button>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <button style={{ ...F.btnPrimary, flex:1, justifyContent:"center", padding:"12px" }} onClick={createTemplate}><span className="ms16" style={{ color:"#fff" }}>save</span>Save Template</button>
                  <button style={{ ...F.btnGhost, padding:"12px 20px" }}>Cancel</button>
                </div>
              </div>
              <div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <div style={{ fontSize:18, fontWeight:600 }}>Live Preview</div>
                  <div style={{ fontSize:12, color:"#45464d", display:"flex", alignItems:"center", gap:4 }}><span className="ms16" style={{ fontSize:14 }}>visibility</span>Real-time visualization</div>
                </div>
                <div style={{ background:"#fff", border:"1px solid #e4e2e4", borderRadius:6, padding:24 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20, paddingBottom:14, borderBottom:"2px solid #1b1b1d" }}>
                    {showLogo && <div style={{ background:"#f0edef", padding:"8px 14px", borderRadius:4, fontSize:12, fontWeight:600, color:"#45464d" }}>LOGISTICS PRIME</div>}
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:20, fontWeight:700 }}>INVOICE</div>
                      <div style={{ fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:"#45464d" }}>#INV-004829</div>
                      {showDueDate && <div style={{ fontSize:11, color:"#dc2626", fontWeight:600 }}>DUE: 24 OCT 2023</div>}
                    </div>
                  </div>
                  <div style={{ fontSize:11, fontWeight:700, color:"#76777d", letterSpacing:"0.05em", marginBottom:6 }}>BILL TO</div>
                  <div style={{ marginBottom:16 }}>
                    <div style={{ height:10, background:"#f0edef", borderRadius:2, width:"60%", marginBottom:6 }}></div>
                    <div style={{ height:8, background:"#f0edef", borderRadius:2, width:"40%" }}></div>
                  </div>
                  <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:14, fontSize:12 }}>
                    <thead><tr style={{ borderBottom:"1px solid #e4e2e4" }}><th style={{ textAlign:"left", padding:"5px 0", fontWeight:600, color:"#76777d" }}>DESCRIPTION</th><th style={{ textAlign:"right", padding:"5px 0", fontWeight:600, color:"#76777d" }}>TOTAL</th></tr></thead>
                    <tbody>
                      <tr style={{ borderBottom:"1px solid #f0edef" }}><td style={{ padding:"7px 0" }}>Logistics Route A-B</td><td style={{ padding:"7px 0", textAlign:"right", fontFamily:"'JetBrains Mono',monospace" }}>$1,250.00</td></tr>
                      {showFees && <tr style={{ borderBottom:"1px solid #f0edef" }}><td style={{ padding:"7px 0", color:"#45464d" }}>Priority Handling</td><td style={{ padding:"7px 0", textAlign:"right", fontFamily:"'JetBrains Mono',monospace" }}>$125.00</td></tr>}
                      {showTaxes && <tr><td style={{ padding:"7px 0", color:"#45464d" }}>Estimated Tax (8%)</td><td style={{ padding:"7px 0", textAlign:"right", fontFamily:"'JetBrains Mono',monospace" }}>$110.00</td></tr>}
                    </tbody>
                  </table>
                  <div style={{ borderTop:"2px solid #1b1b1d", paddingTop:10, display:"flex", justifyContent:"space-between", fontWeight:700, fontSize:14 }}>
                    <span>GRAND TOTAL</span><span style={{ fontFamily:"'JetBrains Mono',monospace" }}>$1,485.00</span>
                  </div>
                  <div style={{ fontSize:10, color:"#76777d", textAlign:"center", marginTop:14, fontStyle:"italic" }}>Automated by Trip Summary System © 2024</div>
                </div>
                {templates.length>0 && <div style={{ marginTop:14 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"#45464d", marginBottom:8 }}>Saved Templates</div>
                  {templates.map(t=><div key={t.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:"#fff", border:"1px solid #e4e2e4", borderRadius:4, marginBottom:6, fontSize:13 }}>
                    <span style={{ fontWeight:500 }}>{t.document_type}</span>
                    <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                      <span style={{ color:t.show_fees?"#16a34a":"#76777d", fontSize:11 }}>Fees:{t.show_fees?"On":"Off"}</span>
                      <span style={{ color:t.show_taxes?"#16a34a":"#76777d", fontSize:11 }}>Taxes:{t.show_taxes?"On":"Off"}</span>
                      <button style={{ background:"none", border:"none", cursor:"pointer" }} onClick={()=>del("document-templates",t.id,setTemplates)}><span className="ms16" style={{ color:"#dc2626", fontSize:14 }}>delete</span></button>
                    </div>
                  </div>)}
                </div>}
              </div>
            </div>
          </div>}
          {/* DOCUMENTS ARCHIVE */}
          {activeTab==="documents" && <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <div>
                <div style={{ fontSize:12, color:"#76777d", marginBottom:4 }}>Documents › Archive</div>
                <div className="page-header">Documents Archive</div>
              </div>
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <div style={{ background:"#fff", border:"1px solid #e4e2e4", borderRadius:4, padding:"10px 16px", textAlign:"center" }}><div style={{ fontSize:11, fontWeight:600, color:"#76777d" }}>Total Docs</div><div style={{ fontSize:20, fontWeight:700, fontFamily:"'JetBrains Mono',monospace" }}>{documents.length}</div></div>
                <div style={{ background:"#fff", border:"1px solid #e4e2e4", borderRadius:4, padding:"10px 16px", textAlign:"center" }}><div style={{ fontSize:11, fontWeight:600, color:"#76777d" }}>Failed Emails</div><div style={{ fontSize:20, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", color:"#dc2626" }}>0</div></div>
                <button style={F.btnPrimary}><span className="ms16" style={{ color:"#fff" }}>upload</span>Export All</button>
              </div>
            </div>
            <div style={{ background:"#fff", border:"1px solid #e4e2e4", borderRadius:4, padding:"12px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600 }}><span className="ms16">filter_list</span>FILTERS</div>
              <select style={{ ...F.select, width:"auto", padding:"6px 10px" }}><option>All Types</option><option>Invoice</option><option>Delivery Ticket</option></select>
              <select style={{ ...F.select, width:"auto", padding:"6px 10px" }}><option>Any Status</option><option>Sent</option><option>Failed</option><option>Pending</option></select>
              <button style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", fontSize:13, color:"#45464d", textDecoration:"underline" }}>Reset Filters</button>
            </div>
            <div style={{ background:"#fff", border:"1px solid #e4e2e4", borderRadius:6, overflow:"hidden", marginBottom:16 }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr>{["Document ID","Type","Generated At","Email Status","Actions"].map(h=><th key={h} style={F.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {documents.map(doc=>(
                    <tr key={doc.id} style={{ borderBottom:"1px solid #f0edef" }}>
                      <td style={{ ...F.td, fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:"#45464d" }}>
                        {doc.type.includes("invoice")?"INV":doc.type.includes("delivery")?"TKT":"BOL"}-{doc.ref_id}-{String(doc.id).slice(-4)}
                      </td>
                      <td style={F.td}><span style={F.chip(doc.type.includes("invoice")?"#dbeafe":doc.type.includes("delivery")?"#dcfce7":"#fef9c3",doc.type.includes("invoice")?"#2563eb":doc.type.includes("delivery")?"#16a34a":"#ca8a04")}>{doc.type.includes("invoice")?"Invoice":doc.type.includes("delivery")?"Ticket":"Freight"}</span></td>
                      <td style={F.td}>{new Date(doc.generated_at).toLocaleString()}</td>
                      <td style={F.td}><span style={{ fontSize:12, fontWeight:500, color:"#16a34a", display:"flex", alignItems:"center", gap:4 }}><span className="ms16" style={{ fontSize:14 }}>check_circle</span>Sent</span></td>
                      <td style={F.td}>
                        <div style={{ display:"flex", gap:6 }}>
                          <button className="row-btn" style={{ padding:"4px 8px", border:"1px solid #e4e2e4", borderRadius:4, background:"#fff", cursor:"pointer" }} onClick={()=>generatePDF(doc.type,doc.ref_id)}><span className="ms16" style={{ fontSize:14 }}>download</span></button>
                          <button className="row-btn" style={{ padding:"4px 8px", border:"1px solid #e4e2e4", borderRadius:4, background:"#fff", cursor:"pointer" }}><span className="ms16" style={{ fontSize:14 }}>mail</span></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!documents.length && <tr><td colSpan={5} style={{ padding:"40px 16px", textAlign:"center", color:"#76777d" }}>No documents yet. Generate invoices from Invoice Config tab.</td></tr>}
                </tbody>
              </table>
              {documents.length>0 && <div style={{ padding:"10px 16px", borderTop:"1px solid #e4e2e4", fontSize:13, color:"#76777d" }}>Showing <strong>1-{documents.length}</strong> of <strong>{documents.length}</strong> documents</div>}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
              {[
                {icon:"auto_awesome",iconBg:"#1b1b1d",iconColor:"#fff",title:"Batch Automation",sub:"Schedule bulk generation of pending trip summaries for the weekend shift.",action:"Configure Batch →"},
                {icon:"policy",iconBg:"#dbeafe",iconColor:"#2563eb",title:"Retention Policy",sub:"Current policy: Documents are archived for 7 years before automated purging.",action:"Update Policy →"},
                {icon:"sync_problem",iconBg:"#fee2e2",iconColor:"#dc2626",title:"Reconciliation Tools",sub:"Identify documents with failed deliveries and attempt automated SMTP retry.",action:"Start Reconciliation →",ac:"#dc2626"},
              ].map((c,i)=>(
                <div key={i} style={{ background:"#fff", border:"1px solid #e4e2e4", borderRadius:6, padding:20 }}>
                  <div style={{ width:44, height:44, background:c.iconBg, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}><span className="ms16" style={{ color:c.iconColor }}>{c.icon}</span></div>
                  <div style={{ fontSize:15, fontWeight:600, marginBottom:6 }}>{c.title}</div>
                  <div style={{ fontSize:13, color:"#76777d", marginBottom:12 }}>{c.sub}</div>
                  <button style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, fontWeight:600, color:c.ac||"#1b1b1d", padding:0 }}>{c.action}</button>
                </div>
              ))}
            </div>
          </div>}

          {/* INVOICE CONFIG */}
          {activeTab==="invoice-config" && <div>
            <div className="page-header">Invoice Configuration</div><div className="page-sub">Configure customer invoices with products, fees, and taxes then generate professional PDFs.</div>
            <div style={{ display:"grid", gridTemplateColumns:"380px 1fr", gap:16 }}>
              <div style={F.panel}>
                <div style={F.panelHead}>New Invoice Config</div>
                <div style={F.panelBody}>
                  {invValidationMsg && <div style={{ background:"#fef9c3", color:"#ca8a04", padding:"8px 12px", borderRadius:4, fontSize:12, border:"1px solid #fde68a" }}>{invValidationMsg}</div>}
                  <div><label style={F.label}>CUSTOMER</label><select style={F.select} value={invCustomerId} onChange={e=>{setInvCustomerId(e.target.value);loadShiptosForCustomer(e.target.value);setInvValidationMsg("");}}><option value="">— Select customer —</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  <div><label style={F.label}>SHIP TO {invCustomerId&&!invShiptos.length&&<span style={{ color:"#dc2626", fontSize:10 }}>— Add in Ship To tab</span>}</label><select style={F.select} value={invShiptoId} onChange={e=>{setInvShiptoId(e.target.value);setInvValidationMsg("");}}><option value="">— Select ship to —</option>{invShiptos.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                  <div><label style={F.label}>VENDOR (OPTIONAL)</label><select style={F.select} value={invVendorId} onChange={e=>setInvVendorId(e.target.value)}><option value="">— Select vendor —</option>{vendors.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
                  <div style={{ fontSize:11, fontWeight:600, color:"#76777d", letterSpacing:"0.08em" }}>PRODUCTS</div>
                  {invProducts.map((row,idx)=>(
                    <div key={idx} style={{ display:"flex", gap:5 }}>
                      <select style={{ flex:2, padding:"7px 8px", border:"1px solid #c6c6cd", borderRadius:4, fontSize:12, background:"#fff" }} value={row.product_id} onChange={e=>{const r=[...invProducts];r[idx].product_id=e.target.value;setInvProducts(r);}}><option value="">Product</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
                      <input style={{ flex:1, padding:"7px 8px", border:"1px solid #c6c6cd", borderRadius:4, fontSize:12 }} type="number" placeholder="Qty" value={row.quantity} onChange={e=>{const r=[...invProducts];r[idx].quantity=e.target.value;setInvProducts(r);}}/>
                      <input style={{ flex:1, padding:"7px 8px", border:"1px solid #c6c6cd", borderRadius:4, fontSize:12 }} type="number" placeholder="$" value={row.unit_price} onChange={e=>{const r=[...invProducts];r[idx].unit_price=e.target.value;setInvProducts(r);}}/>
                      {invProducts.length>1 && <button style={{ background:"none", border:"none", cursor:"pointer", color:"#dc2626" }} onClick={()=>setInvProducts(invProducts.filter((_,i)=>i!==idx))}><span className="ms16" style={{ fontSize:14 }}>close</span></button>}
                    </div>
                  ))}
                  <button style={{ background:"none", border:"1px dashed #c6c6cd", borderRadius:4, padding:"5px 10px", fontSize:12, cursor:"pointer", color:"#45464d", display:"flex", alignItems:"center", gap:5 }} onClick={()=>setInvProducts([...invProducts,{product_id:"",quantity:"",unit_price:""}])}><span className="ms16" style={{ fontSize:14 }}>add</span>Add Product</button>
                  <div style={{ fontSize:11, fontWeight:600, color:"#76777d", letterSpacing:"0.08em" }}>FEES</div>
                  {invFees.map((row,idx)=>(
                    <div key={idx} style={{ display:"flex", gap:5 }}>
                      <select style={{ flex:2, padding:"7px 8px", border:"1px solid #c6c6cd", borderRadius:4, fontSize:12, background:"#fff" }} value={row.fee_id} onChange={e=>{const r=[...invFees];r[idx].fee_id=e.target.value;const fee=fees.find(f=>f.id===Number(e.target.value));if(fee)r[idx].rate=String(fee.default_rate);setInvFees(r);}}><option value="">Fee</option>{fees.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select>
                      <input style={{ flex:1, padding:"7px 8px", border:"1px solid #c6c6cd", borderRadius:4, fontSize:12 }} type="number" placeholder="Qty" value={row.quantity} onChange={e=>{const r=[...invFees];r[idx].quantity=e.target.value;setInvFees(r);}}/>
                      <input style={{ flex:1, padding:"7px 8px", border:"1px solid #c6c6cd", borderRadius:4, fontSize:12 }} type="number" placeholder="Rate" value={row.rate} onChange={e=>{const r=[...invFees];r[idx].rate=e.target.value;setInvFees(r);}}/>
                      {invFees.length>1 && <button style={{ background:"none", border:"none", cursor:"pointer", color:"#dc2626" }} onClick={()=>setInvFees(invFees.filter((_,i)=>i!==idx))}><span className="ms16" style={{ fontSize:14 }}>close</span></button>}
                    </div>
                  ))}
                  <button style={{ background:"none", border:"1px dashed #c6c6cd", borderRadius:4, padding:"5px 10px", fontSize:12, cursor:"pointer", color:"#45464d", display:"flex", alignItems:"center", gap:5 }} onClick={()=>setInvFees([...invFees,{fee_id:"",quantity:"1",rate:""}])}><span className="ms16" style={{ fontSize:14 }}>add</span>Add Fee</button>
                  <div style={{ fontSize:11, fontWeight:600, color:"#76777d", letterSpacing:"0.08em" }}>TAXES</div>
                  {invTaxes.map((row,idx)=>(
                    <div key={idx} style={{ display:"flex", gap:5 }}>
                      <select style={{ flex:2, padding:"7px 8px", border:"1px solid #c6c6cd", borderRadius:4, fontSize:12, background:"#fff" }} value={row.tax_id} onChange={e=>{const r=[...invTaxes];r[idx].tax_id=e.target.value;setInvTaxes(r);}}><option value="">Tax</option>{taxes.map(t=><option key={t.id} value={t.id}>{t.name}({t.percentage}%)</option>)}</select>
                      <input style={{ flex:1, padding:"7px 8px", border:"1px solid #c6c6cd", borderRadius:4, fontSize:12 }} type="number" placeholder="Basis $" value={row.basis} onChange={e=>{const r=[...invTaxes];r[idx].basis=e.target.value;setInvTaxes(r);}}/>
                      {invTaxes.length>1 && <button style={{ background:"none", border:"none", cursor:"pointer", color:"#dc2626" }} onClick={()=>setInvTaxes(invTaxes.filter((_,i)=>i!==idx))}><span className="ms16" style={{ fontSize:14 }}>close</span></button>}
                    </div>
                  ))}
                  <button style={{ background:"none", border:"1px dashed #c6c6cd", borderRadius:4, padding:"5px 10px", fontSize:12, cursor:"pointer", color:"#45464d", display:"flex", alignItems:"center", gap:5 }} onClick={()=>setInvTaxes([...invTaxes,{tax_id:"",basis:""}])}><span className="ms16" style={{ fontSize:14 }}>add</span>Add Tax</button>
                </div>
                <div style={F.panelFoot}>
                  <button style={F.btnGhost}>Cancel</button>
                  <button style={F.btnPrimary} onClick={createInvoiceConfig}><span className="ms16" style={{ color:"#fff" }}>save</span>Save Config</button>
                </div>
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:"#45464d", marginBottom:10 }}>{invoiceConfigs.length} Configurations</div>
                {invoiceConfigs.map(c=>(
                  <div key={c.id} style={{ background:"#fff", border:"1px solid #e4e2e4", borderRadius:6, padding:"14px 16px", marginBottom:10, borderLeft:"3px solid #16a34a" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                      <div style={{ fontSize:14, fontWeight:600 }}>Config #{c.id} — {customers.find(cu=>cu.id===c.customer_id)?.name||"—"}</div>
                      <button style={{ background:"none", border:"none", cursor:"pointer" }} onClick={()=>del("invoice-configurations",c.id,setInvoiceConfigs)}><span className="ms16" style={{ color:"#dc2626", fontSize:14 }}>delete</span></button>
                    </div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
                      <span style={F.chip("#f0edef","#45464d")}>{shiptos.find(s=>s.id===c.shipto_id)?.name||"—"}</span>
                      {c.vendor_id && <span style={F.chip("#f0edef","#45464d")}>{vendors.find(v=>v.id===c.vendor_id)?.name||"—"}</span>}
                      <span style={F.chip("#f0edef","#45464d")}>{(c.products||[]).length} products</span>
                      <span style={F.chip("#f0edef","#45464d")}>{(c.fees||[]).length} fees</span>
                      <span style={F.chip("#f0edef","#45464d")}>{(c.taxes||[]).length} taxes</span>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button style={F.btnGreen} onClick={()=>generatePDF("invoice-config",c.id)}><span className="ms16" style={{ color:"#fff", fontSize:14 }}>receipt_long</span>Generate Invoice</button>
                      <button className="row-btn" style={{ padding:"7px 14px", border:"1px solid #e4e2e4", borderRadius:4, fontSize:13, background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }} onClick={()=>generatePDF("delivery-config",c.id)}><span className="ms16" style={{ fontSize:14 }}>local_shipping</span>Delivery Ticket</button>
                    </div>
                  </div>
                ))}
                {!invoiceConfigs.length && <div style={{ background:"#fff", border:"1px dashed #e4e2e4", borderRadius:6, padding:"40px 20px", textAlign:"center", color:"#76777d" }}>No invoice configurations yet. Create one to generate professional PDFs.</div>}
              </div>
            </div>
          </div>}

          {/* SHIP TO */}
          {activeTab==="shipto" && <div>
            <div className="page-header">Ship To Locations</div><div className="page-sub">Manage delivery sites linked to customers.</div>
            <div style={{ display:"grid", gridTemplateColumns:"340px 1fr", gap:16 }}>
              <div style={F.panel}>
                <div style={F.panelHead}>Add Location</div>
                <div style={F.panelBody}>
                  <div><label style={F.label}>CUSTOMER</label><select style={F.select} value={shiptoCustomerId} onChange={e=>setShiptoCustomerId(e.target.value)}><option value="">— Select customer —</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  <div><label style={F.label}>LOCATION NAME</label><input style={F.input} placeholder="e.g. Austin Tank Farm" value={shiptoName} onChange={e=>setShiptoName(e.target.value)}/></div>
                  <div><label style={F.label}>DELIVERY ADDRESS</label><input style={F.input} placeholder="Street, City, State ZIP" value={shiptoAddress} onChange={e=>setShiptoAddress(e.target.value)}/></div>
                </div>
                <div style={F.panelFoot}><button style={F.btnPrimary} onClick={createShipTo}>Add Location</button></div>
              </div>
              <div style={{ background:"#fff", border:"1px solid #e4e2e4", borderRadius:6, overflow:"hidden" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead><tr>{["Location Name","Customer","Address","Actions"].map(h=><th key={h} style={F.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {shiptos.map(s=><tr key={s.id} style={{ borderBottom:"1px solid #f0edef" }}>
                      <td style={{ ...F.td, fontWeight:500 }}>{s.name}</td>
                      <td style={F.td}>{customers.find(c=>c.id===s.customer_id)?.name||"—"}</td>
                      <td style={F.td}>{s.address||"—"}</td>
                      <td style={F.td}><button style={{ padding:"4px 8px", border:"1px solid #fecaca", borderRadius:4, background:"#fff", cursor:"pointer" }} onClick={()=>del("shipto",s.id,setShiptos)}><span className="ms16" style={{ color:"#dc2626", fontSize:14 }}>delete</span></button></td>
                    </tr>)}
                    {!shiptos.length && <tr><td colSpan={4} style={{ padding:"40px 16px", textAlign:"center", color:"#76777d" }}>No ship to locations yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>}

          {/* EMAIL */}
          {activeTab==="email" && <div>
            <div className="page-header">Email Settings</div><div className="page-sub">Configure automated email delivery for invoices and delivery tickets.</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div>
                <div style={F.panel}>
                  <div style={F.panelHead}>Email Provider</div>
                  <div style={F.panelBody}>
                    <div><label style={F.label}>PROVIDER</label><select style={F.select} value={emailProvider} onChange={e=>setEmailProvider(e.target.value)}><option value="gmail">Gmail</option><option value="smtp">SMTP</option></select></div>
                    <div><label style={F.label}>EMAIL ADDRESS</label><input style={F.input} type="email" placeholder="sender@gmail.com" value={emailAddress} onChange={e=>setEmailAddress(e.target.value)}/></div>
                    {emailProvider==="gmail" && <div><label style={F.label}>APP PASSWORD</label><input style={F.input} type="password" placeholder="••••••••" value={emailToken} onChange={e=>setEmailToken(e.target.value)}/></div>}
                    {emailProvider==="smtp" && <><div><label style={F.label}>SMTP HOST</label><input style={F.input} placeholder="smtp.server.com" value={smtpHost} onChange={e=>setSmtpHost(e.target.value)}/></div><div><label style={F.label}>SMTP PORT</label><input style={F.input} type="number" placeholder="587" value={smtpPort} onChange={e=>setSmtpPort(e.target.value)}/></div></>}
                  </div>
                  <div style={F.panelFoot}><button style={F.btnPrimary} onClick={createEmailSettings}>Save Settings</button></div>
                </div>
                <div style={F.panel}>
                  <div style={F.panelHead}>Send Configuration</div>
                  <div style={F.panelBody}>
                    <div><label style={F.label}>DOCUMENT TYPE</label><select style={F.select} value={sendDocType} onChange={e=>setSendDocType(e.target.value)}><option value="invoice">Invoice</option><option value="delivery_ticket">Delivery Ticket</option><option value="freight_invoice">Freight Invoice</option></select></div>
                    <div><label style={F.label}>DESTINATION EMAIL</label><input style={F.input} type="email" placeholder="billing@customer.com" value={sendDestEmail} onChange={e=>setSendDestEmail(e.target.value)}/></div>
                  </div>
                  <div style={F.panelFoot}><button style={F.btnPrimary} onClick={createEmailConfig}>Add Config</button></div>
                </div>
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>Active Providers</div>
                {emailSettings.map(s=><div key={s.id} style={{ background:"#fff", border:"1px solid #e4e2e4", borderRadius:4, padding:"12px 14px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}><div><div style={{ fontSize:13, fontWeight:500 }}>{s.email}</div><div style={{ fontSize:11, color:"#76777d" }}>{s.provider}</div></div><div style={{ display:"flex", gap:8, alignItems:"center" }}>{statusBadge(s.is_active?"Active":"Inactive")}<button style={{ background:"none", border:"none", cursor:"pointer" }} onClick={()=>del("email-settings",s.id,setEmailSettings)}><span className="ms16" style={{ color:"#dc2626", fontSize:14 }}>delete</span></button></div></div>)}
                {!emailSettings.length && <div style={{ fontSize:13, color:"#76777d", marginBottom:16 }}>No providers configured.</div>}
                <div style={{ fontSize:13, fontWeight:600, marginBottom:10, marginTop:16 }}>Send Configurations</div>
                {emailConfigs.map(c=><div key={c.id} style={{ background:"#fff", border:"1px solid #e4e2e4", borderRadius:4, padding:"12px 14px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}><div><div style={{ fontSize:13, fontWeight:500 }}>{c.destination_email}</div><div style={{ fontSize:11, color:"#76777d" }}>{c.document_type}</div></div><button style={{ background:"none", border:"none", cursor:"pointer" }} onClick={()=>del("email-send-configurations",c.id,setEmailConfigs)}><span className="ms16" style={{ color:"#dc2626", fontSize:14 }}>delete</span></button></div>)}
                {!emailConfigs.length && <div style={{ fontSize:13, color:"#76777d" }}>No send configurations yet.</div>}
              </div>
            </div>
          </div>}

          {/* COMPANY */}
          {activeTab==="company" && <div>
            <div className="page-header">Company Settings</div><div className="page-sub">Your company information displayed on generated documents.</div>
            <div style={{ display:"grid", gridTemplateColumns:"400px 1fr", gap:16 }}>
              <div style={F.panel}>
                <div style={F.panelHead}>{editingCompanyId?"Edit Company":"Add Company"}</div>
                <div style={F.panelBody}>
                  {[{l:"Company Name",v:companyName,s:setCompanyName,p:"e.g. First Fuel America, LLC"},{l:"Address",v:companyAddress,s:setCompanyAddress,p:"Street, City, State ZIP"},{l:"Phone",v:companyPhone,s:setCompanyPhone,p:"(000) 000-0000"},{l:"Email",v:companyEmail,s:setCompanyEmail,p:"info@company.com",t:"email"},{l:"Website",v:companyWebsite,s:setCompanyWebsite,p:"www.company.com"}].map(f=>(
                    <div key={f.l}><label style={F.label}>{f.l.toUpperCase()}</label><input style={F.input} type={f.t||"text"} placeholder={f.p} value={f.v} onChange={e=>f.s(e.target.value)}/></div>
                  ))}
                  <div><label style={F.label}>PAYMENT TERMS</label><select style={F.select} value={companyPaymentTerms} onChange={e=>setCompanyPaymentTerms(e.target.value)}><option>Net 30</option><option>Net 15</option><option>Net 60</option><option>Due on Receipt</option></select></div>
                </div>
                <div style={F.panelFoot}>
                  {editingCompanyId && <button style={F.btnGhost} onClick={()=>{setEditingCompanyId(null);setCompanyName("");setCompanyAddress("");setCompanyPhone("");setCompanyEmail("");setCompanyWebsite("");setCompanyPaymentTerms("Net 30");}}>Cancel</button>}
                  <button style={F.btnPrimary} onClick={saveCompanySettings}><span className="ms16" style={{ color:"#fff" }}>save</span>{editingCompanyId?"Update":"Save"} Settings</button>
                </div>
              </div>
              <div>
                {companySettings.map(s=>(
                  <div key={s.id} style={{ background:"#fff", border:"1px solid #e4e2e4", borderRadius:6, padding:16, marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                      <div style={{ fontSize:16, fontWeight:600 }}>{s.company_name}</div>
                      <div style={{ display:"flex", gap:8 }}>
                        <button className="row-btn" style={{ padding:"4px 12px", border:"1px solid #e4e2e4", borderRadius:4, background:"#fff", cursor:"pointer", fontSize:12 }} onClick={()=>editCompany(s)}>Edit</button>
                        <button style={{ padding:"4px 8px", border:"1px solid #fecaca", borderRadius:4, background:"#fff", cursor:"pointer" }} onClick={()=>del("company-settings",s.id,setCompanySettings)}><span className="ms16" style={{ color:"#dc2626", fontSize:14 }}>delete</span></button>
                      </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, fontSize:13, color:"#45464d" }}>
                      {[{l:"ADDRESS",v:s.address},{l:"PHONE",v:s.phone},{l:"EMAIL",v:s.email},{l:"PAYMENT TERMS",v:s.payment_terms}].map(item=>(
                        <div key={item.l}><span style={{ fontSize:11, fontWeight:600, color:"#76777d", display:"block" }}>{item.l}</span>{item.v||"—"}</div>
                      ))}
                    </div>
                  </div>
                ))}
                {!companySettings.length && <div style={{ background:"#fff", border:"1px dashed #e4e2e4", borderRadius:6, padding:"40px 20px", textAlign:"center", color:"#76777d" }}>No company settings yet. Add your company info to display on invoices.</div>}
              </div>
            </div>
          </div>}

        </main>
      </div>
    </div>
  );
}
