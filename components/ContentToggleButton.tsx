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
  showLegacyToggle: true,
  showLegendsToggle: true,
  showNexusToggle: true,
  showArcToggle: true,
  showNabooToggle: true,
};

export function ContentToggleButton() {
  const [enableLegacy, setEnableLegacy] = useState(false);
  const [enableLegends, setEnableLegends] = useState(false);
  const [enableNexus, setEnableNexus] = useState(false);
  const [enableArc, setEnableArc] = useState(false);
  const [enableNaboo, setEnableNaboo] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [infoOpen, setInfoOpen] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const legacyCookie = Cookies.get('enableLegacy');
    const legendsCookie = Cookies.get('enableLegends');
    const nexusCookie = Cookies.get('enableNexus');
    const arcCookie = Cookies.get('enableArc');
    const nabooCookie = Cookies.get('enableNaboo');

    setEnableLegacy(CONFIG.showLegacyToggle && legacyCookie === 'true');
    setEnableLegends(CONFIG.showLegendsToggle && legendsCookie === 'true');
    setEnableNexus(nexusCookie === 'true');
    setEnableArc(CONFIG.showArcToggle && arcCookie === 'true');
    setEnableNaboo(CONFIG.showNabooToggle && nabooCookie === 'true');
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

  const handleLegacyToggle = async (checked: boolean) => {
    setEnableLegacy(checked);
    await handleToggle('enableLegacy', checked);
  };

  const handleLegendsToggle = async (checked: boolean) => {
    setEnableLegends(checked);
    await handleToggle('enableLegends', checked);
  };

  const handleNexusToggle = async (checked: boolean) => {
    setEnableNexus(checked);
    await handleToggle('enableNexus', checked);
  };

  const handleArcToggle = async (checked: boolean) => {
    setEnableArc(checked);
    await handleToggle('enableArc', checked);
  };

  const handleNabooToggle = async (checked: boolean) => {
    setEnableNaboo(checked);
    await handleToggle('enableNaboo', checked);
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
                    <h5 className="font-semibold text-sm mb-3">Core Content</h5>

                    {CONFIG.showLegacyToggle && (
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <label htmlFor="legacy-toggle" className="text-sm font-medium leading-none">
                            Enable Legacy Content
                          </label>
                          <button
                            type="button"
                            onClick={() => setInfoOpen('legacy')}
                            className="ml-1 p-1 hover:bg-zinc-700/20 rounded-full"
                            aria-label="Info"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                        <Switch
                          id="legacy-toggle"
                          checked={enableLegacy}
                          onCheckedChange={handleLegacyToggle}
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

                  <div className="mt-4">
                    <h5 className="font-semibold text-sm mb-3">Experimental Content</h5>

                    {CONFIG.showNabooToggle && (
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <label htmlFor="naboo-toggle" className="text-sm font-medium leading-none">
                            Battle for Naboo
                          </label>
                          <button
                            type="button"
                            onClick={() => setInfoOpen('naboo')}
                            className="ml-1 p-1 hover:bg-zinc-700/20 rounded-full"
                            aria-label="Info"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                        <Switch
                          id="naboo-toggle"
                          checked={enableNaboo}
                          onCheckedChange={handleNabooToggle}
                        />
                      </div>
                    )}

                    {CONFIG.showArcToggle && (
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <label htmlFor="arc-toggle" className="text-sm font-medium leading-none">
                            Arc Content
                          </label>
                          <button
                            type="button"
                            onClick={() => setInfoOpen('arc')}
                            className="ml-1 p-1 hover:bg-zinc-700/20 rounded-full"
                            aria-label="Info"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                        <Switch
                          id="arc-toggle"
                          checked={enableArc}
                          onCheckedChange={handleArcToggle}
                        />
                      </div>
                    )}

                    {CONFIG.showLegendsToggle && (
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <label htmlFor="legends-toggle" className="text-sm font-medium leading-none">
                            Legends Content
                          </label>
                          <button
                            type="button"
                            onClick={() => setInfoOpen('legends')}
                            className="ml-1 p-1 hover:bg-zinc-700/20 rounded-full"
                            aria-label="Info"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                        <Switch
                          id="legends-toggle"
                          checked={enableLegends}
                          onCheckedChange={handleLegendsToggle}
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
