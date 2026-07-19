// TickerInput is now integrated into CommandBar.jsx
// This file is kept for backward compatibility but is no longer used directly.
// See CommandBar.jsx for the new inline ticker search implementation.

import { useState } from 'react';
import { Search, Loader2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TickerInput({ onStartAnalysis, isAnalyzing }) {
  const [ticker, setTicker] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticker.trim()) {
      onStartAnalysis(ticker.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
      <div className="relative flex-1 glow-focus rounded-lg transition-all duration-200">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isAnalyzing ? (
            <Loader2 className="h-4 w-4 text-theme-accent animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-zinc-500" />
          )}
        </div>
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="Enter ticker symbol..."
          className="block w-full pl-9 pr-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-lg text-sm text-theme-accent placeholder-zinc-500 focus:outline-none font-semibold tracking-wider uppercase font-data"
          disabled={isAnalyzing}
        />
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        type="submit"
        disabled={isAnalyzing || !ticker.trim()}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg text-theme-bg bg-theme-accent hover:bg-[#e5d2b0] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-theme-accent/10 transition-all duration-200 whitespace-nowrap"
      >
        <Zap className="w-3.5 h-3.5 text-theme-bg" />
        {isAnalyzing ? 'Analyzing...' : 'Analyze'}
      </motion.button>
    </form>
  );
}
