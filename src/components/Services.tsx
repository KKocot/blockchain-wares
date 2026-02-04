import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";

/**
 * Services section component showcasing 4 core expertise areas
 * Features:
 * - Alternating layout (text left/right)
 * - Scroll-triggered fade-in animations
 * - Highlighted key phrases
 * - Custom icons/illustrations
 */

/**
 * Safely renders description text with **bold** markers converted to <strong> tags
 * XSS-safe alternative to dangerouslySetInnerHTML
 */
function render_description(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    const key = `desc-${index}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      const content = part.slice(2, -2);
      return (
        <strong key={key} className="text-secondary">
          {content}
        </strong>
      );
    }
    return <span key={key}>{part}</span>;
  });
}

interface ServiceCardProps {
  title: string;
  description: string;
  key_features: string[];
  icon: React.ReactNode;
  reverse?: boolean;
  index: number;
}

/**
 * ServiceCard - individual service card with alternating layout
 */
function ServiceCard({
  title,
  description,
  key_features,
  icon,
  reverse = false,
  index,
}: ServiceCardProps) {
  const [is_visible, set_is_visible] = useState(false);
  const card_ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          set_is_visible(true);
        }
      },
      { threshold: 0.2 },
    );

    if (card_ref.current) {
      observer.observe(card_ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={card_ref}
      initial={{ opacity: 0, y: 50 }}
      animate={is_visible ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.8,
        delay: index * 0.2,
        ease: [0.6, -0.05, 0.01, 0.99],
      }}
      className={cn(
        "grid md:grid-cols-2 gap-8 md:gap-16 items-center",
        reverse && "md:flex-row-reverse",
      )}
    >
      {/* Icon/Illustration column */}
      <motion.div
        className={cn(
          "flex items-center justify-center",
          reverse && "md:order-2",
        )}
        animate={is_visible ? { scale: [0.9, 1], rotate: [0, 5, 0] } : {}}
        transition={{ duration: 1, delay: index * 0.2 + 0.3 }}
      >
        <div className="relative">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-secondary opacity-10 blur-3xl rounded-full" />
          {/* Icon container */}
          <div className="relative w-64 h-64 flex items-center justify-center bg-gradient-to-br from-base-200 to-base-300 rounded-2xl border border-base-300 backdrop-blur-sm">
            {icon}
          </div>
        </div>
      </motion.div>

      {/* Content column */}
      <div className={cn(reverse && "md:order-1")}>
        <motion.h3
          className="text-3xl md:text-4xl font-bold mb-4 text-base-content"
          animate={is_visible ? { opacity: [0, 1], x: [20, 0] } : {}}
          transition={{ duration: 0.6, delay: index * 0.2 + 0.2 }}
        >
          {title}
        </motion.h3>

        <motion.p
          className="text-base md:text-lg text-base-content/70 leading-relaxed mb-6"
          animate={is_visible ? { opacity: [0, 1] } : {}}
          transition={{ duration: 0.8, delay: index * 0.2 + 0.4 }}
        >
          {render_description(description)}
        </motion.p>

        {/* Key features list */}
        <motion.ul
          className="space-y-3"
          animate={is_visible ? { opacity: [0, 1] } : {}}
          transition={{ duration: 0.8, delay: index * 0.2 + 0.6 }}
        >
          {key_features.map((feature) => (
            <motion.li
              key={feature}
              className="flex items-start gap-3 text-base-content"
              initial={{ opacity: 0, x: -20 }}
              animate={is_visible ? { opacity: 1, x: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: index * 0.2 + 0.7,
              }}
            >
              <span className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm md:text-base">{feature}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </motion.div>
  );
}

/**
 * BlockchainIcon - custom SVG icon for Blockchain service
 */
function BlockchainIcon() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-secondary"
    >
      {/* Central cube */}
      <path
        d="M60 30L80 42V66L60 78L40 66V42L60 30Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Connected nodes */}
      <circle cx="60" cy="30" r="4" fill="currentColor" />
      <circle cx="80" cy="42" r="4" fill="currentColor" />
      <circle cx="80" cy="66" r="4" fill="currentColor" />
      <circle cx="60" cy="78" r="4" fill="currentColor" />
      <circle cx="40" cy="66" r="4" fill="currentColor" />
      <circle cx="40" cy="42" r="4" fill="currentColor" />
      {/* Network connections */}
      <line
        x1="20"
        y1="30"
        x2="40"
        y2="42"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.5"
      />
      <line
        x1="100"
        y1="30"
        x2="80"
        y2="42"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.5"
      />
      <line
        x1="20"
        y1="90"
        x2="40"
        y2="66"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.5"
      />
      <line
        x1="100"
        y1="90"
        x2="80"
        y2="66"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.5"
      />
    </svg>
  );
}

/**
 * EDAIcon - custom SVG icon for Event-Driven Architecture
 */
function EDAIcon() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-secondary"
    >
      {/* Circuit board pattern */}
      <rect
        x="20"
        y="20"
        width="80"
        height="80"
        rx="8"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.05"
      />
      {/* Event nodes */}
      <circle cx="35" cy="35" r="6" fill="currentColor" />
      <circle cx="85" cy="35" r="6" fill="currentColor" />
      <circle cx="35" cy="85" r="6" fill="currentColor" />
      <circle cx="85" cy="85" r="6" fill="currentColor" />
      {/* Central processor */}
      <rect
        x="50"
        y="50"
        width="20"
        height="20"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.2"
      />
      {/* Connection lines */}
      <path
        d="M35 35 L50 50 M85 35 L70 50 M35 85 L50 70 M85 85 L70 70"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Signal waves */}
      <path
        d="M40 60 Q45 55 50 60 T60 60"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.6"
        fill="none"
      />
    </svg>
  );
}

/**
 * EngineeringIcon - custom SVG icon for Engineering/CAD
 */
function EngineeringIcon() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-secondary"
    >
      {/* Blueprint grid */}
      <rect
        x="15"
        y="15"
        width="90"
        height="90"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="5 5"
        opacity="0.3"
      />
      {/* Gear/cog */}
      <circle
        cx="60"
        cy="60"
        r="25"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Gear teeth */}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <rect
          key={angle}
          x="58"
          y="28"
          width="4"
          height="8"
          fill="currentColor"
          transform={`rotate(${angle} 60 60)`}
        />
      ))}
      {/* Center hole */}
      <circle cx="60" cy="60" r="8" stroke="currentColor" strokeWidth="2" />
      {/* Dimension lines */}
      <line
        x1="25"
        y1="110"
        x2="95"
        y2="110"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
      />
      <line
        x1="25"
        y1="108"
        x2="25"
        y2="112"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
      />
      <line
        x1="95"
        y1="108"
        x2="95"
        y2="112"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  );
}

/**
 * DatabaseIcon - custom SVG icon for Database solutions
 */
function DatabaseIcon() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-secondary"
    >
      {/* Database cylinders */}
      <ellipse
        cx="60"
        cy="35"
        rx="30"
        ry="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M30 35 V55 Q30 60 60 60 Q90 60 90 55 V35"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.05"
      />
      <ellipse
        cx="60"
        cy="55"
        rx="30"
        ry="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M30 55 V75 Q30 80 60 80 Q90 80 90 75 V55"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.05"
      />
      <ellipse
        cx="60"
        cy="75"
        rx="30"
        ry="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Data flow lines */}
      <path
        d="M45 90 L45 95 M60 90 L60 95 M75 90 L75 95"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Services() {
  const services = [
    {
      title: "Blockchain",
      description:
        "Our first limited experience with blockchain technology dates back to **2014** when Keyhotee project started. By now the **Hive blockchain** related development is our main focus. Our in-house developed framework offers broad customization capabilities and impressive performance, leading to handling **thousands of transactions per second**, exceptionally short block generation times and various integration methods to traditional data sources.",
      key_features: [
        "Hive blockchain ecosystem expertise",
        "High-performance transaction processing (1000+ TPS)",
        "Custom framework with flexible integration",
        "Sub-second block generation times",
      ],
      icon: <BlockchainIcon />,
    },
    {
      title: "EDA",
      description:
        "The most complex system we have been developing for **more than a dozen years** now is a set of **HDL compiler, simulation and advanced debugging tools** which allow design and verification of large scale System Verilog models. The system is provided to our direct customers.",
      key_features: [
        "12+ years of continuous development",
        "HDL compiler & simulation tools",
        "Large-scale System Verilog support",
        "Advanced debugging capabilities",
      ],
      icon: <EDAIcon />,
    },
    {
      title: "Engineering",
      description:
        "We are involved in development of **CAD & CAE software**, being used at design, verification and simulation process. These tools are used at **biggest engineering and aviation companies in the world**.",
      key_features: [
        "CAD/CAE software development",
        "Design verification & simulation tools",
        "Aerospace industry standards",
        "Enterprise-grade solutions",
      ],
      icon: <EngineeringIcon />,
    },
    {
      title: "Databases",
      description:
        "We are experienced in developing solutions based on both traditional RDBMS and modern high performance oriented non-SQL databases like **RocksDB and Neo4J** offering critical write throughput and most efficient object traversal, very useful at solving **social network analysis problems**.",
      key_features: [
        "RDBMS & NoSQL expertise (RocksDB, Neo4J)",
        "High-performance write throughput",
        "Efficient graph traversal algorithms",
        "Social network analysis solutions",
      ],
      icon: <DatabaseIcon />,
    },
  ];

  return (
    <section className="relative py-24 md:py-32 px-4 overflow-hidden bg-base-100">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary opacity-5 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary opacity-5 blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.p
            className="text-sm md:text-base text-secondary font-semibold tracking-wider uppercase mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Our Expertise
          </motion.p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-base-content mb-6">
            What We Do
          </h2>
          <p className="text-base md:text-lg text-base-content/70 max-w-2xl mx-auto">
            Four core areas where we deliver cutting-edge software solutions
            for the most demanding challenges
          </p>
        </motion.div>

        {/* Services grid */}
        <div className="space-y-32 md:space-y-40">
          {services.map((service, index) => (
            <ServiceCard
              key={service.title}
              {...service}
              reverse={index % 2 === 1}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
