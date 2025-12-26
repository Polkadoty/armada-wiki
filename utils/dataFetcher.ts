import Cookies from 'js-cookie';

const getPrimaryApiUrl = () => process.env.NEXT_PUBLIC_PRIMARY_API_URL || 'https://api.swarmada.wiki';
const getBackupApiUrl = () => process.env.NEXT_PUBLIC_BACKUP_API_URL || 'https://api-backup.swarmada.wiki';

// Mapping from API file types to localStorage keys and fetch URLs
const FILE_TYPE_MAP: Record<string, { storageKey: string; url: string; enableCookie?: string; tracked?: boolean }> = {
  // Core data tracked in /lastModified
  'ships': { storageKey: 'ships', url: '/ships/', tracked: true },
  'squadrons': { storageKey: 'squadrons', url: '/squadrons/', tracked: true },
  'upgrades': { storageKey: 'upgrades', url: '/upgrades/', tracked: true },
  'objectives': { storageKey: 'objectives', url: '/objectives/', tracked: true },

  // Core metadata (tracked)
  'aliases': { storageKey: 'aliases', url: '/aliases/', tracked: true },
  'images': { storageKey: 'imageLinks', url: '/image-links/', tracked: true },
  'errata-keys': { storageKey: 'errataKeys', url: '/errata-keys/', tracked: true },

  // Legends (tracked)
  'legends-ships': { storageKey: 'legendsShips', url: '/legends/ships/', enableCookie: 'enableLegends', tracked: true },
  'legends-squadrons': { storageKey: 'legendsSquadrons', url: '/legends/squadrons/', enableCookie: 'enableLegends', tracked: true },
  'legends-upgrades': { storageKey: 'legendsUpgrades', url: '/legends/upgrades/', enableCookie: 'enableLegends', tracked: true },

  // Legacy (tracked)
  'legacy-squadrons': { storageKey: 'legacySquadrons', url: '/legacy/squadrons/', enableCookie: 'enableLegacy', tracked: true },
  'legacy-upgrades': { storageKey: 'legacyUpgrades', url: '/legacy/upgrades/', enableCookie: 'enableLegacy', tracked: true },

  // Nexus (tracked)
  'nexus-ships': { storageKey: 'nexusShips', url: '/nexus/ships/', enableCookie: 'enableNexus', tracked: true },
  'nexus-squadrons': { storageKey: 'nexusSquadrons', url: '/nexus/squadrons/', enableCookie: 'enableNexus', tracked: true },
  'nexus-upgrades': { storageKey: 'nexusUpgrades', url: '/nexus/upgrades/', enableCookie: 'enableNexus', tracked: true },

  // ARC (tracked)
  'arc-ships': { storageKey: 'arcShips', url: '/arc/ships/', enableCookie: 'enableArc', tracked: true },
  'arc-squadrons': { storageKey: 'arcSquadrons', url: '/arc/squadrons/', enableCookie: 'enableArc', tracked: true },
  'arc-upgrades': { storageKey: 'arcUpgrades', url: '/arc/upgrades/', enableCookie: 'enableArc', tracked: true },

  // Legacy Beta (tracked)
  'legacy-beta-ships': { storageKey: 'legacyBetaShips', url: '/legacy-beta/ships/', enableCookie: 'enableLegacyBeta', tracked: true },
  'legacy-beta-squadrons': { storageKey: 'legacyBetaSquadrons', url: '/legacy-beta/squadrons/', enableCookie: 'enableLegacyBeta', tracked: true },
  'legacy-beta-upgrades': { storageKey: 'legacyBetaUpgrades', url: '/legacy-beta/upgrades/', enableCookie: 'enableLegacyBeta', tracked: true },

  // Naboo (tracked)
  'naboo-ships': { storageKey: 'nabooShips', url: '/naboo/ships/', enableCookie: 'enableNaboo', tracked: true },
  'naboo-squadrons': { storageKey: 'nabooSquadrons', url: '/naboo/squadrons/', enableCookie: 'enableNaboo', tracked: true },
  'naboo-upgrades': { storageKey: 'nabooUpgrades', url: '/naboo/upgrades/', enableCookie: 'enableNaboo', tracked: true },
};

interface LastModifiedResponse {
  globalLastModified: string;
  globalTimestamp: number;
  files: Record<string, {
    lastModified: string;
    timestamp: number;
    fileCount: number;
  }>;
}

const checkApiHealth = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(`${url}/lastModified`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.json();
    return !!data.globalLastModified;
  } catch {
    return false;
  }
};

const getApiUrl = async (): Promise<string> => {
  const useBackup = process.env.NEXT_PUBLIC_USE_BACKUP_API === 'true';
  const primaryUrl = getPrimaryApiUrl();
  const backupUrl = getBackupApiUrl();

  if (useBackup) return backupUrl;

  const isPrimaryHealthy = await checkApiHealth(primaryUrl);
  return isPrimaryHealthy ? primaryUrl : backupUrl;
};

const isContentTypeEnabled = (fileType: string): boolean => {
  const mapping = FILE_TYPE_MAP[fileType];
  if (!mapping) return false;
  // Always enable all content for the wiki
  return true;
};

const getCachedTimestamp = (fileType: string): number | null => {
  const mapping = FILE_TYPE_MAP[fileType];
  if (!mapping) return null;
  const cached = localStorage.getItem(`${mapping.storageKey}_timestamp`);
  return cached ? parseInt(cached, 10) : null;
};

const saveTimestamp = (fileType: string, timestamp: number): void => {
  const mapping = FILE_TYPE_MAP[fileType];
  if (mapping) {
    localStorage.setItem(`${mapping.storageKey}_timestamp`, timestamp.toString());
  }
};

export const fetchCardData = async (): Promise<void> => {
  try {
    console.log('Starting fetchCardData...');

    // Use proxy API route to avoid CORS issues
    const response = await fetch('/api/proxy?path=/lastModified');
    if (!response.ok) {
      throw new Error(`Failed to fetch manifest: ${response.status} ${response.statusText}`);
    }

    const manifest: LastModifiedResponse = await response.json();
    console.log('Fetched manifest with', Object.keys(manifest.files).length, 'file types');

    for (const [fileType, fileInfo] of Object.entries(manifest.files)) {
      if (!isContentTypeEnabled(fileType)) {
        console.log('Skipping disabled content type:', fileType);
        continue;
      }

      const mapping = FILE_TYPE_MAP[fileType];
      if (!mapping) {
        console.log('No mapping found for:', fileType);
        continue;
      }

      const cachedTimestamp = getCachedTimestamp(fileType);
      const hasLocalData = localStorage.getItem(mapping.storageKey);

      if (!hasLocalData || !cachedTimestamp || fileInfo.timestamp > cachedTimestamp) {
        console.log(`Fetching ${fileType} from ${mapping.url}...`);
        // Use proxy to avoid CORS
        const dataResponse = await fetch(`/api/proxy?path=${encodeURIComponent(mapping.url)}`);

        if (!dataResponse.ok) {
          console.error(`Failed to fetch ${fileType}:`, dataResponse.status);
          continue;
        }

        const data = await dataResponse.json();
        localStorage.setItem(mapping.storageKey, JSON.stringify(data));
        saveTimestamp(fileType, fileInfo.timestamp);
        console.log(`✓ Cached ${fileType}`);
      } else {
        console.log(`Using cached ${fileType}`);
      }
    }
    console.log('fetchCardData complete!');
  } catch (error) {
    console.error('Error in fetchCardData:', error);
    throw error;
  }
};

export const sanitizeImageUrl = (url: string): string => {
  if (!url) return url;
  const useBackup = process.env.NEXT_PUBLIC_USE_BACKUP_API === 'true';
  if (useBackup) {
    return url.replace('images.swarmada.wiki', 'api-backup.swarmada.wiki');
  }
  return url;
};
