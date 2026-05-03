interface SecurityIconProps {
  className?: string;
}

const SHIELD_OUTER =
  "M100,25 C100,25,108,25,120,28 C132,31,145,38,145,38 L145,42 C145,42,145,80,140,98 C135,116,120,128,100,140 C80,128,65,116,60,98 C55,80,55,42,55,42 L55,38 C55,38,68,31,80,28 C92,25,100,25,100,25Z";
const SHIELD_INNER =
  "M100,36 C100,36,107,36,117,39 C127,42,137,47,137,47 L137,50 C137,50,137,82,133,97 C129,112,116,122,100,132 C84,122,71,112,67,97 C63,82,63,50,63,50 L63,47 C63,47,73,42,83,39 C93,36,100,36,100,36Z";

export function SecurityIcon({ className }: SecurityIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield - outer */}
      <path
        d={SHIELD_OUTER}
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        className="security-shield"
      />

      {/* Shield - inner */}
      <path
        d={SHIELD_INNER}
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.4"
        strokeLinejoin="round"
      />

      {/* Lock group */}
      <g className="security-lock">
        {/* Lock body */}
        <rect
          x="86"
          y="74"
          width="28"
          height="24"
          rx="4"
          fill="currentColor"
          fillOpacity="0.25"
          stroke="currentColor"
          strokeWidth="1.5"
        />

        {/* Lock shackle */}
        <path
          d="M90,74L90,66A10,10,0,0,1,110,66L110,74"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Keyhole */}
        <circle
          cx="100"
          cy="84"
          r="4"
          fill="currentColor"
          fillOpacity="0.7"
        />
        <line
          x1="100"
          y1="87"
          x2="100"
          y2="93"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>

      {/* Crypto dots — network nodes around shield */}
      <circle cx="38" cy="55" r="2.5" fill="currentColor" fillOpacity="0.35" />
      <circle
        cx="162"
        cy="55"
        r="2.5"
        fill="currentColor"
        fillOpacity="0.35"
      />
      <circle
        cx="100"
        cy="152"
        r="2.5"
        fill="currentColor"
        fillOpacity="0.35"
      />

    </svg>
  );
}
