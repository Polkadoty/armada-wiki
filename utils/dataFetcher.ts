import { FILE_TYPE_MAP, validateManifestContractMappings } from './manifestContract';

const getPrimaryApiUrl = () => process.env.NEXT_PUBLIC_PRIMARY_API_URL || 'https://api.swarmada.wiki';
const getBackupApiUrl = () => process.env.NEXT_PUBLIC_BACKUP_API_URL || 'https://api-backup.swarmada.wiki';

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
    if (process.env.NODE_ENV !== 'production') {
      const contractErrors = validateManifestContractMappings(FILE_TYPE_MAP);
      if (contractErrors.length > 0) {
        console.error('Manifest mapping contract violations:', contractErrors);
      }
    }

    console.log('Starting fetchCardData...');
    const apiUrl = await getApiUrl();
    console.log('Using API URL:', apiUrl);

    const response = await fetch(`${apiUrl}/lastModified`);
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
        const fetchUrl = `${apiUrl}${mapping.url}`;
        const dataResponse = await fetch(fetchUrl);

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
