# LogiTrack Prime — Enterprise Fleet & Logistics Management System

A next-generation commercial logistics dispatch, fuel telemetry tracking, and automated document generation platform built with **FastAPI**, **React**, and **SQLAlchemy**.

---

## 🚀 Key Capabilities & Highlights

- **Executive Logistics Radar (Dashboard)**: Real-time telemetry monitoring gallons delivered, active fleet stops, and automated invoice reconciliation.
- **Trip & Dispatch Hub**: Live fleet progress tracking, stop milestone counters, and instant 1-click PDF document generation.
- **Enterprise Partner Directory**: Customer profiles linked to multiple Ship-To delivery sites, fuel terminal supplier registry, and carrier management.
- **Dynamic Pricing Engine**: Fuel catalog management, handling surcharges, and regional excise tax calculators.
- **Document Studio & Live PDF Generator**: Interactive WYSIWYG template editor with real-time dynamic invoice sheet preview and PDF rendering.
- **Email & Automation Center**: Automated transmission via Gmail App Passwords / Custom SMTP with destination routing rules.
- **Corporate Entity Profile**: Multi-entity branding and billing terms configuration for printed invoices and delivery manifests.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Vanilla CSS Design System (Flexport/Samsara inspired), Plus Jakarta Sans & JetBrains Mono typography.
- **Backend**: Python FastAPI, Uvicorn, SQLAlchemy ORM, ReportLab PDF Engine, Pydantic, Bcrypt authentication.
- **Database**: PostgreSQL (Production) with SQLite local development fallback.

---

## 📦 Getting Started

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📄 License
MIT License.