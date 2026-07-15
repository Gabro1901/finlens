import { useState, useEffect } from 'react';
import { Search, TrendingUp, Sparkles, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '../hooks/useDebounce';

const TRENDING_TICKERS = [
  { symbol: 'NVDA', name: 'Nvidia Corp.' },
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'PLTR', name: 'Palantir' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
];

export default function MobileHome({ onStartAnalysis, onOpenSettings }) {
  const [ticker, setTicker] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedTicker = useDebounce(ticker, 300);
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    if (debouncedTicker.trim().length >= 1) {
      const fetchSuggestions = async () => {
        try {
          const res = await fetch(`/api/search/?q=${encodeURIComponent(debouncedTicker)}`);
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data.results || []);
            setShowSuggestions(true);
          }
        } catch (e) {
          console.error("Failed to fetch suggestions");
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedTicker]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticker.trim()) {
      setShowSuggestions(false);
      onStartAnalysis(ticker.trim());
    }
  };

  return (
    <div className="flex flex-col min-h-full px-6 pt-12 pb-32">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-8 flex justify-between items-start"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            <h1 className="text-3xl font-bold text-white tracking-tight">{greeting}</h1>
          </div>
          <p className="text-[15px] text-zinc-400">What would you like to analyze today?</p>
        </div>
        
        <button 
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Big Search Bar */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="relative mb-10 z-50"
      >
        <form onSubmit={handleSubmit} className="relative w-full shadow-2xl shadow-rose-900/10">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-zinc-400" />
          </div>
          <input
            type="text"
            value={ticker}
            onChange={(e) => {
              setTicker(e.target.value.toUpperCase());
              setShowSuggestions(true);
            }}
            placeholder="Search company or ticker..."
            className="block w-full pl-12 pr-6 py-4 bg-zinc-900 border border-zinc-800 rounded-3xl text-lg text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50 focus:bg-zinc-800 transition-all shadow-inner"
          />
        </form>

        {/* Autocomplete Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-3 bg-zinc-800/95 backdrop-blur-xl border border-zinc-700 rounded-3xl shadow-2xl overflow-hidden z-50"
            >
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onStartAnalysis(s.symbol);
                    setShowSuggestions(false);
                    setTicker('');
                  }}
                  className="w-full text-left px-6 py-4 hover:bg-zinc-700/80 transition-colors flex flex-col border-b border-zinc-700/50 last:border-0"
                >
                  <span className="text-lg font-bold text-white mb-1">{s.symbol}</span>
                  <span className="text-sm text-zinc-400 truncate">{s.name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Trending / Watchlist */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-zinc-500" />
          <h2 className="text-lg font-semibold text-zinc-300">Trending Now</h2>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {TRENDING_TICKERS.map((t) => (
            <button
              key={t.symbol}
              onClick={() => onStartAnalysis(t.symbol)}
              className="px-5 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-start hover:bg-zinc-800 transition-colors active:scale-95 duration-200"
            >
              <span className="text-base font-bold text-white font-data tracking-wide">{t.symbol}</span>
              <span className="text-[13px] text-zinc-500">{t.name}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
