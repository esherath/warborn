"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <div className="route-transition" key={pathname}>{children}</div>;
}
