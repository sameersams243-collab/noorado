import "./App.css";
import { Navigate, Routes, Route } from "react-router-dom";

import Home from "./pages/HomePage";
import PortfolioPage from "./pages/PortfolioPage";

import CorporateWebsitePage from "./pages/portfolio/CorporateWebsitePage";
import ExcelAutomationPage from "./pages/portfolio/ExcelAutomationPage";
import InventoryManagementPage from "./pages/portfolio/InventoryManagementPage";
import BusinessToolsPage from "./pages/portfolio/BusinessToolsPage";

import SignInPage from "./pages/auth/SignInPage/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage/SignUpPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage/ForgotPasswordPage";

import DashboardPage from "./pages/Dashboard/DashboardPage/DashboardPage";
import ToolsPage from "./pages/Freetoolspage/ToolsPage";
import GSTCalculatorPage from "./pages/Freetoolspage/GSTCalculator/GSTCalculatorPage";
import GSTDiscountCalculatorPage from "./pages/Freetoolspage/GSTDiscountCalculator/GSTDiscountCalculatorPage";
import GSTInvoiceGeneratorPage from "./pages/Freetoolspage/GSTInvoiceGenerator/GSTInvoiceGeneratorPage";
import Services from "./pages/ServicesPage";
import About from "./pages/AboutPage";
import Contact from "./pages/ContactPage";


function isLoggedIn() {
  return (
    localStorage.getItem("noorado_logged_in") === "true" &&
    localStorage.getItem("noorado_user") !== null
  );
}

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isLoggedIn()) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}

function PublicRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isLoggedIn()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      {/* Public pages */}

      <Route path="/" element={<Home />} />

      <Route path="/services" element={<Services />} />

      <Route path="/portfolio" element={<PortfolioPage />} />

      <Route path="/about" element={<About />} />

      <Route path="/contact" element={<Contact />} />

      {/* Public tools */}

      <Route path="/tools" element={<ToolsPage />} />

      <Route
        path="/tools/gst-calculator"
        element={<GSTCalculatorPage />}
      />

      <Route
        path="/tools/gst-discount-calculator"
        element={<GSTDiscountCalculatorPage />}
      />

      <Route
        path="/tools/gst-invoice-generator"
        element={<GSTInvoiceGeneratorPage />}
      />

      {/* Portfolio pages */}

      <Route
        path="/portfolio/corporate-website"
        element={<CorporateWebsitePage />}
      />

      <Route
        path="/portfolio/excel-automation"
        element={<ExcelAutomationPage />}
      />

      <Route
        path="/portfolio/inventory-management"
        element={<InventoryManagementPage />}
      />

      <Route
        path="/portfolio/business-tools"
        element={<BusinessToolsPage />}
      />

      {/* Authentication pages */}

      <Route
        path="/signin"
        element={
          <PublicRoute>
            <SignInPage />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUpPage />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />

      {/* Protected Dashboard */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;