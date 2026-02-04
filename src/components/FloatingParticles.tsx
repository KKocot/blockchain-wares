import { motion } from "framer-motion";

interface ParticleProps {
  index: number;
  from_left: boolean;
}

function Particle({ index, from_left }: ParticleProps) {
  const size = 4 + (index % 6);
  const start_x = from_left ? 5 + (index % 15) : 80 + (index % 15);
  const start_y = (index * 23) % 80;
  const duration = 8 + (index % 10);
  const delay = (index * 0.2) % 4;
  const drift_x = (index % 20) - 10;
  const drift_y = 300 + (index % 200);

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: "#ffffff",
        left: `${start_x}%`,
        top: `${start_y}%`,
        boxShadow: "0 0 10px 3px rgba(255, 255, 255, 0.5)",
      }}
      initial={{ opacity: 0 }}
      animate={{
        x: [0, drift_x, drift_x * 2],
        y: [0, drift_y / 2, drift_y],
        opacity: [0, 0.8, 0.8, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/**
 * Floating particles animation component
 * Creates a snow-like effect with particles on sides
 */
export function FloatingParticles({ count = 40 }: { count?: number }) {
  return (
    <div className="absolute inset-0 z-[5] pointer-events-none">
      {Array.from({ length: count }, (_, i) => (
        <Particle key={i} index={i} from_left={i % 2 === 0} />
      ))}
    </div>
  );
}
