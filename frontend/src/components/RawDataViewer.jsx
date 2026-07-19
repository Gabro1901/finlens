import { useState } from 'react';
import { Database, ChevronDown, ChevronRight } from 'lucide-react';

const JsonViewer = ({ data, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (typeof data !== 'object' || data === null) {
    return <span className="text-theme-accent font-data text-xs">{JSON.stringify(data)}</span>;
  }

  const isArray = Array.isArray(data);
  const keys = Object.keys(data);

  if (keys.length === 0) {
    return <span className="text-zinc-500 font-data text-xs">{isArray ? '[]' : '{}'}</span>;
  }

  return (
    <div className="font-data text-xs">
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="flex items-center gap-1 hover:text-theme-accent transition-colors text-zinc-400"
      >
        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <span>{isArray ? 'Array' : 'Object'}</span>
        <span className="text-zinc-500 text-[10px] ml-1">({keys.length} items)</span>
      </button>
      
      {expanded && (
        <div className="pl-4 mt-1 border-l border-zinc-800/50 space-y-1">
          {keys.map(key => (
            <div key={key} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
              <span className="text-theme-accent min-w-fit font-medium">
                {isArray ? `[${key}]` : `"${key}"`}:
              </span>
              <div className="overflow-x-auto pb-1">
                <JsonViewer data={data[key]} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function RawDataViewer({ data }) {
  if (!data) return null;

  const sections = [
    { title: 'Market Data (yfinance)', key: 'market' },
    { title: 'SEC Filings (EDGAR)', key: 'edgar' },
    { title: 'Macro Economics', key: 'macro' },
    { title: 'News Sentiment', key: 'news' },
    { title: 'Regulatory Actions', key: 'regulatory' },
    { title: 'Normalized Data', key: 'normalized' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-8 lg:px-16 xl:px-24 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-theme-accent/15 flex items-center justify-center border border-theme-accent/30">
            <Database className="w-4 h-4 text-theme-accent" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-theme-accent">Raw Context Data</h2>
            <p className="text-[10px] text-zinc-400">Pipeline data exactly as assembled</p>
          </div>
        </div>
      </div>
      
      {/* Data sections */}
      <div className="flex-1 overflow-y-auto px-8 lg:px-16 xl:px-24 pb-16 space-y-4">
        
        {data.context_prompt && (
          <div className="bg-zinc-900/60 rounded-xl border border-zinc-800/50 overflow-hidden">
            <div className="px-4 py-3 bg-theme-bg/40 border-b border-zinc-800/50 font-medium text-theme-accent text-xs uppercase tracking-wide">
              Prompt sent to AI
            </div>
            <div className="p-4 overflow-x-auto">
              <pre className="text-[11px] text-theme-accent/80 font-data whitespace-pre-wrap leading-relaxed">
                {data.context_prompt}
              </pre>
            </div>
          </div>
        )}

        {sections.map(({ title, key }) => {
          if (!data[key]) return null;
          return (
            <div key={key} className="bg-zinc-900/60 rounded-xl border border-zinc-800/50 overflow-hidden">
              <div className="px-4 py-3 bg-zinc-800/30 border-b border-zinc-800/50 font-medium text-zinc-300 text-xs">
                {title}
              </div>
              <div className="p-4 overflow-x-auto">
                <JsonViewer data={data[key]} defaultExpanded={false} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
