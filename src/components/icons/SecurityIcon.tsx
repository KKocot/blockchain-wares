interface SecurityIconProps {
  className?: string;
}

export function SecurityIcon({ className }: SecurityIconProps) {
  const create_shield = (cx: number, cy: number, w: number, h: number): string => {
    const hw = w / 2;
    const ty = cy - h * 0.42;
    const my = cy + h * 0.1;
    const by = cy + h * 0.42;
    return `M${cx} ${ty} L${cx + hw} ${ty + h * 0.15} L${cx + hw} ${my} C${cx + hw} ${my + h * 0.2}, ${cx} ${by}, ${cx} ${by} C${cx} ${by}, ${cx - hw} ${my + h * 0.2}, ${cx - hw} ${my} L${cx - hw} ${ty + h * 0.15} Z`;
  };

  // BIP44 derivation tree
  const tree_nodes = [
    { cx: 100, cy: 14, level: 0 },
    { cx: 30, cy: 38, level: 1 }, { cx: 170, cy: 38, level: 1 },
    { cx: 18, cy: 62, level: 2 }, { cx: 42, cy: 62, level: 2 },
    { cx: 158, cy: 62, level: 2 }, { cx: 182, cy: 62, level: 2 },
    { cx: 12, cy: 86, level: 3 }, { cx: 30, cy: 86, level: 3 }, { cx: 48, cy: 86, level: 3 },
    { cx: 152, cy: 86, level: 3 }, { cx: 170, cy: 86, level: 3 }, { cx: 188, cy: 86, level: 3 },
  ];

  const tree_edges = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6],
    [3, 7], [3, 8], [4, 8], [4, 9], [5, 10], [5, 11], [6, 11], [6, 12],
  ];

  const node_r = [6, 5, 4, 3.5];
  const node_o = [0.6, 0.45, 0.35, 0.25];

  const hash_blocks = [
    { x: 36, y: 122, w: 28, lines: 3 }, { x: 72, y: 126, w: 24, lines: 2 },
    { x: 104, y: 122, w: 28, lines: 3 }, { x: 140, y: 126, w: 24, lines: 2 },
  ];

  return (
    <svg className={className} viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sec-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sec-shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id="sec-key-glow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
        </radialGradient>
      </defs>

      <circle cx="100" cy="80" r="70" fill="url(#sec-glow)" className="security-glow" />

      {/* BIP44 Hierarchical Derivation Tree */}
      <g className="security-tree">
        {tree_edges.map(([f, t], i) => (
          <line key={`e-${i}`} x1={tree_nodes[f].cx} y1={tree_nodes[f].cy} x2={tree_nodes[t].cx} y2={tree_nodes[t].cy} stroke="currentColor" strokeWidth="1" strokeOpacity={0.2 - tree_nodes[t].level * 0.03} strokeLinecap="round" />
        ))}
        {tree_nodes.map((n, i) => {
          const r = node_r[n.level] ?? 3;
          const o = node_o[n.level] ?? 0.2;
          return (
            <g key={`n-${i}`} className={`security-node-${i}`}>
              <circle cx={n.cx} cy={n.cy} r={r + 3} fill="currentColor" fillOpacity={o * 0.15} stroke="currentColor" strokeWidth={n.level === 0 ? 1.5 : 1} strokeOpacity={o * 0.6} />
              <circle cx={n.cx} cy={n.cy} r={r * 0.5} fill="currentColor" fillOpacity={o} />
            </g>
          );
        })}
        <circle cx="100" cy="14" r="12" fill="currentColor" fillOpacity="0.05" className="security-root-glow" />
      </g>

      {/* Central Shield (3-layer) */}
      <g className="security-shield">
        <path d={create_shield(100, 104, 62, 60)} fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
        <path d={create_shield(100, 104, 52, 52)} fill="url(#sec-shield-grad)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d={create_shield(100, 104, 38, 40)} fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.5" strokeLinejoin="round" />
      </g>

      {/* Key inside shield */}
      <g className="security-key">
        <circle cx="100" cy="97" r="7" fill="url(#sec-key-glow)" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="100" cy="97" r="3" fill="currentColor" fillOpacity="0.5" />
        <line x1="100" y1="104" x2="100" y2="118" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6" />
        <line x1="100" y1="112" x2="105" y2="112" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
        <line x1="100" y1="116" x2="104" y2="116" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
        {/* Key emanating rays */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <line key={`r-${i}`} x1={100 + 10 * Math.cos(rad)} y1={97 + 10 * Math.sin(rad)} x2={100 + 14 * Math.cos(rad)} y2={97 + 14 * Math.sin(rad)} stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" strokeLinecap="round" />
          );
        })}
      </g>

      {/* Encrypted data blocks */}
      <g className="security-hashes">
        {hash_blocks.map((b, i) => (
          <g key={`h-${i}`} className={`security-hash-${i}`}>
            <rect x={b.x} y={b.y} width={b.w} height={14} rx="2" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />
            {Array.from({ length: b.lines }).map((_, li) => (
              <line key={`hl-${i}-${li}`} x1={b.x + 3} y1={b.y + 4 + li * 4} x2={b.x + b.w - 3 - (li % 2) * 6} y2={b.y + 4 + li * 4} stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" strokeLinecap="round" />
            ))}
          </g>
        ))}
        {hash_blocks.map((b, i) => (
          <line key={`hl-${i}`} x1="100" y1="120" x2={b.x + b.w / 2} y2={b.y} stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.12" strokeDasharray="2 3" />
        ))}
      </g>

    </svg>
  );
}
