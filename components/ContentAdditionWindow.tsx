'use client';

import React, { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { ImageModal, CardType } from './ImageModal';

interface Card {
  id: string;
  name: string;
  faction: string;
  cardimage: string;
  unique: boolean;
  'ace-name': string;
  size?: string;
  type?: string;
}

interface ContentAdditionWindowProps {
  contentType: string;
  onClose: () => void;
  showNonSWFactions?: boolean;
}

const DATA_TYPES = ['Ships', 'Squadrons', 'Upgrades', 'Objectives'];

const formatFactionName = (faction: string): string => {
  if (faction === 'legacy') return 'Legacy';
  if (faction === 'nexus') return 'Nexus';
  if (faction === 'nexusExperimental') return 'Nexus Experimental';
  if (faction === 'legends') return 'Legends';
  if (faction === 'legacyBeta') return 'LegacyBeta';
  if (faction === 'legacyAlpha') return 'LegacyAlpha';
  if (faction === 'naboo') return 'Battle for Naboo';

  return faction
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

function getDisplayName(card: Card) {
  let name = card['ace-name'] && card['ace-name'].trim() !== '' ? card['ace-name'] : card.name;
  if (card.unique) {
    name = '• ' + name;
  }
  return name;
}

const getCardType = (card: Card): CardType => {
  if (card.type === 'Ships') {
    if (card.size === 'huge' || card.size === '280-huge' || card.size === 'wide-huge') {
      return 'huge';
    }
    return 'ship';
  }
  if (card.type === 'Squadrons') return 'squadron';
  if (card.type === 'Objectives') return 'objective';
  return 'upgrade';
};

const ContentAdditionWindow: React.FC<ContentAdditionWindowProps> = ({ contentType, onClose, showNonSWFactions = false }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState<{src: string, alt: string, cardType: CardType} | null>(null);
  const [isTouchMoving, setIsTouchMoving] = useState(false);

  useEffect(() => {
    setLoading(true);
    const allCards: Card[] = [];
    DATA_TYPES.forEach(type => {
      const key = `${contentType}${type}`;
      const raw = localStorage.getItem(key);
      if (raw && raw.trim().length > 0) {
        try {
          const data = JSON.parse(raw);
          let items: unknown[] = [];
          if (type === 'Ships' && data.ships) {
            const shipsByChassis = data.ships as Record<string, { models?: Record<string, unknown>; size?: string }>;
            items = Object.values(shipsByChassis).flatMap((chassis) =>
              chassis.models
                ? Object.values(chassis.models).map((model) => ({ ...(model as Record<string, unknown>), size: chassis.size }))
                : []
            );
          } else if (type === 'Squadrons' && data.squadrons) {
            items = Object.values(data.squadrons);
          } else if (type === 'Upgrades' && data.upgrades) {
            items = Object.values(data.upgrades);
          } else if (type === 'Objectives' && data.objectives) {
            items = Object.values(data.objectives);
          }
          items.forEach((rawItem) => {
            const item = rawItem as Record<string, unknown>;
            if (item.cardimage && item.faction && item.name) {
              allCards.push({
                id: String(item.id || item.name),
                name: String(item.name),
                faction: String(item.faction),
                cardimage: String(item.cardimage),
                unique: Boolean(item.unique),
                'ace-name': String(item['ace-name'] || ''),
                size: typeof item.size === 'string' ? item.size : undefined,
                type,
              });
            }
          });
        } catch {
          // Ignore parse errors
        }
      }
    });

    const forbiddenFactions = ['cylon', 'colonial', 'unsc', 'covenant'];
    let filteredCards = allCards;
    if (!showNonSWFactions) {
      filteredCards = allCards.filter(card => {
        const faction = typeof card.faction === 'string' ? card.faction.toLowerCase() : '';
        return !forbiddenFactions.some(ff =>
          faction === ff ||
          faction.startsWith(ff + '-') ||
          faction.endsWith('-' + ff) ||
          faction.includes('-' + ff + '-') ||
          faction.includes(',' + ff + ',') ||
          faction.includes(' ' + ff + ' ') ||
          faction.includes(ff + ',') ||
          faction.includes(',' + ff) ||
          faction.includes(ff + ' ') ||
          faction.includes(' ' + ff) ||
          faction === ff.replace(/\s+/g, '')
        );
      });
    }
    setCards(filteredCards);
    setLoading(false);
  }, [contentType, showNonSWFactions]);

  const cardsByFaction = cards.reduce<Record<string, Card[]>>((acc, card) => {
    if (!acc[card.faction]) acc[card.faction] = [];
    acc[card.faction].push(card);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-[500] backdrop-blur-md bg-black/50 flex items-center justify-center" style={{ pointerEvents: 'auto', width: '100vw', height: '100vh' }}>
      <div className="bg-white/95 dark:bg-zinc-900/95 rounded-lg shadow-lg w-[98vw] h-[98vh] min-w-[200px] min-h-[120px] overflow-y-auto transition-all duration-200 flex flex-col border border-zinc-200 dark:border-zinc-700" style={{ maxWidth: '98vw', maxHeight: '98vh', padding: 0 }}>
        <div className="sticky top-0 z-20 bg-white dark:bg-zinc-900 rounded-t-lg flex items-center justify-between px-4 sm:px-10 pt-2 pb-2 sm:pt-6 sm:pb-4 border-b border-zinc-200 dark:border-zinc-700" style={{ minWidth: 0 }}>
          <h2 className="font-bold text-zinc-900 dark:text-white" style={{ fontSize: 'clamp(1.1rem, 2vw, 2rem)', minWidth: 0, whiteSpace: 'normal', wordBreak: 'break-word', flex: 1, paddingRight: '1rem' }}>
            Content Window - {formatFactionName(contentType)}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-2xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 sm:p-6">
          {loading ? (
            <div className="text-center text-zinc-500">Loading...</div>
          ) : cards.length === 0 ? (
            <div className="text-center text-zinc-500">No content found for this category.</div>
          ) : (
            <div>
              {Object.entries(cardsByFaction).map(([faction, factionCards]) => (
                <div key={faction} className="mb-12 pb-4">
                  <h3 className="text-xl font-semibold mb-2">{formatFactionName(faction)}</h3>
                  <div className="content-grid" style={{ maxWidth: '100%' }}>
                    {factionCards.map((card, i) => {
                      const key = (card.id ? card.id : `${card.name}-${card.faction}-${i}`) + '-' + Math.random().toString(36).substr(2, 6);
                      let width = 250, height = 350, aspect = 'aspect-[8.75/15]', colSpan = '';
                      const className = 'object-cover object-center w-full h-full rounded shadow border border-zinc-700';
                      if (card.type === 'Ships' && (card.size === 'huge' || card.size === '280-huge' || card.size === 'wide-huge')) {
                        width = 900; height = 630; aspect = 'aspect-[5/4]';
                        colSpan = 'col-span-3';
                      } else if (card.type === 'Squadrons' || card.type === 'Upgrades') {
                        width = 250; height = 350; aspect = 'aspect-[2.5/3.5]';
                      }
                      return (
                        <div
                          key={key}
                          className={`flex flex-col items-center relative group ${aspect} ${colSpan}`}
                          onClick={() => {
                            if (!isTouchMoving) setModalImage({ src: card.cardimage, alt: card.name, cardType: getCardType(card) });
                          }}
                          onTouchStart={() => setIsTouchMoving(false)}
                          onTouchMove={() => setIsTouchMoving(true)}
                          style={{ cursor: 'pointer' }}
                        >
                          <OptimizedImage
                            src={card.cardimage}
                            alt={card.name}
                            width={width}
                            height={height}
                            className={className}
                          />
                          <div
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded"
                            style={{ pointerEvents: 'none' }}
                          >
                            <Eye className="text-white w-10 h-10 drop-shadow-lg" />
                          </div>
                          <span
                            className="mt-1 text-xs text-center"
                            style={{
                              fontSize: 'clamp(0.85rem, 1.5vw, 1.2rem)',
                              fontWeight: 600,
                              textAlign: 'center',
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                              maxWidth: '95%',
                              display: 'block',
                            }}>
                            {getDisplayName(card)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {modalImage && (
        <ImageModal
          src={modalImage.src}
          alt={modalImage.alt}
          onClose={() => setModalImage(null)}
          cardType={modalImage.cardType}
        />
      )}
    </div>
  );
};

export default ContentAdditionWindow;
