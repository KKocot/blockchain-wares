interface DatabaseIconProps {
  className?: string;
}

export function DatabaseIcon({ className }: DatabaseIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background glow */}
      <defs>
        <radialGradient id="db-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="db-cylinder" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      <circle
        cx="100"
        cy="80"
        r="70"
        fill="url(#db-glow)"
        className="db-glow"
      />

      {/* Main database cylinder (center) */}
      <g className="db-cylinder">
        {/* Cylinder body */}
        <rect
          x="70"
          y="55"
          width="60"
          height="50"
          rx="2"
          fill="url(#db-cylinder)"
          stroke="currentColor"
          strokeWidth="2"
        />
        {/* Top ellipse */}
        <ellipse
          cx="100"
          cy="55"
          rx="30"
          ry="10"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="2"
        />
        {/* Middle layer line */}
        <ellipse
          cx="100"
          cy="75"
          rx="30"
          ry="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="db-layer-1"
        />
        {/* Bottom layer line */}
        <ellipse
          cx="100"
          cy="95"
          rx="30"
          ry="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="db-layer-2"
        />
        {/* Bottom ellipse */}
        <ellipse
          cx="100"
          cy="105"
          rx="30"
          ry="10"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2"
        />
      </g>

      {/* Graph nodes (Neo4J style) - left cluster */}
      <g className="db-node-cluster-left">
        {/* Node 1 */}
        <circle
          cx="28"
          cy="45"
          r="10"
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="28" cy="45" r="4" fill="currentColor" fillOpacity="0.6" />

        {/* Node 2 */}
        <circle
          cx="22"
          cy="80"
          r="10"
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="22" cy="80" r="4" fill="currentColor" fillOpacity="0.6" />

        {/* Node 3 */}
        <circle
          cx="32"
          cy="115"
          r="10"
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="32" cy="115" r="4" fill="currentColor" fillOpacity="0.6" />

        {/* Graph connections */}
        <line
          x1="28" y1="55" x2="22" y2="70"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="db-graph-line-1"
        />
        <line
          x1="22" y1="90" x2="32" y2="105"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="db-graph-line-2"
        />
        <line
          x1="35" y1="50" x2="38" y2="108"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="3 3"
          className="db-graph-line-3"
        />
      </g>

      {/* Graph nodes - right cluster */}
      <g className="db-node-cluster-right">
        {/* Node 4 */}
        <circle
          cx="172"
          cy="45"
          r="10"
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="172" cy="45" r="4" fill="currentColor" fillOpacity="0.6" />

        {/* Node 5 */}
        <circle
          cx="178"
          cy="80"
          r="10"
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="178" cy="80" r="4" fill="currentColor" fillOpacity="0.6" />

        {/* Node 6 */}
        <circle
          cx="168"
          cy="115"
          r="10"
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="168" cy="115" r="4" fill="currentColor" fillOpacity="0.6" />

        {/* Graph connections */}
        <line
          x1="172" y1="55" x2="178" y2="70"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="db-graph-line-4"
        />
        <line
          x1="178" y1="90" x2="168" y2="105"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="db-graph-line-5"
        />
        <line
          x1="165" y1="50" x2="162" y2="108"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="3 3"
          className="db-graph-line-6"
        />
      </g>

      {/* Data flow lines - left to center (write throughput) */}
      <line
        x1="38" y1="45" x2="70" y2="60"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="db-flow-1"
      />
      <line
        x1="32" y1="80" x2="70" y2="80"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="db-flow-2"
      />
      <line
        x1="42" y1="115" x2="70" y2="100"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="db-flow-3"
      />

      {/* Data flow lines - center to right */}
      <line
        x1="130" y1="60" x2="162" y2="45"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="db-flow-4"
      />
      <line
        x1="130" y1="80" x2="168" y2="80"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="db-flow-5"
      />
      <line
        x1="130" y1="100" x2="158" y2="115"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="db-flow-6"
      />

      {/* Top indicator - pulsing dot showing activity */}
      <circle
        cx="100"
        cy="30"
        r="5"
        fill="currentColor"
        fillOpacity="0.8"
        className="db-activity"
      />
      <circle
        cx="100"
        cy="30"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="db-ring"
      />

      {/* Connection from top indicator to database */}
      <line
        x1="100" y1="38" x2="100" y2="45"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="db-status"
      />
    </svg>
  );
}
