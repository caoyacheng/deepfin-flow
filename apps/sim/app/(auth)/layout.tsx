"use client";

import { GridPattern } from "@/app/(landing)/components/grid-pattern";
import { useBrandConfig } from "@/lib/branding/branding";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brand = useBrandConfig();

  return (
    <main className="relative flex min-h-screen flex-col bg-[#0C0C0C] font-geist-sans text-white">
      {/* Background pattern */}
      <GridPattern
        x={-5}
        y={-5}
        className="absolute inset-0 z-0 stroke-[#ababab]/5"
        width={90}
        height={90}
        aria-hidden="true"
      />

      {/* Header */}

      {/* Content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </main>
  );
}
