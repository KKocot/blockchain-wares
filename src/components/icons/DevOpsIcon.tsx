interface DevOpsIconProps {
  className?: string;
}

/*
 * Infinity loop (lemniscate) centered at (100, 75).
 * Two symmetric lobes drawn as cubic beziers.
 * Left lobe: center → top-left → left-apex → bottom-left → center
 * Right lobe: center → top-right → right-apex → bottom-right → center
 */
const INFINITY = [
  "M100,75",
  // Right lobe
  "C115,55 155,50 160,75",
  "C165,100 115,95 100,75",
  // Left lobe
  "C85,55 45,50 40,75",
  "C35,100 85,95 100,75",
  "Z",
].join(" ");

/* Cloud shape: 3 bumps + flat base */
const CLOUD =
  "M76,20 C76,12 86,8 94,14 C98,6 110,6 114,14 C122,8 132,12 132,20 C138,20 138,30 132,30 L76,30 C70,30 70,20 76,20 Z";

/*
 * 6 stage nodes placed on the infinity path perimeter.
 * Positions computed from the lemniscate geometry:
 * - Right lobe: top (130,58), apex (160,75), bottom (130,92)
 * - Left lobe: top (70,58), apex (40,75), bottom (70,92)
 */
const STAGES: [number, number][] = [
  [70, 58], // left-top
  [40, 75], // left-apex
  [70, 92], // left-bottom
  [130, 58], // right-top
  [160, 75], // right-apex
  [130, 92], // right-bottom
];

/* Container specs */
const CONTAINERS = [
  { x: 24, y: 122 },
  { x: 81, y: 122 },
  { x: 138, y: 122 },
];
const CW = 38;
const CH = 28;

export function DevOpsIcon({ className }: DevOpsIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cloud */}
      <path
        d={CLOUD}
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />

      {/* Connector: cloud to loop (dashed arrow) */}
      <g className="devops-connector">
        <line
          x1="100"
          y1="30"
          x2="100"
          y2="52"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.3"
          strokeDasharray="3 3"
          strokeLinecap="round"
        />
        {/* Arrowhead pointing down */}
        <path
          d="M96,52 L100,58 L104,52"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Infinity loop */}
      <path
        d={INFINITY}
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeWidth="2.5"
      />

      {/* 6 stage nodes on infinity loop */}
      {STAGES.map(([cx, cy], i) => (
        <g key={`stage-${i}`}>
          <circle
            cx={cx}
            cy={cy}
            r="7"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx={cx} cy={cy} r="3" fill="currentColor" fillOpacity="0.6" />
        </g>
      ))}

      {/* Deploy arrows: loop bottom to containers */}
      {CONTAINERS.map((c, i) => {
        const tx = c.x + CW / 2;
        return (
          <g key={`arrow-${i}`} className={`devops-arrow-${i}`}>
            <line
              x1={tx}
              y1="106"
              x2={tx}
              y2={c.y}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeOpacity="0.3"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
            <path
              d={`M${tx - 3.5} ${c.y - 4} L${tx} ${c.y} L${tx + 3.5} ${c.y - 4}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeOpacity="0.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );
      })}

      {/* 3 Docker containers */}
      {CONTAINERS.map((c, i) => (
        <g key={`container-${i}`}>
          <rect
            x={c.x}
            y={c.y}
            width={CW}
            height={CH}
            rx="3"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          {/* Layer rects inside container */}
          <rect
            x={c.x + 4}
            y={c.y + 5}
            width={CW - 8}
            height={5}
            rx="1"
            fill="currentColor"
            fillOpacity="0.18"
          />
          <rect
            x={c.x + 4}
            y={c.y + 12}
            width={CW - 8}
            height={5}
            rx="1"
            fill="currentColor"
            fillOpacity="0.12"
          />
          <rect
            x={c.x + 4}
            y={c.y + 19}
            width={CW - 8}
            height={5}
            rx="1"
            fill="currentColor"
            fillOpacity="0.08"
          />
          {/* Status dot */}
          <circle
            cx={c.x + CW - 7}
            cy={c.y + 7}
            r="2"
            fill="currentColor"
            fillOpacity="0.5"
          />
        </g>
      ))}
    </svg>
  );
}
