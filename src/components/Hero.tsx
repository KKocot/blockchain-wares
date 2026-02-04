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
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-base-100">
      {/* 3D blockchain grid background */}
      <div className="absolute inset-0">
        <BlockchainGrid />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, oklch(71% 0.143 215.221 / 0.15) 0%, transparent 50%)",
          }}
        />
        <div
          className="absolute top-20 right-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(71% 0.143 215.221 / 0.1) 0%, transparent 70%)",
            width: "600px",
            height: "600px",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Logo + Company name */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 mb-8">
          <AnimatedLogo className="h-16 sm:h-20 md:h-28 lg:h-36 w-auto text-base-content" />
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
            <span className="text-secondary">Blockchain</span>Wares
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-lg md:text-xl lg:text-2xl text-base-content/70 max-w-2xl mx-auto leading-relaxed">
          Software development company from Poland
        </p>
      </div>
    </section>
  );
}
