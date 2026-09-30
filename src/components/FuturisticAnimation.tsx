import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import {
  ANIMATION_VALIDATION_CODE,
  AnimationValidationCode,
  FuturisticAnimationSettings,
  getAnimationConfig,
  updateAnimationConfig,
  subscribeToAnimationConfig,
  validateAnimationSecurityCode,
  STATIC_FALLBACK_CONFIG
} from '../config/animationConfig';

// ============================================================================
// Context & Hook: useFuturisticAnimations
// ============================================================================

interface AnimationContextValue {
  config: FuturisticAnimationSettings;
  isEnabled: boolean;
  securityCode: AnimationValidationCode;
  updateSettings: (updates: Partial<Omit<FuturisticAnimationSettings, 'securityCode'>>, validationCode: number) => boolean;
}

const AnimationContext = createContext<AnimationContextValue>({
  config: STATIC_FALLBACK_CONFIG,
  isEnabled: false,
  securityCode: ANIMATION_VALIDATION_CODE,
  updateSettings: () => false
});

export function FuturisticAnimationProvider({
  children,
  validationCode = ANIMATION_VALIDATION_CODE
}: {
  children: React.ReactNode;
  validationCode?: number;
}) {
  const [config, setConfig] = useState<FuturisticAnimationSettings>(() =>
    getAnimationConfig(validationCode)
  );

  useEffect(() => {
    // If validation fails initially, fallback immediately to static mode
    if (!validateAnimationSecurityCode(validationCode)) {
      setConfig({ ...STATIC_FALLBACK_CONFIG });
      return;
    }

    const unsubscribe = subscribeToAnimationConfig((newConfig) => {
      setConfig(newConfig);
    });

    return unsubscribe;
  }, [validationCode]);

  const updateSettings = (
    updates: Partial<Omit<FuturisticAnimationSettings, 'securityCode'>>,
    code: number
  ): boolean => {
    const result = updateAnimationConfig(updates, code);
    return result.success;
  };

  const isEnabled = config.enabled && validateAnimationSecurityCode(validationCode);

  return (
    <AnimationContext.Provider
      value={{
        config,
        isEnabled,
        securityCode: ANIMATION_VALIDATION_CODE,
        updateSettings
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
}

export function useFuturisticAnimations() {
  return useContext(AnimationContext);
}

// ============================================================================
// 1. Holographic Z-Axis Bloom (Page Load / Backdrop)
// ============================================================================

interface HolographicBloomProps {
  children: React.ReactNode;
  className?: string;
  validationCode?: number;
  showScanlines?: boolean;
}

export function HolographicBloom({
  children,
  className = '',
  validationCode = ANIMATION_VALIDATION_CODE,
  showScanlines = true
}: HolographicBloomProps) {
  const { config, isEnabled } = useFuturisticAnimations();
  const isValid = isEnabled && validateAnimationSecurityCode(validationCode) && config.holographicBloom.enabled;

  const { initialScale, initialBlur, duration, ease } = config.holographicBloom;

  // Fallback to static UI if validation fails or disabled
  if (!isValid) {
    return <div className={`w-full ${className}`}>{children}</div>;
  }

  return (
    <div className="holographic-projection-root w-full relative">
      {/* Optional futuristic 2050 volumetric light beam projection on load */}
      <motion.div
        initial={{ opacity: 0.8, scaleX: 0.1, scaleY: 0 }}
        animate={{ opacity: 0, scaleX: 1.5, scaleY: 1.5 }}
        transition={{ duration: duration * 0.9, ease: 'easeOut' }}
        className="pointer-events-none fixed inset-0 z-40 bg-radial from-cyan-500/15 via-blue-500/5 to-transparent blur-3xl"
        style={{ transformOrigin: 'top center' }}
      />

      <motion.div
        initial={{
          opacity: 0,
          scale: initialScale,
          filter: `blur(${initialBlur}px)`,
          transform: 'translate3d(0, 0, -160px)'
        }}
        animate={{
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          transform: 'translate3d(0, 0, 0px)'
        }}
        transition={{
          duration,
          ease: ease,
          opacity: { duration: duration * 0.65 }
        }}
        className={`w-full ${showScanlines ? 'hologram-shimmer' : ''} ${className}`}
        style={{
          transformStyle: 'preserve-3d',
          willChange: 'transform, filter, opacity'
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ============================================================================
// 2. Zero-Gravity Stagger (Lists & Grid Items)
// ============================================================================

interface ZeroGravityContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  validationCode?: number;
}

export function ZeroGravityContainer({
  children,
  className = '',
  staggerDelay,
  validationCode = ANIMATION_VALIDATION_CODE
}: ZeroGravityContainerProps) {
  const { config, isEnabled } = useFuturisticAnimations();
  const isValid = isEnabled && validateAnimationSecurityCode(validationCode) && config.zeroGravityStagger.enabled;

  const delay = staggerDelay ?? config.zeroGravityStagger.staggerDelay;

  if (!isValid) {
    return <div className={className}>{children}</div>;
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delay,
        delayChildren: 0.05
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ZeroGravityItemProps {
  children: React.ReactNode;
  className?: string;
  enableAmbientFloat?: boolean;
  validationCode?: number;
}

export function ZeroGravityItem({
  children,
  className = '',
  enableAmbientFloat = false,
  validationCode = ANIMATION_VALIDATION_CODE
}: ZeroGravityItemProps) {
  const { config, isEnabled } = useFuturisticAnimations();
  const isValid = isEnabled && validateAnimationSecurityCode(validationCode) && config.zeroGravityStagger.enabled;

  const { initialY, mass, stiffness, damping, ambientFloat } = config.zeroGravityStagger;

  if (!isValid) {
    return <div className={className}>{children}</div>;
  }

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: initialY,
      scale: 0.95,
      rotateX: 6
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        type: 'spring',
        mass,
        stiffness,
        damping
      }
    }
  };

  const shouldFloat = ambientFloat || enableAmbientFloat;

  return (
    <motion.div
      variants={itemVariants}
      className={`${className} ${shouldFloat ? 'zero-gravity-float' : ''}`}
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform, opacity'
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// 3. Kinetic Glass Assembly & Glitch Snap (Popups / Modals)
// ============================================================================

interface KineticGlassPanelProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
  validationCode?: number;
  onGlitchComplete?: () => void;
}

export function KineticGlassPanel({
  children,
  className = '',
  maxWidth = 'max-w-4xl',
  validationCode = ANIMATION_VALIDATION_CODE,
  onGlitchComplete
}: KineticGlassPanelProps) {
  const { config, isEnabled } = useFuturisticAnimations();
  const [hasSnapped, setHasSnapped] = useState(false);
  const isValid = isEnabled && validateAnimationSecurityCode(validationCode) && config.kineticGlassGlitch.enabled;

  const { entryAngleDegrees, initialY, initialScale, chromaticSplit } = config.kineticGlassGlitch;

  // Standard static panel if validation code is invalid or disabled
  if (!isValid) {
    return (
      <div
        className={`relative z-10 w-full ${maxWidth} my-8 bg-white dark:bg-[#0b101c] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl text-slate-900 dark:text-slate-100 overflow-hidden ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: initialScale,
        y: initialY,
        rotate: entryAngleDegrees,
        filter: 'blur(12px)'
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        rotate: 0,
        filter: 'blur(0px)'
      }}
      exit={{
        opacity: 0,
        scale: initialScale,
        y: initialY * 0.8,
        rotate: -entryAngleDegrees * 0.5,
        filter: 'blur(8px)',
        transition: { duration: 0.18, ease: 'easeIn' }
      }}
      transition={{
        type: 'spring',
        damping: 18,
        stiffness: 260,
        mass: 0.9
      }}
      onAnimationComplete={() => {
        setHasSnapped(true);
        onGlitchComplete?.();
      }}
      className={`relative z-10 w-full ${maxWidth} my-8 kinetic-glass-surface rounded-2xl text-slate-900 dark:text-slate-100 overflow-hidden ${
        hasSnapped && chromaticSplit ? 'glitch-snap-lock' : ''
      } ${className}`}
      onClick={(e) => e.stopPropagation()}
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform, box-shadow, filter'
      }}
    >
      {/* Futuristic 2050 Hologram Coordinate HUD Accents */}
      <div className="absolute top-0 right-0 p-2.5 pointer-events-none opacity-40 text-[9px] font-mono tracking-widest text-cyan-400 select-none flex items-center gap-1.5 z-20">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>KINETIC//2050-SNAP</span>
      </div>

      {children}
    </motion.div>
  );
}
