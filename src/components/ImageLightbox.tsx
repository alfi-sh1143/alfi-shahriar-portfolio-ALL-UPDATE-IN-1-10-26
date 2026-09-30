import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import {
  ANIMATION_VALIDATION_CODE,
  getAnimationConfig,
  validateAnimationSecurityCode
} from '../config/animationConfig';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images?: { src: string; alt: string; caption?: string }[];
  imageSrc?: string;
  imageAlt?: string;
  caption?: string;
  initialIndex?: number;
  validationCode?: number;
}

export default function ImageLightbox({
  isOpen,
  onClose,
  images = [],
  imageSrc,
  imageAlt = '',
  caption,
  initialIndex = 0,
  validationCode = ANIMATION_VALIDATION_CODE
}: ImageLightboxProps) {
  const resolvedImages = images.length > 0 
    ? images 
    : imageSrc 
      ? [{ src: imageSrc, alt: imageAlt, caption }] 
      : [];

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [hasSnapped, setHasSnapped] = useState(false);

  const animConfig = getAnimationConfig(validationCode);
  const isValid = validateAnimationSecurityCode(validationCode) && animConfig.enabled && animConfig.kineticGlassGlitch.enabled;
  const { entryAngleDegrees, initialY, initialScale, chromaticSplit } = animConfig.kineticGlassGlitch;

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsZoomed(false);
    if (isOpen) setHasSnapped(false);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && resolvedImages.length > 1) handleNext();
      if (e.key === 'ArrowLeft' && resolvedImages.length > 1) handlePrev();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentIndex, resolvedImages.length]);

  const activeImagesRef = React.useRef(resolvedImages);
  if (resolvedImages.length > 0) {
    activeImagesRef.current = resolvedImages;
  }
  const currentImages = resolvedImages.length > 0 ? resolvedImages : activeImagesRef.current;

  const currentImage = currentImages[currentIndex] || currentImages[0] || { src: '', alt: '' };

  const handleNext = () => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev + 1) % currentImages.length);
  };

  const handlePrev = () => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  return (
    <AnimatePresence>
      {isOpen && currentImage.src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg select-none"
          role="dialog"
          aria-modal="true"
          aria-label="Image Lightbox"
        >
          {/* Top Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent"
          >
            <div className="text-sm font-medium text-slate-300">
              <span className="text-white font-semibold">{currentIndex + 1}</span> / {resolvedImages.length}
              {currentImage.caption && (
                <span className="ml-3 text-slate-400 hidden sm:inline border-l border-slate-700 pl-3">
                  {currentImage.caption}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                id="lightbox-zoom-toggle-btn"
                onClick={() => setIsZoomed(!isZoomed)}
                aria-label={isZoomed ? "Zoom out" : "Zoom in"}
                className="p-2 text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition-colors"
              >
                {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
              </button>
              <button
                id="lightbox-close-btn"
                onClick={onClose}
                aria-label="Close lightbox"
                className="p-2 text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Main Image Stage */}
          <div
            className="relative w-full h-full flex items-center justify-center p-4 sm:p-12 overflow-auto"
            onClick={() => {
              if (!isZoomed) onClose();
            }}
          >
            <motion.div
              key={currentImage.src}
              initial={
                isValid
                  ? {
                      opacity: 0,
                      scale: initialScale,
                      y: initialY,
                      rotate: entryAngleDegrees,
                      filter: 'blur(16px)'
                    }
                  : { opacity: 0, scale: 0.94 }
              }
              animate={
                isValid
                  ? {
                      opacity: 1,
                      scale: isZoomed ? 1.45 : 1,
                      y: 0,
                      rotate: 0,
                      filter: 'blur(0px)'
                    }
                  : { opacity: 1, scale: isZoomed ? 1.45 : 1 }
              }
              exit={{ opacity: 0, scale: 0.92, filter: 'blur(10px)' }}
              transition={{
                type: 'spring',
                damping: 22,
                stiffness: 270,
                mass: 0.85
              }}
              onAnimationComplete={() => {
                if (isValid) setHasSnapped(true);
              }}
              className={`max-w-full max-h-full flex items-center justify-center ${
                isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
              } ${hasSnapped && chromaticSplit ? 'glitch-snap-lock' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(!isZoomed);
              }}
              style={{
                transformStyle: 'preserve-3d',
                willChange: 'transform, filter, box-shadow'
              }}
            >
              <img
                src={currentImage.src}
                alt={currentImage.alt}
                referrerPolicy="no-referrer"
                className={`max-h-[82vh] max-w-[90vw] object-contain shadow-2xl transition-all ${
                  currentImage.src.includes('/logos/')
                    ? 'bg-white p-6 sm:p-10 rounded-3xl border border-slate-600/80 shadow-2xl max-w-xs sm:max-w-md'
                    : 'rounded-xl border border-cyan-500/30 backdrop-blur-md'
                }`}
              />
            </motion.div>
          </div>

          {/* Navigation Arrows */}
          {resolvedImages.length > 1 && (
            <>
              <button
                id="lightbox-prev-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 text-slate-300 hover:text-white bg-slate-900/70 hover:bg-slate-800 rounded-full border border-slate-700/60 transition-colors shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                id="lightbox-next-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next image"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 text-slate-300 hover:text-white bg-slate-900/70 hover:bg-slate-800 rounded-full border border-slate-700/60 transition-colors shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Bottom Caption on Mobile */}
          {currentImage.caption && (
            <div className="absolute bottom-4 inset-x-4 text-center sm:hidden z-20 bg-slate-900/90 py-2 px-4 rounded-lg text-xs text-slate-300 border border-slate-800">
              {currentImage.caption}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
