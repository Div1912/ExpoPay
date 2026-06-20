"use client";

import { BeamsBackground } from "@/components/ui/beams-background";

export function Background({ children }: { children?: React.ReactNode }) {
  if (children) {
    return <BeamsBackground intensity="strong">{children}</BeamsBackground>;
  }
  
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <BeamsBackground intensity="strong" />
    </div>
  );
}
