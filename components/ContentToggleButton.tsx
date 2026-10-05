'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { ListPlus, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import Cookies from 'js-cookie';
import ContentAdditionWindow from './ContentAdditionWindow';
import { fetchCardData } from '@/utils/dataFetcher';

const CONFIG = {
  showCommunityToggle: true,
  showNexusToggle: true,
};

export function ContentToggleButton() {
  const [enableCommunity, setEnableCommunity] = useState(true);
  const [enableNexus, setEnableNexus] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [infoOpen, setInfoOpen] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Community and Nexus are on unless explicitly turned off. Cookies for retired
    // sources (enableLegacy, enableArc, ...) are simply never read.
    setEnableCommunity(Cookies.get('enableCommunity') !== 'false');
    setEnableNexus(Cookies.get('enableNexus') !== 'false');
  }, []);

  useEffect(() => {
    if (infoOpen) setPopoverOpen(false);
  }, [infoOpen]);

  if (!mounted) {
    return null;
  }

  const handleToggle = async (toggleName: string, checked: boolean) => {
    Cookies.set(toggleName, checked.toString(), { expires: 365 });
    // Reload the data
    await fetchCardData();
    // Reload the page to update all components
    window.location.reload();
  };

  const handleCommunityToggle = async (checked: boolean) => {
    setEnableCommunity(checked);
    await handleToggle('enableCommunity', checked);
  };

  const handleNexusToggle = async (checked: boolean) => {
    setEnableNexus(checked);
    await handleToggle('enableNexus', checked);
  };

  const triggerButton = (
    <Button variant="glass" size="icon">
      <ListPlus className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
    </Button>
  );

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger>
              <TooltipTrigger>
                {triggerButton}
              </TooltipTrigger>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Content Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Toggle additional content for the wiki.
                  </p>
                </div>
                <div className="grid gap-3">
                  <div className="mt-4">
                    <h5 className="font-semibold text-sm mb-3">Additional Content</h5>

                    {CONFIG.showCommunityToggle && (
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <label htmlFor="community-toggle" className="text-sm font-medium leading-none">
                            Enable Community Content
                          </label>
                          <button
                            type="button"
                            onClick={() => setInfoOpen('community')}
                            className="ml-1 p-1 hover:bg-zinc-700/20 rounded-full"
                            aria-label="Info"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                        <Switch
                          id="community-toggle"
                          checked={enableCommunity}
                          onCheckedChange={handleCommunityToggle}
                        />
                      </div>
                    )}

                    {CONFIG.showNexusToggle && (
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <label htmlFor="nexus-toggle" className="text-sm font-medium leading-none">
                            Enable Nexus Content
                          </label>
                          <button
                            type="button"
                            onClick={() => setInfoOpen('nexus')}
                            className="ml-1 p-1 hover:bg-zinc-700/20 rounded-full"
                            aria-label="Info"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                        <Switch
                          id="nexus-toggle"
                          checked={enableNexus}
                          onCheckedChange={handleNexusToggle}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <TooltipContent>
            <p>Toggle additional content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {infoOpen && (
        <ContentAdditionWindow
          contentType={infoOpen}
          onClose={() => setInfoOpen(null)}
        />
      )}
    </>
  );
}
