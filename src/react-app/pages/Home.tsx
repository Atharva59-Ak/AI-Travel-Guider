import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Train, Map, Sparkles, ChevronRight, CheckSquare } from "lucide-react";
import Header from "@/react-app/components/Header";
import CitySearchForm from "@/react-app/components/CitySearchForm";
import { useEffect, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useRevealOnScroll } from "@/react-app/utils/scrollAnimations";

export default function Home() {
  const navigate = useNavigate();
  const featuresRef = useRevealOnScroll(0.1);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  const features = [
    {
      icon: Train,
      title: "Multi-Mode Travel",
      description: "Compare trains, buses, and car routes with real-time pricing",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Planning",
      description: "Get personalized itineraries powered by advanced AI",
    },
    {
      icon: CheckSquare,
      title: "AI Travel Checklist",
      description: "Generate personalized packing lists for your trips",
    },
    {
      icon: Map,
      title: "Interactive Maps",
      description: "Visualize your journey with detailed route mapping",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen relative overflow-hidden"
      ref={heroRef}
    >
      {/* Background Video */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src="/bg-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
      <Header />
      
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="container mx-auto px-4 pt-20 pb-16 relative"
      >
        <div className="max-w-4xl mx-auto text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, type: "spring", stiffness: 120 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full mb-8 backdrop-blur-sm border border-white drop-shadow-md"
          >
            <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span className="text-sm font-medium text-indigo-900">
              AI-Powered Travel Planning
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight drop-shadow-[0_8px_8px_rgba(0,0,0,0.8)]"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="block mb-2"
              style={{ textShadow: "0 4px 12px rgba(0,0,0,0.45)" }}
            >
              Plan Your Perfect
            </motion.span>
            <motion.span
              className="block bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.7, type: "spring", stiffness: 150 }}
              style={{ filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.45))" }}
            >
              Indian Journey
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.7 }}
            className="text-xl md:text-2xl font-bold text-white mb-12 max-w-2xl mx-auto drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,1)" }}
          >
            Compare trains, buses, and car routes across India. Get AI-generated
            itineraries, live availability, and budget-friendly travel options.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.7 }}
            className="max-w-3xl mx-auto bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_20px_40px_rgba(0,0,0,0.2)] p-4 md:p-6 rounded-3xl"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <CitySearchForm />
          </motion.div>
        </div>
        
        {/* Floating elements for depth */}
        <motion.div 
          className="absolute top-10 left-10 w-20 h-20 rounded-full bg-indigo-500 opacity-20 blur-xl"
          animate={{ 
            y: [0, -20, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-purple-500 opacity-20 blur-xl"
          animate={{ 
            y: [0, -30, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-blue-500 opacity-20 blur-xl"
          animate={{ 
            y: [0, -25, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 3.5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </motion.section>

      {/* Features Section */}
      <motion.section
        ref={featuresRef}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="container mx-auto px-4 py-16 relative z-10"
        data-aos="fade-up"
      >
        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 shadow-sm border border-white/50 hover:bg-white/95 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-emerald-100 rounded-xl flex items-center justify-center mb-6 shadow-inner">
                <feature.icon className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-700">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* AI Travel Planner & Checklist Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="container mx-auto px-4 py-16 bg-white/50 rounded-3xl m-4 backdrop-blur-xl border border-white/50 shadow-xl relative z-10"
        data-aos="fade-up"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* AI Travel Planner Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-lg border border-emerald-200/50 hover:bg-white/95 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-inner">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">
                  Advanced AI Planner
                </h2>
              </div>
              
              <p className="text-lg text-slate-800 mb-8 font-medium">
                Generate personalized day-by-day itineraries with attractions, restaurants, and travel tips using advanced AI technology.
              </p>
              
              <motion.button
                onClick={() => navigate('/ai-planner')}
                className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles className="w-5 h-5" />
                Generate Travel Plan
              </motion.button>
            </motion.div>

            {/* AI Travel Checklist Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-lg border border-indigo-200/50 hover:bg-white/95 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-xl shadow-inner">
                  <CheckSquare className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">
                  AI Travel Checklist
                </h2>
              </div>
              
              <p className="text-lg text-slate-800 mb-8 font-medium">
                Generate personalized packing lists based on your destination, season, and travel type. Download and track your essentials.
              </p>
              
              <motion.button
                onClick={() => navigate('/checklist')}
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-xl shadow-lg hover:from-indigo-600 hover:to-violet-600 transition-all duration-300 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                <CheckSquare className="w-5 h-5" />
                Generate AI Checklist
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Quick Links Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="container mx-auto px-4 py-16 bg-white/60 rounded-3xl m-4 mb-8 backdrop-blur-xl border border-white/60 shadow-xl relative z-10"
        data-aos="fade-up"
      >
        <motion.h2 
          className="text-4xl font-extrabold text-slate-900 text-center mb-12 drop-shadow-sm"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Popular Routes
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { from: "Mumbai", to: "Pune", isCity: false },
            { from: "Delhi", to: "Jaipur", isCity: false },
            { from: "", to: "Mumbai", isCity: true },
            { from: "", to: "Delhi", isCity: true },
            { from: "Bengaluru", to: "Chennai", isCity: false },
            { from: "", to: "Jaipur", isCity: true },
          ].map((route, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                route.isCity
                  ? navigate(`/city?name=${route.to}`)
                  : navigate(`/search?from=${route.from}&to=${route.to}`)
              }
              className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/50 hover:bg-white/95 hover:shadow-[0_15px_30px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <motion.div 
                    className="font-bold text-lg text-slate-900 mb-1"
                    whileHover={{ x: 5 }}
                  >
                    {route.isCity ? `Explore ${route.to}` : `${route.from} → ${route.to}`}
                  </motion.div>
                  <div className="text-sm font-medium text-slate-700">
                    {route.isCity ? "Attractions & more" : "View routes & prices"}
                  </div>
                </div>
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <ChevronRight className="w-6 h-6 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                </motion.div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Statistics Section */}
      <section 
        className="py-12 bg-pink-500 text-white rounded-3xl mx-4 mb-4 shadow-xl relative z-10"
        data-aos="fade-up"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-black mb-2 drop-shadow-md" data-aos="zoom-in">316+</div>
              <div className="text-lg md:text-xl font-bold opacity-90">Destinations</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black mb-2 drop-shadow-md" data-aos="zoom-in" data-aos-delay="100">50+</div>
              <div className="text-lg md:text-xl font-bold opacity-90">Cities</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black mb-2 drop-shadow-md" data-aos="zoom-in" data-aos-delay="200">10K+</div>
              <div className="text-lg md:text-xl font-bold opacity-90">Travelers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black mb-2 drop-shadow-md" data-aos="zoom-in" data-aos-delay="300">98%</div>
              <div className="text-lg md:text-xl font-bold opacity-90">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white/60 backdrop-blur-xl rounded-3xl mx-4 mb-4 border border-white/50 shadow-xl relative z-10" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center text-slate-900 mb-12 drop-shadow-sm">What Travelers Say</h2>
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-10 shadow-lg border border-white hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-200 to-emerald-200 rounded-full flex items-center justify-center mr-4 shadow-inner">
                  <span className="text-2xl font-black text-indigo-700">JD</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">John Doe</h3>
                  <p className="text-slate-700 font-medium tracking-wide text-sm uppercase mt-1">Frequent Traveler</p>
                </div>
              </div>
              <p className="text-xl text-slate-800 italic mb-8 font-medium leading-relaxed">
                "This app completely transformed my travel planning experience. The AI recommendations are spot-on and saved me countless hours of research."
              </p>
              <div className="flex text-amber-400 gap-1">
                {'★'.repeat(5)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-white/70 backdrop-blur-xl rounded-3xl mx-4 mb-4 border border-white/50 shadow-2xl relative z-10" data-aos="fade-up">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 drop-shadow-sm">Ready for Your Next Adventure?</h2>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-slate-800 font-medium">Join thousands of travelers who use our AI-powered platform to discover amazing destinations.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <motion.button 
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold rounded-xl shadow-[0_10px_20px_rgba(79,70,229,0.3)] hover:from-indigo-700 hover:to-indigo-600 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/cities')}
            >
              Explore Destinations
            </motion.button>
            <motion.button 
              className="px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-indigo-200 text-indigo-700 font-bold rounded-xl hover:bg-white hover:border-indigo-300 hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Create Itinerary
            </motion.button>
          </div>
        </div>
      </section>
    </div>
    </motion.div>
  );
}
