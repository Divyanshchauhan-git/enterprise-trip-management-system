import { useEffect, useState, useMemo } from "react";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8001";
const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("token")}`
});

export default function App() {
  // Core Entities
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

  // UI State
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tripFilter, setTripFilter] = useState("all");
  const [docFilter, setDocFilter] = useState("all");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modals
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showShipToModal, setShowShipToModal] = useState(false);

  // Auth State
  const [isSignup, setIsSignup] = useState(false);
  const [authUsername, setAuthUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });

  // Form Fields - Trips
  const [driverName, setDriverName] = useState("");
  const [totalGallons, setTotalGallons] = useState("");
  const [totalStops, setTotalStops] = useState("");
  const [tripStatus, setTripStatus] = useState("Active");

  // Form Fields - Customer & Vendor
  const [customerName, setCustomerName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");

  // Form Fields - Catalog
  const [categoryName, setCategoryName] = useState("");
  const [productName, setProductName] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [feeName, setFeeName] = useState("");
  const [feeRate, setFeeRate] = useState("");
  const [taxName, setTaxName] = useState("");
  const [taxPercentage, setTaxPercentage] = useState("");

  // Form Fields - Templates & PDF Studio
  const [documentType, setDocumentType] = useState("invoice");
  const [showFees, setShowFees] = useState(true);
  const [showTaxes, setShowTaxes] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [showDeliveryTimestamp, setShowDeliveryTimestamp] = useState(false);
  const [showDueDate, setShowDueDate] = useState(true);

  // Form Fields - Email
  const [emailProvider, setEmailProvider] = useState("gmail");
  const [emailAddress, setEmailAddress] = useState("");
  const [emailToken, setEmailToken] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [sendDocType, setSendDocType] = useState("invoice");
  const [sendDestEmail, setSendDestEmail] = useState("");

  // Form Fields - ShipTo
  const [shiptoCustomerId, setShiptoCustomerId] = useState("");
  const [shiptoName, setShiptoName] = useState("");
  const [shiptoAddress, setShiptoAddress] = useState("");

  // Form Fields - Invoice Config
  const [invCustomerId, setInvCustomerId] = useState("");
  const [invShiptoId, setInvShiptoId] = useState("");
  const [invVendorId, setInvVendorId] = useState("");
  const [invShiptos, setInvShiptos] = useState([]);
  const [invProducts, setInvProducts] = useState([{ product_id: "", quantity: "", unit_price: "" }]);
  const [invFees, setInvFees] = useState([{ fee_id: "", quantity: "1", rate: "" }]);
  const [invTaxes, setInvTaxes] = useState([{ tax_id: "", basis: "" }]);
  const [invValidationMsg, setInvValidationMsg] = useState("");

  // Form Fields - Company
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyPaymentTerms, setCompanyPaymentTerms] = useState("Net 30");
  const [editingCompanyId, setEditingCompanyId] = useState(null);

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    const h = { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } };
    const safe = async (url) => {
      try {
        const r = await fetch(url, h);
        const d = await r.json();
        return Array.isArray(d) ? d : [];
      } catch {
        return [];
      }
    };
    const [t, c, v, p, cat, f, tx, tpl, es, ec, st, ic, cs] = await Promise.all([
      safe(`${BASE}/trips`),
      safe(`${BASE}/customers`),
      safe(`${BASE}/vendors`),
      safe(`${BASE}/products`),
      safe(`${BASE}/product-categories`),
      safe(`${BASE}/fees`),
      safe(`${BASE}/taxes`),
      safe(`${BASE}/document-templates`),
      safe(`${BASE}/email-settings`),
      safe(`${BASE}/email-send-configurations`),
      safe(`${BASE}/shipto`),
      safe(`${BASE}/invoice-configurations`),
      safe(`${BASE}/company-settings`),
    ]);
    setTrips(t);
    setCustomers(c);
    setVendors(v);
    setProducts(p);
    setCategories(cat);
    setFees(f);
    setTaxes(tx);
    setTemplates(tpl);
    setEmailSettings(es);
    setEmailConfigs(ec);
    setShiptos(st);
    setInvoiceConfigs(ic);
    setCompanySettings(cs);

    const stored = localStorage.getItem("generated_docs");
    if (stored) {
      try { setDocuments(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) loadAll();
  }, [user]);

  const authAction = async (e) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const body = isSignup ? { username: authUsername, email, password } : { email, password };
      const r = await fetch(`${BASE}/${isSignup ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (isSignup) {
        if (d.user) {
          showToast("Account created successfully! Please sign in.");
          setIsSignup(false);
        } else {
          setAuthError(d.detail || "Signup failed. Please try again.");
        }
      } else {
        if (d.access_token) {
          setUser(d.user);
          localStorage.setItem("user", JSON.stringify(d.user));
          localStorage.setItem("token", d.access_token);
          showToast(`Welcome back, ${d.user.username}!`);
        } else {
          setAuthError(d.detail || "Invalid email or password.");
        }
      }
    } catch {
      setAuthError("Unable to reach the server. Ensure the backend is running.");
    }
    setAuthLoading(false);
  };

  const del = async (endpoint, id, setter) => {
    try {
      await fetch(`${BASE}/${endpoint}/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      setter((prev) => prev.filter((x) => x.id !== id));
      showToast("Record removed successfully");
    } catch {
      showToast("Failed to delete record", "error");
    }
  };

  const post = async (endpoint, body, setter) => {
    try {
      const r = await fetch(`${BASE}/${endpoint}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (d.id || d.trip) {
        setter((prev) => [...prev, d.trip || d]);
        showToast("Created successfully");
        return d.trip || d;
      } else {
        showToast(d.detail || "Validation error", "error");
        return null;
      }
    } catch {
      showToast("Connection error", "error");
      return null;
    }
  };

  const put = async (endpoint, id, body, setter) => {
    try {
      const r = await fetch(`${BASE}/${endpoint}/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (d.id) {
        setter((prev) => prev.map((x) => (x.id === id ? d : x)));
        showToast("Updated successfully");
        return d;
      } else {
        showToast(d.detail || "Update error", "error");
        return null;
      }
    } catch {
      showToast("Connection error", "error");
      return null;
    }
  };

  const createTrip = async () => {
    if (!driverName || !totalGallons) {
      showToast("Driver name and total gallons are required", "error");
      return;
    }
    const ok = await post(
      "trips",
      {
        driver_name: driverName,
        total_gallons: Number(totalGallons),
        total_stops: Number(totalStops) || 1,
        status: tripStatus,
      },
      setTrips
    );
    if (ok) {
      setDriverName("");
      setTotalGallons("");
      setTotalStops("");
      setTripStatus("Active");
      setShowNewTripModal(false);
    }
  };

  const createCustomer = async () => {
    if (!customerName || !billingAddress) {
      showToast("Customer name and billing address are required", "error");
      return;
    }
    const ok = await post(
      "customers",
      {
        name: customerName,
        billing_address: billingAddress,
        email: customerEmail,
      },
      setCustomers
    );
    if (ok) {
      setCustomerName("");
      setBillingAddress("");
      setCustomerEmail("");
      setShowCustomerModal(false);
    }
  };

  const createVendor = async () => {
    if (!vendorName) {
      showToast("Vendor name is required", "error");
      return;
    }
    const ok = await post(
      "vendors",
      { name: vendorName, address: vendorAddress, email: vendorEmail },
      setVendors
    );
    if (ok) {
      setVendorName("");
      setVendorAddress("");
      setVendorEmail("");
    }
  };

  const createCategory = async () => {
    if (!categoryName) return;
    const ok = await post("product-categories", { name: categoryName }, setCategories);
    if (ok) setCategoryName("");
  };

  const createProduct = async () => {
    if (!productName || !productCategoryId) {
      showToast("Product name and category are required", "error");
      return;
    }
    const ok = await post(
      "products",
      { name: productName, product_category_id: Number(productCategoryId) },
      setProducts
    );
    if (ok) {
      setProductName("");
      setProductCategoryId("");
    }
  };

  const createFee = async () => {
    if (!feeName || !feeRate) return;
    const ok = await post(
      "fees",
      { name: feeName, default_rate: Number(feeRate) },
      setFees
    );
    if (ok) {
      setFeeName("");
      setFeeRate("");
    }
  };

  const createTax = async () => {
    if (!taxName || !taxPercentage) return;
    const ok = await post(
      "taxes",
      { name: taxName, percentage: Number(taxPercentage) },
      setTaxes
    );
    if (ok) {
      setTaxName("");
      setTaxPercentage("");
    }
  };

  const createTemplate = async () => {
    const ok = await post(
      "document-templates",
      {
        document_type: documentType,
        show_fees: showFees,
        show_taxes: showTaxes,
        show_logo: showLogo,
      },
      setTemplates
    );
    if (ok) {
      showToast("Template settings saved");
    }
  };

  const createEmailSettings = async () => {
    if (!emailAddress) {
      showToast("Email address is required", "error");
      return;
    }
    const ok = await post(
      "email-settings",
      {
        provider: emailProvider,
        email: emailAddress,
        oauth_token: emailToken || null,
        smtp_host: smtpHost || null,
        smtp_port: smtpPort ? Number(smtpPort) : null,
        smtp_password: smtpPassword || null,
        is_active: true,
      },
      setEmailSettings
    );
    if (ok) {
      setEmailAddress("");
      setEmailToken("");
      setSmtpHost("");
      setSmtpPassword("");
    }
  };

  const createEmailConfig = async () => {
    if (!sendDestEmail) return;
    const ok = await post(
      "email-send-configurations",
      {
        document_type: sendDocType,
        destination_email: sendDestEmail,
        is_active: true,
      },
      setEmailConfigs
    );
    if (ok) setSendDestEmail("");
  };

  const createShipTo = async () => {
    if (!shiptoCustomerId || !shiptoName || !shiptoAddress) {
      showToast("Fill all Ship-To fields", "error");
      return;
    }
    const ok = await post(
      "shipto",
      {
        customer_id: Number(shiptoCustomerId),
        name: shiptoName,
        address: shiptoAddress,
      },
      setShiptos
    );
    if (ok) {
      setShiptoName("");
      setShiptoAddress("");
      setShowShipToModal(false);
      await loadAll();
    }
  };

  const loadShiptosForCustomer = (cid) => {
    if (!cid) {
      setInvShiptos([]);
      setInvShiptoId("");
      return;
    }
    setInvShiptos(shiptos.filter((s) => s.customer_id === Number(cid)));
    setInvShiptoId("");
  };

  const createInvoiceConfig = async () => {
    setInvValidationMsg("");
    if (!invCustomerId) {
      setInvValidationMsg("Please select a customer");
      return;
    }
    if (!invShiptoId) {
      setInvValidationMsg("Please select a Ship-To location");
      return;
    }
    const vp = invProducts
      .filter((p) => p.product_id && p.quantity && p.unit_price)
      .map((p) => ({
        product_id: Number(p.product_id),
        quantity: Number(p.quantity),
        unit_price: Number(p.unit_price),
      }));
    if (!vp.length) {
      setInvValidationMsg("Add at least one product with quantity & price");
      return;
    }
    const vf = invFees
      .filter((f) => f.fee_id)
      .map((f) => ({
        fee_id: Number(f.fee_id),
        quantity: Number(f.quantity) || 1,
        rate: Number(f.rate) || 0,
      }));
    const vt = invTaxes
      .filter((t) => t.tax_id)
      .map((t) => ({
        tax_id: Number(t.tax_id),
        basis: Number(t.basis) || 0,
      }));

    const ok = await post(
      "invoice-configurations",
      {
        customer_id: Number(invCustomerId),
        shipto_id: Number(invShiptoId),
        vendor_id: invVendorId ? Number(invVendorId) : null,
        invoice_time: { hour: 8, minute: 0 },
        products: vp,
        fees: vf,
        taxes: vt,
      },
      setInvoiceConfigs
    );
    if (ok) {
      setInvCustomerId("");
      setInvShiptoId("");
      setInvVendorId("");
      setInvShiptos([]);
      setInvProducts([{ product_id: "", quantity: "", unit_price: "" }]);
      setInvFees([{ fee_id: "", quantity: "1", rate: "" }]);
      setInvTaxes([{ tax_id: "", basis: "" }]);
      setInvValidationMsg("");
    }
  };

  const saveCompanySettings = async () => {
    if (!companyName) {
      showToast("Company name is required", "error");
      return;
    }
    const body = {
      company_name: companyName,
      address: companyAddress,
      phone: companyPhone,
      email: companyEmail,
      website: companyWebsite,
      payment_terms: companyPaymentTerms,
    };
    if (editingCompanyId) {
      const ok = await put("company-settings", editingCompanyId, body, setCompanySettings);
      if (ok) setEditingCompanyId(null);
    } else {
      await post("company-settings", body, setCompanySettings);
    }
    setCompanyName("");
    setCompanyAddress("");
    setCompanyPhone("");
    setCompanyEmail("");
    setCompanyWebsite("");
    setCompanyPaymentTerms("Net 30");
  };

  const editCompany = (s) => {
    setEditingCompanyId(s.id);
    setCompanyName(s.company_name || "");
    setCompanyAddress(s.address || "");
    setCompanyPhone(s.phone || "");
    setCompanyEmail(s.email || "");
    setCompanyWebsite(s.website || "");
    setCompanyPaymentTerms(s.payment_terms || "Net 30");
    setActiveTab("company");
  };

  const generatePDF = async (type, id) => {
    const endpoints = {
      invoice: `generate-invoice/${id}`,
      delivery: `generate-delivery-ticket/${id}`,
      freight: `generate-freight-invoice/${id}`,
      "invoice-config": `generate-invoice-from-config/${id}`,
      "delivery-config": `generate-delivery-ticket-from-config/${id}`,
    };
    try {
      showToast(`Generating ${type.replace("-", " ").toUpperCase()} PDF...`, "info");
      const r = await fetch(`${BASE}/${endpoints[type]}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (r.ok) {
        const blob = await r.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}_${id}.pdf`;
        a.click();

        const newDoc = {
          id: Date.now(),
          type,
          ref_id: id,
          generated_at: new Date().toISOString(),
          status: "Generated",
        };
        const existing = JSON.parse(localStorage.getItem("generated_docs") || "[]");
        existing.unshift(newDoc);
        localStorage.setItem("generated_docs", JSON.stringify(existing.slice(0, 50)));
        setDocuments(existing.slice(0, 50));
        showToast("PDF document downloaded successfully!");
      } else {
        showToast("Backend failed to render PDF", "error");
      }
    } catch {
      showToast("Error generating PDF", "error");
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    showToast("Signed out successfully");
  };

  const initials = user ? (user.username || "OP").substring(0, 2).toUpperCase() : "OP";

  // Filtered Collections
  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const matchSearch =
        !searchQuery ||
        (t.driver_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(t.id).includes(searchQuery);
      const matchFilter =
        tripFilter === "all" || (t.status || "").toLowerCase() === tripFilter.toLowerCase();
      return matchSearch && matchFilter;
    });
  }, [trips, searchQuery, tripFilter]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        !searchQuery ||
        (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.billing_address || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      const matchSearch =
        !searchQuery ||
        (d.type || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(d.ref_id).includes(searchQuery);
      const matchFilter =
        docFilter === "all" ||
        (docFilter === "invoice" && d.type.includes("invoice")) ||
        (docFilter === "delivery" && d.type.includes("delivery"));
      return matchSearch && matchFilter;
    });
  }, [documents, searchQuery, docFilter]);

  // Aggregated Telemetry
  const totalGallonsSum = useMemo(() => {
    return trips.reduce((acc, t) => acc + (Number(t.total_gallons) || 0), 0);
  }, [trips]);

  const totalStopsSum = useMemo(() => {
    return trips.reduce((acc, t) => acc + (Number(t.total_stops) || 0), 0);
  }, [trips]);

  const activeTripsCount = useMemo(() => {
    return trips.filter((t) => (t.status || "").toLowerCase() === "active").length;
  }, [trips]);

  // Navigation Items
  const navGroups = [
    {
      group: "OPERATIONS",
      items: [
        { key: "dashboard", icon: "dashboard", label: "Executive Radar" },
        { key: "trips", icon: "local_shipping", label: "Trips & Fleet", count: trips.length },
      ],
    },
    {
      group: "PARTNERS & DIRECTORY",
      items: [
        { key: "customers", icon: "domain", label: "Customers", count: customers.length },
        { key: "shipto", icon: "pin_drop", label: "Ship-To Sites", count: shiptos.length },
        { key: "vendors", icon: "warehouse", label: "Fuel Suppliers", count: vendors.length },
      ],
    },
    {
      group: "CATALOG & BILLING",
      items: [
        { key: "products", icon: "category", label: "Products & Rates", count: products.length },
        { key: "invoice-config", icon: "receipt_long", label: "Invoice Config", count: invoiceConfigs.length },
      ],
    },
    {
      group: "AUTOMATION & SYSTEM",
      items: [
        { key: "templates", icon: "design_services", label: "Document Studio" },
        { key: "documents", icon: "folder_open", label: "Archive & PDFs", count: documents.length },
        { key: "email", icon: "forward_to_inbox", label: "Email Dispatch" },
        { key: "company", icon: "business", label: "Company Profile" },
      ],
    },
  ];

  // ==========================================
  // AUTHENTICATION SCREEN (LOGISTICS BRANDED)
  // ==========================================
  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", background: "#090d16", fontFamily: "var(--font-main)" }}>
        {/* Left Side: Logistics Showcase */}
        <div style={{ flex: 1.2, padding: "60px 80px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
          {/* Subtle Background Glow */}
          <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, rgba(9, 13, 22, 0) 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(9, 13, 22, 0) 70%)", pointerEvents: "none" }} />

          {/* Brand Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, zIndex: 2 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(79, 70, 229, 0.4)" }}>
              <span className="ms ms-22" style={{ color: "#ffffff" }}>local_shipping</span>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>LOGITRACK PRIME</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.1em" }}>ENTERPRISE FLEET & DISPATCH</div>
            </div>
          </div>

          {/* Hero Content */}
          <div style={{ maxWidth: 540, zIndex: 2, margin: "40px 0" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 99, background: "rgba(79, 70, 229, 0.15)", border: "1px solid rgba(79, 70, 229, 0.3)", color: "#a5b4fc", fontSize: 12, fontWeight: 600, marginBottom: 24 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }} className="beacon-pulse"></span>
              Autonomous Fuel Telemetry & Billing Engine
            </div>
            <h1 style={{ fontSize: 44, fontWeight: 800, color: "#ffffff", lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 20 }}>
              Precision dispatch. Real-time telemetry. Automated billing.
            </h1>
            <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.6, marginBottom: 32 }}>
              Built for commercial carriers and fuel logistics managers. Seamlessly convert field delivery logs into instant customer invoices, delivery tickets, and freight manifests.
            </p>

            {/* Feature Badges */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { icon: "analytics", title: "Live Telemetry", desc: "Gallons & stop volume meters" },
                { icon: "receipt_long", title: "Instant PDF Engine", desc: "Zero-latency invoice creation" },
                { icon: "schedule_send", title: "Automated Sync", desc: "Nightly cron & dispatch batches" },
                { icon: "verified_user", title: "Role Isolation", desc: "Bank-grade JWT session security" },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.07)", borderRadius: 10 }}>
                  <span className="ms ms-20" style={{ color: "#38bdf8" }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>{f.title}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Metrics */}
          <div style={{ display: "flex", gap: 40, borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: 24, zIndex: 2 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", fontFamily: "var(--font-mono)" }}>99.98%</div>
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>System Uptime</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#10b981", fontFamily: "var(--font-mono)" }}>&lt; 35ms</div>
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>API Response</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", fontFamily: "var(--font-mono)" }}>100%</div>
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>PDF Conformance</div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form Card */}
        <div style={{ width: 480, background: "#0e1422", borderLeft: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
          <div style={{ width: "100%", maxWidth: 380 }} className="animate-fade-in">
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
                {isSignup ? "Create operator account" : "Log in to terminal"}
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
                {isSignup ? "Register to access fleet controls and document automation" : "Enter your credentials to manage active logistics"}
              </div>
            </div>

            {authError && (
              <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <span className="ms ms-18" style={{ color: "#ef4444" }}>error</span>
                {authError}
              </div>
            )}

            <form onSubmit={authAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {isSignup && (
                <div>
                  <label className="form-label" style={{ color: "#94a3b8" }}>
                    <span className="ms ms-16">badge</span> Username
                  </label>
                  <input
                    className="form-control"
                    style={{ background: "#151d30", border: "1px solid #1e293b", color: "#f8fafc" }}
                    placeholder="e.g. alex_dispatch"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    required
                  />
                </div>
              )}

              <div>
                <label className="form-label" style={{ color: "#94a3b8" }}>
                  <span className="ms ms-16">mail</span> Operator Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  style={{ background: "#151d30", border: "1px solid #1e293b", color: "#f8fafc" }}
                  placeholder="admin@logistics.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ color: "#94a3b8" }}>
                  <span className="ms ms-16">lock</span> Security Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  style={{ background: "#151d30", border: "1px solid #1e293b", color: "#f8fafc" }}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="btn btn-primary"
                style={{ padding: "12px", fontSize: 14, fontWeight: 700, borderRadius: 8, marginTop: 8 }}
              >
                {authLoading ? (
                  <>
                    <div style={{ width: 16, height: 16, border: "2px solid #ffffff", borderTopColor: "transparent", borderRadius: "50%", animation: "spinSlow 0.6s linear infinite" }}></div>
                    Authenticating Terminal...
                  </>
                ) : isSignup ? (
                  <>
                    <span className="ms ms-18">person_add</span> Complete Registration
                  </>
                ) : (
                  <>
                    <span className="ms ms-18">login</span> Access Control Center
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "#64748b" }}>
              {isSignup ? "Already registered as an operator? " : "Need to set up a new fleet manager? "}
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  setAuthError("");
                }}
                style={{ background: "none", border: "none", color: "#818cf8", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
              >
                {isSignup ? "Sign In" : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN ENTERPRISE APP SHELL
  // ==========================================
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-app)", fontFamily: "var(--font-main)" }}>
      {/* GLOBAL TOAST NOTIFICATION */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#090d16",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: 10,
            fontSize: 13.5,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 10,
            zIndex: 99999,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
            borderLeft: `4px solid ${toast.type === "error" ? "var(--danger)" : toast.type === "info" ? "var(--accent-blue)" : "var(--success)"}`,
          }}
          className="animate-slide-up"
        >
          <span
            className="ms ms-20"
            style={{ color: toast.type === "error" ? "var(--danger)" : toast.type === "info" ? "var(--accent-blue)" : "var(--success)" }}
          >
            {toast.type === "error" ? "error" : toast.type === "info" ? "info" : "check_circle"}
          </span>
          {toast.msg}
        </div>
      )}

      {/* NEW TRIP MODAL */}
      {showNewTripModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(9, 13, 22, 0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
          onClick={() => setShowNewTripModal(false)}
        >
          <div
            style={{ background: "#ffffff", borderRadius: 16, width: 480, overflow: "hidden", boxShadow: "var(--shadow-xl)" }}
            onClick={(e) => e.stopPropagation()}
            className="animate-slide-up"
          >
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="ms ms-20">local_shipping</span>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-main)" }}>Dispatch New Trip</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Record driver fuel delivery assignment</div>
                </div>
              </div>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setShowNewTripModal(false)}>
                <span className="ms ms-22">close</span>
              </button>
            </div>

            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="form-label"><span className="ms ms-16">person</span> Driver Full Name</label>
                <input className="form-control" placeholder="e.g. Marcus Vance" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="form-label"><span className="ms ms-16">local_gas_station</span> Total Gallons</label>
                  <input type="number" className="form-control" placeholder="e.g. 7500" value={totalGallons} onChange={(e) => setTotalGallons(e.target.value)} />
                </div>
                <div>
                  <label className="form-label"><span className="ms ms-16">pin_drop</span> Total Stops</label>
                  <input type="number" className="form-control" placeholder="e.g. 3" value={totalStops} onChange={(e) => setTotalStops(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="form-label"><span className="ms ms-16">flag</span> Initial Status</label>
                <select className="form-control" value={tripStatus} onChange={(e) => setTripStatus(e.target.value)}>
                  <option>Active</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Pending</option>
                </select>
              </div>
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end", gap: 10, background: "#f8fafc" }}>
              <button className="btn btn-secondary" onClick={() => setShowNewTripModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createTrip}>
                <span className="ms ms-18">add_task</span> Confirm & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOMER MODAL */}
      {showCustomerModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(9, 13, 22, 0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
          onClick={() => setShowCustomerModal(false)}
        >
          <div
            style={{ background: "#ffffff", borderRadius: 16, width: 500, overflow: "hidden", boxShadow: "var(--shadow-xl)" }}
            onClick={(e) => e.stopPropagation()}
            className="animate-slide-up"
          >
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--accent-blue-light)", color: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="ms ms-20">domain</span>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-main)" }}>Onboard New Customer</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Add billing profile and primary contact</div>
                </div>
              </div>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setShowCustomerModal(false)}>
                <span className="ms ms-22">close</span>
              </button>
            </div>

            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="form-label"><span className="ms ms-16">apartment</span> Enterprise / Customer Name</label>
                <input className="form-control" placeholder="e.g. Midwest Freight Logistics Corp" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
              <div>
                <label className="form-label"><span className="ms ms-16">mail</span> Primary Invoicing Email</label>
                <input type="email" className="form-control" placeholder="billing@midwestfreight.com" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
              </div>
              <div>
                <label className="form-label"><span className="ms ms-16">home_pin</span> Billing Street Address</label>
                <textarea
                  className="form-control"
                  style={{ minHeight: 80, resize: "vertical" }}
                  placeholder="500 Logistics Parkway, Suite 300, Chicago, IL 60601"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                />
              </div>
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end", gap: 10, background: "#f8fafc" }}>
              <button className="btn btn-secondary" onClick={() => setShowCustomerModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createCustomer}>
                <span className="ms ms-18">save</span> Save Customer Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SHIP-TO MODAL */}
      {showShipToModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(9, 13, 22, 0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
          onClick={() => setShowShipToModal(false)}
        >
          <div
            style={{ background: "#ffffff", borderRadius: 16, width: 480, overflow: "hidden", boxShadow: "var(--shadow-xl)" }}
            onClick={(e) => e.stopPropagation()}
            className="animate-slide-up"
          >
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--success-light)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="ms ms-20">pin_drop</span>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-main)" }}>Add Ship-To Location</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Link a delivery terminal or site to a customer</div>
                </div>
              </div>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setShowShipToModal(false)}>
                <span className="ms ms-22">close</span>
              </button>
            </div>

            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="form-label"><span className="ms ms-16">domain</span> Linked Customer</label>
                <select className="form-control" value={shiptoCustomerId} onChange={(e) => setShiptoCustomerId(e.target.value)}>
                  <option value="">— Select Associated Customer —</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label"><span className="ms ms-16">location_on</span> Destination / Site Name</label>
                <input className="form-control" placeholder="e.g. Austin Tank Farm - Yard 4" value={shiptoName} onChange={(e) => setShiptoName(e.target.value)} />
              </div>
              <div>
                <label className="form-label"><span className="ms ms-16">map</span> Exact Delivery Address</label>
                <input className="form-control" placeholder="7800 Energy Way, Austin, TX 78744" value={shiptoAddress} onChange={(e) => setShiptoAddress(e.target.value)} />
              </div>
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end", gap: 10, background: "#f8fafc" }}>
              <button className="btn btn-secondary" onClick={() => setShowShipToModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createShipTo}>
                <span className="ms ms-18">add_location_alt</span> Register Site
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ENTERPRISE SLATE SIDEBAR                   */}
      {/* ========================================== */}
      <aside
        style={{
          width: 260,
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--sidebar-border)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: "20px 18px", borderBottom: "1px solid var(--sidebar-border)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 14px rgba(79, 70, 229, 0.4)" }}>
            <span className="ms ms-20" style={{ color: "#ffffff" }}>local_shipping</span>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em" }}>LOGITRACK</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em" }}>ENTERPRISE FLEET OPS</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 10px" }}>
          {navGroups.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: "0.1em", padding: "0 10px 6px" }}>
                {g.group}
              </div>
              {g.items.map((item) => {
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "none",
                      background: isActive ? "rgba(79, 70, 229, 0.18)" : "transparent",
                      color: isActive ? "#ffffff" : "var(--sidebar-text)",
                      fontWeight: isActive ? 700 : 500,
                      fontSize: 13.5,
                      cursor: "pointer",
                      marginBottom: 2,
                      transition: "var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        className="ms ms-18"
                        style={{ color: isActive ? "#818cf8" : "#64748b" }}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "1px 7px",
                          borderRadius: 99,
                          background: isActive ? "#4f46e5" : "rgba(255, 255, 255, 0.08)",
                          color: isActive ? "#ffffff" : "#94a3b8",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Dispatch CTA & Profile */}
        <div style={{ padding: 12, borderTop: "1px solid var(--sidebar-border)", background: "#060910" }}>
          <button
            className="btn btn-primary"
            style={{ width: "100%", padding: "10px", fontSize: 13, borderRadius: 8, marginBottom: 12 }}
            onClick={() => setShowNewTripModal(true)}
          >
            <span className="ms ms-18">add</span> Dispatch New Trip
          </button>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#4f46e5", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.username}
                </div>
                <div style={{ fontSize: 11, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span> Terminal Active
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 4, display: "flex" }}
            >
              <span className="ms ms-18">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================== */}
      {/* MAIN VIEWPORT AREA                         */}
      {/* ========================================== */}
      <div style={{ flex: 1, marginLeft: 260, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* TOP COMMAND HEADER */}
        <header
          style={{
            height: 64,
            padding: "0 28px",
            background: "#ffffff",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 90,
          }}
        >
          {/* Search Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-app)", border: "1px solid var(--border-subtle)", borderRadius: 99, padding: "7px 16px", width: 400 }}>
            <span className="ms ms-18" style={{ color: "var(--text-muted)" }}>search</span>
            <input
              style={{ border: "none", background: "transparent", fontSize: 13.5, color: "var(--text-main)", outline: "none", width: "100%" }}
              placeholder="Search trips, drivers, invoices, or customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setSearchQuery("")}>
                <span className="ms ms-16">cancel</span>
              </button>
            )}
          </div>

          {/* Right Header Status Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* Live Clock */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              <span className="ms ms-16" style={{ color: "var(--primary)" }}>schedule</span>
              {currentTime.toLocaleTimeString()} (UTC)
            </div>

            {/* Quick Actions */}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary" style={{ padding: "7px 12px", fontSize: 12.5 }} onClick={() => setShowCustomerModal(true)}>
                <span className="ms ms-16">person_add</span> Add Customer
              </button>
              <button className="btn btn-primary" style={{ padding: "7px 14px", fontSize: 12.5 }} onClick={() => setShowNewTripModal(true)}>
                <span className="ms ms-16">add</span> Dispatch Trip
              </button>
            </div>
          </div>
        </header>

        {/* CONTENT CANVAS */}
        <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", background: "var(--primary-light)", border: "1px solid var(--primary-border)", borderRadius: 10, color: "var(--primary-text)", fontSize: 13.5, marginBottom: 20 }}>
              <div style={{ width: 16, height: 16, border: "2px solid var(--primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spinSlow 0.6s linear infinite" }}></div>
              Synchronizing fleet data from backend...
            </div>
          )}

          {/* ================================================= */}
          {/* TAB 1: EXECUTIVE RADAR (DASHBOARD)                */}
          {/* ================================================= */}
          {activeTab === "dashboard" && (
            <div className="animate-fade-in">
              {/* Header Title */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
                    Executive Logistics Radar
                  </h1>
                  <div style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 2 }}>
                    Real-time fleet telemetry, fuel throughput, and billing automation overview.
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-secondary" onClick={loadAll}>
                    <span className="ms ms-16">refresh</span> Refresh Telemetry
                  </button>
                </div>
              </div>

              {/* KPI RIBBON (Samsara & Flexport Inspired) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 28 }}>
                {[
                  {
                    label: "ACTIVE TRIPS DISPATCHED",
                    val: activeTripsCount,
                    sub: `${trips.length} Total Registered`,
                    icon: "local_shipping",
                    color: "var(--primary)",
                    bg: "var(--primary-light)",
                    badge: "+14% vs avg",
                  },
                  {
                    label: "GALLONS DELIVERED",
                    val: totalGallonsSum.toLocaleString(),
                    unit: "gal",
                    sub: "Fuel volume through rack",
                    icon: "local_gas_station",
                    color: "var(--success)",
                    bg: "var(--success-light)",
                    badge: "Optimal Flow",
                  },
                  {
                    label: "TOTAL STOPS COMPLETED",
                    val: totalStopsSum,
                    sub: `${customers.length} Enterprise Clients`,
                    icon: "pin_drop",
                    color: "var(--accent-blue)",
                    bg: "var(--accent-blue-light)",
                  },
                  {
                    label: "DOCS & PDFS GENERATED",
                    val: documents.length,
                    sub: "100% Validated Deliveries",
                    icon: "receipt_long",
                    color: "#8b5cf6",
                    bg: "#f3e8ff",
                    badge: "Automated",
                  },
                ].map((kpi, idx) => (
                  <div key={idx} className="card-elevated" style={{ padding: "20px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                        {kpi.label}
                      </div>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: kpi.bg, color: kpi.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span className="ms ms-18">{kpi.icon}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 30, fontWeight: 800, color: "var(--text-main)", fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>
                        {kpi.val}
                      </span>
                      {kpi.unit && <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)" }}>{kpi.unit}</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{kpi.sub}</span>
                      {kpi.badge && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: kpi.bg, color: kpi.color }}>
                          {kpi.badge}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* LIVE SHIPMENT MILESTONE RADAR (FourKites / Project44 Inspired) */}
              <div className="card-elevated" style={{ padding: "22px 26px", marginBottom: 28, background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--success)" }} className="beacon-pulse"></div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-main)" }}>Active Shipment Lifecycle Pipeline</div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Automated End-to-End Handshake</div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
                  {/* Connecting Track */}
                  <div style={{ position: "absolute", top: "22px", left: "40px", right: "40px", height: "3px", background: "var(--border-subtle)", zIndex: 1 }} />

                  {[
                    { step: "1", title: "Terminal Scheduled", desc: `${trips.filter(t=>t.status==='Pending').length} Pending Load`, icon: "event_note", status: "done" },
                    { step: "2", title: "Rack Dispatched", desc: `${activeTripsCount} On Highway`, icon: "local_shipping", status: "active" },
                    { step: "3", title: "Site Drop-off", desc: `${totalStopsSum} Total Waypoints`, icon: "where_to_vote", status: "done" },
                    { step: "4", title: "Automated Invoiced", desc: `${documents.length} PDF Packages`, icon: "task_alt", status: "done" },
                  ].map((m, mi) => (
                    <div key={mi} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, position: "relative", width: 180, textAlign: "center" }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          background: m.status === "active" ? "var(--primary)" : "#ffffff",
                          border: `3px solid ${m.status === "active" ? "var(--primary-light)" : "var(--border-subtle)"}`,
                          color: m.status === "active" ? "#ffffff" : "var(--primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 10,
                          boxShadow: m.status === "active" ? "0 4px 16px rgba(79, 70, 229, 0.4)" : "var(--shadow-sm)",
                        }}
                      >
                        <span className="ms ms-20">{m.icon}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>{m.title}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{m.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2-COLUMN BOTTOM GRID: RECENT TRIPS & AUTOMATION MONITOR */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
                {/* Left: Recent Dispatched Trips */}
                <div className="card-elevated" style={{ overflow: "hidden" }}>
                  <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-main)" }}>Recent Fleet Dispatches</div>
                    <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => setActiveTab("trips")}>
                      View All Fleet <span className="ms ms-16">arrow_forward</span>
                    </button>
                  </div>

                  <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
                    <table className="logi-table">
                      <thead>
                        <tr>
                          <th>Trip ID</th>
                          <th>Driver Name</th>
                          <th>Gallons</th>
                          <th>Status</th>
                          <th>1-Click Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trips.slice(0, 6).map((t) => {
                          const statusClass = (t.status || "").toLowerCase().replace(" ", "-");
                          return (
                            <tr key={t.id}>
                              <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--primary)" }}>
                                #TRP-{String(t.id).padStart(4, "0")}
                              </td>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e0e7ff", color: "#4338ca", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {(t.driver_name || "DR").substring(0, 2).toUpperCase()}
                                  </div>
                                  <span style={{ fontWeight: 600 }}>{t.driver_name}</span>
                                </div>
                              </td>
                              <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                                {(t.total_gallons || 0).toLocaleString()} gal
                              </td>
                              <td>
                                <span className={`status-pill ${statusClass}`}>{t.status || "Active"}</span>
                              </td>
                              <td>
                                <div style={{ display: "flex", gap: 6 }}>
                                  <button
                                    className="btn btn-secondary"
                                    style={{ padding: "4px 8px", fontSize: 11.5 }}
                                    onClick={() => generatePDF("invoice", t.id)}
                                    title="Generate Customer Invoice"
                                  >
                                    <span className="ms ms-16" style={{ color: "var(--primary)" }}>receipt_long</span> Invoice
                                  </button>
                                  <button
                                    className="btn btn-secondary"
                                    style={{ padding: "4px 8px", fontSize: 11.5 }}
                                    onClick={() => generatePDF("delivery", t.id)}
                                    title="Generate Delivery Ticket"
                                  >
                                    <span className="ms ms-16" style={{ color: "var(--success)" }}>local_shipping</span> Ticket
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {!trips.length && (
                          <tr>
                            <td colSpan={5} style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                              No trips dispatched yet. Click "+ Dispatch Trip" to create your first delivery record.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right: Automation & Scheduler Monitor */}
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div className="card-elevated" style={{ padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <span className="ms ms-20" style={{ color: "var(--primary)" }}>smart_toy</span>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>Dispatch Scheduler</div>
                    </div>
                    <div style={{ background: "var(--bg-surface-subtle)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: 14, marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em" }}>SERVICE HEALTH</span>
                        <span className="status-pill active" style={{ fontSize: 11 }}>Active</span>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-mono)" }}>Next Sync: 08:00 AM</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Nightly Customer Invoice Reconciliation</div>
                    </div>

                    {[
                      { label: "Active Customers", val: customers.length },
                      { label: "Configured Ship-To Sites", val: shiptos.length },
                      { label: "Email Dispatch Routes", val: emailConfigs.length },
                      { label: "API Handshake Latency", val: "34 ms", green: true },
                    ].map((item, ii) => (
                      <div key={ii} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: 13 }}>
                        <span style={{ color: "var(--text-muted)" }}>{item.label}</span>
                        <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: item.green ? "var(--success)" : "var(--text-main)" }}>
                          {item.val}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="card-elevated" style={{ padding: 20, background: "#090d16", color: "#ffffff" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", marginBottom: 6 }}>FAST AUTOMATION</div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Need an instant PDF invoice?</div>
                    <div style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.5, marginBottom: 14 }}>
                      Configure customized line-items with dynamic fuel pricing and print production-ready documents.
                    </div>
                    <button className="btn btn-primary" style={{ width: "100%", fontSize: 12.5 }} onClick={() => setActiveTab("invoice-config")}>
                      <span className="ms ms-16">receipt_long</span> Open Invoice Studio
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* TAB 2: TRIPS & FLEET DISPATCH                     */}
          {/* ================================================= */}
          {activeTab === "trips" && (
            <div className="animate-fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
                    Trips & Fleet Dispatch
                  </h1>
                  <div style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 2 }}>
                    Manage driver fuel assignments, stop checkpoints, and PDF billing triggers.
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowNewTripModal(true)}>
                  <span className="ms ms-18">add</span> Dispatch New Trip
                </button>
              </div>

              {/* Status Filter Ribbon */}
              <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                {[
                  { key: "all", label: "All Fleet", count: trips.length },
                  { key: "active", label: "Active", count: trips.filter(t => (t.status||"").toLowerCase() === "active").length },
                  { key: "in progress", label: "In Progress", count: trips.filter(t => (t.status||"").toLowerCase() === "in progress").length },
                  { key: "pending", label: "Pending", count: trips.filter(t => (t.status||"").toLowerCase() === "pending").length },
                  { key: "completed", label: "Completed", count: trips.filter(t => (t.status||"").toLowerCase() === "completed").length },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setTripFilter(tab.key)}
                    className={`btn ${tripFilter === tab.key ? "btn-primary" : "btn-secondary"}`}
                    style={{ padding: "6px 14px", fontSize: 12.5, borderRadius: 99 }}
                  >
                    {tab.label}
                    <span style={{ fontSize: 11, fontWeight: 800, padding: "1px 6px", borderRadius: 99, background: tripFilter === tab.key ? "rgba(255,255,255,0.25)" : "var(--bg-app)", fontFamily: "var(--font-mono)" }}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Trips Table */}
              <div className="table-container">
                <table className="logi-table">
                  <thead>
                    <tr>
                      <th>Trip Reference</th>
                      <th>Driver Assigned</th>
                      <th>Fuel Volume (Gallons)</th>
                      <th>Stops</th>
                      <th>Status</th>
                      <th>Instant PDF Generators</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrips.map((t) => {
                      const statusClass = (t.status || "").toLowerCase().replace(" ", "-");
                      return (
                        <tr key={t.id}>
                          <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--primary)" }}>
                            #TRP-{String(t.id).padStart(5, "0")}
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#e0e7ff", color: "#4338ca", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {(t.driver_name || "DR").substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>{t.driver_name}</div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Commercial CDL-A</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: 14 }}>
                                {(t.total_gallons || 0).toLocaleString()} gal
                              </div>
                              <div style={{ width: 120, height: 5, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
                                <div style={{ width: `${Math.min(100, ((t.total_gallons || 0) / 10000) * 100)}%`, height: "100%", background: "var(--primary)" }}></div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: "var(--bg-app)", fontFamily: "var(--font-mono)" }}>
                              {String(t.total_stops || 1).padStart(2, "0")} Stops
                            </span>
                          </td>
                          <td>
                            <span className={`status-pill ${statusClass}`}>{t.status || "Active"}</span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: "5px 10px", fontSize: 12 }}
                                onClick={() => generatePDF("invoice", t.id)}
                              >
                                <span className="ms ms-16" style={{ color: "var(--primary)" }}>receipt_long</span> Invoice PDF
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: "5px 10px", fontSize: 12 }}
                                onClick={() => generatePDF("delivery", t.id)}
                              >
                                <span className="ms ms-16" style={{ color: "var(--success)" }}>local_shipping</span> Delivery Ticket
                              </button>
                            </div>
                          </td>
                          <td>
                            <button
                              className="btn btn-danger btn-icon"
                              onClick={() => del("trips", t.id, setTrips)}
                              title="Delete Trip Record"
                            >
                              <span className="ms ms-16">delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {!filteredTrips.length && (
                      <tr>
                        <td colSpan={7} style={{ padding: "50px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                          No trips matching your filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* TAB 3: CUSTOMERS & CLIENT DIRECTORY               */}
          {/* ================================================= */}
          {activeTab === "customers" && (
            <div className="animate-fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
                    Customer Accounts
                  </h1>
                  <div style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 2 }}>
                    Manage enterprise billing accounts, delivery agreements, and associated ship-to sites.
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCustomerModal(true)}>
                  <span className="ms ms-18">person_add</span> Onboard Customer
                </button>
              </div>

              <div className="table-container">
                <table className="logi-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Primary Billing Email</th>
                      <th>Linked Ship-To Sites</th>
                      <th>Corporate Billing Address</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((c) => {
                      const sitesCount = shiptos.filter((s) => s.customer_id === c.id).length;
                      return (
                        <tr key={c.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--accent-blue-light)", color: "var(--accent-blue)", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {(c.name || "CU").substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-main)" }}>{c.name}</div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>ID: #CUST-{String(c.id).padStart(4, "0")}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
                            {c.email || "—"}
                          </td>
                          <td>
                            <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "var(--success-light)", color: "var(--success-text)" }}>
                              {sitesCount} Delivery Site{sitesCount !== 1 ? "s" : ""}
                            </span>
                          </td>
                          <td style={{ maxWidth: 300, color: "var(--text-muted)", fontSize: 13 }}>
                            {c.billing_address || "—"}
                          </td>
                          <td>
                            <button
                              className="btn btn-danger btn-icon"
                              onClick={() => del("customers", c.id, setCustomers)}
                              title="Delete Customer"
                            >
                              <span className="ms ms-16">delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {!filteredCustomers.length && (
                      <tr>
                        <td colSpan={5} style={{ padding: "50px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                          No customers found. Click "Onboard Customer" to create an enterprise profile.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* TAB 4: VENDORS & FUEL SUPPLIERS                   */}
          {/* ================================================= */}
          {activeTab === "vendors" && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
                  Fuel Suppliers & Carriers
                </h1>
                <div style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 2 }}>
                  Maintain fuel terminal supplier profiles and freight transportation partners.
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 24 }}>
                {/* Add Vendor Form */}
                <div className="card-elevated" style={{ padding: 22, height: "fit-content" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="ms ms-20" style={{ color: "var(--primary)" }}>warehouse</span>
                    Add Supplier Partner
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label className="form-label">Vendor / Terminal Name</label>
                      <input className="form-control" placeholder="e.g. Valero Energy Terminal" value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label">Terminal Address</label>
                      <input className="form-control" placeholder="1200 Terminal Road, Houston, TX" value={vendorAddress} onChange={(e) => setVendorAddress(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label">Contact Email</label>
                      <input type="email" className="form-control" placeholder="dispatch@valero.com" value={vendorEmail} onChange={(e) => setVendorEmail(e.target.value)} />
                    </div>
                    <button className="btn btn-primary" style={{ marginTop: 6 }} onClick={createVendor}>
                      <span className="ms ms-18">add</span> Register Supplier
                    </button>
                  </div>
                </div>

                {/* Vendors Table */}
                <div className="table-container">
                  <table className="logi-table">
                    <thead>
                      <tr>
                        <th>Supplier / Carrier</th>
                        <th>Terminal Address</th>
                        <th>Dispatch Email</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendors.map((v) => (
                        <tr key={v.id}>
                          <td style={{ fontWeight: 700 }}>{v.name}</td>
                          <td style={{ color: "var(--text-muted)" }}>{v.address || "—"}</td>
                          <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{v.email || "—"}</td>
                          <td>
                            <button className="btn btn-danger btn-icon" onClick={() => del("vendors", v.id, setVendors)}>
                              <span className="ms ms-16">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!vendors.length && (
                        <tr>
                          <td colSpan={4} style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                            No suppliers registered yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* TAB 5: PRODUCTS, CATEGORIES, FEES & TAXES         */}
          {/* ================================================= */}
          {activeTab === "products" && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
                  Product Catalog & Pricing Rules
                </h1>
                <div style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 2 }}>
                  Configure fuel grades, surcharge matrices, handling fees, and regional tax brackets.
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* 1. Product Categories */}
                <div className="card-elevated" style={{ padding: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="ms ms-18" style={{ color: "var(--primary)" }}>folder</span> Fuel Categories
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    <input className="form-control" placeholder="e.g. ULSD, DEF, BioDiesel" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
                    <button className="btn btn-primary" onClick={createCategory}>Add</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto" }}>
                    {categories.map((c) => (
                      <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-app)", borderRadius: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</span>
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)" }} onClick={() => del("product-categories", c.id, setCategories)}>
                          <span className="ms ms-16">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Fuel Products */}
                <div className="card-elevated" style={{ padding: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="ms ms-18" style={{ color: "var(--accent-blue)" }}>category</span> Fuel Products
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                    <input className="form-control" style={{ flex: 1, minWidth: 140 }} placeholder="Product title" value={productName} onChange={(e) => setProductName(e.target.value)} />
                    <select className="form-control" style={{ flex: 1, minWidth: 140 }} value={productCategoryId} onChange={(e) => setProductCategoryId(e.target.value)}>
                      <option value="">Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <button className="btn btn-primary" onClick={createProduct}>Add</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto" }}>
                    {products.map((p) => (
                      <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-app)", borderRadius: 6 }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 13.5 }}>{p.name}</span>
                          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>
                            {categories.find((c) => c.id === p.product_category_id)?.name || "Uncategorized"}
                          </span>
                        </div>
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)" }} onClick={() => del("products", p.id, setProducts)}>
                          <span className="ms ms-16">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Surcharges & Fees */}
                <div className="card-elevated" style={{ padding: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="ms ms-18" style={{ color: "var(--warning)" }}>payments</span> Handling & Surcharge Fees
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    <input className="form-control" style={{ flex: 2 }} placeholder="Fee name (e.g. Fuel Surcharge)" value={feeName} onChange={(e) => setFeeName(e.target.value)} />
                    <input type="number" className="form-control" style={{ flex: 1 }} placeholder="Rate $" value={feeRate} onChange={(e) => setFeeRate(e.target.value)} />
                    <button className="btn btn-primary" onClick={createFee}>Add</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto" }}>
                    {fees.map((f) => (
                      <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-app)", borderRadius: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{f.name}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--primary)" }}>
                            ${Number(f.default_rate).toFixed(2)}
                          </span>
                          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)" }} onClick={() => del("fees", f.id, setFees)}>
                            <span className="ms ms-16">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Tax Configuration */}
                <div className="card-elevated" style={{ padding: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="ms ms-18" style={{ color: "var(--success)" }}>percent</span> Regional Taxes
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    <input className="form-control" style={{ flex: 2 }} placeholder="Tax name (e.g. State Excise)" value={taxName} onChange={(e) => setTaxName(e.target.value)} />
                    <input type="number" className="form-control" style={{ flex: 1 }} placeholder="%" value={taxPercentage} onChange={(e) => setTaxPercentage(e.target.value)} />
                    <button className="btn btn-primary" onClick={createTax}>Add</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto" }}>
                    {taxes.map((t) => (
                      <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-app)", borderRadius: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--success)" }}>
                            {t.percentage}%
                          </span>
                          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)" }} onClick={() => del("taxes", t.id, setTaxes)}>
                            <span className="ms ms-16">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* TAB 6: DOCUMENT STUDIO & LIVE PDF PREVIEW         */}
          {/* ================================================= */}
          {activeTab === "templates" && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
                  Document Template Studio
                </h1>
                <div style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 2 }}>
                  Customize document formatting, line-item breakdowns, and preview live PDF structures.
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 24 }}>
                {/* Template Controls */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div className="card-elevated" style={{ padding: 22 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Document Format Type</div>
                    {[
                      { val: "invoice", label: "Product Invoice", sub: "Standard customer fuel billing", icon: "receipt_long" },
                      { val: "delivery_ticket", label: "Delivery Ticket", sub: "Proof of site delivery confirmation", icon: "local_shipping" },
                      { val: "freight_invoice", label: "Freight Invoice", sub: "Carrier reconciliation manifest", icon: "description" },
                    ].map((opt) => (
                      <div
                        key={opt.val}
                        onClick={() => setDocumentType(opt.val)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 14px",
                          borderRadius: 8,
                          border: `2px solid ${documentType === opt.val ? "var(--primary)" : "var(--border-subtle)"}`,
                          background: documentType === opt.val ? "var(--primary-light)" : "var(--bg-surface)",
                          cursor: "pointer",
                          marginBottom: 10,
                          transition: "var(--transition-fast)",
                        }}
                      >
                        <span className="ms ms-20" style={{ color: documentType === opt.val ? "var(--primary)" : "var(--text-muted)" }}>
                          {opt.icon}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-main)" }}>{opt.label}</div>
                          <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{opt.sub}</div>
                        </div>
                        {documentType === opt.val && <span className="ms ms-18" style={{ color: "var(--primary)" }}>check_circle</span>}
                      </div>
                    ))}
                  </div>

                  <div className="card-elevated" style={{ padding: 22 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Display Switches & Fields</div>
                    {[
                      { label: "Show Company Header Logo", sub: "Print company header on document", val: showLogo, set: setShowLogo },
                      { label: "Include Handling Fees", sub: "Calculate administrative line items", val: showFees, set: setShowFees },
                      { label: "Calculate Regional Taxes", sub: "Display excise and state tax rows", val: showTaxes, set: setShowTaxes },
                      { label: "Show Drop-off Timestamp", sub: "Print precise time of delivery", val: showDeliveryTimestamp, set: setShowDeliveryTimestamp },
                      { label: "Highlight Payment Due Date", sub: "Net 30 payment notice at header", val: showDueDate, set: setShowDueDate },
                    ].map((item, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{item.sub}</div>
                        </div>
                        <button
                          type="button"
                          className={`toggle-switch ${item.val ? "active" : ""}`}
                          onClick={() => item.set(!item.val)}
                        />
                      </div>
                    ))}
                    <button className="btn btn-primary" style={{ width: "100%", marginTop: 18 }} onClick={createTemplate}>
                      <span className="ms ms-18">save</span> Save Template Preset
                    </button>
                  </div>
                </div>

                {/* Live Realistic Document Preview (Flexport & Turvo Inspired) */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>
                      LIVE DOCUMENT PREVIEW (WYSIWYG)
                    </div>
                    <div style={{ fontSize: 12, color: "var(--success)", display: "flex", alignItems: "center", gap: 4 }}>
                      <span className="ms ms-16">visibility</span> Real-time Rendering
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 12,
                      border: "1px solid var(--border-strong)",
                      boxShadow: "var(--shadow-lg)",
                      padding: 40,
                      minHeight: 520,
                    }}
                  >
                    {/* Invoice Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 24, borderBottom: "2px solid #0f172a", marginBottom: 24 }}>
                      <div>
                        {showLogo && (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 6, background: "#0f172a", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span className="ms ms-18">local_shipping</span>
                            </div>
                            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em" }}>FIRST FUEL LOGISTICS</span>
                          </div>
                        )}
                        <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>
                          100 Enterprise Boulevard, Suite 400<br />
                          Chicago, IL 60601 • (800) 555-0199
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "var(--primary)" }}>
                          {documentType === "invoice" ? "COMMERCIAL INVOICE" : documentType === "delivery_ticket" ? "DELIVERY TICKET" : "FREIGHT MANIFEST"}
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--text-muted)", marginTop: 4 }}>
                          REF: #DOC-2024-8841
                        </div>
                        {showDueDate && (
                          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--danger)", marginTop: 4 }}>
                            PAYMENT DUE: NET 30
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bill To & Ship To */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 4 }}>BILLED TO</div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>Midwest Transport Fleet Inc.</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>500 Logistics Parkway, Chicago, IL</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 4 }}>DELIVERY SITE</div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>Austin Tank Farm - Terminal 4</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>7800 Energy Way, Austin, TX</div>
                      </div>
                    </div>

                    {/* Line Items Table */}
                    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                          <th style={{ textAlign: "left", padding: "8px 0", fontSize: 11, color: "var(--text-muted)" }}>DESCRIPTION</th>
                          <th style={{ textAlign: "right", padding: "8px 0", fontSize: 11, color: "var(--text-muted)" }}>QTY (GAL)</th>
                          <th style={{ textAlign: "right", padding: "8px 0", fontSize: 11, color: "var(--text-muted)" }}>UNIT PRICE</th>
                          <th style={{ textAlign: "right", padding: "8px 0", fontSize: 11, color: "var(--text-muted)" }}>AMOUNT</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "10px 0", fontSize: 13, fontWeight: 600 }}>Ultra Low Sulfur Diesel (ULSD)</td>
                          <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 13 }}>7,500</td>
                          <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 13 }}>$3.45</td>
                          <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13 }}>$25,875.00</td>
                        </tr>
                        {showFees && (
                          <tr style={{ borderBottom: "1px solid #f1f5f9", color: "var(--text-muted)" }}>
                            <td style={{ padding: "8px 0", fontSize: 12.5 }}>Hazardous Material & Handling Surcharge</td>
                            <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 12.5 }}>1</td>
                            <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 12.5 }}>$150.00</td>
                            <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 12.5 }}>$150.00</td>
                          </tr>
                        )}
                        {showTaxes && (
                          <tr style={{ borderBottom: "1px solid #f1f5f9", color: "var(--text-muted)" }}>
                            <td style={{ padding: "8px 0", fontSize: 12.5 }}>State Fuel Excise Tax (6.5%)</td>
                            <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 12.5 }}>—</td>
                            <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 12.5 }}>—</td>
                            <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 12.5 }}>$1,681.88</td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {/* Total Breakdown */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                      <div style={{ width: 260, borderTop: "2px solid #0f172a", paddingTop: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800 }}>
                          <span>TOTAL DUE:</span>
                          <span style={{ fontFamily: "var(--font-mono)", color: "var(--primary)" }}>$27,706.88</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* TAB 7: INVOICE CONFIGURATION MATRIX               */}
          {/* ================================================= */}
          {activeTab === "invoice-config" && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
                  Invoice & Billing Configurator
                </h1>
                <div style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 2 }}>
                  Assemble custom product rates, handling fees, and tax bases, then render production PDF packages.
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 24 }}>
                {/* Configuration Builder Form */}
                <div className="card-elevated" style={{ padding: 22 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="ms ms-20" style={{ color: "var(--primary)" }}>tune</span>
                    New Invoice Template
                  </div>

                  {invValidationMsg && (
                    <div style={{ background: "var(--warning-light)", border: "1px solid var(--warning-border)", color: "var(--warning-text)", padding: "8px 12px", borderRadius: 6, fontSize: 12.5, marginBottom: 14 }}>
                      {invValidationMsg}
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label className="form-label">Select Customer</label>
                      <select
                        className="form-control"
                        value={invCustomerId}
                        onChange={(e) => {
                          setInvCustomerId(e.target.value);
                          loadShiptosForCustomer(e.target.value);
                          setInvValidationMsg("");
                        }}
                      >
                        <option value="">— Select Customer —</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Ship-To Site</label>
                      <select
                        className="form-control"
                        value={invShiptoId}
                        onChange={(e) => {
                          setInvShiptoId(e.target.value);
                          setInvValidationMsg("");
                        }}
                      >
                        <option value="">— Select Ship-To Site —</option>
                        {invShiptos.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Vendor / Supplier (Optional)</label>
                      <select className="form-control" value={invVendorId} onChange={(e) => setInvVendorId(e.target.value)}>
                        <option value="">— Select Supplier —</option>
                        {vendors.map((v) => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Products Builder */}
                    <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span className="form-label" style={{ margin: 0 }}>Product Items</span>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: "2px 8px", fontSize: 11 }}
                          onClick={() => setInvProducts([...invProducts, { product_id: "", quantity: "", unit_price: "" }])}
                        >
                          + Add Row
                        </button>
                      </div>
                      {invProducts.map((row, idx) => (
                        <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                          <select
                            className="form-control"
                            style={{ flex: 2, padding: "6px 8px", fontSize: 12.5 }}
                            value={row.product_id}
                            onChange={(e) => {
                              const r = [...invProducts];
                              r[idx].product_id = e.target.value;
                              setInvProducts(r);
                            }}
                          >
                            <option value="">Product</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            className="form-control"
                            style={{ flex: 1, padding: "6px 8px", fontSize: 12.5 }}
                            placeholder="Qty"
                            value={row.quantity}
                            onChange={(e) => {
                              const r = [...invProducts];
                              r[idx].quantity = e.target.value;
                              setInvProducts(r);
                            }}
                          />
                          <input
                            type="number"
                            className="form-control"
                            style={{ flex: 1, padding: "6px 8px", fontSize: 12.5 }}
                            placeholder="Price $"
                            value={row.unit_price}
                            onChange={(e) => {
                              const r = [...invProducts];
                              r[idx].unit_price = e.target.value;
                              setInvProducts(r);
                            }}
                          />
                          {invProducts.length > 1 && (
                            <button
                              type="button"
                              style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}
                              onClick={() => setInvProducts(invProducts.filter((_, i) => i !== idx))}
                            >
                              <span className="ms ms-16">close</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={createInvoiceConfig}>
                      <span className="ms ms-18">save</span> Save Configuration
                    </button>
                  </div>
                </div>

                {/* Configurations List */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-main)" }}>
                    Active Configurations ({invoiceConfigs.length})
                  </div>

                  {invoiceConfigs.map((c) => (
                    <div
                      key={c.id}
                      className="card-elevated"
                      style={{ padding: 18, borderLeft: "4px solid var(--primary)", display: "flex", flexDirection: "column", gap: 12 }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-main)" }}>
                            {customers.find((cu) => cu.id === c.customer_id)?.name || `Customer #${c.customer_id}`}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                            Site: {shiptos.find((s) => s.id === c.shipto_id)?.name || `Site #${c.shipto_id}`}
                          </div>
                        </div>
                        <button
                          className="btn btn-danger btn-icon"
                          onClick={() => del("invoice-configurations", c.id, setInvoiceConfigs)}
                        >
                          <span className="ms ms-16">delete</span>
                        </button>
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "var(--bg-app)" }}>
                          {(c.products || []).length} Products
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "var(--bg-app)" }}>
                          {(c.fees || []).length} Fees
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "var(--bg-app)" }}>
                          {(c.taxes || []).length} Taxes
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 10, paddingTop: 6, borderTop: "1px solid var(--border-subtle)" }}>
                        <button
                          className="btn btn-success"
                          style={{ padding: "6px 12px", fontSize: 12 }}
                          onClick={() => generatePDF("invoice-config", c.id)}
                        >
                          <span className="ms ms-16">receipt_long</span> Generate Invoice PDF
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "6px 12px", fontSize: 12 }}
                          onClick={() => generatePDF("delivery-config", c.id)}
                        >
                          <span className="ms ms-16">local_shipping</span> Delivery Ticket PDF
                        </button>
                      </div>
                    </div>
                  ))}

                  {!invoiceConfigs.length && (
                    <div className="card-elevated" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                      No invoice configurations assembled yet. Create one on the left to render customized customer bills.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* TAB 8: SHIP-TO LOCATIONS                          */}
          {/* ================================================= */}
          {activeTab === "shipto" && (
            <div className="animate-fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
                    Ship-To Delivery Sites
                  </h1>
                  <div style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 2 }}>
                    Manage customer drop-off yards, tank terminals, and commercial fueling stations.
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowShipToModal(true)}>
                  <span className="ms ms-18">add_location_alt</span> Add Ship-To Location
                </button>
              </div>

              <div className="table-container">
                <table className="logi-table">
                  <thead>
                    <tr>
                      <th>Terminal / Site Name</th>
                      <th>Linked Customer</th>
                      <th>Delivery Street Address</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shiptos.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span className="ms ms-18" style={{ color: "var(--primary)" }}>pin_drop</span>
                            <span style={{ fontWeight: 700 }}>{s.name}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "var(--accent-blue-light)", color: "var(--accent-blue)" }}>
                            {customers.find((c) => c.id === s.customer_id)?.name || `Customer #${s.customer_id}`}
                          </span>
                        </td>
                        <td style={{ color: "var(--text-muted)" }}>{s.address}</td>
                        <td>
                          <button className="btn btn-danger btn-icon" onClick={() => del("shipto", s.id, setShiptos)}>
                            <span className="ms ms-16">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!shiptos.length && (
                      <tr>
                        <td colSpan={4} style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                          No Ship-To sites added yet. Click "Add Ship-To Location" to map sites to customers.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* TAB 9: DOCUMENTS ARCHIVE & EXPORTS                */}
          {/* ================================================= */}
          {activeTab === "documents" && (
            <div className="animate-fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
                    Documents & Generated Archive
                  </h1>
                  <div style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 2 }}>
                    Access generated invoices, tickets, and automated transmission records.
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className={`btn ${docFilter === "all" ? "btn-primary" : "btn-secondary"}`}
                    style={{ padding: "6px 14px", fontSize: 12.5, borderRadius: 99 }}
                    onClick={() => setDocFilter("all")}
                  >
                    All Docs ({documents.length})
                  </button>
                  <button
                    className={`btn ${docFilter === "invoice" ? "btn-primary" : "btn-secondary"}`}
                    style={{ padding: "6px 14px", fontSize: 12.5, borderRadius: 99 }}
                    onClick={() => setDocFilter("invoice")}
                  >
                    Invoices
                  </button>
                  <button
                    className={`btn ${docFilter === "delivery" ? "btn-primary" : "btn-secondary"}`}
                    style={{ padding: "6px 14px", fontSize: 12.5, borderRadius: 99 }}
                    onClick={() => setDocFilter("delivery")}
                  >
                    Tickets
                  </button>
                </div>
              </div>

              <div className="table-container">
                <table className="logi-table">
                  <thead>
                    <tr>
                      <th>Document Reference</th>
                      <th>Document Class</th>
                      <th>Generated At</th>
                      <th>Transmission Status</th>
                      <th>Instant Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id}>
                        <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--primary)" }}>
                          {doc.type.includes("invoice") ? "INV" : "TKT"}-{doc.ref_id}-{String(doc.id).slice(-4)}
                        </td>
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: doc.type.includes("invoice") ? "var(--primary-light)" : "var(--success-light)", color: doc.type.includes("invoice") ? "var(--primary-text)" : "var(--success-text)" }}>
                            {doc.type.replace("-", " ").toUpperCase()}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                          {new Date(doc.generated_at).toLocaleString()}
                        </td>
                        <td>
                          <span className="status-pill sent">Transmitted</span>
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "5px 12px", fontSize: 12 }}
                            onClick={() => generatePDF(doc.type, doc.ref_id)}
                          >
                            <span className="ms ms-16">download</span> Re-download PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!filteredDocuments.length && (
                      <tr>
                        <td colSpan={5} style={{ padding: "50px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                          No documents generated in this session yet. Generate documents from Trips or Invoice Config tab.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* TAB 10: EMAIL DISPATCH SETTINGS                   */}
          {/* ================================================= */}
          {activeTab === "email" && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
                  Email & Dispatch Automation
                </h1>
                <div style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 2 }}>
                  Configure SMTP/Gmail transmission credentials and destination routing rules.
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                {/* Provider Setup */}
                <div className="card-elevated" style={{ padding: 22 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="ms ms-20" style={{ color: "var(--primary)" }}>mail</span>
                    Sender Account Setup
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label className="form-label">Provider</label>
                      <select className="form-control" value={emailProvider} onChange={(e) => setEmailProvider(e.target.value)}>
                        <option value="gmail">Gmail (App Password)</option>
                        <option value="smtp">Custom Enterprise SMTP</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Sender Email Address</label>
                      <input type="email" className="form-control" placeholder="dispatch@company.com" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} />
                    </div>
                    {emailProvider === "gmail" && (
                      <div>
                        <label className="form-label">Gmail App Password</label>
                        <input type="password" className="form-control" placeholder="••••••••••••••••" value={emailToken} onChange={(e) => setEmailToken(e.target.value)} />
                      </div>
                    )}
                    {emailProvider === "smtp" && (
                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
                        <div>
                          <label className="form-label">SMTP Host</label>
                          <input className="form-control" placeholder="smtp.office365.com" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} />
                        </div>
                        <div>
                          <label className="form-label">Port</label>
                          <input type="number" className="form-control" placeholder="587" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
                        </div>
                      </div>
                    )}
                    <button className="btn btn-primary" onClick={createEmailSettings}>
                      <span className="ms ms-18">save</span> Save Sender Credentials
                    </button>
                  </div>
                </div>

                {/* Routing Rules */}
                <div className="card-elevated" style={{ padding: 22 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="ms ms-20" style={{ color: "var(--success)" }}>forward_to_inbox</span>
                    Automated Delivery Routes
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label className="form-label">Document Type</label>
                      <select className="form-control" value={sendDocType} onChange={(e) => setSendDocType(e.target.value)}>
                        <option value="invoice">Product Invoice</option>
                        <option value="delivery_ticket">Delivery Ticket</option>
                        <option value="freight_invoice">Freight Invoice</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Destination Billing Email</label>
                      <input type="email" className="form-control" placeholder="accounts@customer.com" value={sendDestEmail} onChange={(e) => setSendDestEmail(e.target.value)} />
                    </div>
                    <button className="btn btn-primary" onClick={createEmailConfig}>
                      <span className="ms ms-18">add</span> Add Transmission Rule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* TAB 11: COMPANY PROFILE SETTINGS                  */}
          {/* ================================================= */}
          {activeTab === "company" && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
                  Corporate Entity Profile
                </h1>
                <div style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 2 }}>
                  Branding and contact information printed on official invoices and manifests.
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 24 }}>
                <div className="card-elevated" style={{ padding: 22 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="ms ms-20" style={{ color: "var(--primary)" }}>business</span>
                    {editingCompanyId ? "Edit Company Information" : "Add Entity Information"}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label className="form-label">Legal Corporate Name</label>
                      <input className="form-control" placeholder="e.g. First Fuel America Logistics LLC" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label">Headquarters Address</label>
                      <input className="form-control" placeholder="100 Logistics Blvd, Suite 200, Dallas, TX" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label className="form-label">Support Phone</label>
                        <input className="form-control" placeholder="(800) 555-0199" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
                      </div>
                      <div>
                        <label className="form-label">Billing Terms</label>
                        <select className="form-control" value={companyPaymentTerms} onChange={(e) => setCompanyPaymentTerms(e.target.value)}>
                          <option>Net 30</option>
                          <option>Net 15</option>
                          <option>Net 60</option>
                          <option>Due on Receipt</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" placeholder="ops@firstfuel.com" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
                      </div>
                      <div>
                        <label className="form-label">Website</label>
                        <input className="form-control" placeholder="www.firstfuel.com" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                      {editingCompanyId && (
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setEditingCompanyId(null);
                            setCompanyName("");
                            setCompanyAddress("");
                          }}
                        >
                          Cancel
                        </button>
                      )}
                      <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveCompanySettings}>
                        <span className="ms ms-18">save</span> {editingCompanyId ? "Update Profile" : "Save Profile"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Company Profiles Display */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>Configured Entities ({companySettings.length})</div>
                  {companySettings.map((s) => (
                    <div key={s.id} className="card-elevated" style={{ padding: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-main)" }}>{s.company_name}</div>
                          <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>{s.address || "No address recorded"}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-secondary" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => editCompany(s)}>
                            Edit
                          </button>
                          <button className="btn btn-danger btn-icon" onClick={() => del("company-settings", s.id, setCompanySettings)}>
                            <span className="ms ms-16">delete</span>
                          </button>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, fontSize: 12.5, color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)", paddingTop: 12 }}>
                        <div><strong style={{ color: "var(--text-main)" }}>Phone:</strong> {s.phone || "—"}</div>
                        <div><strong style={{ color: "var(--text-main)" }}>Email:</strong> {s.email || "—"}</div>
                        <div><strong style={{ color: "var(--text-main)" }}>Terms:</strong> {s.payment_terms || "Net 30"}</div>
                      </div>
                    </div>
                  ))}
                  {!companySettings.length && (
                    <div className="card-elevated" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                      No corporate entities configured. Add your business details on the left.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
