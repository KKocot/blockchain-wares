import { motion, useScroll, useTransform } from "framer-motion";
import type { Transition } from "framer-motion";
import { useEffect, useState } from "react";
import { FloatingParticles } from "./FloatingParticles";
import { AnimatedLogo } from "./AnimatedLogo";

/**
 * Hero section component with advanced animations
 * Features:
 * - Full-screen layout with animated gradient background
 * - Floating geometric shapes
 * - Staggered fade-in animations
 * - Scroll indicator
 * - Parallax effect on scroll
 */
export function Hero() {
  const [is_mounted, set_is_mounted] = useState(false);
  const { scrollY } = useScroll();

  // Parallax effect - content moves slower than scroll
  const y_parallax = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity_parallax = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    set_is_mounted(true);
  }, []);

  const spring_transition: Transition = {
    type: "spring",
    stiffness: 100,
    damping: 15,
    mass: 0.8,
  };

  const fade_transition: Transition = {
    duration: 0.8,
    ease: [0.6, -0.05, 0.01, 0.99] as [number, number, number, number],
  };

  const fade_in_up = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  };

  const fade_in_scale = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 bg-base-100"
        style={{
          backgroundImage: "url(/assets/img/bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, oklch(71% 0.143 215.221 / 0.15) 0%, transparent 50%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-20 right-20"
          style={{
            background:
              "radial-gradient(circle, oklch(71% 0.143 215.221 / 0.1) 0%, transparent 70%)",
            width: "600px",
            height: "600px",
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Floating particles - snow-like effect from sides */}
      <FloatingParticles count={50} />

      {/* Floating geometric shapes */}
      {is_mounted && (
        <>
          <motion.div
            className="absolute top-1/4 left-1/4 w-2 h-2 bg-secondary rounded-full blur-sm"
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/3 right-1/3 w-3 h-3 border border-secondary rounded-sm opacity-20"
            animate={{
              rotate: [0, 180, 360],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-secondary rounded-full blur-md opacity-30"
            animate={{
              y: [0, -20, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/2 right-1/4 w-1 h-1 bg-base-content rounded-full opacity-50"
            animate={{
              y: [0, -50, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </>
      )}

      {/* Main content */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto text-center"
        style={{
          y: y_parallax,
          opacity: opacity_parallax,
        }}
      >
        {/* Logo + Company name */}
        <motion.div
          className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 mb-8"
          {...fade_in_scale}
          transition={{ ...spring_transition, delay: 0.2 }}
        >
          <AnimatedLogo className="h-16 sm:h-20 md:h-28 lg:h-36 w-auto text-base-content" />
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
            <span className="text-secondary">Blockchain</span>Wares
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-lg md:text-xl lg:text-2xl text-base-content/70 max-w-2xl mx-auto leading-relaxed"
          {...fade_in_up}
          transition={{ ...fade_transition, delay: 0.4 }}
        >
          Software development company from Poland
        </motion.p>
      </motion.div>
    </section>
  );
}
