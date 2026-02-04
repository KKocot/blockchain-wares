import { motion } from "framer-motion";

interface EngineeringIconProps {
  className?: string;
}

export function EngineeringIcon({ className }: EngineeringIconProps) {
  // Generate gear tooth path
  const create_gear = (cx: number, cy: number, inner_r: number, outer_r: number, teeth: number) => {
    const points: string[] = [];
    const tooth_angle = (2 * Math.PI) / teeth;
    const half_tooth = tooth_angle / 4;

    for (let i = 0; i < teeth; i++) {
      const angle = i * tooth_angle;
      // Inner point before tooth
      points.push(
        `${cx + inner_r * Math.cos(angle - half_tooth)},${cy + inner_r * Math.sin(angle - half_tooth)}`
      );
      // Outer tooth start
      points.push(
        `${cx + outer_r * Math.cos(angle - half_tooth * 0.5)},${cy + outer_r * Math.sin(angle - half_tooth * 0.5)}`
      );
      // Outer tooth end
      points.push(
        `${cx + outer_r * Math.cos(angle + half_tooth * 0.5)},${cy + outer_r * Math.sin(angle + half_tooth * 0.5)}`
      );
      // Inner point after tooth
      points.push(
        `${cx + inner_r * Math.cos(angle + half_tooth)},${cy + inner_r * Math.sin(angle + half_tooth)}`
      );
    }
    return `M${points.join("L")}Z`;
  };

  return (
    <motion.svg
      className={className}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="eng-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="eng-shine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Background glow */}
      <motion.circle
        cx="100"
        cy="80"
        r="70"
        fill="url(#eng-glow)"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main large gear - center */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "100px 80px" }}
      >
        <path
          d={create_gear(100, 80, 32, 42, 12)}
          fill="url(#eng-shine)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle
          cx="100"
          cy="80"
          r="24"
          fill="currentColor"
          fillOpacity="0.05"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle
          cx="100"
          cy="80"
          r="10"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {/* Spokes */}
        {[0, 60, 120, 180, 240, 300].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <line
              key={angle}
              x1={100 + 12 * Math.cos(rad)}
              y1={80 + 12 * Math.sin(rad)}
              x2={100 + 22 * Math.cos(rad)}
              y2={80 + 22 * Math.sin(rad)}
              stroke="currentColor"
              strokeWidth="3"
              strokeOpacity="0.4"
            />
          );
        })}
      </motion.g>

      {/* Top-left gear */}
      <motion.g
        animate={{ rotate: -360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "52px 42px" }}
      >
        <path
          d={create_gear(52, 42, 18, 26, 8)}
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="52" cy="42" r="12" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="1" />
        <circle cx="52" cy="42" r="5" fill="currentColor" fillOpacity="0.3" />
      </motion.g>

      {/* Bottom-right gear */}
      <motion.g
        animate={{ rotate: -360 }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "152px 115px" }}
      >
        <path
          d={create_gear(152, 115, 16, 22, 8)}
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="152" cy="115" r="10" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="1" />
        <circle cx="152" cy="115" r="4" fill="currentColor" fillOpacity="0.3" />
      </motion.g>

      {/* Technical drawing - cross section view */}
      <g>
        {/* Vertical cross-section line */}
        <motion.line
          x1="100"
          y1="25"
          x2="100"
          y2="135"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="4 2"
          strokeOpacity="0.3"
          animate={{ strokeDashoffset: [0, -12] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        {/* Horizontal cross-section line */}
        <motion.line
          x1="30"
          y1="80"
          x2="170"
          y2="80"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="4 2"
          strokeOpacity="0.3"
          animate={{ strokeDashoffset: [0, -12] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </g>

      {/* Dimension arrows and measurements */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0.8, 0] }}
        transition={{ duration: 4, repeat: Infinity, times: [0, 0.15, 0.85, 1] }}
      >
        {/* Top dimension */}
        <line x1="58" y1="20" x2="142" y2="20" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M58 20 L63 17 L63 23 Z" fill="currentColor" fillOpacity="0.5" />
        <path d="M142 20 L137 17 L137 23 Z" fill="currentColor" fillOpacity="0.5" />
        <line x1="100" y1="38" x2="100" y2="20" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />

        {/* Right dimension */}
        <line x1="175" y1="42" x2="175" y2="115" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M175 42 L172 47 L178 47 Z" fill="currentColor" fillOpacity="0.5" />
        <path d="M175 115 L172 110 L178 110 Z" fill="currentColor" fillOpacity="0.5" />
      </motion.g>

      {/* Connecting rods / linkages */}
      <motion.g
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Rod from center to top-left gear */}
        <line
          x1="72"
          y1="58"
          x2="68"
          y2="54"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeOpacity="0.3"
        />
        {/* Rod from center to bottom-right gear */}
        <line
          x1="128"
          y1="102"
          x2="136"
          y2="103"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeOpacity="0.3"
        />
      </motion.g>

      {/* Piston animation on left side */}
      <g>
        <rect
          x="18"
          y="60"
          width="12"
          height="40"
          rx="2"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="1"
        />
        <motion.rect
          x="20"
          y="65"
          width="8"
          height="15"
          rx="1"
          fill="currentColor"
          fillOpacity="0.4"
          animate={{ y: [65, 80, 65] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Piston rod */}
        <motion.line
          x1="24"
          y1="80"
          x2="24"
          y2="55"
          stroke="currentColor"
          strokeWidth="2"
          animate={{ y1: [80, 95, 80], y2: [55, 70, 55] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </g>

      {/* Data flow particles */}
      <motion.circle
        r="3"
        fill="currentColor"
        animate={{
          cx: [52, 76, 100],
          cy: [42, 61, 80],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle
        r="3"
        fill="currentColor"
        animate={{
          cx: [100, 126, 152],
          cy: [80, 97, 115],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Blueprint corner markers */}
      <g stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4">
        <path d="M15 20 L15 10 L25 10" fill="none" />
        <path d="M185 10 L195 10 L195 20" fill="none" />
        <path d="M15 140 L15 150 L25 150" fill="none" />
        <path d="M185 150 L195 150 L195 140" fill="none" />
      </g>

      {/* Scanning/verification line */}
      <motion.line
        x1="30"
        y1="80"
        x2="170"
        y2="80"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.6"
        initial={{ x1: 30, x2: 30 }}
        animate={{
          x1: [30, 30, 170],
          x2: [30, 170, 170],
          opacity: [0, 0.6, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          times: [0, 0.5, 1],
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Rotation indicators on main gear */}
      {[0, 90, 180, 270].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = 100 + 50 * Math.cos(rad);
        const y = 80 + 50 * Math.sin(rad);
        return (
          <motion.circle
            key={angle}
            cx={x}
            cy={y}
            r="2"
            fill="currentColor"
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        );
      })}
    </motion.svg>
  );
}
