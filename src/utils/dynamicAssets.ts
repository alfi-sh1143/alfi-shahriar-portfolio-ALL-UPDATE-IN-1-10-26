/**
 * Dynamic Auto-Update Gallery & Asset Management Engine
 *
 * Automatically discovers, imports, and auto-updates images from `public/images/`.
 * When new images are placed or uploaded to `public/images/`, the frontend
 * automatically detects and displays them without requiring manual JSX/TSX changes.
 */

import { useState, useEffect, useCallback } from 'react';
import { getStaticAsset, ASSET_VALIDATION_CODE, validateAssetSecurityCode } from '../config/assetsConfig';

export interface DynamicImageItem {
  id: string;
  filename: string;
  url: string;
  path: string;
  category: 'profile' | 'projects' | 'research' | 'logos' | 'general';
  title: string;
  lastModified?: number;
  sizeBytes?: number;
}

// Built-in Static Asset Registry (Root-relative URLs for Vite static serving)
// Enables instant offline/build-time knowledge of all public/images without violating Vite's public asset rules
const viteDiscoveredImages: DynamicImageItem[] = [
  {
    id: 'profile-photo-primary',
    filename: 'photo_2026-09-12_23-23-52_2.jpg',
    url: '/images/photo_2026-09-12_23-23-52_2.jpg',
    path: 'images/photo_2026-09-12_23-23-52_2.jpg',
    category: 'profile',
    title: 'Alfi Shahriyar — Main Portrait'
  },
  {
    id: 'profile-photo-secondary',
    filename: 'photo_2026-09-12_23-23-52.jpg',
    url: '/images/photo_2026-09-12_23-23-52.jpg',
    path: 'images/photo_2026-09-12_23-23-52.jpg',
    category: 'profile',
    title: 'Alfi Shahriyar — Studio Portrait'
  },
  {
    id: 'project-apex-roofing',
    filename: 'apex-roofing.jpg',
    url: '/images/projects/apex-roofing.jpg',
    path: 'images/projects/apex-roofing.jpg',
    category: 'projects',
    title: 'Apex Roofing'
  },
  {
    id: 'project-flowdesk-ai',
    filename: 'flowdesk-ai.jpg',
    url: '/images/projects/flowdesk-ai.jpg',
    path: 'images/projects/flowdesk-ai.jpg',
    category: 'projects',
    title: 'FlowDesk AI'
  },
  {
    id: 'project-novacare',
    filename: 'novacare.jpg',
    url: '/images/projects/novacare.jpg',
    path: 'images/projects/novacare.jpg',
    category: 'projects',
    title: 'NovaCare'
  },
  {
    id: 'project-clearflow',
    filename: 'clearflow.jpg',
    url: '/images/projects/clearflow.jpg',
    path: 'images/projects/clearflow.jpg',
    category: 'projects',
    title: 'ClearFlow'
  },
  {
    id: 'research-federated-ids',
    filename: 'federated-ids.jpg',
    url: '/images/research/federated-ids.jpg',
    path: 'images/research/federated-ids.jpg',
    category: 'research',
    title: 'Federated Learning IDS Diagram'
  },
  {
    id: 'meta-og-image',
    filename: 'og-image.jpg',
    url: '/images/og-image.jpg',
    path: 'images/og-image.jpg',
    category: 'general',
    title: 'OpenGraph Meta Card'
  },
  {
    id: 'logo-diu-png',
    filename: 'diu.png',
    url: '/images/logos/diu.png',
    path: 'images/logos/diu.png',
    category: 'logos',
    title: 'Daffodil International University'
  },
  {
    id: 'logo-ccpc-png',
    filename: 'ccpc.png',
    url: '/images/logos/ccpc.png',
    path: 'images/logos/ccpc.png',
    category: 'logos',
    title: 'Chattogram Cantonment Public College'
  }
];

// Active in-memory cache
let dynamicImagesCache: DynamicImageItem[] = [...viteDiscoveredImages];
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('[DynamicAssets] Listener error:', e);
    }
  });
}

/**
 * Global signal to notify that a new asset has been uploaded or updated
 */
export function triggerAssetRegistryRefresh() {
  fetchImagesFromServer().then(() => notifyListeners());
}

/**
 * Fetches dynamic image list from the backend Express filesystem scanner
 */
export async function fetchImagesFromServer(): Promise<DynamicImageItem[]> {
  try {
    const res = await fetch('/api/images');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.images)) {
      dynamicImagesCache = data.images;
      return dynamicImagesCache;
    }
  } catch (err) {
    // If backend endpoint is unavailable, use vite glob cache
    console.debug('[DynamicAssets] Server readdir not reachable, using build-time assets:', err);
  }
  return dynamicImagesCache;
}

/**
 * Retrieves the latest profile photograph dynamically from public/images
 */
export function getLatestProfileImage(): string {
  // Check client custom override first
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('custom_profile_image');
    if (saved) return saved;
  }

  // Look for photo_2026-09-12_23-23-52_2.jpg or latest portrait in dynamic list
  const priorityPhoto = dynamicImagesCache.find((img) =>
    img.filename.includes('photo_2026-09-12_23-23-52_2')
  );
  if (priorityPhoto) return priorityPhoto.url;

  // Next look for any photo_2026
  const anyNewPhoto = dynamicImagesCache.find((img) =>
    img.filename.startsWith('photo_2026')
  );
  if (anyNewPhoto) return anyNewPhoto.url;

  // Fallback to validated centralized configuration
  return getStaticAsset('profileImage', ASSET_VALIDATION_CODE);
}

/**
 * React Hook for consuming the auto-updating gallery & image list
 */
export function useDynamicAssets() {
  const [images, setImages] = useState<DynamicImageItem[]>(dynamicImagesCache);
  const [isLoading, setIsLoading] = useState(false);
  const [activeProfilePhoto, setActiveProfilePhoto] = useState<string>(() => getLatestProfileImage());

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const updated = await fetchImagesFromServer();
    setImages([...updated]);
    setActiveProfilePhoto(getLatestProfileImage());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    const handleChange = () => {
      setImages([...dynamicImagesCache]);
      setActiveProfilePhoto(getLatestProfileImage());
    };

    listeners.add(handleChange);

    // Auto-poll every 12 seconds in development/runtime for new images placed in public/images
    const pollInterval = setInterval(() => {
      fetchImagesFromServer().then((newList) => {
        if (newList.length !== images.length) {
          setImages([...newList]);
          setActiveProfilePhoto(getLatestProfileImage());
        }
      });
    }, 12000);

    return () => {
      listeners.delete(handleChange);
      clearInterval(pollInterval);
    };
  }, [refresh, images.length]);

  return {
    images,
    isLoading,
    activeProfilePhoto,
    refresh,
    profileImages: images.filter((img) => img.category === 'profile'),
    projectImages: images.filter((img) => img.category === 'projects'),
    researchImages: images.filter((img) => img.category === 'research'),
  };
}

/**
 * Validated manual asset path changer enforcing Code 5101143
 */
export function applyManualAssetUpdate(
  assetKey: string,
  newPath: string,
  validationCode: number
): { success: boolean; error?: string } {
  if (!validateAssetSecurityCode(validationCode)) {
    return {
      success: false,
      error: `Security Validation Failed: Code ${validationCode} is invalid. Validation code ${ASSET_VALIDATION_CODE} required.`
    };
  }

  // Update dynamic cache if matching
  const matchingIndex = dynamicImagesCache.findIndex((img) => img.path === newPath || img.url === newPath);
  if (matchingIndex !== -1) {
    dynamicImagesCache[matchingIndex].category = assetKey.toLowerCase().includes('profile') ? 'profile' : 'general';
  }

  notifyListeners();
  return { success: true };
}
