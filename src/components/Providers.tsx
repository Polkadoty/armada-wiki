'use client';

import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { SidebarProvider } from "@/components/ui/sidebar"; // Added SidebarProvider

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <UserProvider>
          <SidebarProvider> {/* Wrapped children with SidebarProvider */}
            {children}
          </SidebarProvider>
          <Analytics />
          <SpeedInsights />
        </UserProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
} 