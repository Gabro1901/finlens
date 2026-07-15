import { X, ExternalLink, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsModal({ isOpen, onClose, apiKeys, setApiKeys }) {
  const handleChange = (e) => {
    setApiKeys({ ...apiKeys, [e.target.name]: e.target.value });
  };

  const ApiField = ({ label, name, type = "password", placeholder = "", rateLimit, link, required }) => (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <label className="text-xs font-medium text-zinc-300">
          {label}
          {required && <span className="text-rose-400 ml-1">*</span>}
        </label>
        {link && (
          <div className="flex items-center gap-2 text-[10px] text-zinc-600">
            {rateLimit && <span>{rateLimit}</span>}
            <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-rose-400 transition-colors">
              Get Key <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        )}
      </div>
      <input 
        type={type} 
        name={name} 
        value={apiKeys[name] || ''} 
        onChange={handleChange} 
        placeholder={placeholder} 
        className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-lg text-sm text-white font-data placeholder-zinc-700 focus:outline-none focus:border-rose-500/50 transition-colors"
        id={`settings-${name}`}
      />
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/40 w-full max-w-lg flex flex-col max-h-[85vh] pointer-events-auto overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                    <Shield className="w-4.5 h-4.5 text-rose-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">API Configuration</h2>
                    <p className="text-[11px] text-zinc-500">Keys are stored locally in your browser</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all duration-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Body */}
              <div className="p-6 space-y-5 overflow-y-auto">
                {/* Primary section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Required</span>
                    <div className="flex-1 h-px bg-zinc-800" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">
                      OpenAI API Key <span className="text-rose-400 ml-1">*</span>
                    </label>
                    <input 
                      type="password" 
                      name="openai" 
                      value={apiKeys.openai || ''} 
                      onChange={handleChange} 
                      placeholder="sk-..." 
                      className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-lg text-sm text-white font-data placeholder-zinc-700 focus:outline-none focus:border-rose-500/50 transition-colors"
                      id="settings-openai"
                    />
                  </div>
                </div>

                {/* Optional section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Optional Data Sources</span>
                    <div className="flex-1 h-px bg-zinc-800" />
                  </div>
                  
                  <ApiField 
                    label="SEC EDGAR Identity (Email)" 
                    name="sec_email" 
                    type="email" 
                    placeholder="name@domain.com" 
                    rateLimit="10 req/sec" 
                    link="https://www.sec.gov/os/accessing-edgar-data" 
                  />
                  <ApiField 
                    label="FRED API Key" 
                    name="fred" 
                    rateLimit="120 req/min" 
                    link="https://fred.stlouisfed.org/docs/api/api_key.html" 
                  />
                  <ApiField 
                    label="Congress.gov API Key" 
                    name="congress" 
                    rateLimit="5,000 req/hour" 
                    link="https://api.congress.gov/" 
                  />
                </div>
              </div>
              
              {/* Footer */}
              <div className="px-6 py-4 border-t border-zinc-800/60 flex items-center justify-between">
                <p className="text-[10px] text-zinc-600">
                  Or configure in backend <code className="font-data text-zinc-500">.env</code> file
                </p>
                <button 
                  onClick={onClose} 
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-rose-500/15"
                  id="settings-done-button"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
