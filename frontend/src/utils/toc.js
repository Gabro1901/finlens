import React from 'react';
import { useState, useEffect } from 'react';

/**
 * Generates an ID from React component children to match the manual markdown extractor.
 */
export function generateIdFromChildren(children) {
  const getText = (node) => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(getText).join('');
    if (React.isValidElement(node) && node.props && node.props.children) {
      return getText(node.props.children);
    }
    return '';
  };
  
  const text = getText(children);
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Custom hook to extract headings from markdown string.
 */
export function useHeadings(markdown) {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    if (!markdown) {
      setHeadings([]);
      return;
    }
    
    const extracted = [];
    const lines = markdown.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('#')) {
        const match = trimmedLine.match(/^(#{1,3})\s+(.+)$/);
        if (match) {
          const level = match[1].length;
          const text = match[2].trim();
          const plainText = text.replace(/[\*_~`\[\]]/g, '').trim();
          const id = plainText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          extracted.push({ id, text: plainText, level });
        }
      }
    }
    
    setHeadings(extracted);
  }, [markdown]);

  return headings;
}
