import { motion } from "framer-motion";

interface BlockchainIconProps {
  className?: string;
}

export function BlockchainIcon({ className }: BlockchainIconProps) {
  const hexagon_path = (cx: number, cy: number, r: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
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
      {/* Background glow */}
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <motion.circle
        cx="100"
        cy="80"
        r="70"
        fill="url(#glow)"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Central hexagon - main node */}
      <motion.g
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d={hexagon_path(100, 80, 28)}
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d={hexagon_path(100, 80, 18)}
          fill="currentColor"
          fillOpacity="0.25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="100" cy="80" r="6" fill="currentColor" fillOpacity="0.8" />
      </motion.g>

      {/* Top hexagon */}
      <motion.g
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      >
        <path
          d={hexagon_path(100, 28, 18)}
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="100" cy="28" r="4" fill="currentColor" fillOpacity="0.6" />
      </motion.g>

      {/* Top-left hexagon */}
      <motion.g
        animate={{ x: [0, -2, 0], y: [0, -2, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      >
        <path
          d={hexagon_path(45, 52, 18)}
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="45" cy="52" r="4" fill="currentColor" fillOpacity="0.6" />
      </motion.g>

      {/* Top-right hexagon */}
      <motion.g
        animate={{ x: [0, 2, 0], y: [0, -2, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      >
        <path
          d={hexagon_path(155, 52, 18)}
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="155" cy="52" r="4" fill="currentColor" fillOpacity="0.6" />
      </motion.g>

      {/* Bottom-left hexagon */}
      <motion.g
        animate={{ x: [0, -2, 0], y: [0, 2, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      >
        <path
          d={hexagon_path(45, 108, 18)}
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="45" cy="108" r="4" fill="currentColor" fillOpacity="0.6" />
      </motion.g>

      {/* Bottom-right hexagon */}
      <motion.g
        animate={{ x: [0, 2, 0], y: [0, 2, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 1.0 }}
      >
        <path
          d={hexagon_path(155, 108, 18)}
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="155" cy="108" r="4" fill="currentColor" fillOpacity="0.6" />
      </motion.g>

      {/* Bottom hexagon */}
      <motion.g
        animate={{ y: [0, 3, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      >
        <path
          d={hexagon_path(100, 132, 18)}
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="100" cy="132" r="4" fill="currentColor" fillOpacity="0.6" />
      </motion.g>

      {/* Connection lines */}
      {/* Center to top */}
      <motion.line
        x1="100" y1="52" x2="100" y2="46"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Center to top-left */}
      <motion.line
        x1="75" y1="65" x2="60" y2="58"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />
      {/* Center to top-right */}
      <motion.line
        x1="125" y1="65" x2="140" y2="58"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      />
      {/* Center to bottom-left */}
      <motion.line
        x1="75" y1="95" x2="60" y2="102"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      />
      {/* Center to bottom-right */}
      <motion.line
        x1="125" y1="95" x2="140" y2="102"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />
      {/* Center to bottom */}
      <motion.line
        x1="100" y1="108" x2="100" y2="114"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 1.0 }}
      />

      {/* Data packets traveling along connections */}
      <motion.circle
        r="3"
        fill="currentColor"
        animate={{
          cx: [100, 100],
          cy: [52, 46],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.circle
        r="3"
        fill="currentColor"
        animate={{
          cx: [75, 60],
          cy: [65, 58],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear", delay: 0.3 }}
      />
      <motion.circle
        r="3"
        fill="currentColor"
        animate={{
          cx: [125, 140],
          cy: [65, 58],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear", delay: 0.6 }}
      />
      <motion.circle
        r="3"
        fill="currentColor"
        animate={{
          cx: [75, 60],
          cy: [95, 102],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear", delay: 0.9 }}
      />
      <motion.circle
        r="3"
        fill="currentColor"
        animate={{
          cx: [125, 140],
          cy: [95, 102],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear", delay: 1.2 }}
      />
    </motion.svg>
  );
}
