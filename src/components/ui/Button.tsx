import { cn } from "../../lib/utils";
import type { MouseEvent, ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

/**
 * Button component with CSS transitions
 * Supports multiple variants and sizes using DaisyUI theme
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  onClick,
  disabled,
  type = "button",
}: ButtonProps) {
  const base_styles =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]";

  const variant_styles = {
    primary: "bg-primary text-primary-content hover:bg-primary/90 shadow-sm hover:shadow-md",
    secondary: "bg-secondary text-secondary-content hover:bg-secondary/90 shadow-md hover:shadow-lg",
    outline:
      "border border-base-300 text-base-content hover:bg-base-300 bg-transparent shadow-sm hover:shadow-md",
  };

  const size_styles = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-6 text-lg",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        base_styles,
        variant_styles[variant],
        size_styles[size],
        className,
      )}
    >
      {children}
    </button>
  );
}
