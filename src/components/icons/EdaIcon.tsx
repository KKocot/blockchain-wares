import { motion } from "framer-motion";

interface EdaIconProps {
  className?: string;
}

export function EdaIcon({ className }: EdaIconProps) {
  // Digital waveform path generator - creates square wave pattern
  const create_waveform = (
    start_x: number,
    y_high: number,
    y_low: number,
    segments: number[]
  ) => {
    let path = `M${start_x},${y_low}`;
    let current_x = start_x;
    let is_high = false;

    for (const width of segments) {
      if (is_high) {
        path += ` L${current_x},${y_high}`;
        path += ` L${current_x + width},${y_high}`;
        path += ` L${current_x + width},${y_low}`;
      } else {
        path += ` L${current_x},${y_low}`;
        path += ` L${current_x + width},${y_low}`;
      }
      current_x += width;
      is_high = !is_high;
    }
    return path;
  };

  // Waveform patterns (width of each segment)
  const wave1_segments = [8, 12, 6, 10, 8, 14, 6, 10, 8, 12];
  const wave2_segments = [10, 8, 14, 6, 12, 8, 10, 6, 14, 8];
  const wave3_segments = [6, 14, 8, 10, 12, 6, 8, 14, 10, 8];

  return (
    <motion.svg
      className={className}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background glow */}
      <defs>
        <radialGradient id="eda-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="chip-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      <motion.circle
        cx="100"
        cy="80"
        r="70"
        fill="url(#eda-glow)"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main chip body */}
      <motion.rect
        x="60"
        y="45"
        width="80"
        height="70"
        rx="4"
        fill="url(#chip-gradient)"
        stroke="currentColor"
        strokeWidth="2"
        animate={{ scale: [1, 1.01, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "100px 80px" }}
      />

      {/* Inner die */}
      <rect
        x="72"
        y="55"
        width="56"
        height="50"
        rx="2"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.4"
      />

      {/* Circuit traces inside chip */}
      <g stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3">
        <line x1="75" y1="65" x2="95" y2="65" />
        <line x1="95" y1="65" x2="95" y2="80" />
        <line x1="95" y1="80" x2="115" y2="80" />
        <line x1="85" y1="75" x2="85" y2="95" />
        <line x1="85" y1="95" x2="105" y2="95" />
        <line x1="105" y1="70" x2="125" y2="70" />
        <line x1="110" y1="85" x2="110" y2="100" />
      </g>

      {/* Left pins */}
      {[52, 62, 72, 82, 92, 102].map((y, i) => (
        <motion.g key={`left-${i}`}>
          <line
            x1="45"
            y1={y}
            x2="60"
            y2={y}
            stroke="currentColor"
            strokeWidth="2"
          />
          <motion.circle
            cx="45"
            cy={y}
            r="3"
            fill="currentColor"
            fillOpacity="0.6"
            animate={{ fillOpacity: [0.4, 0.9, 0.4] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.15,
            }}
          />
        </motion.g>
      ))}

      {/* Right pins */}
      {[52, 62, 72, 82, 92, 102].map((y, i) => (
        <motion.g key={`right-${i}`}>
          <line
            x1="140"
            y1={y}
            x2="155"
            y2={y}
            stroke="currentColor"
            strokeWidth="2"
          />
          <motion.circle
            cx="155"
            cy={y}
            r="3"
            fill="currentColor"
            fillOpacity="0.6"
            animate={{ fillOpacity: [0.4, 0.9, 0.4] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.9 - i * 0.15,
            }}
          />
        </motion.g>
      ))}

      {/* Top pins */}
      {[75, 90, 105, 120].map((x, i) => (
        <motion.g key={`top-${i}`}>
          <line
            x1={x}
            y1="30"
            x2={x}
            y2="45"
            stroke="currentColor"
            strokeWidth="2"
          />
          <motion.circle
            cx={x}
            cy="30"
            r="3"
            fill="currentColor"
            fillOpacity="0.6"
            animate={{ fillOpacity: [0.4, 0.9, 0.4] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        </motion.g>
      ))}

      {/* Bottom pins */}
      {[75, 90, 105, 120].map((x, i) => (
        <motion.g key={`bottom-${i}`}>
          <line
            x1={x}
            y1="115"
            x2={x}
            y2="130"
            stroke="currentColor"
            strokeWidth="2"
          />
          <motion.circle
            cx={x}
            cy="130"
            r="3"
            fill="currentColor"
            fillOpacity="0.6"
            animate={{ fillOpacity: [0.4, 0.9, 0.4] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.6 - i * 0.2,
            }}
          />
        </motion.g>
      ))}

      {/* Waveform displays - simulating timing diagrams */}
      <g>
        {/* Waveform 1 - top left */}
        <motion.path
          d={create_waveform(8, 18, 28, wave1_segments)}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          strokeOpacity="0.7"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.4, 0.6, 1],
          }}
        />

        {/* Waveform 2 - bottom left */}
        <motion.path
          d={create_waveform(8, 135, 145, wave2_segments)}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          strokeOpacity="0.7"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.4, 0.6, 1],
            delay: 0.5,
          }}
        />

        {/* Waveform 3 - top right */}
        <motion.path
          d={create_waveform(165, 18, 28, wave3_segments)}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          strokeOpacity="0.7"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.4, 0.6, 1],
            delay: 1,
          }}
        />
      </g>

      {/* Signal flow indicators - data packets */}
      <motion.circle
        r="2.5"
        fill="currentColor"
        animate={{
          cx: [45, 60, 100, 140, 155],
          cy: [62, 62, 80, 82, 82],
          opacity: [0, 1, 1, 1, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.circle
        r="2.5"
        fill="currentColor"
        animate={{
          cx: [155, 140, 100, 60, 45],
          cy: [72, 72, 65, 52, 52],
          opacity: [0, 1, 1, 1, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.7,
        }}
      />

      <motion.circle
        r="2.5"
        fill="currentColor"
        animate={{
          cx: [90, 90, 90],
          cy: [30, 80, 130],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.4,
        }}
      />

      {/* Clock signal indicator in chip center */}
      <motion.g
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="100"
          cy="80"
          r="6"
          fill="currentColor"
          fillOpacity="0.3"
        />
        <circle cx="100" cy="80" r="3" fill="currentColor" fillOpacity="0.7" />
      </motion.g>
    </motion.svg>
  );
}
