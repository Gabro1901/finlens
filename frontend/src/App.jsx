import { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import CommandBar from './components/CommandBar';
import AnalysisOverlay from './components/AnalysisOverlay';
import ReportViewer from './components/ReportViewer';
import ChatPanel from './components/ChatPanel';
import HistoryView from './components/HistoryView';
import { MessageSquare } from 'lucide-react';
import RawDataViewer from './components/RawDataViewer';
import SettingsModal from './components/SettingsModal';
import { AnimatePresence } from 'framer-motion';
import PrintView from './components/PrintView';
import './index.css';

function App() {
  const isPrintMode = new URLSearchParams(window.location.search).get('print') === 'true';

  if (isPrintMode) {
    return <PrintView />;
  }

  // ── Core state (preserved exactly from original) ──
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState('');
  const [currentStage, setCurrentStage] = useState('');
  const [targetTicker, setTargetTicker] = useState('');
  const [rawContextData, setRawContextData] = useState(null);
  const rawContextDataRef = useRef(null);

  // ── UI state (new layout) ──
  const [activeView, setActiveView] = useState('report');    // 'report' | 'raw' | 'chat'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const [apiKeys, setApiKeys] = useState(() => {
    const saved = localStorage.getItem('finlens_api_keys');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { openai: '', fred: '', congress: '', sec_email: '' };
  });

  useEffect(() => {
    localStorage.setItem('finlens_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  // ── History management (preserved exactly) ──
  const fetchHistoryList = async () => {
    setIsHistoryLoading(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/history/`);
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data);
      }
    } catch (e) {
      console.error("Failed to fetch history", e);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryList();
  }, []);

  const saveReportToHistory = async (tickerToSave, markdownToSave, rawDataToSave) => {
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/history/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ticker: tickerToSave, 
          markdown: markdownToSave,
          raw_data: rawDataToSave
        })
      });
      if (res.ok) {
        fetchHistoryList();
      }
    } catch (e) {
      console.error("Failed to save history", e);
    }
  };

  const handleSelectHistory = async (id) => {
    setIsHistoryOpen(false);
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/history/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTargetTicker(data.ticker);
        setReportMarkdown(data.markdown);
        setRawContextData(data.raw_data || null);
        rawContextDataRef.current = data.raw_data || null;
        setCurrentStage('complete');
        setActiveView('report');
      }
    } catch (e) {
      console.error("Failed to fetch report", e);
    }
  };

  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchHistoryList();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ── SSE analysis pipeline (preserved exactly) ──
  const handleStartAnalysis = async (ticker) => {
    setIsAnalyzing(true);
    setReportMarkdown('');
    setRawContextData(null);
    rawContextDataRef.current = null;
    setCurrentStage('init');
    setTargetTicker(ticker);
    setActiveView('report');
    setIsChatOpen(false);

    try {
      const response = await fetch(`http://${window.location.hostname}:8000/api/analysis/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ticker, 
          llm_provider: 'openai', 
          llm_api_key: apiKeys.openai,
          fred_api_key: apiKeys.fred,
          congress_api_key: apiKeys.congress,
          sec_email: apiKeys.sec_email
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start analysis: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let currentMarkdown = '';
      let buffer = '';
      let currentEvent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.substring(7).trim();
          } else if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim();
            if (!dataStr) continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (currentEvent === 'status') {
                setCurrentStage(data.stage);
              } else if (currentEvent === 'raw_data') {
                setRawContextData(data);
                rawContextDataRef.current = data;
              } else if (currentEvent === 'report_chunk') {
                currentMarkdown += data.text;
                setReportMarkdown(currentMarkdown);
              } else if (currentEvent === 'complete') {
                setCurrentStage('complete');
                setIsAnalyzing(false);
                saveReportToHistory(ticker, currentMarkdown, rawContextDataRef.current);
              } else if (currentEvent === 'error') {
                setCurrentStage('error');
                setIsAnalyzing(false);
                console.error('Pipeline error:', data.message || data);
              }
            } catch (e) {
              console.error("Failed to parse SSE data", e, dataStr);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setCurrentStage('error');
      setIsAnalyzing(false);
    }
  };

  // ── Navigation handler ──
  const handleNavigate = (view) => {
    if (view === 'chat') {
      setIsChatOpen(prev => !prev);
    } else {
      setActiveView(view);
    }
  };

  // ── Determine what main content to show ──
  const mainContentView = activeView === 'history' ? 'history' : activeView === 'raw' && rawContextData ? 'raw' : 'report';

  return (
    <div className="h-screen w-screen flex overflow-hidden relative">
      {/* ── Ambient background glows ── */}
      <div className="fixed top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-rose-600/[0.04] blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[10%] w-[500px] h-[500px] rounded-full bg-red-600/[0.03] blur-[150px] pointer-events-none" />

      {/* ── Sidebar ── */}
      <Sidebar
        activeView={isChatOpen ? 'chat' : activeView}
        onNavigate={setActiveView}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasReport={!!reportMarkdown}
      />

      {/* ── Main Layout ── */}
      <div 
        className="flex h-full" 
        style={{ 
          width: 'calc(100vw - var(--sidebar-width))', 
          marginLeft: 'var(--sidebar-width)' 
        }}
      >
        
        {/* Main Content Column */}
        <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* ── Command Bar ── */}
        <CommandBar
          onStartAnalysis={handleStartAnalysis}
          isAnalyzing={isAnalyzing}
          currentStage={currentStage}
          reportMarkdown={reportMarkdown}
          ticker={targetTicker}
          activeView={activeView}
          onViewChange={setActiveView}
          hasRawData={!!rawContextData}
        />

        {/* ── Content area ── */}
        <main 
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{ marginTop: 'var(--commandbar-height)' }}
        >
          {/* Error state */}
          {currentStage === 'error' && (
            <div className="max-w-3xl mx-auto mt-8 px-6">
              <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-6 text-red-300 animate-fade-in">
                <h3 className="font-semibold text-red-200 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  Analysis Error
                </h3>
                <p className="text-sm">An error occurred during the pipeline. Check the browser console (F12) for details, or try again.</p>
              </div>
            </div>
          )}

          {/* Empty state — no report yet */}
          {!reportMarkdown && !isAnalyzing && currentStage !== 'error' && mainContentView !== 'history' && (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center space-y-6 animate-fade-in max-w-md px-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-500/20 flex items-center justify-center">
                  <svg className="w-10 h-10 text-rose-400/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-200 mb-2">Financial Intelligence</h2>
                  <p className="text-sm text-zinc-500 leading-relaxed">Enter a ticker symbol in the command bar above to generate a comprehensive AI-driven analysis report with accounting forensics, peer benchmarking, and forward-looking signals.</p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  {['AAPL', 'TSLA', 'MSFT', 'NVDA'].map(t => (
                    <button
                      key={t}
                      onClick={() => handleStartAnalysis(t)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs font-data font-semibold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all duration-200"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Report view */}
          {reportMarkdown && mainContentView === 'report' && (
            <div className="animate-fade-in">
              <ReportViewer markdown={reportMarkdown} ticker={targetTicker} />
            </div>
          )}

          {/* Raw data view */}
          {rawContextData && mainContentView === 'raw' && (
            <div className="animate-fade-in h-full">
              <RawDataViewer data={rawContextData} />
            </div>
          )}

          {/* History view */}
          {mainContentView === 'history' && (
            <div className="animate-fade-in h-full">
              <HistoryView 
                historyList={historyList}
                isLoading={isHistoryLoading}
                onSelectHistory={handleSelectHistory}
                onDeleteHistory={handleDeleteHistory}
              />
            </div>
          )}
        </main>
        </div>

        {/* ── Chat drawer ── */}
        <AnimatePresence>
          {isChatOpen && (
            <ChatPanel
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              ticker={targetTicker}
              reportMarkdown={reportMarkdown}
              rawContextData={rawContextData}
              apiKey={apiKeys.openai}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Analysis overlay ── */}
      <AnalysisOverlay currentStage={isAnalyzing ? currentStage : null} ticker={targetTicker} />

      {/* ── Settings modal ── */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        apiKeys={apiKeys} 
        setApiKeys={setApiKeys} 
      />

      {/* ── Chat FAB ── */}
      {reportMarkdown && !isChatOpen && (
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-600/30 flex items-center justify-center transition-all duration-200 z-50 hover:scale-105 active:scale-95"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

export default App;
