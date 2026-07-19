import { X, ExternalLink, Shield, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, THEME_PRESETS } from '../contexts/ThemeContext';

export default function SettingsModal({ isOpen, onClose, apiKeys, setApiKeys }) {
  const { theme, setTheme } = useTheme();

  const handleChange = (e) => {
    setApiKeys({ ...apiKeys, [e.target.name]: e.target.value });
  };

  const ApiField = ({ label, name, type = "password", placeholder = "", rateLimit, link, required }) => (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <label className="text-xs font-medium text-zinc-300">
          {label}
          {required && <span className="text-theme-accent ml-1">*</span>}
        </label>
        {link && (
          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            {rateLimit && <span>{rateLimit}</span>}
            <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-theme-accent transition-colors">
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
        className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-lg text-sm text-theme-accent font-data placeholder-zinc-700 focus:outline-none focus:border-theme-accent/50 transition-colors"
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
                  <div className="w-9 h-9 rounded-xl bg-theme-accent/15 flex items-center justify-center border border-theme-accent/30">
                    <Shield className="w-4.5 h-4.5 text-theme-accent" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-theme-accent">Settings</h2>
                    <p className="text-[11px] text-zinc-400">Configure your workspace and keys</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-all duration-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Body */}
              <div className="p-6 space-y-8 overflow-y-auto">
                {/* Theme Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Palette className="w-3.5 h-3.5 text-theme-accent" />
                    <span className="text-[10px] font-bold text-theme-accent uppercase tracking-widest">Appearance</span>
                    <div className="flex-1 h-px bg-zinc-800" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {THEME_PRESETS.map((preset) => {
                      const isActive = theme.bg === preset.bg && theme.accent === preset.accent;
                      return (
                        <button
                          key={preset.name}
                          onClick={() => setTheme({ bg: preset.bg, accent: preset.accent })}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            isActive ? 'border-theme-accent bg-theme-accent/10 shadow-md shadow-theme-accent/10' : 'border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900'
                          }`}
                        >
                          <span className="text-sm font-medium text-zinc-200">{preset.name}</span>
                          <div className="flex -space-x-1">
                            <div className="w-5 h-5 rounded-full border border-zinc-700" style={{ backgroundColor: preset.bg }} />
                            <div className="w-5 h-5 rounded-full border border-zinc-700" style={{ backgroundColor: preset.accent }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-xs font-medium text-zinc-300">Custom Background</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={theme.bg}
                          onChange={(e) => setTheme({ ...theme, bg: e.target.value })}
                          className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                        />
                        <code className="text-xs text-zinc-400 font-data">{theme.bg.toUpperCase()}</code>
                      </div>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="text-xs font-medium text-zinc-300">Custom Accent</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={theme.accent}
                          onChange={(e) => setTheme({ ...theme, accent: e.target.value })}
                          className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                        />
                        <code className="text-xs text-zinc-400 font-data">{theme.accent.toUpperCase()}</code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary API section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Required APIs</span>
                    <div className="flex-1 h-px bg-zinc-800" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">
                      OpenAI API Key <span className="text-theme-accent ml-1">*</span>
                    </label>
                    <input 
                      type="password" 
                      name="openai" 
                      value={apiKeys.openai || ''} 
                      onChange={handleChange} 
                      placeholder="sk-..." 
                      className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-lg text-sm text-theme-accent font-data placeholder-zinc-700 focus:outline-none focus:border-theme-accent/50 transition-colors"
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
                <p className="text-[10px] text-zinc-500">
                  Or configure in backend <code className="font-data text-zinc-400">.env</code> file
                </p>
                <button 
                  onClick={onClose} 
                  className="px-5 py-2 bg-theme-accent hover:opacity-90 text-theme-bg text-sm font-bold rounded-lg transition-colors shadow-lg shadow-theme-accent/10"
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
