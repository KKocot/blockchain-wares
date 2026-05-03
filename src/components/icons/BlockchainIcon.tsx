interface BlockchainIconProps {
  className?: string;
}

const HEX_CENTER_28 = "M100,52L124.25,66L124.25,94L100,108L75.75,94L75.75,66Z";
const HEX_CENTER_18 = "M100,62L115.59,71L115.59,89L100,98L84.41,89L84.41,71Z";
const HEX_TOP = "M100,10L115.59,19L115.59,37L100,46L84.41,37L84.41,19Z";
const HEX_TOP_LEFT = "M45,34L60.59,43L60.59,61L45,70L29.41,61L29.41,43Z";
const HEX_TOP_RIGHT =
  "M155,34L170.59,43L170.59,61L155,70L139.41,61L139.41,43Z";
const HEX_BOTTOM_LEFT =
  "M45,90L60.59,99L60.59,117L45,126L29.41,117L29.41,99Z";
const HEX_BOTTOM_RIGHT =
  "M155,90L170.59,99L170.59,117L155,126L139.41,117L139.41,99Z";
const HEX_BOTTOM =
  "M100,114L115.59,123L115.59,141L100,150L84.41,141L84.41,123Z";

export function BlockchainIcon({ className }: BlockchainIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Central hexagon - main node */}
      <g className="blockchain-center">
        <path
          d={HEX_CENTER_28}
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d={HEX_CENTER_18}
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
          d={HEX_TOP}
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
          d={HEX_TOP_LEFT}
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
          d={HEX_TOP_RIGHT}
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
          d={HEX_BOTTOM_LEFT}
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
          d={HEX_BOTTOM_RIGHT}
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle
          cx="155"
          cy="108"
          r="4"
          fill="currentColor"
          fillOpacity="0.6"
        />
      </g>

      {/* Bottom hexagon */}
      <g className="blockchain-bottom">
        <path
          d={HEX_BOTTOM}
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle
          cx="100"
          cy="132"
          r="4"
          fill="currentColor"
          fillOpacity="0.6"
        />
      </g>

      {/* Connection lines */}
      <line
        x1="100"
        y1="52"
        x2="100"
        y2="46"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="blockchain-line-1"
      />
      <line
        x1="75"
        y1="65"
        x2="60"
        y2="58"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="blockchain-line-2"
      />
      <line
        x1="125"
        y1="65"
        x2="140"
        y2="58"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="blockchain-line-3"
      />
      <line
        x1="75"
        y1="95"
        x2="60"
        y2="102"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="blockchain-line-4"
      />
      <line
        x1="125"
        y1="95"
        x2="140"
        y2="102"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="blockchain-line-5"
      />
      <line
        x1="100"
        y1="108"
        x2="100"
        y2="114"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="blockchain-line-6"
      />
    </svg>
  );
}
