import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ChevronDown, ChevronUp, Calendar, Wallet, Users, MapPin, Mountain, History, Utensils, MountainSnow, Wine, ShoppingBag, Heart as HeartIcon, HeartOff } from "lucide-react";
import { cardHover } from "@/react-app/utils/animations";
import TripCostEstimator from "@/react-app/components/TripCostEstimator";

interface ItineraryDay {
  day: number;
  morning: {
    place: string;
    description: string;
  };
  afternoon: {
    place: string;
    travelTime: string;
  };
  evening: {
    place: string;
    activity: string;
  };
  estimatedCost: number;
}

interface PersonalizedItinerary {
  days: ItineraryDay[];
  totalCost: number;
  summary: string;
}

interface AIItineraryProps {
  city?: string;
  to?: string;
}

export default function AIItinerary({ city, to }: AIItineraryProps) {
  const destinationCity = city || to || "";
  // Form state
  const [days, setDays] = useState<number>(3);
  const [budget, setBudget] = useState<'low' | 'medium' | 'luxury'>('medium');
  const [travelStyle, setTravelStyle] = useState<'solo' | 'couple' | 'family' | 'friends'>('solo');
  const [interests, setInterests] = useState<{
    nature: boolean;
    history: boolean;
    food: boolean;
    adventure: boolean;
    nightlife: boolean;
    shopping: boolean;
  }>({
    nature: false,
    history: false,
    food: false,
    adventure: false,
    nightlife: false,
    shopping: false,
  });
  
  // Results state
  const [itinerary, setItinerary] = useState<PersonalizedItinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleInterest = (interest: keyof typeof interests) => {
    setInterests(prev => ({
      ...prev,
      [interest]: !prev[interest]
    }));
  };

  const generateItinerary = async () => {
    if (!destinationCity.trim()) {
      setError("Destination city is required");
      return;
    }
    if (Object.values(interests).every(value => !value)) {
      setError('Please select at least one interest');
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      // Prepare request data
      const requestData = {
        city: destinationCity,
        days,
        budget,
        travelStyle,
        interests: Object.entries(interests)
          .filter(([_, isSelected]) => isSelected)
          .map(([interest]) => interest),
      };
      
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to generate itinerary');
      }
      
      const data: any = await res.json();

      const parsedItinerary = data?.plan
        ? parseBackendPlan(data.plan)
        : parseAIResponse(String(data?.itinerary || ""));
      
      setItinerary(parsedItinerary);
      setExpanded(true);
    } catch (error) {
      console.error("Error generating itinerary:", error);
      setError(error instanceof Error ? error.message : 'Failed to generate itinerary');
    } finally {
      setLoading(false);
    }
  };
  
  const parseBackendPlan = (plan: any): PersonalizedItinerary => {
    const fallbackEstimatedCost = budget === 'low' ? 1000 : budget === 'medium' ? 2500 : 5000;
    const rawDays: any[] = Array.isArray(plan?.itinerary)
      ? plan.itinerary
      : Array.isArray(plan?.days)
        ? plan.days
        : [];

    const daysArray: ItineraryDay[] = rawDays.map((entry, index) => {
      const activities: string[] = Array.isArray(entry?.activities) ? entry.activities : [];

      const morningPlace = entry?.morning?.place || activities[0] || '';
      const afternoonPlace = entry?.afternoon?.place || activities[1] || '';
      const eveningPlace = entry?.evening?.place || activities[2] || '';

      return {
        day: Number(entry?.day ?? index + 1),
        morning: {
          place: String(morningPlace),
          description: String(entry?.morning?.description || ''),
        },
        afternoon: {
          place: String(afternoonPlace),
          travelTime: String(entry?.afternoon?.travelTime || ''),
        },
        evening: {
          place: String(eveningPlace),
          activity: String(entry?.evening?.activity || ''),
        },
        estimatedCost: Number(entry?.estimatedCost ?? fallbackEstimatedCost),
      };
    });

    const computedTotal = daysArray.reduce((sum, day) => sum + (Number.isFinite(day.estimatedCost) ? day.estimatedCost : 0), 0);
    return {
      days: daysArray,
      totalCost: Number(plan?.totalCost ?? computedTotal),
      summary: String(plan?.summary || `Your ${days}-day itinerary for ${destinationCity}`),
    };
  };

  // Function to parse AI response into structured format
  const parseAIResponse = (response: string): PersonalizedItinerary => {
    // This function will parse the AI response into a structured itinerary
    // In a real implementation, this would use more sophisticated parsing
    // For now, we'll use a simple regex-based approach
    
    const lines = response.split('\n');
    const daysArray: ItineraryDay[] = [];
    
    let currentDay: ItineraryDay | null = null;
    
    for (const line of lines) {
      const dayMatch = line.match(/Day\s+(\d+):?/i);
      if (dayMatch) {
        // Save previous day if exists
        if (currentDay) {
          daysArray.push(currentDay);
        }
        
        // Start new day
        currentDay = {
          day: parseInt(dayMatch[1]),
          morning: { place: '', description: '' },
          afternoon: { place: '', travelTime: '' },
          evening: { place: '', activity: '' },
          estimatedCost: budget === 'low' ? 1000 : budget === 'medium' ? 2500 : 5000
        };
        
        // Try to find cost for this day
        const costMatch = line.match(/cost[:\s]*₹?(\d+(?:,\d+)*)/i) || 
                         line.match(/budget[:\s]*₹?(\d+(?:,\d+)*)/i) ||
                         line.match(/expense[:\s]*₹?(\d+(?:,\d+)*)/i);
        if (costMatch) {
          currentDay.estimatedCost = parseInt(costMatch[1].replace(/,/g, ''));
        }
      } else if (currentDay) {
        // Look for morning, afternoon, evening sections
        if (line.toLowerCase().includes('morning')) {
          const morningMatch = line.match(/Morning:\s*(.+)/i) || line.match(/:\s*(.+)/);
          if (morningMatch) {
            const [place, ...descParts] = morningMatch[1].split('. ').map(s => s.trim()).filter(s => s);
            currentDay.morning.place = place || 'Morning Activity';
            currentDay.morning.description = descParts.join('. ') || 'Enjoy the morning in the city';
          }
        } else if (line.toLowerCase().includes('afternoon')) {
          const afternoonMatch = line.match(/Afternoon:\s*(.+)/i) || line.match(/:\s*(.+)/);
          if (afternoonMatch) {
            const [place] = afternoonMatch[1].split('. ').map(s => s.trim()).filter(s => s);
            currentDay.afternoon.place = place || 'Afternoon Activity';
            
            // Try to find travel time
            const travelTimeMatch = line.match(/(\d+\s*hours?|\d+\s*minutes?|\d+\s*hr)/i);
            currentDay.afternoon.travelTime = travelTimeMatch ? travelTimeMatch[0] : '1 hour';
          }
        } else if (line.toLowerCase().includes('evening')) {
          const eveningMatch = line.match(/Evening:\s*(.+)/i) || line.match(/:\s*(.+)/);
          if (eveningMatch) {
            const [place, ...descParts] = eveningMatch[1].split('. ').map(s => s.trim()).filter(s => s);
            currentDay.evening.place = place || 'Evening Activity';
            currentDay.evening.activity = descParts.join('. ') || 'Relax and enjoy the evening';
          }
        }
      }
    }
    
    // Add the last day if it exists
    if (currentDay) {
      daysArray.push(currentDay);
    }
    
    // Fill in any missing information with defaults
    for (const day of daysArray) {
      if (!day.morning.place) day.morning.place = 'Morning Activity';
      if (!day.morning.description) day.morning.description = 'Start your day with a great experience';
      if (!day.afternoon.place) day.afternoon.place = 'Afternoon Activity';
      if (!day.afternoon.travelTime) day.afternoon.travelTime = '1 hour';
      if (!day.evening.place) day.evening.place = 'Evening Activity';
      if (!day.evening.activity) day.evening.activity = 'Enjoy the evening';
    }
    
    // If no days were parsed, create sample days
    if (daysArray.length === 0) {
      for (let i = 1; i <= days; i++) {
        daysArray.push({
          day: i,
          morning: {
            place: `Morning Place Day ${i}`,
            description: `Experience something special in ${destinationCity}`
          },
          afternoon: {
            place: `Afternoon Spot Day ${i}`,
            travelTime: '1 hour'
          },
          evening: {
            place: `Evening Venue Day ${i}`,
            activity: 'Enjoy the evening in the city'
          },
          estimatedCost: budget === 'low' ? 1000 : budget === 'medium' ? 2500 : 5000
        });
      }
    }
    
    return {
      days: daysArray,
      totalCost: daysArray.reduce((sum, day) => sum + day.estimatedCost, 0),
      summary: `Your personalized ${days}-day itinerary for ${destinationCity} based on your preferences`
    };
  };
  
  const regenerateItinerary = () => {
    setItinerary(null);
    setExpanded(false);
    generateItinerary();
  };
  
  const saveItinerary = async () => {
    if (!itinerary) return;
    
    setSaving(true);
    
    try {
      const response = await fetch('/api/saved-itineraries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itinerary_name: `${destinationCity} - ${days}-Day Itinerary`,
          city: destinationCity,
          days,
          budget,
          travel_style: travelStyle,
          interests: Object.entries(interests)
            .filter(([_, isSelected]) => isSelected)
            .map(([interest]) => interest),
          itinerary_content: JSON.stringify(itinerary, null, 2), // Save the itinerary in JSON format
        }),
      });
      
      if (response.ok) {
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving itinerary:', error);
    } finally {
      setSaving(false);
    }
  };

  // Interest icons mapping
  const interestIcons: Record<string, React.ReactNode> = {
    nature: <Mountain className="w-4 h-4" />,
    history: <History className="w-4 h-4" />,
    food: <Utensils className="w-4 h-4" />,
    adventure: <MountainSnow className="w-4 h-4" />,
    nightlife: <Wine className="w-4 h-4" />,
    shopping: <ShoppingBag className="w-4 h-4" />,
  };
  
  // Budget options
  const budgetOptions = [
    { value: 'low', label: 'Low', description: 'Under ₹1,500/day' },
    { value: 'medium', label: 'Medium', description: '₹1,500 - ₹4,000/day' },
    { value: 'luxury', label: 'Luxury', description: 'Over ₹4,000/day' },
  ];
  
  // Travel style options
  const travelStyleOptions = [
    { value: 'solo', label: 'Solo', icon: <Users className="w-4 h-4" /> },
    { value: 'couple', label: 'Couple', icon: <Users className="w-4 h-4" /> },
    { value: 'family', label: 'Family', icon: <Users className="w-4 h-4" /> },
    { value: 'friends', label: 'Friends', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover="hover"
      variants={cardHover}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300"
    >
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900">AI Personalized Itinerary</h3>
          </div>
          {itinerary && (
            <div className="flex items-center gap-2">
              <button
                onClick={saveItinerary}
                disabled={saving || isSaved}
                className={`p-1.5 rounded-lg transition-colors ${
                  isSaved 
                    ? 'text-red-500 hover:bg-red-50' 
                    : 'text-slate-400 hover:bg-slate-100'
                }`}
                title={isSaved ? 'Itinerary saved' : 'Save this itinerary'}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                ) : isSaved ? (
                  <HeartIcon className="w-4 h-4 fill-current" />
                ) : (
                  <HeartOff className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1 hover:bg-slate-50 rounded-lg transition-colors"
              >
                {expanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!itinerary ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6"
          >
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Trip Details</h4>
                
                {/* City */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Destination City
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700">{destinationCity || "Not selected"}</span>
                  </div>
                </div>
                
                {/* Days */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Number of Days
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <button
                        key={day}
                        onClick={() => setDays(day)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          days === day
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {day} {day === 1 ? 'Day' : 'Days'}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Budget */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Budget
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {budgetOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setBudget(option.value as any)}
                        className={`p-3 rounded-lg text-sm font-medium transition-colors text-left ${
                          budget === option.value
                            ? 'bg-indigo-600 text-white border border-indigo-600'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        <div>{option.label}</div>
                        <div className="text-xs opacity-80 mt-1">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Travel Style */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Travel Style
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {travelStyleOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTravelStyle(option.value as any)}
                        className={`p-3 rounded-lg text-sm font-medium transition-colors flex flex-col items-center gap-2 ${
                          travelStyle === option.value
                            ? 'bg-indigo-600 text-white border border-indigo-600'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {option.icon}
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Interests */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Interests (Select all that apply)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(interests).map(([interest, isSelected]) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest as keyof typeof interests)}
                        className={`p-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border border-indigo-600'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {interestIcons[interest]}
                        <span className="capitalize">{interest}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                {/* Trip Cost Estimator Preview */}
                <div className="mb-4">
                  <TripCostEstimator 
                    cityName={destinationCity}
                    days={days}
                    budget={budget}
                  />
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateItinerary}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating Itinerary...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                  <span>Generate Personalized Itinerary</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          expanded && (
            <motion.div
              key="content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6 max-h-[70vh] overflow-y-auto"
            >
              <div className="mb-6">
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Your {days}-Day Itinerary for {destinationCity}
                </h4>
                <p className="text-slate-600 text-sm mb-4">{itinerary.summary}</p>
                
                <div className="flex items-center gap-4 mb-6 p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">Total Budget:</span>
                    <span className="text-sm font-semibold text-indigo-600">₹{itinerary.totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">Travel Style:</span>
                    <span className="text-sm capitalize font-semibold text-indigo-600">{travelStyle}</span>
                  </div>
                </div>
                
                {/* Detailed Cost Breakdown */}
                <TripCostEstimator 
                  cityName={destinationCity}
                  days={days}
                  budget={budget}
                />
              </div>
              
              <div className="space-y-6">
                {itinerary.days.map((day, index) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-slate-200 rounded-xl overflow-hidden"
                  >
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                      <h5 className="font-semibold text-slate-900">Day {day.day}</h5>
                      <div className="text-xs text-slate-600 mt-1">Estimated cost: ₹{day.estimatedCost.toLocaleString()}</div>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-24 text-xs font-medium text-slate-500 mt-1">Morning</div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{day.morning.place}</div>
                          <div className="text-sm text-slate-600 mt-1">{day.morning.description}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-24 text-xs font-medium text-slate-500 mt-1">Afternoon</div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{day.afternoon.place}</div>
                          <div className="text-sm text-slate-600 mt-1">Travel time: {day.afternoon.travelTime}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-24 text-xs font-medium text-slate-500 mt-1">Evening</div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{day.evening.place}</div>
                          <div className="text-sm text-slate-600 mt-1">{day.evening.activity}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={regenerateItinerary}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Regenerating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Regenerate Itinerary</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </motion.div>
  );
}
