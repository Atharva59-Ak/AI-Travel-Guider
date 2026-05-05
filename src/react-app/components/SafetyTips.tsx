import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, AlertTriangle, Phone, HeartPulse, Gavel, Clock, MapPin, Star } from 'lucide-react';
import { getSafetyTipsForCity, SafetyTip } from '@/react-app/utils/safetyTips';
import { cardHover } from '@/react-app/utils/animations';

interface SafetyTipsProps {
  cityName: string;
}

export default function SafetyTips({ cityName }: SafetyTipsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const safetyTips = getSafetyTipsForCity(cityName);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    {
      id: 'safety',
      title: 'Safety Tips',
      icon: Shield,
      items: safetyTips.safety,
      color: 'blue'
    },
    {
      id: 'etiquette',
      title: 'Local Etiquette',
      icon: Users,
      items: safetyTips.etiquette,
      color: 'green'
    },
    {
      id: 'scams',
      title: 'Common Scams to Avoid',
      icon: AlertTriangle,
      items: safetyTips.scams,
      color: 'amber'
    },
    {
      id: 'emergency',
      title: 'Emergency Contacts',
      icon: Phone,
      items: [
        `Police: ${safetyTips.emergencyContacts.police}`,
        `Ambulance: ${safetyTips.emergencyContacts.ambulance}`,
        `Fire: ${safetyTips.emergencyContacts.fire}`,
        ...(safetyTips.emergencyContacts.touristHelpline 
          ? [`Tourist Helpline: ${safetyTips.emergencyContacts.touristHelpline}`] 
          : [])
      ],
      color: 'red'
    }
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-600',
      hover: 'hover:bg-blue-100'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-600',
      hover: 'hover:bg-green-100'
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: 'text-amber-600',
      hover: 'hover:bg-amber-100'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-600',
      hover: 'hover:bg-red-100'
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover="hover"
      variants={cardHover}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Travel Safety & Local Tips for {cityName}
          </h3>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-500 fill-current" />
            <Star className="w-4 h-4 text-amber-500 fill-current" />
            <Star className="w-4 h-4 text-amber-500 fill-current" />
          </div>
        </div>

        <div className="space-y-3">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const colors = colorClasses[section.color as keyof typeof colorClasses];
            
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between p-4 text-left ${colors.bg} ${colors.border} border ${colors.hover} transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colors.icon} bg-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`font-medium ${colors.text}`}>{section.title}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedSection === section.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg 
                      className="w-5 h-5 text-slate-500" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expandedSection === section.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-white border-t border-slate-100">
                        <ul className="space-y-3">
                          {section.items.map((item, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="flex items-start gap-3"
                            >
                              <div className={`w-1.5 h-1.5 mt-2 rounded-full ${colors.icon}`}></div>
                              <span className="text-slate-700">{item}</span>
                            </motion.li>
                          ))}
                        </ul>
                        
                        {section.id === 'safety' && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3"
                          >
                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-amber-800 mb-1">Important Safety Note</h4>
                              <p className="text-sm text-amber-700">
                                Always trust your instincts. If something feels wrong, remove yourself from the situation immediately.
                              </p>
                            </div>
                          </motion.div>
                        )}
                        
                        {section.id === 'scams' && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3"
                          >
                            <Gavel className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-red-800 mb-1">Scam Prevention</h4>
                              <p className="text-sm text-red-700">
                                When in doubt, verify credentials of anyone offering services or asking for money.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-start gap-3">
            <HeartPulse className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-slate-900 mb-1">Traveler's Health & Wellness</h4>
              <p className="text-sm text-slate-700">
                Remember to carry essential medications, stay hydrated, and have travel insurance. 
                Keep digital and physical copies of important documents in separate locations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
