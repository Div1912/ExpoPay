"use client";

import { BeamsBackground } from "@/components/ui/beams-background";

export function Background({ children }: { children?: React.ReactNode }) {
  return <BeamsBackground intensity="strong">{children}</BeamsBackground>;
}
