import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Globe,
  Award,
  Upload,
  X,
  Tag,
  Camera,
  Plane,
  Heart,
  Star,
  Users,
  Trophy,
  TrendingUp,
  Gift,
  Plus
} from "lucide-react";
import Header from "@/react-app/components/Header";
import type { SavedTrip } from "@/shared/types";

type SavedCity = { id: number; city_name: string; city_state: string; saved_at: string };
type SavedAttraction = { id: number; attraction_name: string; city_name: string; saved_at: string };
type GalleryPhoto = {
  id: string;
  url: string;
  location: string;
  likes: number;
  comments: number;
  date: string;
  description?: string;
  tags?: string[];
  heightFactor?: string; // For masonry layout visual variation
};

type Earning = { action: string; points: number; date: string };

const defaultCover =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80";
const defaultAvatar =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80";
const profileStorageKey = "cityguider_profile_settings_v1";

// Helper function to get attraction/city images
function getAttractionImage(attractionName: string, cityName: string): string {
  const imageMap: Record<string, string> = {
    "Gateway of India": "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800&h=800&fit=crop",
    "Marine Drive": "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800&h=800&fit=crop",
    "India Gate": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=800&fit=crop",
    "Hawa Mahal": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=800&fit=crop",
    "Taj Mahal": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=800&fit=crop",
    "Red Fort": "https://images.unsplash.com/photo-1597081771834-c7e77b44d654?w=800&h=800&fit=crop",
    "Qutub Minar": "https://images.unsplash.com/photo-1585234388634-5300a8c936a8?w=800&h=800&fit=crop",
    "Victoria Memorial": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=800&fit=crop",
    "Charminar": "https://images.unsplash.com/photo-1585234388634-5300a8c936a8?w=800&h=800&fit=crop",
  };
  
  if (imageMap[attractionName]) return imageMap[attractionName];
  
  const cityImages: Record<string, string> = {
    "Mumbai": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=800&fit=crop",
    "Delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=800&fit=crop",
    "Jaipur": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=800&fit=crop",
    "Agra": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=800&fit=crop",
    "Kolkata": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=800&fit=crop",
    "Hyderabad": "https://images.unsplash.com/photo-1585234388634-5300a8c936a8?w=800&h=800&fit=crop",
  };
  
  return cityImages[cityName] || "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=800&fit=crop";
}

function computeLevel(totalPoints: number) {
  return Math.max(1, Math.floor(totalPoints / 200) + 1);
}

export default function Profile() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [cities, setCities] = useState<SavedCity[]>([]);
  const [attractions, setAttractions] = useState<SavedAttraction[]>([]);
  const [loading, setLoading] = useState(true);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [recentEarnings, setRecentEarnings] = useState<Earning[]>([]);
  const [pointsFromActions, setPointsFromActions] = useState(0);
  const [profileName, setProfileName] = useState("Traveler");
  const [profileUsername, setProfileUsername] = useState("localuser");
  const [profileEmail, setProfileEmail] = useState("local.user@cityguider.app");
  const [profileLocation, setProfileLocation] = useState("India Traveler");
  const [profileBio, setProfileBio] = useState(
    "Passionate traveler documenting journeys, saving favorite places, and building personalized itineraries.",
  );
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatar);
  const [coverUrl, setCoverUrl] = useState(defaultCover);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(profileStorageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<{
        profileName: string; profileUsername: string; profileEmail: string;
        profileLocation: string; profileBio: string; avatarUrl: string; coverUrl: string;
      }>;
      if (parsed.profileName) setProfileName(parsed.profileName);
      if (parsed.profileUsername) setProfileUsername(parsed.profileUsername);
      if (parsed.profileEmail) setProfileEmail(parsed.profileEmail);
      if (parsed.profileLocation) setProfileLocation(parsed.profileLocation);
      if (parsed.profileBio) setProfileBio(parsed.profileBio);
      if (parsed.avatarUrl) setAvatarUrl(parsed.avatarUrl);
      if (parsed.coverUrl) setCoverUrl(parsed.coverUrl);
    } catch (error) {
      console.error("Failed to parse", error);
    }
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [tripsRes, citiesRes, attractionsRes] = await Promise.all([
          fetch("/api/trips"), fetch("/api/saved-cities"), fetch("/api/saved-attractions"),
        ]);

        const [tripsJson, citiesJson, attractionsJson] = await Promise.all([
          tripsRes.json(), citiesRes.json(), attractionsRes.json(),
        ]);

        const safeTrips = Array.isArray(tripsJson) ? (tripsJson as SavedTrip[]) : [];
        const safeCities = Array.isArray(citiesJson) ? (citiesJson as SavedCity[]) : [];
        const safeAttractions = Array.isArray(attractionsJson) ? (attractionsJson as SavedAttraction[]) : [];

        const now = new Date().toISOString();
        const demoTrips: SavedTrip[] = [
          { id: 90001, user_id: "local-user", name: "Mumbai to Pune", from_city: "Mumbai", to_city: "Pune", travel_mode: "train", route_details: null, estimated_cost: 450, estimated_duration: "3h 45m", created_at: now, updated_at: now },
        ];
        const demoCities: SavedCity[] = [
          { id: 91001, city_name: "Mumbai", city_state: "Maharashtra", saved_at: now },
        ];
        const demoAttractions: SavedAttraction[] = [
          { id: 92001, attraction_name: "Gateway of India", city_name: "Mumbai", saved_at: now },
          { id: 92002, attraction_name: "India Gate", city_name: "Delhi", saved_at: now },
          { id: 92003, attraction_name: "Hawa Mahal", city_name: "Jaipur", saved_at: now },
          { id: 92004, attraction_name: "Marine Drive", city_name: "Mumbai", saved_at: now },
        ];

        const tripsToUse = safeTrips.length > 0 ? safeTrips : demoTrips;
        const citiesToUse = safeCities.length > 0 ? safeCities : demoCities;
        const attractionsToUse = safeAttractions.length > 0 ? safeAttractions : demoAttractions;

        setTrips(tripsToUse);
        setCities(citiesToUse);
        setAttractions(attractionsToUse);

        const seedPhotos: GalleryPhoto[] = attractionsToUse.slice(0, 6).map((a, idx) => ({
          id: `attr-${a.id}`,
          url: getAttractionImage(a.attraction_name, a.city_name),
          location: `${a.attraction_name}, ${a.city_name}`,
          likes: 100 + (a.id % 250),
          comments: 10 + (a.id % 40),
          date: new Date(a.saved_at).toLocaleDateString(),
          description: "Saved from your city explorer list",
          tags: ["saved", "travel"],
          heightFactor: idx % 2 === 0 ? "h-96" : "h-64", 
        }));
        setPhotos(seedPhotos);
        setRecentEarnings([
          { action: "Trip completed", points: 100, date: "Today" },
          { action: "Visited city", points: 80, date: "Yesterday" },
          { action: "Attraction saved", points: 40, date: "2 days ago" },
        ]);
      } catch (error) {
        console.error("Failed to load", error);
      } finally {
        setLoading(false);
      }
    };
    void fetchProfileData();
  }, []);

  const basePoints = useMemo(() => trips.length * 100 + cities.length * 80 + attractions.length * 40 + photos.length * 50, [trips.length, cities.length, attractions.length, photos.length]);
  const totalPoints = basePoints + pointsFromActions;
  const level = computeLevel(totalPoints);
  const pointsToNextLevel = 200;
  const progressPercentage = ((totalPoints % pointsToNextLevel) / pointsToNextLevel) * 100;

  const initials = useMemo(() => {
    const base = profileName.trim() || profileEmail;
    const parts = base.split(/[._\s-]/).filter(Boolean);
    return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : base.slice(0, 2)).toUpperCase();
  }, [profileEmail, profileName]);

  const preferredMode = useMemo(() => {
    if (!trips.length) return "explorer";
    const counts = trips.reduce<Record<string, number>>((acc, t) => {
      const k = (t.travel_mode || "unknown").toLowerCase();
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "explorer";
  }, [trips]);

  const addTag = () => {
    const clean = tagInput.trim();
    if (!clean || tags.includes(clean)) return;
    setTags((prev) => [...prev, clean]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const onFileChange = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onProfileImageChange = (kind: "avatar" | "cover", file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const image = reader.result as string;
      if (kind === "avatar") setAvatarUrl(image);
      if (kind === "cover") setCoverUrl(image);
    };
    reader.readAsDataURL(file);
  };

  const saveProfileChanges = () => {
    const payload = {
      profileName: profileName.trim() || "Traveler",
      profileUsername: profileUsername.trim().replace(/\s+/g, "").toLowerCase() || "localuser",
      profileEmail: profileEmail.trim() || "local.user@cityguider.app",
      profileLocation: profileLocation.trim() || "India Traveler",
      profileBio: profileBio.trim() || "Travel enthusiast",
      avatarUrl,
      coverUrl,
    };
    localStorage.setItem(profileStorageKey, JSON.stringify(payload));
    setProfileName(payload.profileName);
    setIsEditingProfile(false);
  };

  const uploadPhoto = () => {
    if (!preview || !location || !date) return;
    const newPhoto: GalleryPhoto = { id: `upload-${Date.now()}`, url: preview, location, likes: 0, comments: 0, date, description, tags, heightFactor: "h-80" };
    setPhotos((prev) => [newPhoto, ...prev]);
    setPointsFromActions((prev) => prev + 50);
    setRecentEarnings((prev) => [{ action: `Photo uploaded - ${location}`, points: 50, date: "Just now" }, ...prev].slice(0, 6));
    setPreview(null);
    setIsUploadOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
          <div className="h-96 animate-pulse rounded-[3rem] bg-slate-200/50" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-neutral-50 relative overflow-hidden"
    >
      {/* Immersive Cinematic Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/20 rounded-full blur-[140px] mix-blend-multiply animate-blob"></div>
      <div className="absolute top-[30%] right-[-10%] w-[60%] h-[60%] bg-emerald-400/20 rounded-full blur-[140px] mix-blend-multiply animate-blob animation-delay-2000"></div>

      <div className="relative z-10 pb-20">
        <Header />

        <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
          
          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-[2.5rem] bg-white/40 backdrop-blur-3xl shadow-[0_20px_40px_rgba(79,70,229,0.03)] border border-white mb-8">
            {/* Immersive Cover */}
            <div className="relative h-80">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10" />
              <img src={coverUrl} alt="Cover" className="h-full w-full object-cover rounded-t-[2.5rem] transition-transform duration-1000 hover:scale-105" />
              
              {isEditingProfile && (
                <button onClick={() => coverInputRef.current?.click()} className="absolute right-6 top-6 z-20 rounded-full bg-white/20 backdrop-blur-md px-4 py-2.5 text-sm font-bold text-white border border-white/40 hover:bg-white/30 transition-all flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Change Cover
                </button>
              )}
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onProfileImageChange("cover", e.target.files?.[0])} />
            </div>

            {/* Profile Info Overlay */}
            <div className="relative -mt-24 px-8 pb-10 z-30">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-end justify-between bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] shadow-xl border border-white">
                
                {/* Avatar Column */}
                <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center w-full">
                  <div className="relative group shrink-0 -mt-16">
                    <img src={avatarUrl} alt="avatar" className="h-40 w-40 rounded-[2rem] border-[6px] border-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] object-cover rotate-3 group-hover:rotate-0 transition-transform duration-500" />
                    
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="absolute -bottom-4 -right-4 inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-400 px-4 py-2 shadow-lg border-2 border-white text-sm font-black tracking-widest uppercase text-white"
                    >
                      <Award className="h-4 w-4" />
                      Lvl {level}
                    </motion.div>

                    {isEditingProfile && (
                      <button onClick={() => avatarInputRef.current?.click()} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/40 backdrop-blur-md p-3 text-white hover:bg-black/60 shadow-lg">
                        <Camera className="h-5 w-5" />
                      </button>
                    )}
                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onProfileImageChange("avatar", e.target.files?.[0])} />
                  </div>

                  <div className="flex-1 mt-2 sm:mt-0">
                    {isEditingProfile ? (
                      <div className="space-y-3 w-full max-w-md">
                        <input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Full name" className="w-full rounded-2xl border border-indigo-100 bg-white/70 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-bold text-xl" />
                        <input value={profileUsername} onChange={(e) => setProfileUsername(e.target.value)} placeholder="Username" className="w-full rounded-2xl border border-indigo-100 bg-white/70 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-500" />
                        <textarea value={profileBio} onChange={(e) => setProfileBio(e.target.value)} className="w-full rounded-2xl border border-indigo-100 bg-white/70 px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400" rows={3} />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter drop-shadow-sm">{profileName}</h1>
                        <p className="text-sm font-bold text-indigo-500 tracking-wider uppercase bg-indigo-50 inline-block px-3 py-1 rounded-full border border-indigo-100">@{profileUsername}</p>
                        <p className="max-w-2xl text-slate-600 text-base leading-relaxed font-medium mt-3">{profileBio}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Corner */}
                <div className="flex flex-col gap-4 shrink-0 mt-6 md:mt-0 w-full md:w-auto items-start md:items-end">
                  <div className="flex gap-2">
                    <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                      <MapPin className="w-4 h-4 text-slate-500" /> 
                      <span className="font-semibold text-xs text-slate-600">{profileLocation}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                      <Globe className="w-4 h-4 text-slate-500" /> 
                      <span className="font-semibold text-xs text-slate-600">Traveler Type: <span className="capitalize text-indigo-600 ml-1">{preferredMode}</span></span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full mt-2">
                    {!isEditingProfile ? (
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setIsEditingProfile(true)} className="flex-1 inline-flex justify-center items-center gap-2 rounded-xl border border-indigo-200 bg-white/50 px-5 py-3 text-sm font-bold text-indigo-700 hover:bg-white shadow-sm transition-all">
                        Edit Profile
                      </motion.button>
                    ) : (
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={saveProfileChanges} className="flex-1 inline-flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition-all">
                        Save Identity
                      </motion.button>
                    )}
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setIsUploadOpen(true)} className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-600 hover:bg-emerald-100 transition-all">
                      <Plus className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Quick Stats Pills */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Saved Cities", value: cities.length, icon: MapPin },
              { label: "Total Trips", value: trips.length, icon: Plane },
              { label: "Photos Shared", value: photos.length, icon: Camera },
              { label: "Attractions", value: attractions.length, icon: Heart },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="rounded-3xl bg-white/50 backdrop-blur-xl border border-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col items-center justify-center text-center group hover:bg-white transition-colors"
              >
                <div className="inline-flex rounded-2xl bg-slate-100 p-4 mb-4 text-indigo-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all group-hover:scale-110">
                  <stat.icon className="h-6 w-6" />
                </div>
                <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </section>

          {/* Body Columns */}
          <div className="grid gap-8 lg:grid-cols-3 items-start">
            
            {/* Gamification Tracker */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-[2rem] bg-white/50 backdrop-blur-xl border border-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
              >
                <h3 className="mb-6 inline-flex items-center gap-3 text-xl font-extrabold text-slate-800 tracking-tight">
                  <div className="p-2 bg-yellow-100 rounded-full text-yellow-600"><Trophy className="h-5 w-5" /></div>
                  Pioneer Status
                </h3>
                
                <div className="mb-3 flex items-center justify-between text-sm font-bold">
                  <span className="text-slate-500 uppercase tracking-widest text-xs">Level {level} Progress</span>
                  <span className="text-indigo-600">{totalPoints % pointsToNextLevel} / {pointsToNextLevel} xp</span>
                </div>
                
                {/* Premium Progress Bar */}
                <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner mb-8">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative"
                  >
                    <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                  </motion.div>
                </div>

                <div className="rounded-[1.5rem] bg-indigo-50/50 border border-indigo-100 p-5 mt-4">
                  <p className="mb-4 inline-flex items-center gap-2 font-black tracking-tight text-indigo-900">
                    <TrendingUp className="h-5 w-5 text-indigo-500" />
                    How to level up
                  </p>
                  <ul className="space-y-3 text-sm font-medium text-indigo-800/70">
                    <li className="flex justify-between items-center bg-white/50 px-3 py-2 rounded-lg"><span>Upload aesthetic photo</span> <span className="font-bold text-indigo-600">+50 xp</span></li>
                    <li className="flex justify-between items-center bg-white/50 px-3 py-2 rounded-lg"><span>Finish a Journey</span> <span className="font-bold text-indigo-600">+100 xp</span></li>
                    <li className="flex justify-between items-center bg-white/50 px-3 py-2 rounded-lg"><span>Bookmark Attraction</span> <span className="font-bold text-indigo-600">+40 xp</span></li>
                  </ul>
                </div>
              </motion.div>

              <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.4 }}
                 className="rounded-[2rem] bg-white/50 backdrop-blur-xl border border-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
              >
                <h3 className="mb-6 inline-flex items-center gap-3 text-xl font-extrabold text-slate-800 tracking-tight">
                  <div className="p-2 bg-emerald-100 rounded-full text-emerald-600"><Gift className="h-5 w-5" /></div>
                  Activity Log
                </h3>
                <div className="space-y-4">
                  {recentEarnings.length === 0 && (
                    <p className="text-sm font-medium text-slate-500 italic">No recent activity detected.</p>
                  )}
                  {recentEarnings.map((earning, idx) => (
                    <div key={`${earning.action}-${idx}`} className="flex items-start justify-between border-b border-slate-100/50 pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-bold text-slate-700">{earning.action}</p>
                        <p className="text-[0.65rem] uppercase tracking-widest font-bold text-slate-400 mt-1">{earning.date}</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-600 shadow-sm border border-emerald-100">+{earning.points}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Masonry Travel Gallery */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Visual Journal</h2>
                <button 
                  onClick={() => setIsUploadOpen(true)}
                  className="hidden md:flex items-center gap-2 text-indigo-600 font-bold bg-white/60 backdrop-blur-md px-4 py-2 rounded-full hover:bg-white shadow-sm border border-white"
                >
                  <Camera className="w-4 h-4" /> Add Memory
                </button>
              </div>

              {/* CSS columns masonry layout */}
              <div className="columns-1 sm:columns-2 gap-6 space-y-6">
                {photos.map((photo, i) => (
                  <motion.div 
                    key={photo.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className={`break-inside-avoid w-full group relative overflow-hidden rounded-[2rem] bg-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.08)] transform transition-transform duration-500 hover:-translate-y-2 ${photo.heightFactor}`}
                  >
                    <img src={photo.url} alt={photo.location} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80"></div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
                      <p className="font-extrabold text-xl tracking-tight mb-1">{photo.location}</p>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-3">{photo.date}</p>
                      
                      <div className="flex items-center gap-4 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                          <Heart className="h-4 w-4" /> {photo.likes}
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                          <Users className="h-4 w-4" /> {photo.comments}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {isUploadOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
            onClick={() => setIsUploadOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-xl rounded-[2.5rem] bg-white/90 backdrop-blur-2xl border border-white p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Post Memory</h3>
                <button onClick={() => setIsUploadOpen(false)} className="rounded-full bg-slate-100 p-2 hover:bg-slate-200 transition-colors">
                  <X className="h-5 w-5 text-slate-600" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="rounded-[2rem] border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-2 overflow-hidden transition-all hover:bg-indigo-50">
                  {preview ? (
                    <div className="relative">
                      <img src={preview} alt="preview" className="h-64 w-full rounded-[1.5rem] object-cover shadow-sm" />
                       <button onClick={() => setPreview(null)} className="absolute right-3 top-3 rounded-full bg-black/50 backdrop-blur-md p-2 text-white hover:bg-black/70">
                         <X className="h-4 w-4" />
                       </button>
                    </div>
                  ) : (
                    <div className="relative text-center py-12">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-indigo-100">
                        <Upload className="h-6 w-6 text-indigo-500" />
                      </div>
                      <p className="text-sm font-bold text-slate-600 mb-2">Tap to browse or drag photo</p>
                      <p className="text-xs text-slate-400 font-medium">High quality JPG, PNG, WEBP</p>
                      <input type="file" accept="image/*" onChange={(e) => onFileChange(e.target.files?.[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location name..." className="w-full rounded-2xl border border-slate-200 bg-white/70 px-5 py-3.5 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 font-medium" />
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white/70 px-5 py-3.5 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 font-medium text-slate-600" />
                </div>
                
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a caption to this memory..." className="w-full rounded-2xl border border-slate-200 bg-white/70 px-5 py-4 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 font-medium resize-none" rows={3} />
                
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Tag className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} placeholder="Add tags..." className="w-full rounded-2xl border border-slate-200 bg-white/70 py-3.5 pl-11 pr-4 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 font-medium" />
                  </div>
                  <button onClick={addTag} className="rounded-2xl bg-slate-800 px-6 py-3.5 font-bold text-white hover:bg-slate-900 transition-colors">
                    Add
                  </button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600">
                        {tag} <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}

                <button onClick={uploadPhoto} disabled={!preview || !location || !date} className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-4 font-extrabold tracking-wide text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50 hover:shadow-indigo-500/30 transition-all mt-4">
                  Publish Memory & Earn 50xp
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
