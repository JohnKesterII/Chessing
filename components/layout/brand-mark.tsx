import Link from "next/link";

import { BRAND } from "@/lib/constants/brand";

export function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-2xl border border-accent/30 bg-accent/10 text-lg font-bold text-accent">
        K
      </div>
      <div>
        <div className="font-display text-lg font-semibold tracking-tight text-text">{BRAND.name}</div>
        <div className="text-xs uppercase tracking-[0.18em] text-muted">Analysis-first chess</div>
      </div>
    </Link>
  );
}
