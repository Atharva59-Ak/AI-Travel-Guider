import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// Lazy load heavy components
const HomePage = lazy(() => import("@/react-app/pages/Home"));
const SearchPage = lazy(() => import("@/react-app/pages/Search"));
const DashboardPage = lazy(() => import("@/react-app/pages/Dashboard"));
const ProfilePage = lazy(() => import("@/react-app/pages/Profile"));
const AuthCallbackPage = lazy(() => import("@/react-app/pages/AuthCallback"));
const CityPage = lazy(() => import("@/react-app/pages/City"));
const CitiesPage = lazy(() => import("@/react-app/pages/Cities"));
const ChecklistPage = lazy(() => import("@/react-app/pages/Checklist"));
const SmartTravelPlanner= lazy(() => import("@/components/SmartTravelPlanner"));
const TrainSearch = lazy(() => import("@/components/TrainSearch"));
const TestIRCTC = lazy(() => import("@/react-app/pages/TestIRCTC"));
const TestGeminiAPI = lazy(() => import("@/react-app/pages/TestGeminiAPI"));

// Loading component
const PageLoader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex items-center justify-center min-h-screen bg-slate-50"
  >
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
      <p className="text-slate-600">Loading your travel experience...</p>
    </div>
  </motion.div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/cities" element={<CitiesPage />} />
            <Route path="/city" element={<CityPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/checklist" element={<ChecklistPage />} />
            <Route path="/ai-planner" element={<SmartTravelPlanner />} />
            <Route path="/trains" element={<TrainSearch />} />
            <Route path="/test-irctc" element={<TestIRCTC />} />
            <Route path="/test-gemini" element={<TestGeminiAPI />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
