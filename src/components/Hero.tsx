import { AnimatedLogo } from "./AnimatedLogo";
import { BlockchainGrid } from "./BlockchainGrid";

/**
 * Hero section component
 * Features:
 * - Full-screen layout with gradient background
 * - Static geometric shapes
 * - No animations for better performance
 */
export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 sm:px-8 overflow-hidden">
      {/* 3D blockchain grid background */}
      <div className="absolute inset-0">
        <BlockchainGrid />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 40%, oklch(72% 0.18 215.221 / 0.12) 0%, transparent 55%)",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Logo + Company name */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 mb-8 hero-fade-in">
          <AnimatedLogo className="h-16 sm:h-20 md:h-28 lg:h-36 w-auto text-base-content" />
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
            <span className="text-secondary">Blockchain</span>Wares
            <span className="sr-only">
              {" "}
              — Blockchain & Enterprise Software Development Company
            </span>
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-base sm:text-lg lg:text-xl text-base-content/80 max-w-3xl mx-auto leading-relaxed text-pretty hero-fade-in-delayed">
          BlockchainWares is a software development company from Dabrowa
          Gornicza, Poland, delivering blockchain, EDA, engineering, and
          database systems since 2002. Blockchain has been our main focus since
          2013. Our 25+ engineers develop an in-house Hive blockchain framework,
          HDL compilers and SystemVerilog verification tools, CAD and CAE
          applications used across aviation and industry, and high-throughput
          data layers on RocksDB and Neo4j. Intel, IBM, Fujitsu, Motorola, and
          NASA are among the end users of our work.
        </p>
      </div>
    </section>
  );
}
