import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function SettingsBackButton() {
  return (
    <Link
      className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-sm font-medium text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
      href="/settings"
    >
      <ArrowLeft aria-hidden="true" size={18} strokeWidth={2} />
      Kembali ke Pengaturan
    </Link>
  );
}
