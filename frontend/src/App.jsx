import { useState, useEffect, useRef } from 'react';
import PrintView from './components/PrintView';
import DesktopApp from './components/DesktopApp';
import MobileApp from './components/MobileApp';
import { useIsMobile } from './hooks/useIsMobile';
import './index.css';

function App() {
  const isPrintMode = new URLSearchParams(window.location.search).get('print') === 'true';
  const isMobile = useIsMobile(768);

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
  const wakeLockRef = useRef(null);

  // ── Wake Lock helpers ──
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch (err) {
      console.warn('Wake Lock error:', err);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current !== null) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch (err) {
        console.warn('Wake Lock release error:', err);
      }
    }
  };

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
      const res = await fetch(`/api/history/`);
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
      const res = await fetch(`/api/history/`, {
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
      const res = await fetch(`/api/history/${id}`);
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
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
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
    await requestWakeLock();

    try {
      const response = await fetch(`/api/analysis/`, {
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
                await releaseWakeLock();
              } else if (currentEvent === 'error') {
                setCurrentStage('error');
                setIsAnalyzing(false);
                console.error('Pipeline error:', data.message || data);
                await releaseWakeLock();
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
      await releaseWakeLock();
    }
  };

  // ── Navigation handler ──
  const handleClearAnalysis = () => {
    setReportMarkdown('');
    setTargetTicker('');
    setRawContextData(null);
    setCurrentStage('');
  };

  const sharedProps = {
    isAnalyzing,
    reportMarkdown,
    currentStage,
    targetTicker,
    rawContextData,
    activeView,
    setActiveView,
    isSettingsOpen,
    setIsSettingsOpen,
    isChatOpen,
    setIsChatOpen,
    isHistoryOpen,
    setIsHistoryOpen,
    historyList,
    isHistoryLoading,
    apiKeys,
    setApiKeys,
    handleStartAnalysis,
    handleClearAnalysis,
    handleSelectHistory,
    handleDeleteHistory
  };

  return isMobile ? <MobileApp {...sharedProps} /> : <DesktopApp {...sharedProps} />;
}

export default App;
