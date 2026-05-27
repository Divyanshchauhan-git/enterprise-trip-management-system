import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [trips, setTrips] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [templates, setTemplates] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [driverName, setDriverName] = useState("");
  const [totalGallons, setTotalGallons] = useState("");
  const [totalStops, setTotalStops] = useState("");
  const [status, setStatus] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [vendorName, setVendorName] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");

  const [documentType, setDocumentType] = useState("");

  const [showFees, setShowFees] = useState(false);
  const [showTaxes, setShowTaxes] = useState(false);
  const [showLogo, setShowLogo] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    fetch("http://localhost:8000/trips")
      .then((response) => response.json())
      .then((data) => {
        setTrips(data);
      });

    fetch("http://localhost:8000/customers")
      .then((response) => response.json())
      .then((data) => {
        setCustomers(data);
      });

    fetch("http://localhost:8000/vendors")
      .then((response) => response.json())
      .then((data) => {
        setVendors(data);
      });

    fetch("http://localhost:8000/document-templates")
      .then((response) => response.json())
      .then((data) => {
        setTemplates(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Failed to load data");
        setLoading(false);
      });
  }, [user]);

  const loginUser = async () => {
    const response = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (data.user) {
      setUser(data.user);

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );
    } else {
      alert(data.message);
    }
  };

  const createTrip = async () => {
    const response = await fetch("http://localhost:8000/trips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        driver_name: driverName,
        total_gallons: Number(totalGallons),
        total_stops: Number(totalStops),
        status: status,
      }),
    });

    const data = await response.json();

    setTrips([...trips, data.trip]);

    setDriverName("");
    setTotalGallons("");
    setTotalStops("");
    setStatus("");
  };

  const createCustomer = async () => {
    const response = await fetch(
      "http://localhost:8000/customers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: customerName,
          billing_address: billingAddress,
          email: customerEmail,
        }),
      }
    );

    const data = await response.json();

    setCustomers([...customers, data]);

    setCustomerName("");
    setBillingAddress("");
    setCustomerEmail("");
  };

  const createVendor = async () => {
    const response = await fetch(
      "http://localhost:8000/vendors",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: vendorName,
          address: vendorAddress,
          email: vendorEmail,
        }),
      }
    );

    const data = await response.json();

    setVendors([...vendors, data]);

    setVendorName("");
    setVendorAddress("");
    setVendorEmail("");
  };

  const createTemplate = async () => {
    const response = await fetch(
      "http://localhost:8000/document-templates",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_type: documentType,
          show_fees: showFees,
          show_taxes: showTaxes,
          show_logo: showLogo,
        }),
      }
    );

    const data = await response.json();

    setTemplates([...templates, data]);

    setDocumentType("");

    setShowFees(false);
    setShowTaxes(false);
    setShowLogo(false);
  };

  const deleteTrip = async (tripId) => {
    await fetch(`http://localhost:8000/trips/${tripId}`, {
      method: "DELETE",
    });

    setTrips(
      trips.filter((trip) => trip.id !== tripId)
    );
  };

  if (!user) {
    return (
      <div className="container">
        <h1>Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button onClick={loginUser}>
          Login
        </button>
      </div>
    );
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div className="container">
      <h1>Trip Summary System</h1>

      <h3>Welcome, {user.username}</h3>

      <button
        onClick={() => {
          localStorage.removeItem("user");
          setUser(null);
        }}
      >
        Logout
      </button>

      <h2>Add Trip</h2>

      <div className="form-container">
        <input
          type="text"
          placeholder="Driver Name"
          value={driverName}
          onChange={(e) =>
            setDriverName(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Total Gallons"
          value={totalGallons}
          onChange={(e) =>
            setTotalGallons(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Total Stops"
          value={totalStops}
          onChange={(e) =>
            setTotalStops(e.target.value)
          }
        />

        <input
          type="text"
          placeholder="Status"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        />

        <button onClick={createTrip}>
          Add Trip
        </button>
      </div>

      <h2>Customer Management</h2>

      <div className="form-container">
        <input
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) =>
            setCustomerName(e.target.value)
          }
        />

        <input
          type="text"
          placeholder="Billing Address"
          value={billingAddress}
          onChange={(e) =>
            setBillingAddress(e.target.value)
          }
        />

        <input
          type="email"
          placeholder="Customer Email"
          value={customerEmail}
          onChange={(e) =>
            setCustomerEmail(e.target.value)
          }
        />

        <button onClick={createCustomer}>
          Add Customer
        </button>
      </div>

      {customers.map((customer) => (
        <div
          key={customer.id}
          className="trip-card"
        >
          <h3>{customer.name}</h3>

          <p>
            Address: {customer.billing_address}
          </p>

          <p>Email: {customer.email}</p>
        </div>
      ))}

      <h2>Vendor Management</h2>

      <div className="form-container">
        <input
          type="text"
          placeholder="Vendor Name"
          value={vendorName}
          onChange={(e) =>
            setVendorName(e.target.value)
          }
        />

        <input
          type="text"
          placeholder="Vendor Address"
          value={vendorAddress}
          onChange={(e) =>
            setVendorAddress(e.target.value)
          }
        />

        <input
          type="email"
          placeholder="Vendor Email"
          value={vendorEmail}
          onChange={(e) =>
            setVendorEmail(e.target.value)
          }
        />

        <button onClick={createVendor}>
          Add Vendor
        </button>
      </div>

      {vendors.map((vendor) => (
        <div
          key={vendor.id}
          className="trip-card"
        >
          <h3>{vendor.name}</h3>

          <p>
            Address: {vendor.address}
          </p>

          <p>Email: {vendor.email}</p>
        </div>
      ))}

      <h2>Document Templates</h2>

      <div className="form-container">
        <input
          type="text"
          placeholder="Document Type"
          value={documentType}
          onChange={(e) =>
            setDocumentType(e.target.value)
          }
        />

        <label>
          <input
            type="checkbox"
            checked={showFees}
            onChange={(e) =>
              setShowFees(e.target.checked)
            }
          />
          Show Fees
        </label>

        <label>
          <input
            type="checkbox"
            checked={showTaxes}
            onChange={(e) =>
              setShowTaxes(e.target.checked)
            }
          />
          Show Taxes
        </label>

        <label>
          <input
            type="checkbox"
            checked={showLogo}
            onChange={(e) =>
              setShowLogo(e.target.checked)
            }
          />
          Show Logo
        </label>

        <button onClick={createTemplate}>
          Add Template
        </button>
      </div>

      {templates.map((template) => (
        <div
          key={template.id}
          className="trip-card"
        >
          <h3>{template.document_type}</h3>

          <p>
            Show Fees:
            {template.show_fees ? " Yes" : " No"}
          </p>

          <p>
            Show Taxes:
            {template.show_taxes ? " Yes" : " No"}
          </p>

          <p>
            Show Logo:
            {template.show_logo ? " Yes" : " No"}
          </p>
        </div>
      ))}

      <h2>Trips</h2>

      {trips.map((trip) => (
        <div
          key={trip.id}
          className="trip-card"
        >
          <h3>{trip.driver_name}</h3>

          <p>
            Gallons: {trip.total_gallons}
          </p>

          <p>
            Stops: {trip.total_stops}
          </p>

          <p>Status: {trip.status}</p>

          <button
            onClick={() =>
              deleteTrip(trip.id)
            }
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;