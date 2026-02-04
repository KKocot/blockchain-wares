import { motion } from "framer-motion";

interface DatabaseIconProps {
  className?: string;
}

export function DatabaseIcon({ className }: DatabaseIconProps) {
  return (
    <motion.svg
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

      <motion.circle
        cx="100"
        cy="80"
        r="70"
        fill="url(#db-glow)"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main database cylinder (center) */}
      <motion.g
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
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
        <motion.ellipse
          cx="100"
          cy="75"
          rx="30"
          ry="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.5"
          animate={{ strokeOpacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Bottom layer line */}
        <motion.ellipse
          cx="100"
          cy="95"
          rx="30"
          ry="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.5"
          animate={{ strokeOpacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
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
      </motion.g>

      {/* Graph nodes (Neo4J style) - left cluster */}
      <motion.g
        animate={{ x: [0, -2, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      >
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
        <motion.line
          x1="28" y1="55" x2="22" y2="70"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.line
          x1="22" y1="90" x2="32" y2="105"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        <motion.line
          x1="35" y1="50" x2="38" y2="108"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="3 3"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.g>

      {/* Graph nodes - right cluster */}
      <motion.g
        animate={{ x: [0, 2, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
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
        <motion.line
          x1="172" y1="55" x2="178" y2="70"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.line
          x1="178" y1="90" x2="168" y2="105"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <motion.line
          x1="165" y1="50" x2="162" y2="108"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="3 3"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
      </motion.g>

      {/* Data flow lines - left to center (write throughput) */}
      <motion.line
        x1="38" y1="45" x2="70" y2="60"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.line
        x1="32" y1="80" x2="70" y2="80"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />
      <motion.line
        x1="42" y1="115" x2="70" y2="100"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      />

      {/* Data flow lines - center to right */}
      <motion.line
        x1="130" y1="60" x2="162" y2="45"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
      />
      <motion.line
        x1="130" y1="80" x2="168" y2="80"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.45 }}
      />
      <motion.line
        x1="130" y1="100" x2="158" y2="115"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.75 }}
      />

      {/* Animated data packets - flowing into database (write throughput) */}
      <motion.circle
        r="3"
        fill="currentColor"
        animate={{
          cx: [38, 70],
          cy: [45, 60],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      />
      <motion.circle
        r="3"
        fill="currentColor"
        animate={{
          cx: [32, 70],
          cy: [80, 80],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear", delay: 0.4 }}
      />
      <motion.circle
        r="3"
        fill="currentColor"
        animate={{
          cx: [42, 70],
          cy: [115, 100],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear", delay: 0.8 }}
      />

      {/* Animated data packets - flowing out (traversal) */}
      <motion.circle
        r="3"
        fill="currentColor"
        animate={{
          cx: [130, 162],
          cy: [60, 45],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear", delay: 0.2 }}
      />
      <motion.circle
        r="3"
        fill="currentColor"
        animate={{
          cx: [130, 168],
          cy: [80, 80],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear", delay: 0.6 }}
      />
      <motion.circle
        r="3"
        fill="currentColor"
        animate={{
          cx: [130, 158],
          cy: [100, 115],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear", delay: 1.0 }}
      />

      {/* Top indicator - pulsing dot showing activity */}
      <motion.circle
        cx="100"
        cy="30"
        r="5"
        fill="currentColor"
        fillOpacity="0.8"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.8, 0.4, 0.8]
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle
        cx="100"
        cy="30"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5]
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Connection from top indicator to database */}
      <motion.line
        x1="100" y1="38" x2="100" y2="45"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}
