import "./App.css";
import { lazy, Suspense, useEffect } from "react";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/HomePage";
import PortfolioPage from "./pages/PortfolioPage";

// Lazy-loaded pages
const Services = lazy(() => import("./pages/ServicesPage"));
const About = lazy(() => import("./pages/AboutPage"));
const Contact = lazy(() => import("./pages/ContactPage"));

const ToolsPage = lazy(
  () => import("./pages/Freetoolspage/ToolsPage")
);

const GSTCalculatorPage = lazy(
  () =>
    import(
      "./pages/Freetoolspage/GSTCalculator/GSTCalculatorPage"
    )
);

const GSTInvoiceGeneratorPage = lazy(
  () =>
    import(
      "./pages/Freetoolspage/GSTInvoiceGenerator/GSTInvoiceGeneratorPage"
    )
);

const EMICalculatorPage = lazy(
  () => import("./pages/Freetoolspage/EMICalculator/EMICalculatorPage")
);

const PDFToExcelPage = lazy(
  () => import("./pages/Freetoolspage/PDFToExcel/PDFToExcelPage")
);

const PercentageCalculatorPage = lazy(
  () =>
    import(
      "./pages/Freetoolspage/PercentageCalculator/PercentageCalculatorPage"
    )
);

const AgeCalculatorPage = lazy(
  () => import("./pages/Freetoolspage/AgeCalculator/AgeCalculatorPage")
);

const ProfitLossCalculatorPage = lazy(
  () =>
    import(
      "./pages/Freetoolspage/ProfitLossCalculator/ProfitLossCalculatorPage"
    )
);

const CorporateWebsitePage = lazy(
  () => import("./pages/portfolio/CorporateWebsitePage")
);

const ExcelAutomationPage = lazy(
  () => import("./pages/portfolio/ExcelAutomationPage")
);

const InventoryManagementPage = lazy(
  () => import("./pages/portfolio/InventoryManagementPage")
);

const BusinessToolsPage = lazy(
  () => import("./pages/portfolio/BusinessToolsPage")
);

const SignInPage = lazy(
  () => import("./pages/auth/SignInPage/SignInPage")
);

const SignUpPage = lazy(
  () => import("./pages/auth/SignUpPage/SignUpPage")
);

const ForgotPasswordPage = lazy(
  () => import("./pages/auth/ForgotPasswordPage/ForgotPasswordPage")
);

const DashboardPage = lazy(
  () => import("./pages/Dashboard/DashboardPage/DashboardPage")
);

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

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Suspense
      fallback={
        <div className="page-loading">
          Loading...
        </div>
      }
    >
      <ScrollToTop />

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
          path="/tools/gst-discount-calculator"
          element={<GSTCalculatorPage />}
        />

        <Route
          path="/tools/gst-invoice-generator"
          element={<GSTInvoiceGeneratorPage />}
        />

        <Route
          path="/tools/emi-calculator"
          element={<EMICalculatorPage />}
        />

        <Route
          path="/tools/pdf-to-excel"
          element={<PDFToExcelPage />}
        />

        <Route
          path="/tools/percentage-calculator"
          element={<PercentageCalculatorPage />}
        />

        <Route
          path="/tools/age-calculator"
          element={<AgeCalculatorPage />}
        />

        <Route
          path="/tools/profit-loss-calculator"
          element={<ProfitLossCalculatorPage />}
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
    </Suspense>
  );
}

export default App;
