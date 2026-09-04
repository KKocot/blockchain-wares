interface FooterProps {
  /** Current page path — pass Astro.url.pathname on subpages */
  currentPath?: string;
}

const MARKETS_PATH = "/markets";

/**
 * Footer component — minimal bar with company info and copyright
 */
export function Footer({ currentPath = "/" }: FooterProps) {
  const current_year = new Date().getFullYear();
  const current_path = currentPath.replace(/\/+$/, "") || "/";
  const is_home = current_path === "/";
  // Single event pages live under the listing, so the link stays current there too
  const is_markets =
    current_path === MARKETS_PATH ||
    current_path.startsWith(`${MARKETS_PATH}/`);

  return (
    <footer className="relative bg-base-100 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <a
              href={is_home ? "#" : "/"}
              className="text-base font-bold text-base-content hover:text-secondary transition-colors duration-150"
            >
              BlockchainWares
            </a>
            <span className="text-xs text-base-content/70 hidden sm:inline">
              |
            </span>
            <a
              href={MARKETS_PATH}
              aria-current={is_markets ? "page" : undefined}
              className="text-xs font-medium text-secondary/90 hover:text-secondary transition-colors duration-150"
            >
              Markets
            </a>
            <span className="text-xs text-base-content/70 hidden sm:inline">
              |
            </span>
            <p className="text-xs text-base-content/70 hidden sm:inline">
              Blockchain, EDA & Engineering Solutions
            </p>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-xs text-base-content/70">
              Copyright &copy; {current_year} BlockchainWares
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-base-content/70 hover:text-secondary transition-colors duration-150"
            >
              <ArrowUpIcon />
              <span>Back to top</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ArrowUpIcon() {
  return (
    <svg
      width="14"
      height="14"
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
