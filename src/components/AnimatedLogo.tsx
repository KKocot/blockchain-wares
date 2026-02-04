interface AnimatedLogoProps {
  className?: string;
}

/**
 * Animated logo using pure CSS animations (more performant than Framer Motion)
 * Each cube floats with staggered timing
 */
export function AnimatedLogo({ className }: AnimatedLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 376 381"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>
        {`
          @keyframes float-cube {
            0%, 100% {
              transform: translateY(0);
              opacity: 0.7;
            }
            50% {
              transform: translateY(-8px);
              opacity: 1;
            }
          }

          .cube-top {
            animation: float-cube 2.5s ease-in-out infinite;
          }

          .cube-bottom-left {
            animation: float-cube 2.5s ease-in-out infinite 0.4s;
          }

          .cube-bottom-right {
            animation: float-cube 2.5s ease-in-out infinite 0.8s;
          }

          @media (prefers-reduced-motion: reduce) {
            .cube-top,
            .cube-bottom-left,
            .cube-bottom-right {
              animation: none;
              opacity: 1;
            }
          }
        `}
      </style>

      {/* Top cube */}
      <path
        className="cube-top"
        d="M279.821,53.892 L280.041,161.35 L187.324,215.471 L95.222,161.992 L95,53.697 L187.324,0 L279.821,53.892 Z M124,55.4245884 L187.82302,94.1626305 L251.646039,55.4245884 L187.753367,18 L124,55.4245884 Z M194.410644,185.257007 L259.870283,149.353672 L258.233664,74.7122942 L193.876683,111.332677 L194.410644,185.257007 Z M110.548129,74.7122942 L108.91151,149.353672 L174.371148,185.257007 L174.835456,111.212035 L110.548129,74.7122942 Z"
        fill="currentColor"
      />

      {/* Bottom left cube */}
      <path
        className="cube-bottom-left"
        d="M184.821,218.892 L185.041,326.35 L92.324,380.471 L0.222,326.992 L0,218.697 L92.324,165 L184.821,218.892 Z M29,220.424588 L92.8230196,259.162631 L156.646039,220.424588 L92.7533667,183 L29,220.424588 Z M99.4106443,350.257007 L164.870283,314.353672 L163.233664,239.712294 L98.8766834,276.332677 L99.4106443,350.257007 Z M15.5481286,239.712294 L13.9115098,314.353672 L79.3711482,350.257007 L79.8354562,276.212035 L15.5481286,239.712294 Z"
        fill="currentColor"
      />

      {/* Bottom right cube */}
      <path
        className="cube-bottom-right"
        d="M374.821,218.892 L375.041,326.35 L282.324,380.471 L190.222,326.992 L190,218.697 L282.324,165 L374.821,218.892 Z M219,220.424588 L282.82302,259.162631 L346.646039,220.424588 L282.753367,183 L219,220.424588 Z M289.410644,350.257007 L354.870283,314.353672 L353.233664,239.712294 L288.876683,276.332677 L289.410644,350.257007 Z M205.548129,239.712294 L203.91151,314.353672 L269.371148,350.257007 L269.835456,276.212035 L205.548129,239.712294 Z"
        fill="currentColor"
      />
    </svg>
  );
}
