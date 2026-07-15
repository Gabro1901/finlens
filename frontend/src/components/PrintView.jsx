import { useState, useEffect } from 'react';
import ReportViewer from './ReportViewer';

export default function PrintView() {
  const [markdown, setMarkdown] = useState('');
  const [ticker, setTicker] = useState('');

  useEffect(() => {
    // Playwright will inject the data and dispatch this event
    const handleReady = () => {
      setMarkdown(window.printMarkdown || '');
      setTicker(window.printTicker || '');
    };
    
    // It's possible the event fired before this component mounted
    if (window.printMarkdown) {
      handleReady();
    }
    
    window.addEventListener('printDataReady', handleReady);
    return () => window.removeEventListener('printDataReady', handleReady);
  }, []);

  if (!markdown) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <p className="text-zinc-500 font-data text-sm">Preparing document for print...</p>
      </div>
    );
  }

  return (
    // We use the same dark theme as the main app so the premium dark-mode styling 
    // of ReportViewer renders beautifully in the PDF without text disappearing.
    // The print-ready class acts as a signal for Playwright to take the snapshot.
    <div className="bg-zinc-950 text-zinc-300 min-h-screen w-full print-ready p-12">
      <div className="max-w-4xl mx-auto">
        <ReportViewer markdown={markdown} ticker={ticker} />
      </div>
    </div>
  );
}
