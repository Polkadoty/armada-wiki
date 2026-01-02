'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFavorites, Favorite } from '@/hooks/useFavorites';

interface FavoriteButtonProps {
  favorite: Omit<Favorite, 'addedAt'>;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'ghost' | 'outline';
  showLabel?: boolean;
}

export function FavoriteButton({
  favorite,
  className,
  size = 'icon',
  variant = 'ghost',
  showLabel = false,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites();

  const isFaved = isLoaded && isFavorite(favorite.id, favorite.type);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(favorite);
      }}
      className={cn(
        'transition-colors',
        isFaved && 'text-faction-rebel',
        className
      )}
      title={isFaved ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={cn(
          'w-4 h-4 transition-all',
          isFaved && 'fill-current scale-110'
        )}
      />
      {showLabel && (
        <span className="ml-2">
          {isFaved ? 'Favorited' : 'Favorite'}
        </span>
      )}
    </Button>
  );
}
