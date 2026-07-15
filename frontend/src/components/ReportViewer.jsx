import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import FinChart from './FinChart';

// ── Premium custom renderers ────────────────────────────────────────────────

const renderers = {
  // Code blocks: intercept ```chart or ```json blocks if they are charts
  code({ node, inline, className, children, ...props }) {
    const lang = (className || '').replace('language-', '').trim();
    const raw = String(children).trim();

    if (lang === 'chart') {
      return <FinChart spec={raw} />;
    }
    
    if (lang === 'json') {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.title && parsed.series) {
          return <FinChart spec={raw} />;
        }
      } catch (e) {
        // Ignore JSON parse errors, just render as normal json
      }
    }
    // Normal code blocks
    return (
      <code className="bg-zinc-800/80 text-rose-300 px-1.5 py-0.5 rounded text-sm font-data" {...props}>
        {children}
      </code>
    );
  },

  // Premium table
  table({ children }) {
    return (
      <div className="my-6 overflow-x-auto rounded-xl border border-zinc-800/60 shadow-lg break-inside-avoid">
        <table className="w-full text-sm">{children}</table>
      </div>
    );
  },
  thead({ children }) {
    return <thead className="bg-zinc-900/80">{children}</thead>;
  },
  tbody({ children }) {
    return <tbody className="divide-y divide-zinc-800/50">{children}</tbody>;
  },
  tr({ children, ...props }) {
    return (
      <tr className="hover:bg-zinc-800/30 transition-colors duration-150" {...props}>
        {children}
      </tr>
    );
  },
  th({ children }) {
    return (
      <th className="px-4 py-3 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap font-data">
        {children}
      </th>
    );
  },
  td({ children }) {
    return (
      <td className="px-4 py-3 text-zinc-300 font-medium whitespace-nowrap text-[13px]">{children}</td>
    );
  },

  // Headings with accent indicators
  h1({ children }) {
    return (
      <h1 className="text-2xl font-bold text-white mt-10 mb-5 pb-4 border-b border-zinc-800/60">
        {children}
      </h1>
    );
  },
  h2({ children }) {
    return (
      <h2 className="text-lg font-semibold text-white mt-10 mb-3 flex items-center gap-3">
        <span className="inline-block w-1 h-5 rounded-full bg-rose-500 flex-shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
        {children}
      </h2>
    );
  },
  h3({ children }) {
    return (
      <h3 className="text-sm font-semibold text-rose-300 mt-6 mb-2 uppercase tracking-wide">
        {children}
      </h3>
    );
  },
  h4({ children }) {
    return (
      <h4 className="text-sm font-semibold text-zinc-200 mt-5 mb-2">
        {children}
      </h4>
    );
  },

  // Paragraphs
  p({ children }) {
    return <p className="text-zinc-300 leading-relaxed mb-4 text-[14.5px]">{children}</p>;
  },

  // Lists
  ul({ children }) {
    return <ul className="space-y-1.5 my-3 ml-1">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="space-y-1.5 my-3 ml-4 list-decimal marker:text-zinc-600">{children}</ol>;
  },
  li({ children }) {
    return (
      <li className="text-zinc-300 text-[14.5px] leading-relaxed flex items-start gap-2.5">
        <span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-rose-500/60 flex-shrink-0" />
        <span className="flex-1">{children}</span>
      </li>
    );
  },

  // Horizontal rules — section dividers
  hr() {
    return <hr className="my-10 border-zinc-800/50" />;
  },

  // Bold
  strong({ children }) {
    return <strong className="text-white font-semibold">{children}</strong>;
  },

  // Emphasis
  em({ children }) {
    return <em className="text-zinc-200 italic">{children}</em>;
  },

  // Links
  a({ children, href }) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:text-rose-300 underline decoration-rose-500/30 hover:decoration-rose-400/60 transition-colors">
        {children}
      </a>
    );
  },

  // Blockquotes — used for KEY TAKEAWAY / callout boxes
  blockquote({ children }) {
    return (
      <div className="my-8 border-l-[3px] border-rose-500 bg-rose-500/[0.06] rounded-r-xl px-6 py-5 break-inside-avoid">
        <div className="text-rose-100 [&_p]:text-rose-100 [&_p]:!mb-0 [&_strong]:text-white [&_strong]:tracking-wide text-[14.5px]">
          {children}
        </div>
      </div>
    );
  },

  pre({ children }) {
    return (
      <pre className="bg-zinc-900/80 border border-zinc-800/50 rounded-xl p-5 overflow-x-auto my-4 text-sm font-data break-inside-avoid">
        {children}
      </pre>
    );
  },
};

// ── Main component ──────────────────────────────────────────────────────────

const fixMalformedTables = (markdown) => {
  if (!markdown) return markdown;
  const lines = markdown.split('\n');
  for (let i = 1; i < lines.length; i++) {
    const current = lines[i].trim();
    // Check if current line looks like a markdown table delimiter row
    if (/^[\|\-\:\s]+$/.test(current) && current.includes('-') && current.includes('|')) {
      const prev = lines[i - 1].trim();
      if (prev.includes('|')) {
        const prevParts = prev.split('|');
        const currParts = current.split('|');
        // Only fix if the number of pipes doesn't match
        if (prevParts.length !== currParts.length) {
          lines[i] = prevParts.map((part, index) => {
            if (part.trim() === '' && (index === 0 || index === prevParts.length - 1)) {
              return '';
            }
            return '---';
          }).join('|');
        }
      }
    }
  }
  return lines.join('\n');
};

export default function ReportViewer({ markdown, ticker }) {
  if (!markdown) return null;

  return (
    <div className="w-full">
      {/* Report header */}
      {ticker && (
        <div className="px-8 lg:px-16 xl:px-24 pt-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-data font-bold tracking-wider">
              {ticker}
            </span>
            <span className="text-zinc-600 text-xs">AI Analysis Report</span>
          </div>
        </div>
      )}

      {/* Report body — full-bleed with generous padding */}
      <div className="px-8 lg:px-16 xl:px-24 pb-16 w-full">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={renderers}>
          {fixMalformedTables(markdown)}
        </ReactMarkdown>
      </div>
    </div>
  );
}
