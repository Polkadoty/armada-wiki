export const sanitizeImageUrl = (url?: string | null): string => {
  if (typeof url !== 'string' || !url.trim()) return '';
  const useBackup = process.env.NEXT_PUBLIC_USE_BACKUP_API === 'true';
  if (useBackup) {
    return url.replace('images.swarmada.wiki', 'api-backup.swarmada.wiki');
  }
  return url;
};
