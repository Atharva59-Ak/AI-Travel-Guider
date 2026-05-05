import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, Car, Utensils, Building, MapPin, Star, Wallet, Users } from 'lucide-react';
import { calculateTripCost, formatCurrency, TripCostEstimate } from '@/react-app/utils/costEstimator';
import { cardHover } from '@/react-app/utils/animations';

interface TripCostEstimatorProps {
  cityName: string;
  days: number;
  budget: 'low' | 'medium' | 'luxury';
}

const budgetColors = {
  low: 'text-green-600 bg-green-50 border-green-200',
  medium: 'text-blue-600 bg-blue-50 border-blue-200',
  luxury: 'text-purple-600 bg-purple-50 border-purple-200'
};

const budgetIcons = {
  low: '💰',
  medium: '💸',
  luxury: '💎'
};

export default function TripCostEstimator({ cityName, days, budget }: TripCostEstimatorProps) {
  const [costEstimate, setCostEstimate] = useState<TripCostEstimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('TripCostEstimator - cityName:', cityName, '| days:', days, '| budget:', budget);
    console.log('TripCostEstimator - Types:', { 
      cityNameExists: cityName !== undefined && cityName !== null, 
      daysValue: days, 
      budgetValue: budget,
      cityNameType: typeof cityName, 
      daysType: typeof days, 
      budgetType: typeof budget 
    });
    
    // Validate inputs before calculating
    if (!cityName || !days || days <= 0 || !budget) {
      console.warn('Invalid parameters for trip cost calculation:', { 
        cityName: cityName ?? 'UNDEFINED', 
        days: days ?? 'UNDEFINED', 
        budget: budget ?? 'UNDEFINED' 
      });
      setError('Invalid city or trip parameters');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    // Simulate a small delay for better UX
    const timer = setTimeout(() => {
      try {
        console.log('Calculating trip cost for:', { cityName, days, budget });
        const estimate = calculateTripCost(cityName, days, budget);
        console.log('Trip cost calculated successfully:', estimate);
        setCostEstimate(estimate);
        setLoading(false);
      } catch (err) {
        console.error('Error calculating trip cost:', err);
        setError('Unable to calculate cost');
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [cityName, days, budget]);

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden p-6"
      >
        <div className="flex items-center gap-2 text-red-600">
          <Wallet className="w-5 h-5" />
          <p className="font-medium">{error}</p>
        </div>
      </motion.div>
    );
  }

  if (loading || !costEstimate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-600" />
              Estimated Trip Cost
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
            </div>
          </div>
          
          {/* Loading skeleton for cost breakdown */}
          <div className="space-y-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse" />
                  <div>
                    <div className="w-24 h-4 bg-slate-200 rounded mb-1 animate-pulse" />
                    <div className="w-16 h-3 bg-slate-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="w-16 h-5 bg-slate-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
          
          {/* Loading skeleton for totals */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex justify-between">
              <div className="w-24 h-4 bg-slate-200 rounded animate-pulse" />
              <div className="w-20 h-5 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="flex justify-between">
              <div className="w-32 h-4 bg-slate-200 rounded animate-pulse" />
              <div className="w-24 h-6 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

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
            <Wallet className="w-5 h-5 text-indigo-600" />
            Estimated Trip Cost
          </h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${budgetColors[budget]}`}>
            <span className="mr-1">{budgetIcons[budget]}</span>
            {budget.charAt(0).toUpperCase() + budget.slice(1)} Budget
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Car className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-slate-900">Transport</div>
                <div className="text-xs text-slate-500">Per day</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-slate-900">{formatCurrency(costEstimate.transport)}</div>
              <div className="text-xs text-slate-500">for {days} days</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Utensils className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <div className="font-medium text-slate-900">Food</div>
                <div className="text-xs text-slate-500">Per day</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-slate-900">{formatCurrency(costEstimate.food)}</div>
              <div className="text-xs text-slate-500">for {days} days</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Building className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="font-medium text-slate-900">Accommodation</div>
                <div className="text-xs text-slate-500">Per day</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-slate-900">{formatCurrency(costEstimate.accommodation)}</div>
              <div className="text-xs text-slate-500">for {days} days</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <MapPin className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <div className="font-medium text-slate-900">Activities</div>
                <div className="text-xs text-slate-500">Per day</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-slate-900">{formatCurrency(costEstimate.activities)}</div>
              <div className="text-xs text-slate-500">for {days} days</div>
            </div>
          </div>
        </div>

        {/* Total Costs */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-600">Daily Total</span>
            <span className="font-semibold text-slate-900">{formatCurrency(costEstimate.dailyTotal)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold">
            <div className="flex items-center gap-2">
              <span>Total for {days} days</span>
              <div className="flex items-center gap-1 text-xs font-normal text-slate-500">
                <Users className="w-3 h-3" />
                <span>₹{Math.round(costEstimate.tripTotal / days).toLocaleString('en-IN')}/day</span>
              </div>
            </div>
            <span className="text-indigo-600">{formatCurrency(costEstimate.tripTotal)}</span>
          </div>
        </div>

        {/* Budget Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-2">
            <Star className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Budget Tip</h4>
              <p className="text-sm text-blue-700">
                {budget === 'low' 
                  ? 'Look for local transport, street food, and budget accommodations to stay within budget.'
                  : budget === 'medium'
                  ? 'Balance between comfort and cost - mid-range hotels, local experiences, and mixed transport.'
                  : 'Indulge in premium experiences, luxury hotels, and convenient transport options for the best comfort.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}