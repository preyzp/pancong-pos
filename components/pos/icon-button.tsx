import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: LucideIcon;
  label: string;
  variant?: "solid" | "outline";
};

export function IconButton({
  className = "",
  icon: Icon,
  label,
  type = "button",
  variant = "outline",
  ...props
}: IconButtonProps) {
  const variantClass =
    variant === "solid"
      ? "border border-ink bg-ink text-white"
      : "border border-gray-200 bg-white text-ink";

  return (
    <button
      aria-label={label}
      className={`inline-flex size-10 items-center justify-center rounded-md outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50 ${variantClass} ${className}`}
      type={type}
      {...props}
    >
      <Icon aria-hidden="true" size={20} strokeWidth={2} />
    </button>
  );
}
