"use client";

import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  // If you were using React Query, you'd set up QueryClientProvider here.
  // For now, it's a simple pass-through for potential future use.
  return <>{children}</>;
}
