"use client";

import { useState, useEffect } from 'react';
import { fetchCardData } from '@/utils/dataFetcher';
import { loadShips, loadSquadrons, loadUpgrades, loadObjectives } from '@/utils/cardSources';
import type { Ship, Squadron, Upgrade, Objective } from '@/types/cards';

// Refreshes the localStorage cache, then reads the merged Core + Community + Nexus set.
// load() never throws: unreadable cache entries come back empty.
function useStoredCards<T>(load: () => Record<string, T>, label: string) {
  const [cards, setCards] = useState<Record<string, T>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchCardData();
      } catch (error) {
        // Fall through to whatever is already cached
        console.error(`Error loading ${label}:`, error);
      }
      setCards(load());
      setLoading(false);
    };

    loadData();
  }, [load, label]);

  return { cards, loading };
}

export function useShips() {
  const { cards: ships, loading } = useStoredCards<Ship>(loadShips, 'ships');
  return { ships, loading };
}

export function useSquadrons() {
  const { cards: squadrons, loading } = useStoredCards<Squadron>(loadSquadrons, 'squadrons');
  return { squadrons, loading };
}

export function useUpgrades() {
  const { cards: upgrades, loading } = useStoredCards<Upgrade>(loadUpgrades, 'upgrades');
  return { upgrades, loading };
}

export function useObjectives() {
  const { cards: objectives, loading } = useStoredCards<Objective>(loadObjectives, 'objectives');
  return { objectives, loading };
}
