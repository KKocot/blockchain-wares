interface PythonIconProps {
  className?: string;
}

export function PythonIcon({ className }: PythonIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Terminal window */}
      <g className="python-terminal">
        {/* Terminal body */}
        <rect
          x="18"
          y="25"
          width="100"
          height="110"
          rx="6"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2"
        />

        {/* Title bar separator */}
        <line
          x1="18"
          y1="43"
          x2="118"
          y2="43"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.3"
        />

        {/* Window dots */}
        <circle cx="31" cy="34" r="2.5" fill="currentColor" fillOpacity="0.5" />
        <circle cx="41" cy="34" r="2.5" fill="currentColor" fillOpacity="0.35" />
        <circle cx="51" cy="34" r="2.5" fill="currentColor" fillOpacity="0.2" />

        {/* >>> prompt line 1 */}
        <g className="python-prompt-1">
          <path
            d="M28 56 L33 60 L28 64"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.6"
            fill="none"
          />
          <path
            d="M35 56 L40 60 L35 64"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.6"
            fill="none"
          />
          <path
            d="M42 56 L47 60 L42 64"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.6"
            fill="none"
          />
          <line
            x1="52"
            y1="60"
            x2="105"
            y2="60"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.25"
          />
        </g>

        {/* Indented line 2 */}
        <g className="python-prompt-2">
          <line
            x1="40"
            y1="78"
            x2="100"
            y2="78"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.2"
          />
        </g>

        {/* Indented line 3 */}
        <line
          x1="40"
          y1="93"
          x2="82"
          y2="93"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.15"
        />

        {/* >>> prompt line 4 */}
        <path
          d="M28 105 L33 109 L28 113"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.5"
          fill="none"
        />
        <path
          d="M35 105 L40 109 L35 113"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.5"
          fill="none"
        />
        <path
          d="M42 105 L47 109 L42 113"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.5"
          fill="none"
        />
        <line
          x1="52"
          y1="109"
          x2="88"
          y2="109"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.2"
        />
      </g>

      {/* Flow arrow: terminal -> gear */}
      <g className="python-flow-arrow">
        <line
          x1="122"
          y1="80"
          x2="135"
          y2="80"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.35"
        />
        <path
          d="M132 75 L138 80 L132 85"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.35"
          fill="none"
        />
      </g>

      {/* Automation gear */}
      <g className="python-gear">
        {/* Gear teeth (6 teeth around the circle) */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const cx = 168;
          const cy = 80;
          const innerR = 22;
          const outerR = 28;
          const halfW = 4;

          const perpX = -Math.sin(rad);
          const perpY = Math.cos(rad);
          const cosA = Math.cos(rad);
          const sinA = Math.sin(rad);

          const points = [
            [cx + innerR * cosA + perpX * halfW, cy + innerR * sinA + perpY * halfW],
            [cx + outerR * cosA + perpX * halfW, cy + outerR * sinA + perpY * halfW],
            [cx + outerR * cosA - perpX * halfW, cy + outerR * sinA - perpY * halfW],
            [cx + innerR * cosA - perpX * halfW, cy + innerR * sinA - perpY * halfW],
          ];

          return (
            <polygon
              key={`tooth-${i}`}
              points={points.map(([x, y]) => `${x},${y}`).join(" ")}
              fill="currentColor"
              fillOpacity="0.15"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Gear outer ring */}
        <circle
          cx="168"
          cy="80"
          r="22"
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="2"
        />

        {/* Gear inner ring */}
        <circle
          cx="168"
          cy="80"
          r="12"
          fill="currentColor"
          fillOpacity="0.08"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.5"
        />

        {/* Gear center dot */}
        <circle cx="168" cy="80" r="4" fill="currentColor" fillOpacity="0.7" />
      </g>
    </svg>
  );
}
