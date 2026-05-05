import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Heart, Clock, Star, TrendingUp, Target } from 'lucide-react';
import { getRecommendations, getDefaultUserProfile, UserProfile, Recommendation } from '@/react-app/utils/recommendationEngine';
import { cardHover } from '@/react-app/utils/animations';
import { City, Attraction } from '@/shared/types';

interface RecommendationEngineProps {
  cities: City[];
  attractions: Attraction[];
  userProfile?: UserProfile;
}

export default function RecommendationEngine({ cities, attractions, userProfile }: RecommendationEngineProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'cities' | 'attractions'>('all');

  // Keep profile reference stable to avoid infinite loading rerenders.
  const profile = useMemo(() => userProfile ?? getDefaultUserProfile(), [userProfile]);
  const profileKey = useMemo(
    () => JSON.stringify({
      interests: profile.interests,
      savedCities: profile.savedCities,
      travelStyle: profile.travelStyle,
    }),
    [profile]
  );

  useEffect(() => {
    setLoading(true);

    const recs = getRecommendations(cities, attractions, profile);
    setRecommendations(recs);
    setLoading(false);
  }, [cities, attractions, profile, profileKey]);

  // Filter recommendations based on active tab
  const filteredRecommendations = recommendations.filter(rec => {
    if (activeTab === 'cities') return rec.type === 'city';
    if (activeTab === 'attractions') return rec.type === 'attraction';
    return true;
  });

  // Get top 3 recommendations for featured display
  const featuredRecommendations = recommendations.slice(0, 3);

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
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Recommended for You
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <TrendingUp className="w-4 h-4" />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>

        {/* Featured Recommendations */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            Top Picks Based on Your Interests
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {featuredRecommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border ${
                  index === 0 
                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200' 
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`p-1.5 rounded ${
                    index === 0 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {rec.type === 'city' ? (
                      <MapPin className="w-4 h-4" />
                    ) : (
                      <Heart className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-medium text-slate-900 text-sm">{rec.name}</h5>
                    <p className="text-xs text-slate-600 mt-1">{rec.reason}</p>
                    {index === 0 && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                        Top Pick
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tabs for filtering */}
        <div className="flex gap-2 mb-4 p-1 bg-slate-100 rounded-lg w-fit">
          {(['all', 'cities', 'attractions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Recommendations List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                  <div>
                    <div className="w-32 h-4 bg-slate-200 rounded mb-2" />
                    <div className="w-40 h-3 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="w-16 h-6 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : filteredRecommendations.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Sparkles className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p>No recommendations available. Try adjusting your interests.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredRecommendations.map((rec, index) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                      {rec.type === 'city' ? (
                        <MapPin className="w-5 h-5" />
                      ) : (
                        <Heart className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{rec.name}</h4>
                      <p className="text-sm text-slate-600">{rec.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-current" />
                      <span className="text-sm font-medium text-slate-700">
                        {(rec.score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rec.type === 'city' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {rec.type}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* User Profile Summary */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Your Profile</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><span className="font-medium">Interests:</span> {profile.interests.join(', ')}</p>
                <p><span className="font-medium">Saved Cities:</span> {profile.savedCities.join(', ')}</p>
                {profile.travelStyle && (
                  <p><span className="font-medium">Travel Style:</span> {profile.travelStyle}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
