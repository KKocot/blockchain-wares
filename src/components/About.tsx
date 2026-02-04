import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import type { Transition } from "framer-motion";
import { cn } from "../lib/utils";
import { BlockchainBackground } from "./BlockchainBackground";

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 15, suffix: "+", label: "Years of Experience" },
  { value: 50, suffix: "+", label: "Projects Delivered" },
  { value: 20, suffix: "+", label: "Expert Developers" },
];

interface ValueProp {
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Animated SVG Icons
function ScaleIcon() {
  return (
    <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 32 32" fill="none">
      {/* Network nodes */}
      <motion.circle
        cx="16" cy="8" r="3"
        fill="currentColor"
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
      />
      <motion.circle
        cx="6" cy="20" r="3"
        fill="currentColor"
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      />
      <motion.circle
        cx="26" cy="20" r="3"
        fill="currentColor"
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
      />
      <motion.circle
        cx="16" cy="26" r="2"
        fill="currentColor"
        opacity={0.6}
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
      />
      {/* Connecting lines */}
      <motion.path
        d="M16 11 L6 17 M16 11 L26 17 M6 20 L16 24 M26 20 L16 24"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.5 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
      />
      {/* Data flow particles */}
      <motion.circle
        cx="16" cy="8" r="1"
        fill="currentColor"
        animate={{
          cx: [16, 6, 16, 26, 16],
          cy: [8, 20, 26, 20, 8],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 32 32" fill="none">
      {/* Shield outline */}
      <motion.path
        d="M16 3 L28 8 L28 15 C28 22 22 27 16 29 C10 27 4 22 4 15 L4 8 L16 3Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
      />
      {/* Inner shield glow */}
      <motion.path
        d="M16 6 L25 10 L25 15 C25 20 20 24 16 26 C12 24 7 20 7 15 L7 10 L16 6Z"
        fill="currentColor"
        initial={{ opacity: 0.1 }}
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Checkmark */}
      <motion.path
        d="M11 16 L14 19 L21 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.5, repeat: Infinity, repeatDelay: 2 }}
      />
      {/* Pulse rings */}
      <motion.circle
        cx="16" cy="16" r="12"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        initial={{ scale: 0.8, opacity: 0.5 }}
        animate={{ scale: 1.2, opacity: 0 }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </svg>
  );
}

function ExpertiseIcon() {
  return (
    <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 32 32" fill="none">
      {/* Brain/chip hybrid */}
      <motion.rect
        x="8" y="8" width="16" height="16" rx="3"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "center" }}
      />
      {/* Circuit lines */}
      <motion.path
        d="M4 12 L8 12 M4 16 L8 16 M4 20 L8 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
      />
      <motion.path
        d="M24 12 L28 12 M24 16 L28 16 M24 20 L28 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
      />
      <motion.path
        d="M12 4 L12 8 M16 4 L16 8 M20 4 L20 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.25 }}
      />
      <motion.path
        d="M12 24 L12 28 M16 24 L16 28 M20 24 L20 28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
      />
      {/* Core */}
      <motion.circle
        cx="16" cy="16" r="4"
        fill="currentColor"
        initial={{ scale: 0.8 }}
        animate={{ scale: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Inner circuit pattern */}
      <motion.path
        d="M13 13 L19 19 M19 13 L13 19"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </svg>
  );
}

const VALUE_PROPS: ValueProp[] = [
  {
    title: "Built to Scale",
    description: "Architecture designed for growth, handling thousands of transactions per second.",
    icon: <ScaleIcon />,
  },
  {
    title: "Battle-Tested",
    description: "Production-proven solutions powering enterprise systems worldwide.",
    icon: <ShieldIcon />,
  },
  {
    title: "Deep Expertise",
    description: "Specialists in blockchain, EDA, databases, and complex engineering challenges.",
    icon: <ExpertiseIcon />,
  },
];

function useAnimatedCounter(value: number, is_in_view: boolean) {
  const count = useMotionValue(0);

  useEffect(() => {
    if (is_in_view) {
      const controls = animate(count, value, {
        duration: 2,
        ease: "easeOut",
      });
      return controls.stop;
    }
  }, [is_in_view, value, count]);

  return count;
}

function StatCard({ stat, index, is_in_view }: { stat: Stat; index: number; is_in_view: boolean }) {
  const count = useAnimatedCounter(stat.value, is_in_view);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [display_value, set_display_value] = useState(0);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (latest) => {
      set_display_value(latest);
    });
    return unsubscribe;
  }, [rounded]);

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 20 }}
      animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
    >
      <div className={cn(
        "relative z-10 p-4 md:p-6 rounded-xl md:rounded-2xl",
        "bg-base-200/30 backdrop-blur-sm",
        "border border-white/5",
        "shadow-lg shadow-black/20",
        "transition-all duration-300",
        "hover:bg-base-200/50 hover:border-secondary/20",
        "hover:shadow-xl hover:shadow-secondary/10"
      )}>
        <div className="text-2xl md:text-4xl lg:text-5xl font-bold text-secondary mb-1 md:mb-2 drop-shadow-[0_0_20px_rgba(56,189,248,0.25)]">
          {display_value}{stat.suffix}
        </div>
        <div className="text-[10px] md:text-sm text-base-content/60 uppercase tracking-wider">
          {stat.label}
        </div>
      </div>
      {/* Glow effect on hover */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100",
        "bg-secondary/5 blur-xl transition-opacity duration-300 -z-10"
      )} />
    </motion.div>
  );
}

export function About() {
  const section_ref = useRef<HTMLDivElement>(null);
  const is_in_view = useInView(section_ref, { once: true, amount: 0.2 });

  const transition: Transition = {
    duration: 0.6,
    ease: [0.6, -0.05, 0.01, 0.99] as [number, number, number, number],
  };

  return (
    <section
      id="about"
      ref={section_ref}
      className="relative min-h-screen flex items-center py-12 md:py-24 lg:py-32 px-4 overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, oklch(71% 0.143 215.221) 1px, transparent 1px),
              linear-gradient(to bottom, oklch(71% 0.143 215.221) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Blockchain network animation */}
        <BlockchainBackground id="about" />
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-80 h-80 bg-secondary/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center mb-10 md:mb-20">
          {/* Left column - Text content */}
          <div>
            <motion.span
              className="text-secondary font-medium tracking-wider uppercase text-xs md:text-sm block mb-2 md:mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={is_in_view ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={transition}
            >
              About Us
            </motion.span>

            <motion.h2
              className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6 drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ ...transition, delay: 0.1 }}
            >
              Software Development{" "}
              <span className="text-secondary drop-shadow-[0_0_30px_rgba(56,189,248,0.3)]">Done Right</span>
            </motion.h2>

            <motion.p
              className="text-base md:text-lg text-base-content/70 leading-relaxed mb-4 md:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ ...transition, delay: 0.2 }}
            >
              We are a software development company based in Dabrowa Gornicza, Poland.
              We specialize in building complete products, complex frameworks, and
              reusable libraries that power businesses worldwide.
            </motion.p>

            <motion.p
              className="text-sm md:text-base text-base-content/60 leading-relaxed mb-6 md:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ ...transition, delay: 0.3 }}
            >
              From blockchain solutions to database optimization, we tackle the most
              demanding engineering challenges with precision and expertise.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ ...transition, delay: 0.4 }}
            >
              <a
                href="#expertise"
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-3 rounded-full",
                  "bg-secondary text-secondary-content font-medium",
                  "shadow-lg shadow-secondary/30",
                  "transition-all duration-300",
                  "hover:bg-secondary/90 hover:gap-3 hover:shadow-xl hover:shadow-secondary/40",
                  "focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-base-100"
                )}
              >
                Our Expertise
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
              </a>
            </motion.div>
          </div>

          {/* Right column - Value propositions */}
          <div className="space-y-3 md:space-y-4">
            {VALUE_PROPS.map((prop, index) => (
              <motion.div
                key={prop.title}
                className={cn(
                  "group relative p-4 md:p-6 rounded-xl md:rounded-2xl",
                  "bg-base-200/30 backdrop-blur-sm",
                  "border border-white/5",
                  "shadow-lg shadow-black/20",
                  "transition-all duration-300",
                  "hover:bg-base-200/50 hover:border-secondary/20",
                  "hover:shadow-xl hover:shadow-secondary/10",
                  "hover:translate-x-2"
                )}
                initial={{ opacity: 0, x: 30 }}
                animate={is_in_view ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                transition={{ ...transition, delay: 0.2 + index * 0.1 }}
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div className={cn(
                    "flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl",
                    "bg-secondary/10 text-secondary",
                    "flex items-center justify-center",
                    "shadow-md shadow-secondary/20",
                    "transition-all duration-300",
                    "group-hover:bg-secondary group-hover:text-secondary-content",
                    "group-hover:shadow-lg group-hover:shadow-secondary/40"
                  )}>
                    {prop.icon}
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold mb-0.5 md:mb-1 group-hover:text-secondary transition-colors">
                      {prop.title}
                    </h3>
                    <p className="text-xs md:text-sm text-base-content/60">
                      {prop.description}
                    </p>
                  </div>
                </div>
                {/* Accent line */}
                <div className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 rounded-full",
                  "bg-secondary transition-all duration-300",
                  "group-hover:h-1/2"
                )} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats section */}
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={is_in_view ? { opacity: 1 } : { opacity: 0 }}
          transition={{ ...transition, delay: 0.5 }}
        >
          {/* Divider line - hidden on mobile */}
          <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />

          <div className="pt-8 md:pt-16">
            <div className="grid grid-cols-3 gap-3 md:gap-6">
              {STATS.map((stat, index) => (
                <StatCard
                  key={stat.label}
                  stat={stat}
                  index={index}
                  is_in_view={is_in_view}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
