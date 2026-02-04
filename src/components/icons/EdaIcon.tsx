interface EdaIconProps {
  className?: string;
}

export function EdaIcon({ className }: EdaIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background glow */}
      <defs>
        <radialGradient id="eda-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="chip-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      <circle
        cx="100"
        cy="80"
        r="70"
        fill="url(#eda-glow)"
        className="eda-glow"
      />

      {/* Main chip body */}
      <rect
        x="60"
        y="45"
        width="80"
        height="70"
        rx="4"
        fill="url(#chip-gradient)"
        stroke="currentColor"
        strokeWidth="2"
        className="eda-chip"
      />

      {/* Inner die */}
      <rect
        x="72"
        y="55"
        width="56"
        height="50"
        rx="2"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.4"
      />

      {/* Circuit traces inside chip */}
      <g stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3">
        <line x1="75" y1="65" x2="95" y2="65" />
        <line x1="95" y1="65" x2="95" y2="80" />
        <line x1="95" y1="80" x2="115" y2="80" />
        <line x1="85" y1="75" x2="85" y2="95" />
        <line x1="85" y1="95" x2="105" y2="95" />
        <line x1="105" y1="70" x2="125" y2="70" />
        <line x1="110" y1="85" x2="110" y2="100" />
      </g>

      {/* Left pins */}
      {[52, 62, 72, 82, 92, 102].map((y, i) => (
        <g key={`left-${i}`}>
          <line
            x1="45"
            y1={y}
            x2="60"
            y2={y}
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx="45"
            cy={y}
            r="3"
            fill="currentColor"
            fillOpacity="0.6"
            style={{
              animation: `eda-pin-blink 1.5s ease-in-out ${i * 0.15}s infinite`
            }}
          />
        </g>
      ))}

      {/* Right pins */}
      {[52, 62, 72, 82, 92, 102].map((y, i) => (
        <g key={`right-${i}`}>
          <line
            x1="140"
            y1={y}
            x2="155"
            y2={y}
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx="155"
            cy={y}
            r="3"
            fill="currentColor"
            fillOpacity="0.6"
            style={{
              animation: `eda-pin-blink 1.5s ease-in-out ${0.9 - i * 0.15}s infinite`
            }}
          />
        </g>
      ))}

      {/* Top pins */}
      {[75, 90, 105, 120].map((x, i) => (
        <g key={`top-${i}`}>
          <line
            x1={x}
            y1="30"
            x2={x}
            y2="45"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx={x}
            cy="30"
            r="3"
            fill="currentColor"
            fillOpacity="0.6"
            style={{
              animation: `eda-pin-blink 1.2s ease-in-out ${i * 0.2}s infinite`
            }}
          />
        </g>
      ))}

      {/* Bottom pins */}
      {[75, 90, 105, 120].map((x, i) => (
        <g key={`bottom-${i}`}>
          <line
            x1={x}
            y1="115"
            x2={x}
            y2="130"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx={x}
            cy="130"
            r="3"
            fill="currentColor"
            fillOpacity="0.6"
            style={{
              animation: `eda-pin-blink 1.2s ease-in-out ${0.6 - i * 0.2}s infinite`
            }}
          />
        </g>
      ))}

      {/* Clock signal indicator in chip center */}
      <g className="eda-clock">
        <circle
          cx="100"
          cy="80"
          r="6"
          fill="currentColor"
          fillOpacity="0.3"
        />
        <circle cx="100" cy="80" r="3" fill="currentColor" fillOpacity="0.7" />
      </g>
    </svg>
  );
}
