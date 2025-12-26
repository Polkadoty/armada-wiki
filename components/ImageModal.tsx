import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';

export type CardType = 'ship' | 'squadron' | 'upgrade' | 'huge' | 'objective';

interface ImageModalProps {
  src: string;
  alt: string;
  onClose: () => void;
  cardType?: CardType;
}

const CARD_DIMENSIONS: Record<CardType, { width: number; height: number }> = {
  ship: { width: 550, height: 950 },
  squadron: { width: 500, height: 700 },
  upgrade: { width: 500, height: 700 },
  huge: { width: 1000, height: 700 },
  objective: { width: 500, height: 700 },
};

export function ImageModal({ src, alt, onClose, cardType = 'upgrade' }: ImageModalProps) {
  const [mounted, setMounted] = useState(false);
  const dimensions = CARD_DIMENSIONS[cardType];

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ maxWidth: '90vw', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <OptimizedImage
          src={src}
          alt={alt}
          width={dimensions.width}
          height={dimensions.height}
          className="rounded-lg object-contain w-auto h-auto max-w-[90vw] max-h-[85vh]"
          priority={true}
        />
        <button
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 rounded-full p-1.5 transition-colors"
          onClick={onClose}
        >
          <X size={20} className="text-white" />
        </button>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
