import React, { useState } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import Register from "./pages/Register.jsx";
import PolicySelection from "./pages/PolicySelection.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [view, setView] = useState("register"); // register | dashboard | admin

  const handleAuth = (data) => {
    setToken(data.token);
    setUser(data);
    setView(data.role === "admin" ? "admin" : "dashboard");
  };

  const showPolicySelection = () => setView("policy");

  const renderContent = () => {
    if (!token) {
      return <Register onAuthenticated={handleAuth} />;
    }

    if (view === "policy") {
      return (
        <PolicySelection
          token={token}
          onBack={() => setView(user.role === "admin" ? "admin" : "dashboard")}
        />
      );
    }

    if (view === "admin" && user?.role === "admin") {
      return <AdminDashboard token={token} />;
    }

    return (
      <Dashboard
        token={token}
        user={user}
        onChoosePlan={showPolicySelection}
      />
    );
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-logo">G</span>
          <div>
            <div className="brand-title">GigShield AI</div>
            <div className="brand-subtitle">
              Parametric cover for India&apos;s gig workers
            </div>
          </div>
        </div>
        {user && (
          <div className="header-right">
            <span className="user-pill">
              {user.name} · {user.platform}
            </span>
            <button
              className="ghost-button"
              onClick={() => {
                setToken(null);
                setUser(null);
                setView("register");
              }}
            >
              Logout
            </button>
          </div>
        )}
      </header>
      <main className="app-main">{renderContent()}</main>
    </div>
  );
}

export default App;

