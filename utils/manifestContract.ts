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

  // Community (tracked): errata of core cards plus new community cards
  "community-ships": { storageKey: "communityShips", url: "/community/ships/", enableCookie: "enableCommunity", tracked: true },
  "community-squadrons": { storageKey: "communitySquadrons", url: "/community/squadrons/", enableCookie: "enableCommunity", tracked: true },
  "community-upgrades": { storageKey: "communityUpgrades", url: "/community/upgrades/", enableCookie: "enableCommunity", tracked: true },
  "community-objectives": { storageKey: "communityObjectives", url: "/community/objectives/", enableCookie: "enableCommunity", tracked: true },

  // Nexus (tracked)
  "nexus-ships": { storageKey: "nexusShips", url: "/nexus/ships/", enableCookie: "enableNexus", tracked: true },
  "nexus-squadrons": { storageKey: "nexusSquadrons", url: "/nexus/squadrons/", enableCookie: "enableNexus", tracked: true },
  "nexus-upgrades": { storageKey: "nexusUpgrades", url: "/nexus/upgrades/", enableCookie: "enableNexus", tracked: true },
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
