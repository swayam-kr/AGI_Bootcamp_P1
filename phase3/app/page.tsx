"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, DollarSign, Star, Utensils, MessageCircle, ArrowRight, Loader2, Heart, ExternalLink, ChevronDown } from "lucide-react";
import axios from "axios";

interface Restaurant {
  name: string;
  rating_clean: number;
  cost_clean: number;
  area_clean: string;
  cuisines: string;
  address?: string;
  url?: string;
}

export default function Home() {
  const [area, setArea] = useState("");
  const [maxCost, setMaxCost] = useState(1000);
  const [minRating, setMinRating] = useState(4.0);
  const [cuisine, setCuisine] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ candidates: Restaurant[], ai_rationale: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [metadata, setMetadata] = useState<{ areas: string[], cuisines: string[] }>({ areas: [], cuisines: [] });

  useEffect(() => {
    // Fetch areas and cuisines on load
    const fetchMetadata = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/metadata");
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
      const response = await axios.post("http://127.0.0.1:8000/recommend", {
        area: area || null,
        max_cost: maxCost,
        min_rating: minRating,
        cuisine: cuisine || null
      });
      setResult(response.data);
    } catch (err: any) {
      setError("Could not connect to the backend server. Make sure it's running and CORS is enabled!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 md:py-20 lg:py-24">
      {/* Header section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16 space-y-4"
      >
        <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium mb-4">
          <Utensils className="w-4 h-4 mr-2" />
          AI-Powered Discovery
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
          The Perfect Dining Spot, <br /> Found by AI.
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
          We combine the Zomato database with Groq LLM intelligence to give you personalized restaurant recommendations beyond simple filters.
        </p>
      </motion.div>

      {/* Form and Controls */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="glass rounded-3xl p-8 mb-16 lg:max-w-5xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center">
              <MapPin className="w-3 h-3 mr-1" /> Area
            </label>
            <div className="relative">
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition truncate pr-10"
              >
                <option value="">All Areas</option>
                {metadata.areas.map((a, i) => (
                  <option key={i} value={a}>{a}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center">
              <Utensils className="w-3 h-3 mr-1" /> Cuisine
            </label>
            <div className="relative">
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition pr-10"
              >
                <option value="">All Cuisines</option>
                {metadata.cuisines.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center">
              <DollarSign className="w-3 h-3 mr-1" /> Max Cost
            </label>
            <input
              type="number"
              value={maxCost}
              onChange={(e) => setMaxCost(parseInt(e.target.value))}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center">
              <Star className="w-3 h-3 mr-1 text-amber-500" /> Min Rating
            </label>
            <input
              type="number"
              step="0.1"
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
            />
          </div>

          <div className="space-y-2 flex flex-col justify-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full h-[52px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 space-y-4"
          >
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-lg font-medium text-slate-400 animate-pulse">Our AI is hand-picking recommendations for you...</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-red-900/20 border border-red-500/30 text-red-400 text-center"
          >
            {error}
          </motion.div>
        )}

        {result && !loading && (
          <div className="space-y-12">
            {/* AI Recommendation Box */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-1 rounded-3xl bg-gradient-to-br from-blue-500 via-emerald-500 to-indigo-500"
            >
              <div className="bg-[#0f172a] rounded-[22px] p-8 space-y-4 flex flex-col md:flex-row gap-8 items-start">
                <div className="p-4 rounded-full bg-blue-500/10 text-blue-400 shrink-0">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">AI Expert Insight</h3>
                  <div className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">
                    {result.ai_rationale}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* List of candidates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {result.candidates.map((restaurant, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass p-6 rounded-2xl glass-card flex flex-col group h-full"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-xl bg-slate-800 text-slate-300 group-hover:bg-blue-900/30 group-hover:text-blue-400 transition-colors">
                      <Utensils className="w-6 h-6" />
                    </div>
                    <button className="text-slate-600 hover:text-pink-500 transition-colors">
                      <Heart className="w-6 h-6" />
                    </button>
                  </div>

                  <h3 className="text-xl font-bold mb-1 line-clamp-1">{restaurant.name}</h3>
                  <p className="text-slate-500 text-sm mb-4 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" /> {restaurant.area_clean}
                  </p>

                  <div className="flex gap-2 flex-wrap mb-6">
                    {restaurant.cuisines.split(',').slice(0, 2).map((c, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-medium text-slate-400">
                        {c.trim()}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto grid grid-cols-2 border-t border-slate-800 pt-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-600 flex items-center">
                        <Star className="w-2.5 h-2.5 mr-1 text-amber-500" /> Rating
                      </p>
                      <p className="font-bold text-slate-200">{restaurant.rating_clean}/5.0</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-600 flex items-center">
                        <DollarSign className="w-2.5 h-2.5 mr-1 text-emerald-500" /> Cost
                      </p>
                      <p className="font-bold text-slate-200">₹{restaurant.cost_clean}</p>
                    </div>
                  </div>

                  <button className="mt-6 flex items-center justify-center text-sm font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
                    View Details <ExternalLink className="ml-2 w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
