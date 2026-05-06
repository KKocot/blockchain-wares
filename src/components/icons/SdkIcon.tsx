interface SdkIconProps {
  className?: string;
}

export function SdkIcon({ className }: SdkIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Back card — smallest visibility, furthest */}
      <rect
        x="40"
        y="30"
        width="100"
        height="70"
        rx="6"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="2"
        className="sdk-card-back"
      />

      {/* Middle card */}
      <rect
        x="50"
        y="45"
        width="110"
        height="80"
        rx="6"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="2"
        className="sdk-card-mid"
      />

      {/* Front card — main focal */}
      <rect
        x="60"
        y="60"
        width="120"
        height="90"
        rx="6"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth="2.5"
        className="sdk-card-front"
      />

      {/* Small dot indicator (top-left of front card — like file/package marker) */}
      <circle cx="70" cy="70" r="3" fill="currentColor" className="sdk-dot" />

      {/* Left brace { */}
      <path
        d="M82,80 Q76,80 76,90 L76,100 Q76,108 70,108 Q76,108 76,116 L76,126 Q76,136 82,136"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        className="sdk-bracket-left"
      />

      {/* Right brace } */}
      <path
        d="M138,80 Q144,80 144,90 L144,100 Q144,108 150,108 Q144,108 144,116 L144,126 Q144,136 138,136"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        className="sdk-bracket-right"
      />

      {/* Code lines inside braces */}
      <line
        x1="92"
        y1="98"
        x2="128"
        y2="98"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.7"
        className="sdk-line-1"
      />
      <line
        x1="92"
        y1="108"
        x2="120"
        y2="108"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.6"
        className="sdk-line-2"
      />
      <line
        x1="92"
        y1="118"
        x2="124"
        y2="118"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.5"
        className="sdk-line-3"
      />
    </svg>
  );
}
