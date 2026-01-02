'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Favorite {
  id: string;
  type: 'ship' | 'squadron' | 'upgrade' | 'objective';
  name: string;
  faction?: string;
  points?: number;
  href: string;
  addedAt: number;
}

const STORAGE_KEY = 'armada-wiki-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error('Failed to save favorites:', error);
      }
    }
  }, [favorites, isLoaded]);

  const addFavorite = useCallback((favorite: Omit<Favorite, 'addedAt'>) => {
    setFavorites((prev) => {
      // Check if already exists
      if (prev.some((f) => f.id === favorite.id && f.type === favorite.type)) {
        return prev;
      }
      return [...prev, { ...favorite, addedAt: Date.now() }];
    });
  }, []);

  const removeFavorite = useCallback((id: string, type: Favorite['type']) => {
    setFavorites((prev) => prev.filter((f) => !(f.id === id && f.type === type)));
  }, []);

  const isFavorite = useCallback(
    (id: string, type: Favorite['type']) => {
      return favorites.some((f) => f.id === id && f.type === type);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    (favorite: Omit<Favorite, 'addedAt'>) => {
      if (isFavorite(favorite.id, favorite.type)) {
        removeFavorite(favorite.id, favorite.type);
      } else {
        addFavorite(favorite);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    isLoaded,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    clearFavorites,
  };
}
