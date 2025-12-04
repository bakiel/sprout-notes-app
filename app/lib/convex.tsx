import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

// Get Convex URL from environment variable
const convexUrl = import.meta.env.VITE_CONVEX_URL;

// Create Convex client (only if URL is configured)
export const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

// Provider component
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    // Convex not configured - render children without provider
    console.log("Convex not configured - running in demo mode");
    return <>{children}</>;
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

// Check if Convex is available
export function isConvexConfigured(): boolean {
  return convex !== null;
}
