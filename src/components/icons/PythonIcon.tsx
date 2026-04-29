interface PythonIconProps {
  className?: string;
}

export function PythonIcon({ className }: PythonIconProps) {
  const create_snake_curve = (sx: number, sy: number, s: number, flip: boolean): string => {
    const d = flip ? -1 : 1;
    return [
      `M${sx},${sy}`,
      `C${sx + 18 * s * d},${sy - 8 * s} ${sx + 22 * s * d},${sy - 24 * s} ${sx},${sy - 28 * s}`,
      `C${sx - 18 * s * d},${sy - 32 * s} ${sx - 22 * s * d},${sy - 48 * s} ${sx},${sy - 52 * s}`,
    ].join(" ");
  };

  const create_gear_path = (cx: number, cy: number, ir: number, or: number, teeth: number): string => {
    const pts: string[] = [];
    const ta = (2 * Math.PI) / teeth;
    const h = ta / 4;
    for (let i = 0; i < teeth; i++) {
      const a = i * ta;
      pts.push(`${cx + ir * Math.cos(a - h)},${cy + ir * Math.sin(a - h)}`);
      pts.push(`${cx + or * Math.cos(a - h * 0.4)},${cy + or * Math.sin(a - h * 0.4)}`);
      pts.push(`${cx + or * Math.cos(a + h * 0.4)},${cy + or * Math.sin(a + h * 0.4)}`);
      pts.push(`${cx + ir * Math.cos(a + h)},${cy + ir * Math.sin(a + h)}`);
    }
    return `M${pts.join("L")}Z`;
  };

  const term_lines = [
    { x: 26, y: 62, w: 36, o: 0.35 }, { x: 22, y: 70, w: 28, o: 0.3 },
    { x: 26, y: 78, w: 32, o: 0.25 }, { x: 22, y: 86, w: 24, o: 0.2 },
    { x: 26, y: 94, w: 30, o: 0.3 },
  ];

  const gears = [
    { cx: 168, cy: 52, ir: 8, or: 12, t: 6 },
    { cx: 180, cy: 78, ir: 6, or: 9, t: 5 },
    { cx: 164, cy: 98, ir: 7, or: 10, t: 6 },
  ];

  const prog = [
    { x: 42, w: 22, o: 0.5 }, { x: 66, w: 18, o: 0.4 }, { x: 86, w: 26, o: 0.35 },
    { x: 114, w: 14, o: 0.25 }, { x: 130, w: 20, o: 0.15 },
  ];

  return (
    <svg className={className} viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="py-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="py-snake-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="py-term-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="80" r="70" fill="url(#py-glow)" className="python-glow" />

      {/* Terminal prompt */}
      <g className="python-terminal">
        <rect x="12" y="42" width="54" height="66" rx="5" fill="url(#py-term-grad)" stroke="currentColor" strokeWidth="1.5" />
        <rect x="12" y="42" width="54" height="12" rx="5" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="21" cy="48" r="2" fill="currentColor" fillOpacity="0.6" />
        <circle cx="29" cy="48" r="2" fill="currentColor" fillOpacity="0.4" />
        <circle cx="37" cy="48" r="2" fill="currentColor" fillOpacity="0.25" />
        <path d="M18 62 L23 65 L18 68" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" />
        <path d="M18 78 L23 81 L18 84" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.35" />
        {term_lines.map((l, i) => (
          <line key={`t-${i}`} x1={l.x} y1={l.y} x2={l.x + l.w} y2={l.y} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity={l.o} />
        ))}
      </g>

      {/* Python intertwined snakes */}
      <g className="python-snakes">
        {[
          { sx: 92, flip: false, cls: "python-snake-1" },
          { sx: 108, flip: true, cls: "python-snake-2" },
        ].map((snake) => (
          <g key={snake.cls}>
            <path d={create_snake_curve(snake.sx, 118, 1.0, snake.flip)} stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" className={snake.cls} />
            <path d={create_snake_curve(snake.sx, 118, 1.0, snake.flip)} stroke="url(#py-snake-grad)" strokeWidth="8" strokeLinecap="round" fill="none" strokeOpacity="0.15" />
            <circle cx={snake.sx} cy="66" r="4" fill="currentColor" fillOpacity="0.7" />
            <circle cx={snake.sx} cy="66" r="7" fill="currentColor" fillOpacity="0.08" />
          </g>
        ))}
        <rect x="94" y="84" width="12" height="12" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" transform="rotate(45 100 90)" />
      </g>

      {/* Automation pipeline gears */}
      <g className="python-automation">
        {gears.map((g, i) => (
          <g key={`gear-${i}`} className={`python-gear-${i}`}>
            <path d={create_gear_path(g.cx, g.cy, g.ir, g.or, g.t)} fill="currentColor" fillOpacity={0.08 + i * 0.03} stroke="currentColor" strokeWidth="1.5" />
            <circle cx={g.cx} cy={g.cy} r={g.ir * 0.6} fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
            <circle cx={g.cx} cy={g.cy} r={g.ir * 0.25} fill="currentColor" fillOpacity="0.5" />
          </g>
        ))}
        <line x1="168" y1="62" x2="178" y2="70" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.2" />
        <line x1="176" y1="86" x2="168" y2="90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.2" />
        <path d="M120 76 C132 72, 148 56, 156 54" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="3 3" />
        <path d="M120 90 C136 90, 148 92, 154 96" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="3 3" />
      </g>

      {/* Test runner / progress bar */}
      <g className="python-progress">
        <rect x="38" y="134" width="124" height="10" rx="5" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
        {prog.map((s, i) => (
          <rect key={`p-${i}`} x={s.x} y="136" width={s.w} height="6" rx="3" fill="currentColor" fillOpacity={s.o} className={`python-progress-${i}`} />
        ))}
        {[48, 76, 100, 122, 142].map((x, i) => (
          <circle key={`d-${i}`} cx={x} cy="148" r="1.5" fill="currentColor" fillOpacity={0.5 - i * 0.08} />
        ))}
      </g>

    </svg>
  );
}
