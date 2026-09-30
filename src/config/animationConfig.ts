/**
 * 2050 Futuristic Spatial Animation System Configuration
 *
 * CRITICAL SECURITY / VALIDATION REQUIREMENT (Code: 5101143):
 * Any manual toggles, duration changes, or state updates in this configuration file
 * MUST require and validate against the security code 5101143.
 * If the validation code is missing or incorrect, the system automatically falls back
 * to a standard static UI with animations completely disabled.
 */

export const ANIMATION_VALIDATION_CODE = 5101143 as const;
export type AnimationValidationCode = typeof ANIMATION_VALIDATION_CODE;

export interface HolographicBloomSettings {
  enabled: boolean;
  initialScale: number; // Default 0.82
  initialBlur: number;  // Default 20px
  initialZ: number;     // Default -160px
  duration: number;     // In seconds (e.g. 1.1s)
  perspective: number;  // In px (e.g. 1200px)
  ease: [number, number, number, number];
}

export interface ZeroGravityStaggerSettings {
  enabled: boolean;
  staggerDelay: number; // Default 0.08s
  mass: number;         // Default 0.85
  stiffness: number;    // Default 95
  damping: number;      // Default 14 (low friction physics bounce)
  initialY: number;     // Default 36px
  ambientFloat: boolean;// Subtle ambient floating hovering
}

export interface KineticGlassGlitchSettings {
  enabled: boolean;
  entryAngleDegrees: number; // Default -3.5deg
  initialY: number;          // Default 42px
  initialScale: number;      // Default 0.90
  glassmorphicBlur: number;  // Default 24px
  glitchDuration: number;    // Microsecond snap lock (0.24s)
  chromaticSplit: boolean;   // Cyan/Magenta chromatic aberration snap
}

export interface FuturisticAnimationSettings {
  enabled: boolean;
  securityCode: AnimationValidationCode;
  globalSpeedMultiplier: number;
  holographicBloom: HolographicBloomSettings;
  zeroGravityStagger: ZeroGravityStaggerSettings;
  kineticGlassGlitch: KineticGlassGlitchSettings;
  lastUpdated: string;
}

/**
 * Validates if the supplied code strictly matches 5101143.
 */
export function validateAnimationSecurityCode(code: unknown): code is AnimationValidationCode {
  return Number(code) === ANIMATION_VALIDATION_CODE;
}

/**
 * Static fallback configuration applied whenever the validation code is invalid or missing.
 * In fallback mode, all animations are completely disabled (duration: 0, no transitions).
 */
export const STATIC_FALLBACK_CONFIG: FuturisticAnimationSettings = {
  enabled: false,
  securityCode: ANIMATION_VALIDATION_CODE,
  globalSpeedMultiplier: 0,
  holographicBloom: {
    enabled: false,
    initialScale: 1,
    initialBlur: 0,
    initialZ: 0,
    duration: 0,
    perspective: 0,
    ease: [0, 0, 0, 0]
  },
  zeroGravityStagger: {
    enabled: false,
    staggerDelay: 0,
    mass: 1,
    stiffness: 1000,
    damping: 100,
    initialY: 0,
    ambientFloat: false
  },
  kineticGlassGlitch: {
    enabled: false,
    entryAngleDegrees: 0,
    initialY: 0,
    initialScale: 1,
    glassmorphicBlur: 0,
    glitchDuration: 0,
    chromaticSplit: false
  },
  lastUpdated: new Date().toISOString()
};

/**
 * Master Active Configuration initialized with code 5101143
 */
let currentAnimationConfig: FuturisticAnimationSettings = {
  enabled: true,
  securityCode: ANIMATION_VALIDATION_CODE,
  globalSpeedMultiplier: 1.0,
  holographicBloom: {
    enabled: true,
    initialScale: 0.82,
    initialBlur: 20,
    initialZ: -160,
    duration: 1.15,
    perspective: 1200,
    ease: [0.16, 1, 0.3, 1]
  },
  zeroGravityStagger: {
    enabled: true,
    staggerDelay: 0.08,
    mass: 0.85,
    stiffness: 95,
    damping: 14,
    initialY: 36,
    ambientFloat: true
  },
  kineticGlassGlitch: {
    enabled: true,
    entryAngleDegrees: -3.5,
    initialY: 42,
    initialScale: 0.90,
    glassmorphicBlur: 24,
    glitchDuration: 0.24,
    chromaticSplit: true
  },
  lastUpdated: new Date().toISOString()
};

// Event emitter to notify subscribers of dynamic animation configuration changes
type AnimationListener = (config: FuturisticAnimationSettings) => void;
const listeners = new Set<AnimationListener>();

function notifySubscribers() {
  listeners.forEach((listener) => {
    try {
      listener({ ...currentAnimationConfig });
    } catch (e) {
      console.error('[AnimationConfig] Listener notify error:', e);
    }
  });
}

export function subscribeToAnimationConfig(listener: AnimationListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Retrieves the current animation configuration.
 * CRITICAL REQUIREMENT: If validationCode !== 5101143, fallback to STATIC_FALLBACK_CONFIG.
 *
 * @param validationCode Security code (must be 5101143 to enable animations)
 */
export function getAnimationConfig(validationCode: number = ANIMATION_VALIDATION_CODE): FuturisticAnimationSettings {
  if (!validateAnimationSecurityCode(validationCode)) {
    console.warn(
      `[Animation Security] Unauthorized access attempt with code '${validationCode}'. Falling back to standard static UI.`
    );
    return { ...STATIC_FALLBACK_CONFIG };
  }

  return { ...currentAnimationConfig };
}

/**
 * Updates the global animation settings.
 * CRITICAL REQUIREMENT: Any updates require validation code 5101143.
 *
 * @param updates Partial settings updates
 * @param validationCode The security code (must equal 5101143)
 */
export function updateAnimationConfig(
  updates: Partial<Omit<FuturisticAnimationSettings, 'securityCode'>>,
  validationCode: number
): { success: boolean; message: string; config: FuturisticAnimationSettings } {
  if (!validateAnimationSecurityCode(validationCode)) {
    const errorMsg = `[Security Failure] Animation modification rejected. Code '${validationCode}' does not match required security code ${ANIMATION_VALIDATION_CODE}. Falling back to static UI.`;
    console.error(errorMsg);
    currentAnimationConfig = { ...STATIC_FALLBACK_CONFIG };
    notifySubscribers();
    return {
      success: false,
      message: errorMsg,
      config: { ...STATIC_FALLBACK_CONFIG }
    };
  }

  currentAnimationConfig = {
    ...currentAnimationConfig,
    ...updates,
    securityCode: ANIMATION_VALIDATION_CODE,
    lastUpdated: new Date().toISOString()
  };

  notifySubscribers();

  return {
    success: true,
    message: `Animation configuration updated and verified with security code ${ANIMATION_VALIDATION_CODE}.`,
    config: { ...currentAnimationConfig }
  };
}

/**
 * Resets animation configuration to default 2050 futuristic state.
 * Requires validation code 5101143.
 */
export function resetAnimationConfigToDefault(validationCode: number): boolean {
  if (!validateAnimationSecurityCode(validationCode)) return false;

  currentAnimationConfig = {
    enabled: true,
    securityCode: ANIMATION_VALIDATION_CODE,
    globalSpeedMultiplier: 1.0,
    holographicBloom: {
      enabled: true,
      initialScale: 0.82,
      initialBlur: 20,
      initialZ: -160,
      duration: 1.15,
      perspective: 1200,
      ease: [0.16, 1, 0.3, 1]
    },
    zeroGravityStagger: {
      enabled: true,
      staggerDelay: 0.08,
      mass: 0.85,
      stiffness: 95,
      damping: 14,
      initialY: 36,
      ambientFloat: true
    },
    kineticGlassGlitch: {
      enabled: true,
      entryAngleDegrees: -3.5,
      initialY: 42,
      initialScale: 0.90,
      glassmorphicBlur: 24,
      glitchDuration: 0.24,
      chromaticSplit: true
    },
    lastUpdated: new Date().toISOString()
  };

  notifySubscribers();
  return true;
}
