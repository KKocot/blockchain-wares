interface EngineeringIconProps {
  className?: string;
}

export function EngineeringIcon({ className }: EngineeringIconProps) {
  // Generate gear tooth path
  const create_gear = (cx: number, cy: number, inner_r: number, outer_r: number, teeth: number) => {
    const points: string[] = [];
    const tooth_angle = (2 * Math.PI) / teeth;
    const half_tooth = tooth_angle / 4;

    for (let i = 0; i < teeth; i++) {
      const angle = i * tooth_angle;
      // Inner point before tooth
      points.push(
        `${cx + inner_r * Math.cos(angle - half_tooth)},${cy + inner_r * Math.sin(angle - half_tooth)}`
      );
      // Outer tooth start
      points.push(
        `${cx + outer_r * Math.cos(angle - half_tooth * 0.5)},${cy + outer_r * Math.sin(angle - half_tooth * 0.5)}`
      );
      // Outer tooth end
      points.push(
        `${cx + outer_r * Math.cos(angle + half_tooth * 0.5)},${cy + outer_r * Math.sin(angle + half_tooth * 0.5)}`
      );
      // Inner point after tooth
      points.push(
        `${cx + inner_r * Math.cos(angle + half_tooth)},${cy + inner_r * Math.sin(angle + half_tooth)}`
      );
    }
    return `M${points.join("L")}Z`;
  };

  return (
    <svg
      className={className}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="eng-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="eng-shine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Background glow */}
      <circle
        cx="100"
        cy="80"
        r="70"
        fill="url(#eng-glow)"
        className="eng-glow"
      />

      {/* Main large gear - center */}
      <g className="eng-gear-main">
        <path
          d={create_gear(100, 80, 32, 42, 12)}
          fill="url(#eng-shine)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle
          cx="100"
          cy="80"
          r="24"
          fill="currentColor"
          fillOpacity="0.05"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle
          cx="100"
          cy="80"
          r="10"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {/* Spokes */}
        {[0, 60, 120, 180, 240, 300].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <line
              key={angle}
              x1={100 + 12 * Math.cos(rad)}
              y1={80 + 12 * Math.sin(rad)}
              x2={100 + 22 * Math.cos(rad)}
              y2={80 + 22 * Math.sin(rad)}
              stroke="currentColor"
              strokeWidth="3"
              strokeOpacity="0.4"
            />
          );
        })}
      </g>

      {/* Top-left gear */}
      <g className="eng-gear-tl">
        <path
          d={create_gear(52, 42, 18, 26, 8)}
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="52" cy="42" r="12" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="1" />
        <circle cx="52" cy="42" r="5" fill="currentColor" fillOpacity="0.3" />
      </g>

      {/* Bottom-right gear */}
      <g className="eng-gear-br">
        <path
          d={create_gear(152, 115, 16, 22, 8)}
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="152" cy="115" r="10" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="1" />
        <circle cx="152" cy="115" r="4" fill="currentColor" fillOpacity="0.3" />
      </g>

      {/* Technical drawing - cross section view */}
      <g>
        {/* Vertical cross-section line */}
        <line
          x1="100"
          y1="25"
          x2="100"
          y2="135"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="4 2"
          strokeOpacity="0.3"
          className="eng-dash-v"
        />
        {/* Horizontal cross-section line */}
        <line
          x1="30"
          y1="80"
          x2="170"
          y2="80"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="4 2"
          strokeOpacity="0.3"
          className="eng-dash-h"
        />
      </g>

      {/* Dimension arrows and measurements */}
      <g className="eng-dimension">
        {/* Top dimension */}
        <line x1="58" y1="20" x2="142" y2="20" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M58 20 L63 17 L63 23 Z" fill="currentColor" fillOpacity="0.5" />
        <path d="M142 20 L137 17 L137 23 Z" fill="currentColor" fillOpacity="0.5" />
        <line x1="100" y1="38" x2="100" y2="20" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />

        {/* Right dimension */}
        <line x1="175" y1="42" x2="175" y2="115" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M175 42 L172 47 L178 47 Z" fill="currentColor" fillOpacity="0.5" />
        <path d="M175 115 L172 110 L178 110 Z" fill="currentColor" fillOpacity="0.5" />
      </g>

      {/* Connecting rods / linkages */}
      <g className="eng-rod">
        {/* Rod from center to top-left gear */}
        <line
          x1="72"
          y1="58"
          x2="68"
          y2="54"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeOpacity="0.3"
        />
        {/* Rod from center to bottom-right gear */}
        <line
          x1="128"
          y1="102"
          x2="136"
          y2="103"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeOpacity="0.3"
        />
      </g>

      {/* Piston animation on left side */}
      <g>
        <rect
          x="18"
          y="60"
          width="12"
          height="40"
          rx="2"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="1"
        />
        <rect
          x="20"
          y="65"
          width="8"
          height="15"
          rx="1"
          fill="currentColor"
          fillOpacity="0.4"
          className="eng-piston"
        />
      </g>

      {/* Rotation indicators on main gear */}
      {[0, 90, 180, 270].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = 100 + 50 * Math.cos(rad);
        const y = 80 + 50 * Math.sin(rad);
        return (
          <circle
            key={angle}
            cx={x}
            cy={y}
            r="2"
            fill="currentColor"
            className={`eng-point-${i + 1}`}
          />
        );
      })}

      {/* Blueprint corner markers */}
      <g stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4">
        <path d="M15 20 L15 10 L25 10" fill="none" />
        <path d="M185 10 L195 10 L195 20" fill="none" />
        <path d="M15 140 L15 150 L25 150" fill="none" />
        <path d="M185 150 L195 150 L195 140" fill="none" />
      </g>

      {/* Scanning/verification line */}
      <line
        x1="30"
        y1="80"
        x2="30"
        y2="80"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.6"
        className="eng-scan"
      />
    </svg>
  );
}
