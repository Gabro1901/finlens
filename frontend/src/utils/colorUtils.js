export function hexToHSL(hex) {
  // Remove #
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  let r = parseInt(hex.slice(0, 2), 16) / 255;
  let g = parseInt(hex.slice(2, 4), 16) / 255;
  let b = parseInt(hex.slice(4, 6), 16) / 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; 
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function HSLToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function generatePalette(bgHex, accentHex) {
  const bgHSL = hexToHSL(bgHex);
  const accentHSL = hexToHSL(accentHex);
  
  const isLight = bgHSL.l > 60;
  
  const vars = {};
  
  // Background Palette (zinc 950 -> 600)
  if (isLight) {
    // 950 is the base. 900 is lighter (closer to white). 800 is even lighter.
    vars['--dyn-zinc-950'] = bgHex;
    vars['--dyn-zinc-900'] = HSLToHex(bgHSL.h, bgHSL.s, Math.min(100, bgHSL.l + (100 - bgHSL.l) * 0.4));
    vars['--dyn-zinc-800'] = HSLToHex(bgHSL.h, bgHSL.s, Math.min(100, bgHSL.l + (100 - bgHSL.l) * 0.7));
    vars['--dyn-zinc-700'] = HSLToHex(bgHSL.h, bgHSL.s, Math.min(100, bgHSL.l + (100 - bgHSL.l) * 0.85));
    vars['--dyn-zinc-600'] = HSLToHex(bgHSL.h, bgHSL.s, Math.min(100, bgHSL.l + (100 - bgHSL.l) * 0.95));
  } else {
    // 950 is the base. 900 is slightly lighter. 800 is lighter.
    vars['--dyn-zinc-950'] = bgHex;
    vars['--dyn-zinc-900'] = HSLToHex(bgHSL.h, bgHSL.s, Math.min(100, bgHSL.l + 5));
    vars['--dyn-zinc-800'] = HSLToHex(bgHSL.h, bgHSL.s, Math.min(100, bgHSL.l + 12));
    vars['--dyn-zinc-700'] = HSLToHex(bgHSL.h, bgHSL.s, Math.min(100, bgHSL.l + 20));
    vars['--dyn-zinc-600'] = HSLToHex(bgHSL.h, bgHSL.s, Math.min(100, bgHSL.l + 30));
  }

  // Text / Accent Palette (zinc 500 -> 50)
  // Ensure contrast for text colors so they remain legible against the background
  let textBaseL = accentHSL.l;
  if (isLight) {
     // Background is light. Text must be dark!
     if (textBaseL > 40) textBaseL = 20; // force dark
     vars['--dyn-zinc-500'] = HSLToHex(accentHSL.h, accentHSL.s, Math.max(0, textBaseL + 30));
     vars['--dyn-zinc-400'] = HSLToHex(accentHSL.h, accentHSL.s, Math.max(0, textBaseL + 20));
     vars['--dyn-zinc-300'] = HSLToHex(accentHSL.h, accentHSL.s, Math.max(0, textBaseL + 10));
     vars['--dyn-zinc-200'] = HSLToHex(accentHSL.h, accentHSL.s, textBaseL);
     vars['--dyn-zinc-100'] = HSLToHex(accentHSL.h, accentHSL.s, Math.max(0, textBaseL - 10));
     vars['--dyn-zinc-50']  = HSLToHex(accentHSL.h, accentHSL.s, Math.max(0, textBaseL - 15));
  } else {
     // Background is dark. Text must be light!
     if (textBaseL < 60) textBaseL = 85; // force light
     vars['--dyn-zinc-500'] = HSLToHex(accentHSL.h, accentHSL.s, Math.min(100, textBaseL - 30));
     vars['--dyn-zinc-400'] = HSLToHex(accentHSL.h, accentHSL.s, Math.min(100, textBaseL - 15));
     vars['--dyn-zinc-300'] = HSLToHex(accentHSL.h, accentHSL.s, textBaseL);
     vars['--dyn-zinc-200'] = HSLToHex(accentHSL.h, accentHSL.s, Math.min(100, textBaseL + 5));
     vars['--dyn-zinc-100'] = HSLToHex(accentHSL.h, accentHSL.s, Math.min(100, textBaseL + 10));
     vars['--dyn-zinc-50']  = HSLToHex(accentHSL.h, accentHSL.s, Math.min(100, textBaseL + 15));
  }
  
  // Base theme definitions to fall back on if needed
  vars['--theme-bg'] = bgHex;
  vars['--theme-accent'] = accentHex;
  vars['--theme-surface'] = vars['--dyn-zinc-900'];
  vars['--theme-border'] = vars['--dyn-zinc-800'];
  vars['--theme-text'] = vars['--dyn-zinc-100'];
  vars['--theme-text-muted'] = vars['--dyn-zinc-400'];

  return vars;
}
