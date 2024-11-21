'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import StarryBackground from '@/components/StarryBackground';
import { UserAvatar } from '@/components/UserAvatar';
import { ThemeToggle } from '@/components/ThemeToggle';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [search, setSearch] = useState("");

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="relative min-h-screen">
        {/* Background */}
        <div className="fixed inset-0 z-0">
          <StarryBackground show={true} lightDisabled={false} />
        </div>

        <div className="relative z-10 flex min-h-screen">
          {/* Sidebar */}
          <Sidebar>
            <SidebarHeader className="border-b border-border px-4 py-2">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="h-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuButton href="/">Home</SidebarMenuButton>
                <SidebarMenuButton href="/ships">Ships</SidebarMenuButton>
                <SidebarMenuButton href="/squadrons">Squadrons</SidebarMenuButton>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>

          {/* Main content */}
          <div className="flex-1 p-8">
            {/* Header */}
            <div className="flex justify-end gap-2 mb-8">
              <UserAvatar />
              <ThemeToggle />
            </div>

            {/* Content with frosted glass effect */}
            <div className="mx-auto max-w-4xl">
              <div className="rounded-lg border bg-background/60 backdrop-blur-xl p-8 shadow-lg">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
} 