"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, DollarSign, Star, Utensils, MessageCircle, ArrowRight, Loader2, Heart, ExternalLink, ChevronDown, X, Info, TrendingUp, Bike, Calendar } from "lucide-react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface Restaurant {
  name_clean: string;
  rating_clean: number;
  cost_clean: number;
  area_clean: string;
  cuisines_clean: string;
  dish_liked_clean: string;
  address?: string;
  url?: string;
}

export default function Home() {
  const [area, setArea] = useState("");
  const [minCost, setMinCost] = useState(0);
  const [maxCost, setMaxCost] = useState(2500);
  const [minRating, setMinRating] = useState(4.0);
  const [cuisine, setCuisine] = useState("");
  const [topK, setTopK] = useState(6);
  const [onlineOrder, setOnlineOrder] = useState<boolean | null>(null);
  const [bookTable, setBookTable] = useState<boolean | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ candidates: Restaurant[], ai_rationale: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{ areas: string[], cuisines: string[] }>({ areas: [], cuisines: [] });

  // Detailed Modal State
  const [selectedRest, setSelectedRest] = useState<Restaurant | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [restDetail, setRestDetail] = useState<{ metadata: Restaurant, ai_insight: string } | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await axios.get(`${API_BASE}/metadata`);
        setMetadata(res.data);
      } catch (err) {
        console.error("Failed to fetch metadata", err);
      }
    };
    fetchMetadata();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/recommend`, {
        area: area || null,
        min_cost: minCost,
        max_cost: maxCost,
        min_rating: minRating,
        cuisine: cuisine || null,
        online_order: onlineOrder,
        book_table: bookTable,
        top_k: topK
      });
      setResult(response.data);
    } catch (err: any) {
      setError("Trouble reaching the kitchen (Backend)! Is the server running?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async (rest: Restaurant) => {
    setSelectedRest(rest);
    setDetailLoading(true);
    setRestDetail(null);
    try {
      const res = await axios.get(`${API_BASE}/restaurant/${encodeURIComponent(rest.name_clean)}/details`);
      setRestDetail(res.data);
    } catch (err) {
      console.error("Detail fetch failed", err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-6"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-sm font-semibold tracking-wide">
            <TrendingUp className="w-4 h-4 mr-2" />
            V2: Advanced LLM Recommendation
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-none">
            Find Your <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Flavour.</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto font-medium">
            Search across 51,000+ restaurants. Ranked by data, curated by AI.
          </p>
        </motion.div>

        {/* Enhanced Search Console */}
        <motion.div
          className="glass rounded-[32px] p-8 md:p-10 mb-20 max-w-6xl mx-auto border-white/5 shadow-2xl space-y-10"
          layout
        >
          {/* Row 1: Key Data Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-2 text-blue-500" /> Area
              </label>
              <div className="relative group">
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-4 appearance-none focus:ring-2 focus:ring-blue-500/50 transition outline-none pr-10 text-sm font-medium"
                >
                  <option value="">All Locations</option>
                  {metadata.areas.map((a, i) => <option key={i} value={a}>{a}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center">
                <Utensils className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Cuisine
              </label>
              <div className="relative group">
                <select
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-4 appearance-none focus:ring-2 focus:ring-blue-500/50 transition outline-none pr-10 text-sm font-medium"
                >
                  <option value="">Any Cuisine</option>
                  {metadata.cuisines.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center">
                <Star className="w-3.5 h-3.5 mr-2 text-yellow-500" /> Min Rating
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={Number.isNaN(minRating) ? "" : minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500/50 transition outline-none text-sm font-bold"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-2 text-indigo-500" /> Result Count
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500/50 transition outline-none text-sm font-bold"
              />
            </div>
          </div>

          {/* Row 2: Range and Feature Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pt-8 border-t border-white/5 items-start">
            {/* Price Sliders */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center justify-between">
                  <span className="flex items-center"><DollarSign className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Min Price</span>
                  <span className="text-emerald-400 font-bold">₹{minCost}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={minCost}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setMinCost(val);
                    if (val > maxCost) setMaxCost(val);
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center justify-between">
                  <span className="flex items-center"><DollarSign className="w-3.5 h-3.5 mr-2 text-amber-500" /> Max Price</span>
                  <span className="text-amber-400 font-bold">₹{maxCost}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={maxCost}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setMaxCost(val);
                    if (val < minCost) setMinCost(val);
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* Binary Toggles (Treated like Radio/Segments) */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center">
                <Bike className="w-3.5 h-3.5 mr-2 text-blue-400" /> Online Ordering
              </label>
              <div className="flex bg-slate-900 rounded-2xl p-1.5 border border-slate-800">
                <button
                  onClick={() => setOnlineOrder(true)}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${onlineOrder === true ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Bike className="w-4 h-4" /> Available
                </button>
                <button
                  onClick={() => setOnlineOrder(false)}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${onlineOrder === false ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Not needed
                </button>
                <button
                  onClick={() => setOnlineOrder(null)}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${onlineOrder === null ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Any
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-2 text-indigo-400" /> Table Booking
              </label>
              <div className="flex bg-slate-900 rounded-2xl p-1.5 border border-slate-800">
                <button
                  onClick={() => setBookTable(true)}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${bookTable === true ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Calendar className="w-4 h-4" /> Required
                </button>
                <button
                  onClick={() => setBookTable(false)}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${bookTable === false ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Walk-in ok
                </button>
                <button
                  onClick={() => setBookTable(null)}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${bookTable === null ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Any
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: Action Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full md:w-auto md:min-w-[400px] h-[64px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-[20px] shadow-2xl shadow-blue-900/40 transition-all flex items-center justify-center disabled:opacity-50 active:scale-95 text-lg font-black gap-4"
            >
              {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : <><Search className="w-6 h-6" /> Explore Recommendations</>}
            </button>
          </div>
        </motion.div>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 rounded-2xl bg-red-900/20 border border-red-500/30 text-red-400 text-center font-medium max-w-2xl mx-auto">
              {error}
            </motion.div>
          )}

          {result && !loading && (
            <div className="space-y-16">
              {/* AI Expert Section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-[1px] rounded-[32px] bg-gradient-to-r from-blue-500/50 via-indigo-500/50 to-emerald-500/50 overflow-hidden"
              >
                <div className="bg-[#0f172a] rounded-[31px] p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] -z-10" />
                  <div className="w-16 h-16 rounded-3xl bg-blue-600/10 flex items-center justify-center text-blue-500 shrink-0 border border-blue-500/20">
                    <MessageCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Expert AI Analysis</h2>
                    <p className="text-slate-300 text-lg leading-relaxed font-medium">
                      {result.ai_rationale}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Restaurant Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {result.candidates.map((rest, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass rounded-[28px] p-6 lg:p-8 glass-card border-white/5 flex flex-col group cursor-pointer"
                    onClick={() => fetchDetails(rest)}
                  >
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-400 group-hover:bg-blue-950/30 transition-all">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div className="flex items-center space-x-1 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold ring-1 ring-inset ring-emerald-500/20">
                        <TrendingUp className="w-3 h-3" />
                        <span>High Match</span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">
                      {rest.name_clean}
                    </h3>
                    <div className="flex items-center text-slate-500 text-sm font-medium mb-6">
                      <MapPin className="w-4 h-4 mr-2" /> {rest.area_clean}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {rest.cuisines_clean.split(',').slice(0, 3).map((c, i) => (
                        <span key={i} className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] uppercase tracking-tighter font-extrabold text-slate-400">
                          {c.trim()}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-4 border-t border-slate-800/50 pt-6">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center">
                          <Star className="w-3 h-3 mr-1.5 text-yellow-500" /> Score
                        </span>
                        <p className="text-xl font-bold text-slate-200">{rest.rating_clean}/5.0</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center">
                          <DollarSign className="w-3 h-3 mr-1.5 text-emerald-500" /> Avg Cost
                        </span>
                        <p className="text-xl font-bold text-slate-200">₹{rest.cost_clean}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center text-blue-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                      View AI Deep-Dive <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Deep-Dive Modal Overlay */}
      <AnimatePresence>
        {selectedRest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12 overflow-y-auto bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-3xl bg-[#0f172a] border border-white/10 rounded-[40px] shadow-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedRest(null)}
                className="absolute top-8 right-8 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="p-10 md:p-14 space-y-10 custom-scrollbar max-h-[85vh] overflow-y-auto">
                <header className="space-y-4">
                  <div className="flex gap-4 items-center">
                    <h2 className="text-4xl md:text-5xl font-black">{selectedRest.name_clean}</h2>
                    <div className="px-4 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-widest border border-blue-500/20">
                      Verified
                    </div>
                  </div>
                  <p className="text-slate-500 font-medium flex items-center text-lg">
                    <MapPin className="w-5 h-5 mr-3 text-red-500/60" /> {selectedRest.address || selectedRest.area_clean}
                  </p>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                        <Heart className="w-4 h-4 mr-3 text-pink-500" /> Must-Try Dishes
                      </h4>
                      <p className="text-slate-300 font-medium leading-relaxed">
                        {selectedRest.dish_liked_clean !== "Not specified" ? selectedRest.dish_liked_clean : "AI could not find specific viral dishes for this spot."}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                        <Info className="w-4 h-4 mr-3 text-indigo-400" /> Core Meta
                      </h4>
                      <div className="flex gap-4">
                        <div className="px-4 py-2 bg-slate-900 rounded-xl border border-slate-800 text-slate-400 font-bold text-sm">
                          {selectedRest.rating_clean} Stars
                        </div>
                        <div className="px-4 py-2 bg-slate-900 rounded-xl border border-slate-800 text-slate-400 font-bold text-sm">
                          ₹{selectedRest.cost_clean} / 2 People
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass rounded-3xl p-8 bg-blue-500/5 border-blue-500/10">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center mb-6">
                      <MessageCircle className="w-4 h-4 mr-3" /> Professional Insight
                    </h4>
                    {detailLoading ? (
                      <div className="flex flex-col items-center py-10 space-y-4">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                        <p className="text-sm font-bold text-slate-600 animate-pulse">Consulting AI Critic...</p>
                      </div>
                    ) : (
                      <div className="text-slate-200 text-sm leading-relaxed font-medium whitespace-pre-wrap prose prose-invert">
                        {restDetail?.ai_insight || "Analyzing restaurant data..."}
                      </div>
                    )}
                  </div>
                </section>

                <footer className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row gap-4">
                  <a
                    href={selectedRest.url}
                    target="_blank"
                    className="flex-1 px-8 py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-center font-bold text-lg transition-all flex items-center justify-center"
                  >
                    Visit Online <ExternalLink className="ml-3 w-5 h-5" />
                  </a>
                  <button onClick={() => setSelectedRest(null)} className="flex-1 px-8 py-5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-2xl text-center font-bold text-lg transition-colors">
                    Close Discovery
                  </button>
                </footer>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
