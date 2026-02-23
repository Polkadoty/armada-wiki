/* eslint-disable @next/next/no-img-element */
import { useState, memo } from 'react';
import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  onClick?: () => void;
  onError?: () => void;
  onLoad?: () => void;
  loading?: 'eager' | 'lazy';
}

export const OptimizedImage = memo(({
  src,
  alt,
  width,
  height,
  priority = false,
  className = "",
  onClick,
  onError,
  onLoad,
  loading = 'lazy'
}: OptimizedImageProps) => {
  const safeSrc = src?.trim() || '';
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(!safeSrc);

  useEffect(() => {
    setIsLoading(Boolean(safeSrc));
    setHasError(!safeSrc);
  }, [safeSrc]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Loading placeholder */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 via-zinc-300 to-zinc-200 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800 animate-pulse rounded-lg" />
      )}

      {/* Main image */}
      {!hasError && (
        <img
          src={safeSrc}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          loading={priority ? "eager" : loading}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          onClick={onClick}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center border border-red-500/30 rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
          <AlertCircle className="w-8 h-8 text-red-500/70 mb-2" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400 text-center px-2">Failed to load image</span>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';
