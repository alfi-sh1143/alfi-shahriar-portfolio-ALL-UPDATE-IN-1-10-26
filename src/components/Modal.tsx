import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import {
  ANIMATION_VALIDATION_CODE,
  getAnimationConfig,
  validateAnimationSecurityCode
} from '../config/animationConfig';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
  validationCode?: number;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-4xl',
  validationCode = ANIMATION_VALIDATION_CODE
}: ModalProps) {
  const [hasSnapped, setHasSnapped] = useState(false);
  const animConfig = getAnimationConfig(validationCode);
  const isValid = validateAnimationSecurityCode(validationCode) && animConfig.enabled && animConfig.kineticGlassGlitch.enabled;

  const { entryAngleDegrees, initialY, initialScale, chromaticSplit } = animConfig.kineticGlassGlitch;

  useEffect(() => {
    if (isOpen) {
      setHasSnapped(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
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
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: isValid ? 0.25 : 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={title || 'Modal Dialog'}
        >
          {/* Backdrop with 2050 Cybernetic Depth */}
          <div
            className="fixed inset-0 bg-slate-950/70 dark:bg-black/85 backdrop-blur-xl transition-all"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Kinetic Glass Container with Assembly & Glitch Snap Lock */}
          <motion.div
            initial={
              isValid
                ? {
                    opacity: 0,
                    scale: initialScale,
                    y: initialY,
                    rotate: entryAngleDegrees,
                    filter: 'blur(16px)'
                  }
                : { opacity: 1, scale: 1, y: 0 }
            }
            animate={
              isValid
                ? {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    rotate: 0,
                    filter: 'blur(0px)'
                  }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              isValid
                ? {
                    opacity: 0,
                    scale: initialScale * 0.96,
                    y: initialY * 0.6,
                    rotate: -entryAngleDegrees * 0.5,
                    filter: 'blur(10px)',
                    transition: { duration: 0.18, ease: 'easeIn' }
                  }
                : { opacity: 0 }
            }
            transition={
              isValid
                ? {
                    type: 'spring',
                    damping: 20,
                    stiffness: 280,
                    mass: 0.85
                  }
                : { duration: 0 }
            }
            onAnimationComplete={() => {
              if (isValid) setHasSnapped(true);
            }}
            className={`relative z-10 w-full ${maxWidth} my-8 ${
              isValid ? 'kinetic-glass-surface' : 'bg-white dark:bg-[#0b101c] border border-slate-200 dark:border-slate-800'
            } rounded-2xl shadow-2xl text-slate-900 dark:text-slate-100 overflow-hidden ${
              hasSnapped && chromaticSplit ? 'glitch-snap-lock' : ''
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{
              transformStyle: 'preserve-3d',
              willChange: 'transform, box-shadow, filter'
            }}
          >
            {/* 2050 Spatial HUD indicator badge */}
            {isValid && (
              <div className="absolute top-0 right-12 py-1.5 px-3 pointer-events-none opacity-40 text-[9px] font-mono tracking-widest text-cyan-400 select-none flex items-center gap-1 z-20">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>KINETIC//SNAP</span>
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800/70 bg-slate-50/80 dark:bg-[#0e1424]/80 backdrop-blur-md">
              <div>
                {subtitle && (
                  <span className="text-xs font-semibold tracking-wider text-blue-600 dark:text-cyan-400 uppercase block mb-1 font-mono">
                    {subtitle}
                  </span>
                )}
                {title && (
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
                    {title}
                  </h3>
                )}
              </div>
              <button
                id="modal-close-btn"
                onClick={onClose}
                aria-label="Close dialog"
                className="p-2 -mr-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-7 max-h-[78vh] overflow-y-auto custom-scrollbar text-slate-700 dark:text-slate-300">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
