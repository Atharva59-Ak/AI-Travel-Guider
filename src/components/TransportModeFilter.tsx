import { motion } from 'framer-motion';
import { Train, Bus, Car, Plane, Filter } from 'lucide-react';

type TransportMode = 'all' | 'train' | 'bus' | 'airplane' | 'car';

interface TransportModeFilterProps {
  selectedMode: TransportMode;
  onModeChange: (mode: TransportMode) => void;
  availableModes: {
    train: boolean;
    bus: boolean;
    airplane: boolean;
    car: boolean;
  };
}

export default function TransportModeFilter({ 
  selectedMode, 
  onModeChange,
  availableModes 
}: TransportModeFilterProps) {
  const modes: Array<{
    id: TransportMode;
    label: string;
    icon: any;
    color: string;
    activeColor: string;
  }> = [
    { 
      id: 'all', 
      label: 'All', 
      icon: Filter,
      color: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
      activeColor: 'bg-slate-800 text-white'
    },
    { 
      id: 'train', 
      label: 'Trains', 
      icon: Train,
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
      activeColor: 'bg-blue-600 text-white'
    },
    { 
      id: 'bus', 
      label: 'Buses', 
      icon: Bus,
      color: 'bg-green-50 text-green-600 hover:bg-green-100',
      activeColor: 'bg-green-600 text-white'
    },
    { 
      id: 'airplane', 
      label: 'Flights', 
      icon: Plane,
      color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
      activeColor: 'bg-indigo-600 text-white'
    },
    { 
      id: 'car', 
      label: 'Car', 
      icon: Car,
      color: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
      activeColor: 'bg-orange-600 text-white'
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-5 h-5 text-slate-600" />
        <h3 className="font-semibold text-slate-900">Filter by Transport Mode</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = selectedMode === mode.id;
          
          return (
            <motion.button
              key={mode.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onModeChange(mode.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                isActive
                  ? mode.activeColor
                  : mode.color
              } focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:brightness-100`}
            >
              <Icon className="w-4 h-4" />
              <span>{mode.label}</span>
              {mode.id !== 'all' && !availableModes[mode.id as keyof typeof availableModes] && (
                <span className="text-xs opacity-60">(Not Available)</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
