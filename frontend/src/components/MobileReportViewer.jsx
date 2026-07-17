import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import FinChart from './FinChart';
import { ArrowLeft, List, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { generateIdFromChildren, useHeadings } from '../utils/toc';

// ── Native Mobile Custom Renderers ──────────────────────────────────────────

const mobileRenderers = {
  code({ node, inline, className, children, ...props }) {
    const lang = (className || '').replace('language-', '').trim();
    const raw = String(children).trim();

    if (lang === 'chart') {
      return (
        <div className="my-6 -mx-6 px-6 overflow-x-auto snap-x no-scrollbar">
          <div className="min-w-[300px] bg-zinc-900/80 p-4 rounded-3xl border border-zinc-800/60 shadow-xl">
             <FinChart spec={raw} />
          </div>
        </div>
      );
    }
    
    if (lang === 'json') {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.title && parsed.series) {
          return (
            <div className="my-6 -mx-6 px-6 overflow-x-auto snap-x no-scrollbar">
              <div className="min-w-[300px] bg-zinc-900/80 p-4 rounded-3xl border border-zinc-800/60 shadow-xl">
                 <FinChart spec={raw} />
              </div>
            </div>
          );
        }
      } catch (e) {}
    }
    
    return (
      <code className="bg-zinc-800 text-rose-300 px-1.5 py-0.5 rounded-md text-[13px] font-data" {...props}>
        {children}
      </code>
    );
  },

  // Swipeable native cards for tables
  table({ children }) {
    return (
      <div className="my-8 -mx-6 px-6 overflow-x-auto snap-x pb-4" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        <div className="min-w-max bg-zinc-900/90 rounded-[2rem] border border-zinc-800/60 shadow-2xl p-2 snap-center">
          <table className="w-full text-[15px]">{children}</table>
        </div>
      </div>
    );
  },
  thead({ children }) {
    return <thead className="bg-zinc-800/50 rounded-xl">{children}</thead>;
  },
  tbody({ children }) {
    return <tbody className="divide-y divide-zinc-800/40">{children}</tbody>;
  },
  tr({ children, ...props }) {
    return <tr className="transition-colors duration-150" {...props}>{children}</tr>;
  },
  th({ children }) {
    return (
      <th className="px-5 py-4 text-left text-[13px] font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap font-data first:rounded-tl-xl last:rounded-tr-xl">
        {children}
      </th>
    );
  },
  td({ children }) {
    return (
      <td className="px-5 py-4 text-zinc-200 font-medium whitespace-nowrap text-[15px]">{children}</td>
    );
  },

  // Headings
  h1({ children }) {
    const id = generateIdFromChildren(children);
    return (
      <h1 id={id} className="text-[28px] font-bold text-white mt-12 mb-6 pb-6 border-b border-zinc-800/80 leading-tight scroll-mt-24">
        {children}
      </h1>
    );
  },
  // Section Headers
  h2({ children }) {
    const id = generateIdFromChildren(children);
    return (
      <h2 id={id} className="text-[22px] font-bold text-white mt-12 mb-5 flex items-center gap-3 scroll-mt-24">
        <span className="inline-block w-1.5 h-6 rounded-full bg-rose-500 flex-shrink-0 shadow-[0_0_12px_rgba(244,63,94,0.6)]" />
        {children}
      </h2>
    );
  },
  h3({ children }) {
    const id = generateIdFromChildren(children);
    return (
      <h3 id={id} className="text-base font-bold text-rose-400 mt-8 mb-3 uppercase tracking-widest scroll-mt-24">
        {children}
      </h3>
    );
  },

  // Paragraphs — larger, easier to read on mobile
  p({ children }) {
    return <p className="text-zinc-300 leading-relaxed mb-5 text-[16px]">{children}</p>;
  },

  // Lists
  ul({ children }) {
    return <ul className="space-y-3 my-5 ml-1">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="space-y-3 my-5 ml-4 list-decimal marker:text-zinc-500 text-[16px]">{children}</ol>;
  },
  li({ children }) {
    return (
      <li className="text-zinc-300 text-[16px] leading-relaxed flex items-start gap-3">
        <span className="mt-[10px] w-2 h-2 rounded-full bg-rose-500/80 flex-shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
        <span className="flex-1">{children}</span>
      </li>
    );
  },

  hr() {
    return <hr className="my-12 border-zinc-800/60" />;
  },

  // Blockquotes -> TL;DR / Executive Summary Cards
  blockquote({ children }) {
    return (
      <div className="my-10 border border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-transparent rounded-[2rem] p-6 shadow-lg shadow-rose-900/10">
        <div className="text-white [&_p]:text-white [&_p]:!mb-0 [&_strong]:text-rose-200 text-[16px] font-medium leading-relaxed">
          {children}
        </div>
      </div>
    );
  },
};

const fixMalformedTables = (markdown) => {
  if (!markdown) return markdown;
  const lines = markdown.split('\n');
  for (let i = 1; i < lines.length; i++) {
    const current = lines[i].trim();
    if (/^[\|\-\:\s]+$/.test(current) && current.includes('-') && current.includes('|')) {
      const prev = lines[i - 1].trim();
      if (prev.includes('|')) {
        const prevParts = prev.split('|');
        const currParts = current.split('|');
        if (prevParts.length !== currParts.length) {
          lines[i] = prevParts.map((part, index) => {
            if (part.trim() === '' && (index === 0 || index === prevParts.length - 1)) return '';
            return '---';
          }).join('|');
        }
      }
    }
  }
  return lines.join('\n');
};

const fixMissingHeadings = (markdown) => {
  if (!markdown) return markdown;
  // Fallback to convert "1. SECTOR DYNAMICS..." to "## 1. SECTOR DYNAMICS..."
  return markdown.replace(/^([0-9]\.\s+[A-Z][A-Z0-9\s&:,\\'\-]+(?:\(MUST BE PRESENTED FIRST\))?)\s*$/gm, '## $1');
};

export default function MobileReportViewer({ markdown, ticker, onClear }) {
  const fixedMarkdown = fixMissingHeadings(markdown);
  const headings = useHeadings(fixedMarkdown).filter(h => /^\d+\./.test(h.text));
  const [activeId, setActiveId] = useState('');
  const [isTocOpen, setIsTocOpen] = useState(false);

  // Scroll spy logic
  useEffect(() => {
    if (!headings.length) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );

    const timeoutId = setTimeout(() => {
      headings.forEach((h) => {
        const el = document.getElementById(h.id);
        if (el) observer.observe(el);
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [headings, markdown]);

  if (!markdown) return null;

  return (
    <div className="w-full bg-zinc-950 pb-8">
      {/* ── Native Sticky Top Bar ── */}
      <div className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-2xl border-b border-zinc-800/50 px-4 py-3 flex items-center justify-between pt-safe-top h-[60px]">
        <button 
          onClick={onClear}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[13px] font-data font-bold tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.15)] truncate max-w-[200px]">
          {ticker}
        </div>
        {headings.length > 0 ? (
          <button 
            onClick={() => setIsTocOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white active:scale-95 transition-all"
          >
            <List className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}
      </div>

      {/* ── Report Body ── */}
      <div className="px-6 w-full pt-4 max-w-[600px] mx-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mobileRenderers}>
          {fixMalformedTables(fixedMarkdown)}
        </ReactMarkdown>
      </div>

      {/* ── Mobile TOC Bottom Sheet ── */}
      <AnimatePresence>
        {isTocOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTocOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-zinc-900 border-t border-zinc-800/80 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-[60] flex flex-col"
            >
              <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-zinc-800/50">
                <h3 className="text-lg font-bold text-white">Table of Contents</h3>
                <button 
                  onClick={() => setIsTocOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white active:scale-95 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar pb-safe-bottom">
                <nav className="space-y-3 flex flex-col relative before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-zinc-800/60 pb-8">
                  {headings.map((heading, i) => (
                    <button
                      key={`${heading.id}-${i}`}
                      onClick={() => {
                        const target = document.getElementById(heading.id);
                        if (target) {
                          setTimeout(() => {
                            target.scrollIntoView({ behavior: 'smooth' });
                          }, 50);
                        }
                        setActiveId(heading.id);
                        setIsTocOpen(false);
                      }}
                      className={`
                        text-left text-[15px] leading-relaxed transition-all pl-4 relative border-l-2 py-1
                        ${heading.level === 1 ? 'font-semibold mt-2' : heading.level === 2 ? 'ml-0' : 'ml-4'}
                        ${activeId === heading.id 
                          ? 'text-rose-400 border-rose-500' 
                          : 'text-zinc-400 hover:text-zinc-200 border-transparent'
                        }
                      `}
                    >
                      {heading.text}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
