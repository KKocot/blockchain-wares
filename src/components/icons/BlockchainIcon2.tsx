interface BlockchainIcon2Props {
  className?: string;
}

export function BlockchainIcon2({ className }: BlockchainIcon2Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Block 1 */}
      <g className="block-1">
        <rect
          x="8"
          y="30"
          width="50"
          height="80"
          rx="6"
          stroke="currentColor"
          strokeWidth="2"
          fill="currentColor"
          fillOpacity="0.05"
        />
        {/* Block header */}
        <rect
          x="8"
          y="30"
          width="50"
          height="20"
          rx="6"
          fill="currentColor"
          fillOpacity="0.15"
        />
        <text
          x="33"
          y="44"
          textAnchor="middle"
          fill="currentColor"
          fontSize="10"
          fontFamily="monospace"
          opacity="0.8"
        >
          #001
        </text>
        {/* Hash representation */}
        <path
          d="M16 60H50M16 70H42M16 80H48M16 90H38M16 100H45"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.3"
        />
        {/* Nonce indicator */}
        <circle
          cx="45"
          cy="100"
          r="4"
          fill="currentColor"
          fillOpacity="0.6"
          className="nonce-1"
        />
      </g>

      {/* Chain link 1 */}
      <g>
        <path
          d="M58 70H75"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="chain-link-1"
        />
      </g>

      {/* Block 2 */}
      <g className="block-2">
        <rect
          x="75"
          y="30"
          width="50"
          height="80"
          rx="6"
          stroke="currentColor"
          strokeWidth="2"
          fill="currentColor"
          fillOpacity="0.05"
        />
        {/* Block header */}
        <rect
          x="75"
          y="30"
          width="50"
          height="20"
          rx="6"
          fill="currentColor"
          fillOpacity="0.15"
        />
        <text
          x="100"
          y="44"
          textAnchor="middle"
          fill="currentColor"
          fontSize="10"
          fontFamily="monospace"
          opacity="0.8"
        >
          #002
        </text>
        {/* Hash representation */}
        <path
          d="M83 60H117M83 70H109M83 80H115M83 90H105M83 100H112"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.3"
        />
        {/* Nonce indicator */}
        <circle
          cx="112"
          cy="100"
          r="4"
          fill="currentColor"
          fillOpacity="0.6"
          className="nonce-2"
        />
      </g>

      {/* Chain link 2 */}
      <g>
        <path
          d="M125 70H142"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="chain-link-2"
        />
      </g>

      {/* Block 3 */}
      <g className="block-3">
        <rect
          x="142"
          y="30"
          width="50"
          height="80"
          rx="6"
          stroke="currentColor"
          strokeWidth="2"
          fill="currentColor"
          fillOpacity="0.05"
        />
        {/* Block header */}
        <rect
          x="142"
          y="30"
          width="50"
          height="20"
          rx="6"
          fill="currentColor"
          fillOpacity="0.15"
        />
        <text
          x="167"
          y="44"
          textAnchor="middle"
          fill="currentColor"
          fontSize="10"
          fontFamily="monospace"
          opacity="0.8"
        >
          #003
        </text>
        {/* Hash representation */}
        <path
          d="M150 60H184M150 70H176M150 80H182M150 90H172M150 100H179"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.3"
        />
        {/* Nonce indicator - mining animation */}
        <circle
          cx="179"
          cy="100"
          r="4"
          fill="currentColor"
          fillOpacity="0.6"
          className="nonce-3"
        />
      </g>

      {/* Mining/verification indicator on last block */}
      <g className="mining-icon">
        <path
          d="M167 15L167 25"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M162 20L172 20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
