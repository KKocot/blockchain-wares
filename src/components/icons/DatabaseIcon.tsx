interface DatabaseIconProps {
  className?: string;
}

export function DatabaseIcon({ className }: DatabaseIconProps) {
  // Cylinder geometry constants
  const cx = 100;
  const rx = 32;
  const ry = 10;

  // Three stacked cylinders sharing edges (top ellipse of lower = bottom ellipse of upper)
  const layers = [
    { topY: 25, bottomY: 55, fillOpacity: 0.08, label: "top" },
    { topY: 55, bottomY: 85, fillOpacity: 0.15, label: "mid" },
    { topY: 85, bottomY: 115, fillOpacity: 0.22, label: "bottom" },
  ] as const;

  // Data rows inside each cylinder (horizontal lines representing records)
  const dataRows: Array<{ cy: number; lines: Array<{ x1: number; x2: number }> }> = [
    {
      cy: 40,
      lines: [
        { x1: 82, x2: 105 },
        { x1: 88, x2: 118 },
      ],
    },
    {
      cy: 70,
      lines: [
        { x1: 80, x2: 112 },
        { x1: 85, x2: 104 },
        { x1: 90, x2: 120 },
      ],
    },
    {
      cy: 100,
      lines: [
        { x1: 84, x2: 116 },
        { x1: 78, x2: 108 },
      ],
    },
  ];

  return (
    <svg
      className={className}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="db-cylinder">
        {layers.map((layer, i) => (
          <g key={layer.label} className={`db-layer-${i}`}>
            {/* Cylinder body fill: path from top ellipse arc down to bottom ellipse arc */}
            <path
              d={`M${cx - rx},${layer.topY} A${rx},${ry} 0 0,0 ${cx + rx},${layer.topY} L${cx + rx},${layer.bottomY} A${rx},${ry} 0 0,1 ${cx - rx},${layer.bottomY} Z`}
              fill="currentColor"
              fillOpacity={layer.fillOpacity}
              stroke="none"
            />

            {/* Left side line */}
            <line
              x1={cx - rx}
              y1={layer.topY}
              x2={cx - rx}
              y2={layer.bottomY}
              stroke="currentColor"
              strokeWidth="2"
              strokeOpacity="0.6"
            />

            {/* Right side line */}
            <line
              x1={cx + rx}
              y1={layer.topY}
              x2={cx + rx}
              y2={layer.bottomY}
              stroke="currentColor"
              strokeWidth="2"
              strokeOpacity="0.6"
            />

            {/* Bottom ellipse (drawn for every cylinder) */}
            <ellipse
              cx={cx}
              cy={layer.bottomY}
              rx={rx}
              ry={ry}
              fill="currentColor"
              fillOpacity={layer.fillOpacity * 0.6}
              stroke="currentColor"
              strokeWidth="2"
            />

            {/* Data rows (horizontal record lines) */}
            {dataRows[i].lines.map((line, j) => (
              <line
                key={j}
                x1={line.x1}
                y1={dataRows[i].cy + j * 7}
                x2={line.x2}
                y2={dataRows[i].cy + j * 7}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeOpacity={0.2 + i * 0.05}
                strokeLinecap="round"
              />
            ))}
          </g>
        ))}

        {/* Top ellipse of the top cylinder (lid) - drawn last to layer on top */}
        <ellipse
          cx={cx}
          cy={layers[0].topY}
          rx={rx}
          ry={ry}
          fill="currentColor"
          fillOpacity="0.18"
          stroke="currentColor"
          strokeWidth="2.5"
        />

        {/* Data points along left side */}
        {[38, 52, 68, 82, 98, 112].map((y) => (
          <circle
            key={y}
            cx={58}
            cy={y}
            r="1.5"
            fill="currentColor"
            fillOpacity="0.2"
          />
        ))}
      </g>

      {/* Query indicator (magnifying glass) — separate layer, drawn last */}
      <g className="db-magnifier">
        <circle
          cx={148}
          cy={72}
          r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.25"
        />
        <line
          x1={154}
          y1={78}
          x2={160}
          y2={84}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.25"
          strokeLinecap="round"
        />
        {/* Small dot inside magnifying glass */}
        <circle
          cx={148}
          cy={72}
          r="2"
          fill="currentColor"
          fillOpacity="0.2"
        />
      </g>
    </svg>
  );
}
