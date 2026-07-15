import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';

const STAGES = [
  { id: 'init', label: 'Initializing', sublabel: 'Setting up pipeline' },
  { id: 'collection', label: 'Data Collection', sublabel: 'Fetching market data & filings' },
  { id: 'normalization', label: 'Normalizing', sublabel: 'Accounting adjustments' },
  { id: 'context', label: 'Context Assembly', sublabel: 'Building intelligence context' },
  { id: 'generation', label: 'AI Generation', sublabel: 'Writing analysis report' },
  { id: 'complete', label: 'Complete', sublabel: 'Analysis ready' },
];

export default function AnalysisOverlay({ currentStage, ticker }) {
  if (!currentStage || currentStage === 'complete' || currentStage === 'error') return null;

  const currentIndex = STAGES.findIndex(s => s.id === currentStage);
  const currentStageData = STAGES[currentIndex] || STAGES[0];
  const progress = currentIndex >= 0 ? ((currentIndex + 0.5) / STAGES.length) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-30 flex items-center justify-center"
        style={{ left: 'var(--sidebar-width)' }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-[#09090b]/90 backdrop-blur-sm" />
        
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]">
            <div className="absolute inset-0 rounded-full bg-rose-600/8 animate-pulse-glow" />
            <div className="w-3 h-3 rounded-full bg-rose-400/40 animate-orbit absolute top-1/2 left-1/2" />
            <div className="w-2 h-2 rounded-full bg-red-400/30 animate-orbit-reverse absolute top-1/2 left-1/2" />
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400/20" style={{ 
              position: 'absolute', top: '50%', left: '50%',
              animation: 'orbit 12s linear infinite reverse' 
            }} />
          </div>
        </div>

        {/* Center content */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="relative z-10 flex flex-col items-center gap-8 max-w-sm text-center"
        >
          {/* Progress ring */}
          <div className="relative w-28 h-28">
            {/* Track */}
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
              <circle
                cx="56" cy="56" r="48"
                fill="none"
                stroke="rgba(63,63,70,0.3)"
                strokeWidth="4"
              />
              <motion.circle
                cx="56" cy="56" r="48"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 48}
                initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - progress / 100) }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#fb7185" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-rose-400 animate-spin" strokeWidth={1.5} />
            </div>
          </div>

          {/* Ticker badge */}
          {ticker && (
            <div className="px-4 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700/50 text-zinc-300 text-sm font-data font-semibold tracking-wider">
              {ticker}
            </div>
          )}

          {/* Stage info */}
          <div className="space-y-2">
            <motion.h2
              key={currentStageData.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-white"
            >
              {currentStageData.label}
            </motion.h2>
            <motion.p
              key={currentStageData.id + '-sub'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-zinc-500"
            >
              {currentStageData.sublabel}
            </motion.p>
          </div>

          {/* Stage dots */}
          <div className="flex items-center gap-2">
            {STAGES.slice(0, -1).map((stage, idx) => {
              const isCompleted = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <motion.div
                  key={stage.id}
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.3 : 1,
                    backgroundColor: isCompleted ? '#f43f5e' : isCurrent ? '#fda4af' : '#3f3f46',
                  }}
                  className="w-2 h-2 rounded-full"
                  style={{
                    boxShadow: isCurrent ? '0 0 10px rgba(253,164,175,0.5)' : 'none'
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
