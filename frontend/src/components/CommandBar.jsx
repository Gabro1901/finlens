import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, FileDown, Download, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '../hooks/useDebounce';

export default function CommandBar({ 
  onStartAnalysis, 
  isAnalyzing, 
  currentStage,
  reportMarkdown, 
  ticker: activeTicker,
  activeView,
  onViewChange,
  hasRawData 
}) {
  const [ticker, setTicker] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);

  const debouncedTicker = useDebounce(ticker, 300);

  useEffect(() => {
    if (debouncedTicker.trim().length >= 1) {
      const fetchSuggestions = async () => {
        setIsSearching(true);
        try {
          const res = await fetch(`http://${window.location.hostname}:8000/api/search/?q=${encodeURIComponent(debouncedTicker)}`);
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data.results || []);
            setShowSuggestions(true);
          }
        } catch (e) {
          console.error("Failed to fetch suggestions");
        } finally {
          setIsSearching(false);
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedTicker]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticker.trim() && !isAnalyzing) {
      setShowSuggestions(false);
      onStartAnalysis(ticker.trim());
    }
  };

  const handleSuggestionClick = (symbol) => {
    setTicker(symbol);
    setShowSuggestions(false);
    if (!isAnalyzing) {
      onStartAnalysis(symbol);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`http://${window.location.hostname}:8000/api/export/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown_content: reportMarkdown, ticker: activeTicker || 'Report' })
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FinLens_${activeTicker || 'Report'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      console.error(e);
      alert('PDF generation failed. Please check the backend console.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMarkdown = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`http://${window.location.hostname}:8000/api/export/markdown`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown_content: reportMarkdown, ticker: activeTicker || 'Report' })
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FinLens_${activeTicker || 'Report'}.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div 
      className="commandbar-bg absolute top-0 left-0 right-0 z-40 flex items-center gap-4 px-5"
      style={{ height: 'var(--commandbar-height)' }}
    >
      {/* Ticker search */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2.5 flex-1 max-w-lg">
        <div className="relative flex-1 glow-focus rounded-lg transition-all duration-200">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 text-rose-400 animate-spin" />
            ) : (
              <Search className="h-4 w-4 text-zinc-500" />
            )}
          </div>
          <input
            type="text"
            value={ticker}
            onChange={(e) => {
              setTicker(e.target.value.toUpperCase());
              setShowSuggestions(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            placeholder="Search company or ticker..."
            className="block w-full pl-9 pr-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500/50 focus:bg-zinc-900 transition-all font-semibold"
            disabled={isAnalyzing}
            id="ticker-search-input"
            autoComplete="off"
          />
          
          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl shadow-black/40 overflow-hidden z-50"
              >
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSuggestionClick(s.symbol)}
                    className="w-full text-left px-4 py-2.5 hover:bg-zinc-800/80 transition-colors flex items-center justify-between group border-b border-zinc-800/50 last:border-0"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">{s.symbol}</span>
                      <span className="text-xs text-zinc-500 truncate max-w-[200px]">{s.name}</span>
                    </div>
                    <span className="text-[10px] uppercase font-semibold text-zinc-600 bg-zinc-950 px-2 py-1 rounded">{s.type}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isAnalyzing || !ticker.trim()}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg text-black bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:opacity-100 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap"
          id="analyze-button"
        >
          <Zap className="w-3.5 h-3.5" />
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </motion.button>
      </form>

      {/* Analysis status pill */}
      {isAnalyzing && currentStage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          <span className="text-xs text-rose-300 font-medium capitalize">{currentStage}</span>
        </motion.div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* View toggle — only show when we have content */}
      {reportMarkdown && (
        <div className="flex bg-zinc-900/60 rounded-lg p-0.5 border border-zinc-800">
          <button
            onClick={() => onViewChange('report')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
              activeView === 'report' 
                ? 'bg-rose-600/80 text-white shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            id="view-toggle-report"
          >
            Report
          </button>
          {hasRawData && (
            <button
              onClick={() => onViewChange('raw')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                activeView === 'raw' 
                  ? 'bg-rose-600/80 text-white shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              id="view-toggle-raw"
            >
              Raw Data
            </button>
          )}
        </div>
      )}

      {/* Export actions — only show when we have a report */}
      {reportMarkdown && (
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExportMarkdown}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all duration-200"
            id="export-md-button"
          >
            <FileDown className="w-3.5 h-3.5" />
            MD
          </button>
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-rose-600/80 hover:bg-rose-500 disabled:opacity-60 border border-rose-500/50 rounded-lg shadow-sm transition-all duration-200"
            id="export-pdf-button"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {isExporting ? 'Exporting...' : 'PDF'}
          </button>
        </div>
      )}
    </div>
  );
}
