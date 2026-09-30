import React from 'react';
import DynamicGalleryModal from './DynamicGalleryModal';

export interface AssetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenImage: (src: string, alt: string, caption?: string) => void;
}

/**
 * AssetManagerModal (Asset Studio & Media Hub)
 * Executive-grade media and asset management system with authenticated route configuration
 * and spatial animation controls.
 */
export default function AssetManagerModal({ isOpen, onClose, onOpenImage }: AssetManagerModalProps) {
  return (
    <DynamicGalleryModal
      isOpen={isOpen}
      onClose={onClose}
      onOpenImage={onOpenImage}
    />
  );
}

export { AssetManagerModal };
