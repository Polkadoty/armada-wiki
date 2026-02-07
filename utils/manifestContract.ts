export interface FileTypeMapping {
  storageKey: string;
  url: string;
  enableCookie?: string;
  tracked?: boolean;
}

export const FILE_TYPE_MAP: Record<string, FileTypeMapping> = {
  // Core data tracked in /lastModified
  ships: { storageKey: "ships", url: "/ships/", tracked: true },
  squadrons: { storageKey: "squadrons", url: "/squadrons/", tracked: true },
  upgrades: { storageKey: "upgrades", url: "/upgrades/", tracked: true },
  objectives: { storageKey: "objectives", url: "/objectives/", tracked: true },

  // Core metadata (tracked)
  aliases: { storageKey: "aliases", url: "/aliases/", tracked: true },
  images: { storageKey: "imageLinks", url: "/image-links/", tracked: true },
  "errata-keys": { storageKey: "errataKeys", url: "/errata-keys/", tracked: true },

  // Legends (tracked)
  "legends-ships": { storageKey: "legendsShips", url: "/legends/ships/", enableCookie: "enableLegends", tracked: true },
  "legends-squadrons": { storageKey: "legendsSquadrons", url: "/legends/squadrons/", enableCookie: "enableLegends", tracked: true },
  "legends-upgrades": { storageKey: "legendsUpgrades", url: "/legends/upgrades/", enableCookie: "enableLegends", tracked: true },

  // Legacy (tracked)
  "legacy-squadrons": { storageKey: "legacySquadrons", url: "/legacy/squadrons/", enableCookie: "enableLegacy", tracked: true },
  "legacy-upgrades": { storageKey: "legacyUpgrades", url: "/legacy/upgrades/", enableCookie: "enableLegacy", tracked: true },

  // Nexus (tracked)
  "nexus-ships": { storageKey: "nexusShips", url: "/nexus/ships/", enableCookie: "enableNexus", tracked: true },
  "nexus-squadrons": { storageKey: "nexusSquadrons", url: "/nexus/squadrons/", enableCookie: "enableNexus", tracked: true },
  "nexus-upgrades": { storageKey: "nexusUpgrades", url: "/nexus/upgrades/", enableCookie: "enableNexus", tracked: true },

  // ARC (tracked)
  "arc-ships": { storageKey: "arcShips", url: "/arc/ships/", enableCookie: "enableArc", tracked: true },
  "arc-squadrons": { storageKey: "arcSquadrons", url: "/arc/squadrons/", enableCookie: "enableArc", tracked: true },
  "arc-upgrades": { storageKey: "arcUpgrades", url: "/arc/upgrades/", enableCookie: "enableArc", tracked: true },

  // Legacy Beta (tracked)
  "legacy-beta-ships": { storageKey: "legacyBetaShips", url: "/legacy-beta/ships/", enableCookie: "enableLegacyBeta", tracked: true },
  "legacy-beta-squadrons": { storageKey: "legacyBetaSquadrons", url: "/legacy-beta/squadrons/", enableCookie: "enableLegacyBeta", tracked: true },
  "legacy-beta-upgrades": { storageKey: "legacyBetaUpgrades", url: "/legacy-beta/upgrades/", enableCookie: "enableLegacyBeta", tracked: true },

  // Naboo (tracked)
  "naboo-ships": { storageKey: "nabooShips", url: "/naboo/ships/", enableCookie: "enableNaboo", tracked: true },
  "naboo-squadrons": { storageKey: "nabooSquadrons", url: "/naboo/squadrons/", enableCookie: "enableNaboo", tracked: true },
  "naboo-upgrades": { storageKey: "nabooUpgrades", url: "/naboo/upgrades/", enableCookie: "enableNaboo", tracked: true },
};

export function validateManifestContractMappings(map: Record<string, FileTypeMapping>): string[] {
  const errors: string[] = [];

  if (!map.images || map.images.url !== "/image-links/") {
    errors.push("Manifest key 'images' must map to '/image-links/'");
  }

  for (const [key, cfg] of Object.entries(map)) {
    if (!cfg.storageKey || cfg.storageKey.trim().length === 0) {
      errors.push(`Mapping '${key}' has empty storageKey`);
    }
    if (!cfg.url.startsWith("/")) {
      errors.push(`Mapping '${key}' url must start with '/'`);
    }
  }

  return errors;
}
