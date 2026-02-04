interface BlockchainIconProps {
  className?: string;
}

export function BlockchainIcon({ className }: BlockchainIconProps) {
  const hexagon_path = (cx: number, cy: number, r: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
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
      {/* Background glow */}
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle
        cx="100"
        cy="80"
        r="70"
        fill="url(#glow)"
        className="blockchain-glow"
      />

      {/* Central hexagon - main node */}
      <g className="blockchain-center">
        <path
          d={hexagon_path(100, 80, 28)}
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d={hexagon_path(100, 80, 18)}
          fill="currentColor"
          fillOpacity="0.25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="100" cy="80" r="6" fill="currentColor" fillOpacity="0.8" />
      </g>

      {/* Top hexagon */}
      <g className="blockchain-top">
        <path
          d={hexagon_path(100, 28, 18)}
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="100" cy="28" r="4" fill="currentColor" fillOpacity="0.6" />
      </g>

      {/* Top-left hexagon */}
      <g className="blockchain-tl">
        <path
          d={hexagon_path(45, 52, 18)}
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="45" cy="52" r="4" fill="currentColor" fillOpacity="0.6" />
      </g>

      {/* Top-right hexagon */}
      <g className="blockchain-tr">
        <path
          d={hexagon_path(155, 52, 18)}
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="155" cy="52" r="4" fill="currentColor" fillOpacity="0.6" />
      </g>

      {/* Bottom-left hexagon */}
      <g className="blockchain-bl">
        <path
          d={hexagon_path(45, 108, 18)}
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="45" cy="108" r="4" fill="currentColor" fillOpacity="0.6" />
      </g>

      {/* Bottom-right hexagon */}
      <g className="blockchain-br">
        <path
          d={hexagon_path(155, 108, 18)}
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="155" cy="108" r="4" fill="currentColor" fillOpacity="0.6" />
      </g>

      {/* Bottom hexagon */}
      <g className="blockchain-bottom">
        <path
          d={hexagon_path(100, 132, 18)}
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="100" cy="132" r="4" fill="currentColor" fillOpacity="0.6" />
      </g>

      {/* Connection lines */}
      <line
        x1="100" y1="52" x2="100" y2="46"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="blockchain-line-1"
      />
      <line
        x1="75" y1="65" x2="60" y2="58"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="blockchain-line-2"
      />
      <line
        x1="125" y1="65" x2="140" y2="58"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="blockchain-line-3"
      />
      <line
        x1="75" y1="95" x2="60" y2="102"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="blockchain-line-4"
      />
      <line
        x1="125" y1="95" x2="140" y2="102"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="blockchain-line-5"
      />
      <line
        x1="100" y1="108" x2="100" y2="114"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="blockchain-line-6"
      />
    </svg>
  );
}
