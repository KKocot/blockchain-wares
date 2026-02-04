import { motion } from "framer-motion";

interface NavItem {
  label: string;
  href: string;
}

const nav_items: NavItem[] = [
  { label: "About", href: "#about" },
  { label: "Works", href: "#works" },
  { label: "Team", href: "#team" },
  { label: "Career", href: "#career" },
  { label: "Contact", href: "#contact" },
];

const LINKEDIN_URL = "https://www.linkedin.com/company/blockchainwares-software-sp-z-o-o/";

/**
 * Footer component with navigation, social links, copyright, and credits
 */
export function Footer() {
  const current_year = new Date().getFullYear();

  return (
    <footer className="relative bg-base-100 border-t border-base-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4">
            <motion.a
              href="#"
              className="inline-block text-xl font-bold text-base-content hover:text-secondary transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              BlockchainWares
            </motion.a>
            <p className="text-sm text-base-content/70 max-w-xs">
              Software development company specializing in blockchain, EDA, and
              engineering solutions.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-base-content uppercase tracking-wider">
              Navigation
            </h3>
            <ul className="space-y-2">
              {nav_items.map((item) => (
                <li key={item.href}>
                  <motion.a
                    href={item.href}
                    className="text-sm text-base-content/70 hover:text-secondary transition-colors inline-block"
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-base-content uppercase tracking-wider">
              Connect
            </h3>
            <motion.a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-sm text-base-content/70 hover:text-secondary transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LinkedInIcon />
              <span>LinkedIn</span>
            </motion.a>
          </div>
        </div>

        <div className="h-px bg-base-300 mb-8" />

        <div className="space-y-4">
          <p className="text-sm text-base-content/70 text-center md:text-left">
            Copyright © {current_year} BlockchainWares
          </p>

        </div>
      </div>
    </footer>
  );
}

function LinkedInIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
