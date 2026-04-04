import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import WorkerDashboard from "./pages/WorkerDashboard";
import PlanSelection from "./pages/PlanSelection";
import AdminDashboard from "./pages/AdminDashboard";

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [view, setView] = useState("dashboard");

  if (loading) {
    return (
      <div className="loading-wrapper" style={{ minHeight: "100vh" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-shell">
        <Navbar />
        <AuthPage />
      </div>
    );
  }

  const isAdmin = user.role === "admin";

  const renderContent = () => {
    if (isAdmin) return <AdminDashboard />;
    if (view === "plans") {
      return (
        <PlanSelection
          onPlanSelected={() => setView("dashboard")}
        />
      );
    }
    return <WorkerDashboard />;
  };

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="nav-brand" onClick={() => setView("dashboard")}>
          <img src="/logo.png" alt="Earn Shield AI" className="nav-logo-img" />
          <div>
            <div className="nav-title">Earn Shield AI</div>
            <div className="nav-subtitle">Parametric Insurance</div>
          </div>
        </div>

        <div className="nav-right">
          {!isAdmin && (
            <div className="nav-links">
              <button
                className={`nav-link ${view === "dashboard" ? "active" : ""}`}
                onClick={() => setView("dashboard")}
              >
                Dashboard
              </button>
              <button
                className={`nav-link ${view === "plans" ? "active" : ""}`}
                onClick={() => setView("plans")}
              >
                Plans
              </button>
            </div>
          )}

          <div className="nav-user">
            <div className="nav-user-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <span>{user.name}</span>
            <span style={{ color: "var(--text-muted)" }}>
              · {isAdmin ? "Admin" : user.platform}
            </span>
          </div>

          <button className="btn btn-ghost btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content">{renderContent()}</main>
    </div>
  );
}

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <img src="/logo.png" alt="Earn Shield AI" className="nav-logo-img" />
        <div>
          <div className="nav-title">Earn Shield AI</div>
          <div className="nav-subtitle">Parametric Insurance</div>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
