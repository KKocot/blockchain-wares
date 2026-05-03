interface FrontendIconProps {
  className?: string;
}

export function FrontendIcon({ className }: FrontendIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Browser window frame */}
      <g className="frontend-window">
        <rect
          x="30"
          y="10"
          width="140"
          height="140"
          rx="6"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2"
        />
        {/* Title bar */}
        <rect
          x="30"
          y="10"
          width="140"
          height="18"
          rx="6"
          fill="currentColor"
          fillOpacity="0.18"
          stroke="currentColor"
          strokeWidth="2"
        />
        {/* Traffic light dots */}
        <circle cx="44" cy="19" r="3" fill="currentColor" fillOpacity="0.7" />
        <circle cx="56" cy="19" r="3" fill="currentColor" fillOpacity="0.5" />
        <circle cx="68" cy="19" r="3" fill="currentColor" fillOpacity="0.3" />
      </g>

      {/* Component tree inside browser */}
      <g className="frontend-tree">
        {/* Root component */}
        <g className="frontend-root">
          <rect
            x="38"
            y="36"
            width="124"
            height="108"
            rx="3"
            fill="currentColor"
            fillOpacity="0.06"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
          {/* Root content placeholder lines */}
          <line
            x1="46"
            y1="46"
            x2="98"
            y2="46"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.25"
            strokeLinecap="round"
          />
          <line
            x1="46"
            y1="54"
            x2="78"
            y2="54"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.2"
            strokeLinecap="round"
          />
        </g>

        {/* Dashed lines — props flow from root to children */}
        <g className="frontend-props">
          <line
            x1="72"
            y1="60"
            x2="72"
            y2="70"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.35"
            strokeDasharray="3 2"
            strokeLinecap="round"
          />
          <line
            x1="132"
            y1="60"
            x2="132"
            y2="70"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.35"
            strokeDasharray="3 2"
            strokeLinecap="round"
          />
        </g>

        {/* Left child component */}
        <g className="frontend-child-0">
          <rect
            x="42"
            y="70"
            width="56"
            height="68"
            rx="3"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
          {/* Left child content lines */}
          <line
            x1="50"
            y1="82"
            x2="86"
            y2="82"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.3"
            strokeLinecap="round"
          />
          <line
            x1="50"
            y1="90"
            x2="78"
            y2="90"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.25"
            strokeLinecap="round"
          />
          <line
            x1="50"
            y1="98"
            x2="82"
            y2="98"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.2"
            strokeLinecap="round"
          />
        </g>

        {/* Right child component */}
        <g className="frontend-child-1">
          <rect
            x="104"
            y="70"
            width="54"
            height="68"
            rx="3"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
          {/* Right child content lines */}
          <line
            x1="112"
            y1="82"
            x2="146"
            y2="82"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.3"
            strokeLinecap="round"
          />
          <line
            x1="112"
            y1="90"
            x2="138"
            y2="90"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.25"
            strokeLinecap="round"
          />
        </g>

        {/* Dashed line — props flow from right child to grandchild */}
        <line
          className="frontend-props"
          x1="132"
          y1="96"
          x2="132"
          y2="104"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.35"
          strokeDasharray="3 2"
          strokeLinecap="round"
        />

        {/* Grandchild component (inside right child) */}
        <g className="frontend-grandchild">
          <rect
            x="110"
            y="104"
            width="42"
            height="28"
            rx="3"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
          {/* Grandchild content lines */}
          <line
            x1="116"
            y1="114"
            x2="142"
            y2="114"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.35"
            strokeLinecap="round"
          />
          <line
            x1="116"
            y1="122"
            x2="136"
            y2="122"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.3"
            strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  );
}
