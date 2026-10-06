import { useId, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ className = "", id, label, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const input = (
    <input
      className={`h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-ink outline-offset-2 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:bg-gray-100 ${className}`}
      id={inputId}
      {...props}
    />
  );

  if (!label) {
    return input;
  }

  return (
    <label
      className="flex flex-col gap-2 text-xs text-gray-600"
      htmlFor={inputId}
    >
      {label}
      {input}
    </label>
  );
}
