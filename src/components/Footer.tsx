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
            <a
              href="#"
              className="inline-block text-xl font-bold text-base-content hover:text-secondary transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              BlockchainWares
            </a>
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
                  <a
                    href={item.href}
                    className="text-sm text-base-content/70 hover:text-secondary transition-all duration-150 inline-block hover:translate-x-0.5"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-base-content uppercase tracking-wider">
              Connect
            </h3>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-sm text-base-content/70 hover:text-secondary transition-all duration-150 hover:scale-[1.05] active:scale-[0.95]"
            >
              <LinkedInIcon />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>

        <div className="h-px bg-base-300 mb-8" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-sm text-base-content/70 text-center md:text-left">
            Copyright © {current_year} BlockchainWares
          </p>

          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-base-content/70 hover:text-secondary transition-all duration-150 mx-auto md:mx-0 hover:-translate-y-0.5 active:scale-[0.95]"
          >
            <ArrowUpIcon />
            <span>Back to top</span>
          </a>
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

function ArrowUpIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}
