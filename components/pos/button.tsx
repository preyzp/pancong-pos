import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};

export function Button({
  className = "",
  fullWidth = false,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "primary"
      ? "border border-ink bg-ink text-white"
      : "border border-gray-200 bg-white text-ink";

  return (
    <button
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50 ${variantClass} ${fullWidth ? "w-full" : ""} ${className}`}
      type={type}
      {...props}
    />
  );
}
