import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Save, Download, RotateCcw, Star, Calendar, Sun, Mountain, Umbrella, Briefcase, Users, MapPin, Sparkles } from 'lucide-react';
import { generateChecklist, ChecklistData, ChecklistParams, saveChecklist, loadChecklist, getSavedChecklistNames, deleteChecklist } from '@/react-app/utils/checklistGenerator';
import { cardHover } from '@/react-app/utils/animations';

interface ChecklistGeneratorProps {
  city: string;
}

export default function ChecklistGenerator({ city }: ChecklistGeneratorProps) {
  const [days, setDays] = useState<number>(3);
  const [season, setSeason] = useState<'spring' | 'summer' | 'monsoon' | 'autumn' | 'winter'>('summer');
  const [travelType, setTravelType] = useState<'solo' | 'couple' | 'family' | 'business' | 'adventure'>('solo');
  const [checklist, setChecklist] = useState<ChecklistData | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedName, setSavedName] = useState('');
  const [savedChecklists, setSavedChecklists] = useState<string[]>([]);
  const [showSavedList, setShowSavedList] = useState(false);

  // Initialize with default checklist
  useEffect(() => {
    generateNewChecklist();
    loadSavedChecklistNames();
  }, [city]);

  const generateNewChecklist = () => {
    setLoading(true);
    
    const params: ChecklistParams = {
      city,
      days,
      season,
      travelType
    };
    
    // Simulate processing time for better UX
    setTimeout(() => {
      const newChecklist = generateChecklist(params);
      setChecklist(newChecklist);
      setLoading(false);
    }, 500);
  };

  const loadSavedChecklistNames = () => {
    const names = getSavedChecklistNames();
    setSavedChecklists(names);
  };

  const handleItemToggle = (category: keyof ChecklistData, index: number) => {
    if (!checklist) return;
    
    const updatedChecklist = { ...checklist };
    const item = updatedChecklist[category][index];
    updatedChecklist[category][index] = { ...item, checked: !item.checked };
    
    setChecklist(updatedChecklist);
  };

  const saveCurrentChecklist = () => {
    if (!checklist || !savedName.trim()) return;
    
    saveChecklist(checklist, savedName);
    setSavedName('');
    loadSavedChecklistNames();
    alert('Checklist saved successfully!');
  };

  const loadSavedChecklist = (name: string) => {
    const loadedChecklist = loadChecklist(name);
    if (loadedChecklist) {
      setChecklist(loadedChecklist);
      setShowSavedList(false);
    }
  };

  const deleteSavedChecklist = (name: string) => {
    deleteChecklist(name);
    loadSavedChecklistNames();
  };

  const exportChecklist = (format: 'txt' | 'csv' = 'txt') => {
    if (!checklist) return;
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `checklist-${city}-${timestamp}`;
    
    if (format === 'csv') {
      // Export as CSV
      let csvContent = 'Category,Item,Status,Reason\n';
      
      checklist.clothing.forEach(item => {
        csvContent += `Clothing,"${item.item}",${item.checked ? 'Checked' : 'Unchecked'},"${item.reason}"\n`;
      });
      
      checklist.documents.forEach(item => {
        csvContent += `Documents,"${item.item}",${item.checked ? 'Checked' : 'Unchecked'},"${item.reason}"\n`;
      });
      
      checklist.essentials.forEach(item => {
        csvContent += `Essentials,"${item.item}",${item.checked ? 'Checked' : 'Unchecked'},"${item.reason}"\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Export as TXT
      const clothingItems = checklist.clothing.map(item => `${item.checked ? '✓' : '○'} ${item.item}`).join('\n');
      const documentItems = checklist.documents.map(item => `${item.checked ? '✓' : '○'} ${item.item}`).join('\n');
      const essentialItems = checklist.essentials.map(item => `${item.checked ? '✓' : '○'} ${item.item}`).join('\n');
      
      const checklistText = `📋 Travel Checklist for ${city}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Trip Details:
   • Duration: ${days} ${days === 1 ? 'Day' : 'Days'}
   • Season: ${season.charAt(0).toUpperCase() + season.slice(1)}
   • Travel Type: ${travelType.charAt(0).toUpperCase() + travelType.slice(1)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👕 CLOTHING & ACCESSORIES:
${clothingItems}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 DOCUMENTS:
${documentItems}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎒 ESSENTIALS:
${essentialItems}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Summary: ${checklist.clothing.filter(i => i.checked).length + 
               checklist.documents.filter(i => i.checked).length + 
               checklist.essentials.filter(i => i.checked).length} of ${
                 checklist.clothing.length + 
                 checklist.documents.length + 
                 checklist.essentials.length} items checked

Generated by AI Travel Checklist Generator
`;
      
      const blob = new Blob([checklistText], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const resetChecklist = () => {
    if (city) {
      setDays(3);
      setSeason('summer');
      setTravelType('solo');
      generateNewChecklist();
    }
  };

  // Get season icon
  const getSeasonIcon = () => {
    switch (season) {
      case 'summer': return <Sun className="w-5 h-5 text-amber-500" />;
      case 'winter': return <Mountain className="w-5 h-5 text-blue-500" />;
      case 'monsoon': return <Umbrella className="w-5 h-5 text-indigo-500" />;
      case 'spring': return <Star className="w-5 h-5 text-green-500" />;
      case 'autumn': return <MapPin className="w-5 h-5 text-orange-500" />;
      default: return <Sun className="w-5 h-5 text-amber-500" />;
    }
  };

  // Get travel type icon
  const getTravelTypeIcon = () => {
    switch (travelType) {
      case 'solo': return <Star className="w-5 h-5 text-purple-500" />;
      case 'couple': return <Users className="w-5 h-5 text-pink-500" />;
      case 'family': return <Users className="w-5 h-5 text-green-500" />;
      case 'business': return <Briefcase className="w-5 h-5 text-blue-500" />;
      case 'adventure': return <Mountain className="w-5 h-5 text-amber-500" />;
      default: return <Users className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 overflow-visible transition-all duration-500 shadow-[0_20px_40px_rgba(77,68,227,0.04),0_10px_10px_rgba(0,0,0,0.02)]"
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-emerald-400 to-indigo-500 opacity-60 rounded-t-[2.5rem]"></div>
      <div className="p-10">
        <div className="flex items-center justify-between mb-10 relative">
          <motion.h3 
            className="font-extrabold text-3xl text-slate-800 flex items-center gap-4 tracking-tight"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="p-2.5 bg-white/80 rounded-full shadow-sm border border-white"
            >
              <Check className="w-6 h-6 text-indigo-600" />
            </motion.div>
            <span>Checklist <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-500">Architect</span></span>
          </motion.h3>
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-1.5 text-[0.65rem] tracking-widest uppercase text-indigo-800 bg-indigo-100/50 backdrop-blur-md px-4 py-2 border border-indigo-200/50 rounded-full font-bold">
              <Star className="w-3.5 h-3.5 text-indigo-500" />
              <span>AI-Powered</span>
            </div>
          </motion.div>
        </div>

        {/* Configuration Panel */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 p-8 bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div>
            <label className="block text-xs uppercase tracking-widest font-bold text-indigo-800/70 mb-5 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Trip Duration
            </label>
            <div className="flex flex-wrap gap-2.5">
              {[1, 2, 3, 4, 5, 6, 7].map((day, index) => (
                <motion.button
                  key={day}
                  onClick={() => setDays(day)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                    days === day
                      ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-[0_6px_16px_rgba(79,70,229,0.3)] ring-2 ring-indigo-200 ring-offset-2 ring-offset-white/50'
                      : 'bg-white/60 backdrop-blur-sm text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-md border border-white/60'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  {day} {day === 1 ? 'Day' : 'Days'}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest font-bold text-emerald-800/70 mb-5 flex items-center gap-2">
              {getSeasonIcon()}
              Season Filter
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {(['spring', 'summer', 'monsoon', 'autumn', 'winter'] as const).map((s, index) => (
                <motion.button
                  key={s}
                  onClick={() => setSeason(s)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 rounded-full text-sm font-bold transition-all duration-300 ${
                    season === s
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-[0_6px_16px_rgba(16,185,129,0.3)] ring-2 ring-emerald-200 ring-offset-2 ring-offset-white/50'
                      : 'bg-white/60 backdrop-blur-sm text-slate-600 hover:bg-white hover:text-emerald-600 hover:shadow-md border border-white/60'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest font-bold text-violet-800/70 mb-5 flex items-center gap-2">
              {getTravelTypeIcon()}
              Adventure Profile
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {(['solo', 'couple', 'family', 'business', 'adventure'] as const).map((type, index) => (
                <motion.button
                  key={type}
                  onClick={() => setTravelType(type)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 rounded-full text-sm font-bold transition-all duration-300 ${
                    travelType === type
                      ? 'bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white shadow-[0_6px_16px_rgba(139,92,246,0.3)] ring-2 ring-violet-200 ring-offset-2 ring-offset-white/50'
                      : 'bg-white/60 backdrop-blur-sm text-slate-600 hover:bg-white hover:text-violet-600 hover:shadow-md border border-white/60'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Action Buttons Hub */}
        <motion.div 
          className="flex flex-wrap gap-4 mb-10 items-center bg-white/30 backdrop-blur-lg p-3 rounded-full border border-white/40 shadow-[inset_0_2px_10px_rgba(255,255,255,0.7)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={generateNewChecklist}
            disabled={loading}
            className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 bg-[length:200%_auto] text-white rounded-full font-extrabold disabled:opacity-50 transition-all flex items-center gap-3 shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_12px_25px_rgba(16,185,129,0.3)] hover:bg-[100%_auto]"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Checklist</span>
              </>
            )}
          </motion.button>

          <div className="flex gap-2.5 items-center mr-auto">
            <input
              type="text"
              value={savedName}
              onChange={(e) => setSavedName(e.target.value)}
              placeholder="Name your list..."
              className="w-40 px-5 py-3.5 bg-white/70 backdrop-blur-sm border border-white rounded-full focus:ring-2 focus:ring-indigo-300 focus:border-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-shadow"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={saveCurrentChecklist}
              disabled={!checklist || !savedName.trim()}
              className="p-3.5 bg-white/60 backdrop-blur-md text-slate-700 rounded-full font-semibold disabled:opacity-40 transition-colors flex items-center justify-center border border-white hover:bg-white hover:text-indigo-600 hover:shadow-md"
            >
              <Save className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="flex gap-2 sm:gap-3 ml-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSavedList(!showSavedList)}
              className="px-5 py-3 bg-white/60 backdrop-blur-md text-slate-700 rounded-full font-semibold transition-colors flex items-center gap-2 border border-white hover:bg-white hover:shadow-md"
            >
              <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full text-xs">{savedChecklists.length}</span>
              <span className="hidden sm:inline">Saved</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => exportChecklist('txt')}
              disabled={!checklist}
              className="px-5 py-3 bg-white/60 backdrop-blur-md text-slate-700 rounded-full font-semibold disabled:opacity-40 transition-colors flex items-center gap-2 border border-white hover:bg-white hover:text-indigo-600 hover:shadow-md"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">TXT</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetChecklist}
              className="p-3.5 bg-white/60 backdrop-blur-md text-red-500 rounded-full font-semibold transition-colors flex items-center justify-center border border-white hover:bg-white hover:text-red-600 hover:shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* Saved Checklists Dropdown */}
        <AnimatePresence>
          {showSavedList && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200"
            >
              <h4 className="font-medium text-slate-900 mb-3">Saved Checklists</h4>
              {savedChecklists.length === 0 ? (
                <p className="text-slate-600 text-sm">No saved checklists yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {savedChecklists.map((name) => (
                    <div key={name} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-700">{name}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadSavedChecklist(name)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteSavedChecklist(name)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Checklist Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-lg animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-1/4 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-slate-200 rounded" />
                      <div className="h-4 bg-slate-200 rounded flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : checklist ? (
          <div className="space-y-6">
            {/* Clothing Section */}
            <motion.div 
              className="relative bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="relative bg-white/50 px-8 py-5 border-b border-white/40 flex items-center justify-between">
                <h4 className="font-extrabold text-2xl text-slate-800 flex items-center gap-3 tracking-tight">
                  <div className="p-2.5 bg-indigo-100 rounded-full text-indigo-600">
                    <Sun className="w-5 h-5" />
                  </div>
                  Clothing & Accessories
                </h4>
              </div>
              <div className="relative p-6 space-y-3">
                {checklist.clothing.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.05 }}
                    className={`relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 border ${
                      item.checked 
                        ? 'bg-emerald-50/50 backdrop-blur-sm border-emerald-200/50' 
                        : 'bg-white/60 backdrop-blur-md border-white/60 hover:bg-white hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    <button
                      onClick={() => handleItemToggle('clothing', index)}
                      className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                        item.checked
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 border-emerald-500 text-white shadow-sm'
                          : 'border-slate-300 hover:border-indigo-400 bg-white/50'
                      }`}
                    >
                      {item.checked && <Check className="w-5 h-5" />}
                    </button>
                    <div className="flex-1">
                      <span className={`text-lg font-medium ${item.checked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {item.item}
                      </span>
                      {!item.recommended && (
                        <span className="ml-3 text-xs tracking-wider px-3 py-1 bg-amber-100/80 text-amber-800 rounded-full font-bold uppercase">
                          Optional
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-slate-500 italic">{item.reason}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Documents Section */}
            <motion.div 
              className="relative bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="relative bg-white/50 px-8 py-5 border-b border-white/40 flex items-center justify-between">
                <h4 className="font-extrabold text-2xl text-slate-800 flex items-center gap-3 tracking-tight">
                  <div className="p-2.5 bg-emerald-100 rounded-full text-emerald-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  Documents
                </h4>
              </div>
              <div className="relative p-6 space-y-3">
                {checklist.documents.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 + index * 0.05 }}
                    className={`relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 border ${
                      item.checked 
                        ? 'bg-emerald-50/50 backdrop-blur-sm border-emerald-200/50' 
                        : 'bg-white/60 backdrop-blur-md border-white/60 hover:bg-white hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    <button
                      onClick={() => handleItemToggle('documents', index)}
                      className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                        item.checked
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 border-emerald-500 text-white shadow-sm'
                          : 'border-slate-300 hover:border-emerald-400 bg-white/50'
                      }`}
                    >
                      {item.checked && <Check className="w-5 h-5" />}
                    </button>
                    <div className="flex-1">
                      <span className={`text-lg font-medium ${item.checked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {item.item}
                      </span>
                      {!item.recommended && (
                        <span className="ml-3 text-xs tracking-wider px-3 py-1 bg-amber-100/80 text-amber-800 rounded-full font-bold uppercase">
                          Optional
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-slate-500 italic">{item.reason}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Essentials Section */}
            <motion.div 
              className="relative bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <div className="relative bg-white/50 px-8 py-5 border-b border-white/40 flex items-center justify-between">
                <h4 className="font-extrabold text-2xl text-slate-800 flex items-center gap-3 tracking-tight">
                  <div className="p-2.5 bg-violet-100 rounded-full text-violet-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  Essentials
                </h4>
              </div>
              <div className="relative p-6 space-y-3">
                {checklist.essentials.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + index * 0.05 }}
                    className={`relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 border ${
                      item.checked 
                        ? 'bg-emerald-50/50 backdrop-blur-sm border-emerald-200/50' 
                        : 'bg-white/60 backdrop-blur-md border-white/60 hover:bg-white hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    <button
                      onClick={() => handleItemToggle('essentials', index)}
                      className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                        item.checked
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 border-emerald-500 text-white shadow-sm'
                          : 'border-slate-300 hover:border-violet-400 bg-white/50'
                      }`}
                    >
                      {item.checked && <Check className="w-5 h-5" />}
                    </button>
                    <div className="flex-1">
                      <span className={`text-lg font-medium ${item.checked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {item.item}
                      </span>
                      {!item.recommended && (
                        <span className="ml-3 text-xs tracking-wider px-3 py-1 bg-amber-100/80 text-amber-800 rounded-full font-bold uppercase">
                          Optional
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-slate-500 italic">{item.reason}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

        ) : (
          <div className="text-center py-12 text-slate-500">
            <Check className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p>Generate a checklist to get started</p>
          </div>
        )}

        {/* Summary */}
        {checklist && (
          <motion.div 
            className="mt-8 relative p-6 bg-gradient-to-r from-neutral-800 to-neutral-900 rounded-2xl border border-neutral-700 text-white depth-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <div className="flex justify-between items-center relative z-10">
              <div>
                <h4 className="font-bold text-xl mb-1">Trip Summary</h4>
                <p className="text-neutral-300">
                  {city} • {days} {days === 1 ? 'Day' : 'Days'} • {season.charAt(0).toUpperCase() + season.slice(1)} • {travelType.charAt(0).toUpperCase() + travelType.slice(1)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-primary-300">
                  {checklist.clothing.filter(i => i.checked).length + 
                   checklist.documents.filter(i => i.checked).length + 
                   checklist.essentials.filter(i => i.checked).length} of {
                     checklist.clothing.length + 
                     checklist.documents.length + 
                     checklist.essentials.length} items checked
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/10 to-transparent -z-10"></div>
          </motion.div>
        )}
      </div>
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary-500/10 rounded-full floating-element"></div>
      <div className="absolute -top-6 -left-6 w-16 h-16 bg-secondary-500/10 rounded-full floating-element" style={{ animationDelay: '1s' }}></div>
    </motion.div>
  );
}