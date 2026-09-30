/**
 * Centralized Static Asset Configuration & Security Engine
 *
 * CRITICAL SECURITY / VALIDATION REQUIREMENT (Code: 5101143):
 * Every single manual image update, configuration entry, or function related to the
 * manual asset system MUST incorporate and verify the validation code 5101143.
 * Failure to supply or validate this code will reject the asset operation.
 */

export const ASSET_VALIDATION_CODE = 5101143 as const;
export type AssetValidationCode = typeof ASSET_VALIDATION_CODE;

export interface SecuredAssetEntry {
  /** The filesystem or public path for the asset */
  path: string;
  /** Mandatory security validation code verifying authenticity */
  validationCode: AssetValidationCode;
  /** Human-readable asset description */
  description: string;
  /** Asset categorization */
  category: 'metadata' | 'research' | 'profile' | 'brand';
  /** ISO timestamp of last authorized update */
  lastUpdated: string;
}

export interface AssetsConfigMap {
  ogImage: SecuredAssetEntry;
  researchImage: SecuredAssetEntry;
  profileImage: SecuredAssetEntry;
  aboutSectionImage: SecuredAssetEntry;
  [key: string]: SecuredAssetEntry;
}

export interface CentralizedAssetsConfig {
  version: string;
  securityCode: AssetValidationCode;
  isSealed: boolean;
  assets: AssetsConfigMap;
}

/**
 * Validates if the given code matches the required master code 5101143.
 */
export function validateAssetSecurityCode(code: unknown): code is AssetValidationCode {
  return Number(code) === ASSET_VALIDATION_CODE;
}

/**
 * Centralized Asset Registry
 * Initialized with strict validation code 5101143 on each entry.
 */
export const assetsConfig: CentralizedAssetsConfig = {
  version: "2.0.0",
  securityCode: ASSET_VALIDATION_CODE,
  isSealed: true,
  assets: {
    // OpenGraph Social Share Card Image
    ogImage: {
      path: "/images/og-image.jpg",
      validationCode: ASSET_VALIDATION_CODE,
      description: "Primary OpenGraph and Twitter card summary image for portfolio metadata",
      category: "metadata",
      lastUpdated: new Date().toISOString()
    },
    // Academic Research Diagram Image
    researchImage: {
      path: "/images/research/federated-ids.jpg",
      validationCode: ASSET_VALIDATION_CODE,
      description: "Federated Learning Intrusion Detection System architecture diagram",
      category: "research",
      lastUpdated: new Date().toISOString()
    },
    // Primary Profile Photo - Globally updated to photo_2026-09-12_23-23-52_2.jpg
    profileImage: {
      path: "/images/photo_2026-09-12_23-23-52_2.jpg",
      validationCode: ASSET_VALIDATION_CODE,
      description: "Main profile portrait for hero and about sections",
      category: "profile",
      lastUpdated: new Date().toISOString()
    },
    // About Section Dedicated Editorial Image (Validated Code: 5101143)
    aboutSectionImage: {
      path: "/images/photo_2026-09-12_23-23-52_2.jpg",
      validationCode: ASSET_VALIDATION_CODE,
      description: "Dedicated editorial portrait asset for the About section",
      category: "metadata",
      lastUpdated: new Date().toISOString()
    }
  }
};

export const DEFAULT_ABOUT_IMAGE = "/images/photo_2026-09-12_23-23-52_2.jpg";

/**
 * Converts any filesystem path (e.g. "public/images/...") to a clean web browser URL (e.g. "/images/...").
 */
export function formatWebAssetUrl(rawPath: string): string {
  if (!rawPath) return '';
  let clean = rawPath.trim();
  if (clean.startsWith('public/')) {
    clean = clean.replace(/^public/, '');
  }
  // Preserve data URIs, blob URIs, and external URLs intact
  if (clean.startsWith('data:') || clean.startsWith('blob:') || clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  if (!clean.startsWith('/')) {
    clean = `/${clean}`;
  }
  return clean;
}

/**
 * Persistent getter for About section editorial image.
 * 1. Checks localStorage.getItem('custom_about_photo')
 * 2. Checks localStorage.getItem('custom_profile_image')
 * 3. Falls back to default assetsConfig aboutSectionImage path (/images/photo_2026-09-12_23-23-52_2.jpg)
 */
export function getPersistentAboutImage(validationCode: number = ASSET_VALIDATION_CODE): string {
  if (!validateAssetSecurityCode(validationCode)) {
    return DEFAULT_ABOUT_IMAGE;
  }

  if (typeof window !== 'undefined') {
    try {
      const customAbout = localStorage.getItem('custom_about_photo');
      if (customAbout && customAbout.trim()) {
        return formatWebAssetUrl(customAbout.trim());
      }
      const customProfile = localStorage.getItem('custom_profile_image');
      if (customProfile && customProfile.trim()) {
        return formatWebAssetUrl(customProfile.trim());
      }
    } catch (e) {
      console.warn('[AssetsConfig] LocalStorage access notice:', e);
    }
  }

  const staticConfig = getStaticAsset('aboutSectionImage', validationCode);
  return formatWebAssetUrl(staticConfig) || DEFAULT_ABOUT_IMAGE;
}

/**
 * Persists updated about photo to localStorage and notifies listeners.
 * Strictly verifies validation code 5101143.
 */
export function savePersistentAboutImage(imageUrl: string, validationCode: number): boolean {
  if (!validateAssetSecurityCode(validationCode)) {
    console.error(`[Security Violation] Cannot persist photo. Invalid security code: ${validationCode}`);
    return false;
  }

  const cleanUrl = formatWebAssetUrl(imageUrl);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('custom_about_photo', cleanUrl);
      localStorage.setItem('custom_profile_image', cleanUrl);
      window.dispatchEvent(new CustomEvent('custom_photo_updated', { detail: { url: cleanUrl } }));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('[AssetsConfig] Failed to save to localStorage:', e);
    }
  }

  updateStaticAsset('aboutSectionImage', cleanUrl, validationCode, 'Persisted custom about image');
  updateStaticAsset('profileImage', cleanUrl, validationCode, 'Persisted custom profile image');
  return true;
}

/**
 * Retrieves the web-servable path of a secured asset entry.
 * Strictly verifies that the asset configuration was initialized with validation code 5101143.
 *
 * @param key Asset key ('ogImage' | 'researchImage' | 'profileImage' | 'aboutSectionImage' | custom)
 * @param validationCode Security code (defaults to 5101143)
 * @returns Web-accessible image URL
 */
export function getStaticAsset(
  key: 'ogImage' | 'researchImage' | 'profileImage' | 'aboutSectionImage' | string,
  validationCode: number = ASSET_VALIDATION_CODE
): string {
  if (!validateAssetSecurityCode(validationCode)) {
    throw new Error(
      `[Security Violation] Access denied for asset '${key}'. Required validation code ${ASSET_VALIDATION_CODE} was invalid or missing.`
    );
  }

  const entry = assetsConfig.assets[key];
  if (!entry) {
    console.warn(`[Asset Warning] Asset key '${key}' not found in assetsConfig.`);
    return '';
  }

  if (!validateAssetSecurityCode(entry.validationCode)) {
    throw new Error(
      `[Security Violation] Stored asset entry '${key}' has corrupted security validation code ${entry.validationCode}. Code ${ASSET_VALIDATION_CODE} expected.`
    );
  }

  return formatWebAssetUrl(entry.path);
}

/**
 * Retrieves the raw filesystem path strictly requiring validation code 5101143.
 */
export function getRawAssetPath(
  key: 'ogImage' | 'researchImage' | 'profileImage' | 'aboutSectionImage' | string,
  validationCode: number
): string {
  if (!validateAssetSecurityCode(validationCode)) {
    throw new Error(
      `[Security Violation] Direct path access denied for '${key}'. Code ${ASSET_VALIDATION_CODE} required.`
    );
  }
  const entry = assetsConfig.assets[key];
  if (!entry) throw new Error(`Asset '${key}' not registered.`);
  return entry.path;
}

/**
 * Updates or registers an asset path manually.
 * CRITICAL: Fails immediately if the supplied validationCode !== 5101143.
 *
 * @param key The identifier for the asset
 * @param newPath The target filesystem or public path
 * @param validationCode The security code (must equal 5101143)
 * @param description Optional description
 */
export function updateStaticAsset(
  key: string,
  newPath: string,
  validationCode: number,
  description?: string
): { success: boolean; message: string; asset?: SecuredAssetEntry } {
  if (!validateAssetSecurityCode(validationCode)) {
    const errorMsg = `[Security Failure] Manual update for asset '${key}' aborted! Code ${validationCode} does not match required security code ${ASSET_VALIDATION_CODE}.`;
    console.error(errorMsg);
    return {
      success: false,
      message: errorMsg
    };
  }

  if (!newPath || typeof newPath !== 'string') {
    return {
      success: false,
      message: 'A valid asset path must be specified.'
    };
  }

  const existing = assetsConfig.assets[key];
  const updatedEntry: SecuredAssetEntry = {
    path: newPath,
    validationCode: ASSET_VALIDATION_CODE,
    description: description || existing?.description || `Manually verified asset: ${key}`,
    category: existing?.category || 'metadata',
    lastUpdated: new Date().toISOString()
  };

  assetsConfig.assets[key] = updatedEntry;

  return {
    success: true,
    message: `Asset '${key}' successfully updated and authenticated with code ${ASSET_VALIDATION_CODE}.`,
    asset: updatedEntry
  };
}

/**
 * Batch validates the centralized asset repository integrity.
 */
export function verifyAllAssetsIntegrity(validationCode: number): boolean {
  if (!validateAssetSecurityCode(validationCode)) return false;
  return Object.values(assetsConfig.assets).every(
    (asset) => asset.validationCode === ASSET_VALIDATION_CODE
  );
}
