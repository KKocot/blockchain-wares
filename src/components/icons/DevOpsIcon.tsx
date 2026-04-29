interface DevOpsIconProps {
  className?: string;
}

export function DevOpsIcon({ className }: DevOpsIconProps) {
  const create_infinity = (cx: number, cy: number, rx: number, ry: number): string => {
    const lx = cx - rx;
    const rxx = cx + rx;
    return [
      `M${cx},${cy}`,
      `C${cx + rx * 0.4},${cy - ry * 1.2} ${rxx},${cy - ry} ${rxx},${cy}`,
      `C${rxx},${cy + ry} ${cx + rx * 0.4},${cy + ry * 1.2} ${cx},${cy}`,
      `C${cx - rx * 0.4},${cy - ry * 1.2} ${lx},${cy - ry} ${lx},${cy}`,
      `C${lx},${cy + ry} ${cx - rx * 0.4},${cy + ry * 1.2} ${cx},${cy}`,
    ].join(" ");
  };

  const cx = 100, cy = 68, rx = 52, ry = 22;
  const stages = [
    { x: cx + rx, y: cy, l: "deploy" },
    { x: cx + rx * 0.35, y: cy - ry * 0.95, l: "test" },
    { x: cx - rx * 0.35, y: cy - ry * 0.95, l: "build" },
    { x: cx - rx, y: cy, l: "code" },
    { x: cx - rx * 0.35, y: cy + ry * 0.95, l: "plan" },
    { x: cx + rx * 0.35, y: cy + ry * 0.95, l: "monitor" },
  ];

  const containers = [
    { x: 30, y: 118, w: 38, h: 28 },
    { x: 81, y: 118, w: 38, h: 28 },
    { x: 132, y: 118, w: 38, h: 28 },
  ];

  const layer_offsets = (bx: number, by: number, w: number) => [
    { x: bx + 3, y: by + 4, w: w - 6, h: 6, o: 0.2 },
    { x: bx + 3, y: by + 12, w: w - 6, h: 5, o: 0.15 },
    { x: bx + 3, y: by + 19, w: w - 6, h: 5, o: 0.1 },
  ];

  const flow_curves = [
    { f: 0, t: 1, c: -8 }, { f: 1, t: 2, c: -4 }, { f: 2, t: 3, c: -8 },
    { f: 3, t: 4, c: 8 }, { f: 4, t: 5, c: 4 }, { f: 5, t: 0, c: 8 },
  ];

  return (
    <svg className={className} viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="devops-glow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="devops-loop-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="devops-ctn-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="75" r="70" fill="url(#devops-glow)" className="devops-glow" />

      {/* Cloud symbol */}
      <g className="devops-cloud">
        <path d="M72 18 C72 10, 82 6, 90 10 C94 4, 106 4, 110 10 C118 6, 128 10, 128 18 C134 18, 134 28, 128 28 L72 28 C66 28, 66 18, 72 18 Z" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.35" />
        <ellipse cx="100" cy="18" rx="20" ry="6" fill="currentColor" fillOpacity="0.05" />
        <line x1="100" y1="28" x2="100" y2="46" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.2" strokeDasharray="3 3" strokeLinecap="round" />
      </g>

      {/* Infinity / Mobius loop */}
      <g className="devops-loop">
        <path d={create_infinity(100, 68, 52, 22)} stroke="currentColor" strokeWidth="8" strokeOpacity="0.05" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={create_infinity(100, 68, 52, 22)} stroke="url(#devops-loop-grad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={create_infinity(100, 68, 52, 22)} stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      {/* Stage nodes on infinity loop */}
      <g className="devops-stages">
        {stages.map((s, i) => (
          <g key={`s-${i}`} className={`devops-stage-${i}`}>
            <circle cx={s.x} cy={s.y} r="9" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
            <circle cx={s.x} cy={s.y} r="5" fill="currentColor" fillOpacity={0.15 + i * 0.04} />
            <circle cx={s.x} cy={s.y} r="2" fill="currentColor" fillOpacity="0.6" />
          </g>
        ))}
        {flow_curves.map(({ f, t, c }, i) => {
          const s = stages[f], e = stages[t];
          return (
            <path key={`a-${i}`} d={`M${s.x} ${s.y} Q${(s.x + e.x) / 2} ${(s.y + e.y) / 2 + c} ${e.x} ${e.y}`} fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.12" strokeDasharray="2 2" />
          );
        })}
      </g>

      {/* Deploy arrows from loop to containers */}
      <g className="devops-deploy-arrows">
        {containers.map((c, i) => {
          const tx = c.x + c.w / 2;
          return (
            <g key={`dp-${i}`}>
              <line x1={tx} y1="90" x2={tx} y2={c.y} stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.2" strokeDasharray="4 3" strokeLinecap="round" />
              <path d={`M${tx - 4} ${c.y - 4} L${tx} ${c.y} L${tx + 4} ${c.y - 4}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}
      </g>

      {/* Docker containers */}
      <g className="devops-containers">
        {containers.map((c, i) => (
          <g key={`ct-${i}`} className={`devops-container-${i}`}>
            <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="4" fill="url(#devops-ctn-grad)" stroke="currentColor" strokeWidth="1.5" />
            {layer_offsets(c.x, c.y, c.w).map((l, li) => (
              <rect key={`ly-${i}-${li}`} x={l.x} y={l.y} width={l.w} height={l.h} rx="1.5" fill="currentColor" fillOpacity={l.o} stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.15" />
            ))}
            <circle cx={c.x + c.w - 8} cy={c.y + 7} r="2.5" fill="currentColor" fillOpacity="0.5" />
          </g>
        ))}
      </g>

    </svg>
  );
}
