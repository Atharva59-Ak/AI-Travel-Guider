import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { MapPin, LayoutDashboard, CircleUserRound } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <motion.button
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 font-bold text-xl text-slate-900"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span>AI-Powered City Guider</span>
          </motion.button>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-teal-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <CircleUserRound className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
