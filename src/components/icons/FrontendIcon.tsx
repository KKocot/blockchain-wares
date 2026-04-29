interface FrontendIconProps {
  className?: string;
}

export function FrontendIcon({ className }: FrontendIconProps) {
  const module_nodes = [
    { cx: 24, cy: 110 }, { cx: 60, cy: 140 }, { cx: 100, cy: 148 },
    { cx: 140, cy: 140 }, { cx: 176, cy: 110 },
  ];

  const link_targets = [
    { x: 52, y: 108 }, { x: 76, y: 108 }, { x: 100, y: 108 },
    { x: 124, y: 108 }, { x: 148, y: 108 },
  ];

  const comp_boxes = [
    { x: 48, y: 52, w: 104, h: 52, o: 0.06, rx: 4 },
    { x: 54, y: 58, w: 44, h: 40, o: 0.1, rx: 3 },
    { x: 104, y: 58, w: 42, h: 18, o: 0.12, rx: 3 },
    { x: 104, y: 80, w: 42, h: 18, o: 0.1, rx: 3 },
  ];

  const tree_lines = [
    { x1: 100, y1: 52, x2: 76, y2: 58 },
    { x1: 100, y1: 52, x2: 125, y2: 58 },
    { x1: 125, y1: 76, x2: 125, y2: 80 },
  ];

  return (
    <svg className={className} viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="fe-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fe-window-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="fe-node-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="80" r="70" fill="url(#fe-glow)" className="frontend-glow" />

      {/* Browser window frame */}
      <g className="frontend-window">
        <rect x="36" y="18" width="128" height="92" rx="6" fill="url(#fe-window-grad)" stroke="currentColor" strokeWidth="2" />
        <rect x="36" y="18" width="128" height="18" rx="6" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" />
        <circle cx="50" cy="27" r="3" fill="currentColor" fillOpacity="0.7" />
        <circle cx="62" cy="27" r="3" fill="currentColor" fillOpacity="0.5" />
        <circle cx="74" cy="27" r="3" fill="currentColor" fillOpacity="0.3" />
        <rect x="90" y="23" width="62" height="8" rx="4" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3" />
      </g>

      {/* Nested component boxes (React component tree) */}
      <g className="frontend-components">
        {comp_boxes.map((b, i) => (
          <rect key={`c-${i}`} x={b.x} y={b.y} width={b.w} height={b.h} rx={b.rx} fill="currentColor" fillOpacity={b.o} stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" className={`frontend-comp-${i}`} />
        ))}
        {tree_lines.map((l, i) => (
          <line key={`tl-${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="2 2" />
        ))}
        {/* Left box content lines */}
        {[64, 71, 78, 85].map((y, i) => (
          <line key={`ll-${i}`} x1="60" y1={y} x2={76 - (i % 2) * 8} y2={y} stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" strokeLinecap="round" />
        ))}
        {/* Top right box content */}
        {[64, 70].map((y, i) => (
          <line key={`tr-${i}`} x1="110" y1={y} x2={132 - i * 6} y2={y} stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" strokeLinecap="round" />
        ))}
        {/* Bottom right box content */}
        {[86, 92].map((y, i) => (
          <line key={`br-${i}`} x1="110" y1={y} x2={128 - i * 4} y2={y} stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" strokeLinecap="round" />
        ))}
        {/* Props flow dots */}
        <path d="M98 55 L76 58" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.35" />
        <circle cx="76" cy="58" r="1.5" fill="currentColor" fillOpacity="0.5" />
        <circle cx="125" cy="58" r="1.5" fill="currentColor" fillOpacity="0.5" />
      </g>

      {/* Dependency links from window to package nodes */}
      <g className="frontend-links">
        {module_nodes.map((n, i) => (
          <line key={`lk-${i}`} x1={link_targets[i].x} y1={link_targets[i].y} x2={n.cx} y2={n.cy} stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" strokeDasharray="4 3" strokeLinecap="round" className={`frontend-link-${i}`} />
        ))}
        {[{ f: 0, t: 1 }, { f: 1, t: 2 }, { f: 2, t: 3 }, { f: 3, t: 4 }].map(({ f, t }, i) => (
          <line key={`in-${i}`} x1={module_nodes[f].cx} y1={module_nodes[f].cy} x2={module_nodes[t].cx} y2={module_nodes[t].cy} stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" strokeLinecap="round" />
        ))}
      </g>

      {/* Package/module nodes (monorepo packages) */}
      <g className="frontend-nodes">
        {module_nodes.map((n, i) => (
          <g key={`nd-${i}`} className={`frontend-node-${i}`}>
            <circle cx={n.cx} cy={n.cy} r="12" fill="url(#fe-node-grad)" stroke="currentColor" strokeWidth="1.5" />
            <circle cx={n.cx} cy={n.cy} r="7" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
            <circle cx={n.cx} cy={n.cy} r="3" fill="currentColor" fillOpacity="0.6" />
          </g>
        ))}
      </g>

    </svg>
  );
}
