import { useState } from 'react';
import { Clock, FileText, ChevronRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HistoryView({ historyList, onSelectHistory, onDeleteHistory, isLoading }) {
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full px-5 md:px-8 lg:px-16 xl:px-24 pt-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-theme-accent/15 flex items-center justify-center border border-theme-accent/30">
          <Clock className="w-5 h-5 text-theme-accent" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-theme-accent">Analysis History</h2>
          <p className="text-sm text-zinc-400">Your past financial reports and raw data</p>
        </div>
      </div>
      
      {/* List */}
      <div className="flex-1 space-y-3">
        {isLoading ? (
          <div className="text-zinc-400 text-sm text-center py-12 font-medium">Loading history...</div>
        ) : historyList.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-800/50 flex items-center justify-center border border-zinc-700/30">
              <FileText className="w-5 h-5 text-zinc-500" />
            </div>
            <p className="text-zinc-500 text-sm font-medium">No past analyses</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {historyList.map((item, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={item.id}
                className="flex items-center p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-theme-accent/30 hover:bg-theme-bg/30 transition-all duration-200 group shadow-lg"
              >
                <button
                  onClick={() => onSelectHistory(item.id)}
                  className="flex-1 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-theme-bg flex items-center justify-center shrink-0 border border-theme-accent/30 group-hover:bg-theme-accent group-hover:text-theme-bg transition-colors">
                      <span className="text-sm font-data font-bold text-theme-accent group-hover:text-theme-bg">{item.ticker?.substring(0, 3)}</span>
                    </div>
                    <div>
                      <div className="font-bold text-theme-accent text-base font-data">{item.ticker}</div>
                      <div className="text-xs text-zinc-400 font-medium mt-1">
                        {new Date(item.date).toLocaleDateString()} · {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTargetId(item.id);
                  }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 ml-2"
                  title="Delete Report"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {deleteTargetId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-2">Delete Report?</h3>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                Are you sure you want to delete this analysis report from your history? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    onDeleteHistory(deleteTargetId, e);
                    setDeleteTargetId(null);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500/90 hover:bg-red-500 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
