"use client";

import { useState, useEffect } from 'react';
import { fetchCardData } from '@/utils/dataFetcher';
import type { Ship, Squadron, Upgrade, Objective } from '@/types/cards';

export function useShips() {
  const [ships, setShips] = useState<Record<string, Ship>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchCardData();

        const allShips: Record<string, Ship> = {};

        // Load core ships
        const coreStored = localStorage.getItem('ships');
        if (coreStored) {
          const coreData = JSON.parse(coreStored);
          Object.entries(coreData.ships || {}).forEach(([id, ship]: [string, any]) => {
            allShips[`core-${id}`] = { ...ship, source: 'Core' };
          });
        }

        // Load nexus ships
        const nexusStored = localStorage.getItem('nexusShips');
        if (nexusStored) {
          const nexusData = JSON.parse(nexusStored);
          Object.entries(nexusData.ships || {}).forEach(([id, ship]: [string, any]) => {
            allShips[`nexus-${id}`] = { ...ship, source: 'Nexus' };
          });
        }

        // Load ARC ships
        const arcStored = localStorage.getItem('arcShips');
        if (arcStored) {
          const arcData = JSON.parse(arcStored);
          Object.entries(arcData.ships || {}).forEach(([id, ship]: [string, any]) => {
            allShips[`arc-${id}`] = { ...ship, source: 'ARC' };
          });
        }

        // Load Legacy Beta ships
        const legacyBetaStored = localStorage.getItem('legacyBetaShips');
        if (legacyBetaStored) {
          const legacyBetaData = JSON.parse(legacyBetaStored);
          Object.entries(legacyBetaData.ships || {}).forEach(([id, ship]: [string, any]) => {
            allShips[`legacybeta-${id}`] = { ...ship, source: 'LegacyBeta' };
          });
        }

        // Load Naboo ships
        const nabooStored = localStorage.getItem('nabooShips');
        if (nabooStored) {
          const nabooData = JSON.parse(nabooStored);
          Object.entries(nabooData.ships || {}).forEach(([id, ship]: [string, any]) => {
            allShips[`naboo-${id}`] = { ...ship, source: 'Naboo' };
          });
        }

        setShips(allShips);
      } catch (error) {
        console.error('Error loading ships:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { ships, loading };
}

export function useSquadrons() {
  const [squadrons, setSquadrons] = useState<Record<string, Squadron>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchCardData();

        const allSquadrons: Record<string, Squadron> = {};

        // Load core squadrons
        const coreStored = localStorage.getItem('squadrons');
        if (coreStored) {
          const coreData = JSON.parse(coreStored);
          Object.entries(coreData.squadrons || {}).forEach(([id, squad]: [string, any]) => {
            allSquadrons[`core-${id}`] = { ...squad, source: 'Core' };
          });
        }

        // Load legacy squadrons
        const legacyStored = localStorage.getItem('legacySquadrons');
        if (legacyStored) {
          const legacyData = JSON.parse(legacyStored);
          Object.entries(legacyData.squadrons || {}).forEach(([id, squad]: [string, any]) => {
            allSquadrons[`legacy-${id}`] = { ...squad, source: 'Legacy' };
          });
        }

        // Load nexus squadrons
        const nexusStored = localStorage.getItem('nexusSquadrons');
        if (nexusStored) {
          const nexusData = JSON.parse(nexusStored);
          Object.entries(nexusData.squadrons || {}).forEach(([id, squad]: [string, any]) => {
            allSquadrons[`nexus-${id}`] = { ...squad, source: 'Nexus' };
          });
        }

        // Load ARC squadrons
        const arcStored = localStorage.getItem('arcSquadrons');
        if (arcStored) {
          const arcData = JSON.parse(arcStored);
          Object.entries(arcData.squadrons || {}).forEach(([id, squad]: [string, any]) => {
            allSquadrons[`arc-${id}`] = { ...squad, source: 'ARC' };
          });
        }

        // Load Legacy Beta squadrons
        const legacyBetaStored = localStorage.getItem('legacyBetaSquadrons');
        if (legacyBetaStored) {
          const legacyBetaData = JSON.parse(legacyBetaStored);
          Object.entries(legacyBetaData.squadrons || {}).forEach(([id, squad]: [string, any]) => {
            allSquadrons[`legacybeta-${id}`] = { ...squad, source: 'LegacyBeta' };
          });
        }

        // Load Naboo squadrons
        const nabooStored = localStorage.getItem('nabooSquadrons');
        if (nabooStored) {
          const nabooData = JSON.parse(nabooStored);
          Object.entries(nabooData.squadrons || {}).forEach(([id, squad]: [string, any]) => {
            allSquadrons[`naboo-${id}`] = { ...squad, source: 'Naboo' };
          });
        }

        setSquadrons(allSquadrons);
      } catch (error) {
        console.error('Error loading squadrons:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { squadrons, loading };
}

export function useUpgrades() {
  const [upgrades, setUpgrades] = useState<Record<string, Upgrade>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchCardData();

        const allUpgrades: Record<string, Upgrade> = {};

        // Load core upgrades
        const coreStored = localStorage.getItem('upgrades');
        if (coreStored) {
          const coreData = JSON.parse(coreStored);
          Object.entries(coreData.upgrades || {}).forEach(([id, upgrade]: [string, any]) => {
            allUpgrades[`core-${id}`] = { ...upgrade, source: 'Core' };
          });
        }

        // Load legacy upgrades
        const legacyStored = localStorage.getItem('legacyUpgrades');
        if (legacyStored) {
          const legacyData = JSON.parse(legacyStored);
          Object.entries(legacyData.upgrades || {}).forEach(([id, upgrade]: [string, any]) => {
            allUpgrades[`legacy-${id}`] = { ...upgrade, source: 'Legacy' };
          });
        }

        // Load legends upgrades
        const legendsStored = localStorage.getItem('legendsUpgrades');
        if (legendsStored) {
          const legendsData = JSON.parse(legendsStored);
          Object.entries(legendsData.upgrades || {}).forEach(([id, upgrade]: [string, any]) => {
            allUpgrades[`legends-${id}`] = { ...upgrade, source: 'Legends' };
          });
        }

        // Load nexus upgrades
        const nexusStored = localStorage.getItem('nexusUpgrades');
        if (nexusStored) {
          const nexusData = JSON.parse(nexusStored);
          Object.entries(nexusData.upgrades || {}).forEach(([id, upgrade]: [string, any]) => {
            allUpgrades[`nexus-${id}`] = { ...upgrade, source: 'Nexus' };
          });
        }

        // Load ARC upgrades
        const arcStored = localStorage.getItem('arcUpgrades');
        if (arcStored) {
          const arcData = JSON.parse(arcStored);
          Object.entries(arcData.upgrades || {}).forEach(([id, upgrade]: [string, any]) => {
            allUpgrades[`arc-${id}`] = { ...upgrade, source: 'ARC' };
          });
        }

        // Load Legacy Beta upgrades
        const legacyBetaStored = localStorage.getItem('legacyBetaUpgrades');
        if (legacyBetaStored) {
          const legacyBetaData = JSON.parse(legacyBetaStored);
          Object.entries(legacyBetaData.upgrades || {}).forEach(([id, upgrade]: [string, any]) => {
            allUpgrades[`legacybeta-${id}`] = { ...upgrade, source: 'LegacyBeta' };
          });
        }

        // Load Naboo upgrades
        const nabooStored = localStorage.getItem('nabooUpgrades');
        if (nabooStored) {
          const nabooData = JSON.parse(nabooStored);
          Object.entries(nabooData.upgrades || {}).forEach(([id, upgrade]: [string, any]) => {
            allUpgrades[`naboo-${id}`] = { ...upgrade, source: 'Naboo' };
          });
        }

        setUpgrades(allUpgrades);
      } catch (error) {
        console.error('Error loading upgrades:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { upgrades, loading };
}

export function useObjectives() {
  const [objectives, setObjectives] = useState<Record<string, Objective>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchCardData();
        const stored = localStorage.getItem('objectives');
        if (stored) {
          const data = JSON.parse(stored);
          setObjectives(data.objectives || {});
        }
      } catch (error) {
        console.error('Error loading objectives:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { objectives, loading };
}
