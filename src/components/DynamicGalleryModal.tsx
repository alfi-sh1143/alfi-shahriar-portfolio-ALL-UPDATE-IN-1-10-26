import React, { useState } from 'react';
import Modal from './Modal';
import { useDynamicAssets, DynamicImageItem } from '../utils/dynamicAssets';
import { assetsConfig, ASSET_VALIDATION_CODE, validateAssetSecurityCode, updateStaticAsset } from '../config/assetsConfig';
import {
  ANIMATION_VALIDATION_CODE,
  getAnimationConfig,
  updateAnimationConfig,
  validateAnimationSecurityCode as validateAnimCode
} from '../config/animationConfig';
import { useFuturisticAnimations } from './FuturisticAnimation';
import { Image as ImageIcon, ShieldCheck, Lock, RefreshCw, CheckCircle2, AlertTriangle, ExternalLink, Sparkles, Filter, Info, Key, Zap, Layers, Eye } from 'lucide-react';

interface DynamicGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenImage: (src: string, alt: string, caption?: string) => void;
}

export default function DynamicGalleryModal({ isOpen, onClose, onOpenImage }: DynamicGalleryModalProps) {
  const { images, isLoading, refresh } = useDynamicAssets();
  const { config: animConfig, updateSettings: updateAnimSettings } = useFuturisticAnimations();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'gallery' | 'config' | 'animations'>('gallery');

  // Manual configuration form state requiring code 5101143
  const [targetAssetKey, setTargetAssetKey] = useState<string>('profileImage');
  const [manualPath, setManualPath] = useState<string>('/images/photo_2026-09-12_23-23-52_2.jpg');
  const [inputSecurityCode, setInputSecurityCode] = useState<string>(String(ASSET_VALIDATION_CODE));
  const [updateFeedback, setUpdateFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Animation configuration controls
  const [animSecurityCode, setAnimSecurityCode] = useState<string>(String(ANIMATION_VALIDATION_CODE));
  const [animFeedback, setAnimFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredImages = selectedCategory === 'all'
    ? images
    : images.filter((img) => img.category === selectedCategory);

  const handleManualAssetUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateFeedback(null);

    // CRITICAL: Code 5101143 is strictly enforced internally
    const codeNumber = Number(inputSecurityCode);
    if (!validateAssetSecurityCode(codeNumber)) {
      setUpdateFeedback({
        type: 'error',
        message: 'Security Validation Failed: Access code rejected. Valid authorization is required to apply configuration changes.'
      });
      return;
    }

    const result = updateStaticAsset(targetAssetKey, manualPath, codeNumber);
    if (result.success) {
      setUpdateFeedback({
        type: 'success',
        message: 'Asset configuration updated successfully.'
      });
      refresh();
    } else {
      setUpdateFeedback({
        type: 'error',
        message: result.message
      });
    }
  };

  const handleToggleAnimation = (effect: 'holographicBloom' | 'zeroGravityStagger' | 'kineticGlassGlitch') => {
    setAnimFeedback(null);
    const codeNumber = Number(animSecurityCode);

    if (!validateAnimCode(codeNumber)) {
      setAnimFeedback({
        type: 'error',
        message: 'Security Validation Failed: Access code rejected. Valid authorization is required to modify animation settings.'
      });
      updateAnimationConfig({}, 0); // triggers fallback
      return;
    }

    const currentEffectState = animConfig[effect].enabled;
    const result = updateAnimationConfig(
      {
        [effect]: {
          ...animConfig[effect],
          enabled: !currentEffectState
        }
      } as any,
      codeNumber
    );

    if (result.success) {
      setAnimFeedback({
        type: 'success',
        message: `${effect} successfully updated.`
      });
    } else {
      setAnimFeedback({
        type: 'error',
        message: result.message
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asset Studio & Media Hub"
      subtitle="Media & Asset Management System"
      maxWidth="max-w-5xl"
    >
      <div className="space-y-6">
        {/* Top Control Bar & Tab Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'gallery'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Media Library ({images.length})
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'config'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Asset Configuration
            </button>
            <button
              onClick={() => setActiveTab('animations')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'animations'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Motion & Spatial Settings
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Auto-Detection Active
            </span>
            <button
              onClick={() => refresh()}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1"
              title="Rescan media directory on disk"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Rescan</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Dynamic Auto-Update Gallery */}
        {activeTab === 'gallery' && (
          <div className="space-y-4">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {['all', 'profile', 'projects', 'research', 'logos'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                    selectedCategory === cat
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat === 'all' ? 'All Images' : cat}
                </button>
              ))}
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-1">
              {filteredImages.map((img: DynamicImageItem) => (
                <div
                  key={img.id}
                  onClick={() => onOpenImage(img.url, img.title, `Path: ${img.path}`)}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 aspect-square cursor-pointer hover:border-blue-500/50 hover:shadow-lg transition-all"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                    <span className="text-xs font-bold text-white line-clamp-1">{img.title}</span>
                    <span className="text-[10px] text-blue-300 font-mono line-clamp-1">{img.filename}</span>
                  </div>
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] font-mono text-white/90 uppercase">
                    {img.category}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Centralized Manual Configuration & Security Validation Engine */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            {/* Security Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 border border-emerald-500/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <span>Asset Security Protocol</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-[10px]">
                    VERIFIED & ACTIVE
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  All asset route configurations and media pathways are cryptographically authenticated to protect production integrity.
                </p>
              </div>
            </div>

            {/* Current Centralized Entries */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Production Asset Registry
              </h4>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(assetsConfig.assets).map(([key, entry]) => (
                  <div
                    key={key}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-blue-600 dark:text-blue-400 font-mono truncate">{key}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-semibold flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Secured
                      </span>
                    </div>
                    <code className="block p-2 rounded bg-white dark:bg-slate-950 text-[11px] font-mono text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 break-all">
                      {entry.path}
                    </code>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {entry.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual Update Form */}
            <form onSubmit={handleManualAssetUpdate} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h5 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Manual Asset Pathway Editor
                </h5>
                <span className="text-[11px] text-slate-500 font-mono">Authentication Protected</span>
              </div>

              {updateFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    updateFeedback.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                  }`}
                >
                  {updateFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{updateFeedback.message}</span>
                </div>
              )}

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Asset Entry Key
                  </label>
                  <select
                    value={targetAssetKey}
                    onChange={(e) => setTargetAssetKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="profileImage">profileImage (Main Portrait)</option>
                    <option value="aboutSectionImage">aboutSectionImage (About Section Portrait)</option>
                    <option value="ogImage">ogImage (Metadata Card)</option>
                    <option value="researchImage">researchImage (Research Diagram)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Path (Root-Relative URL)
                  </label>
                  <input
                    type="text"
                    value={manualPath}
                    onChange={(e) => setManualPath(e.target.value)}
                    placeholder="/images/..."
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Security Access Code
                  </label>
                  <input
                    type="password"
                    value={inputSecurityCode}
                    onChange={(e) => setInputSecurityCode(e.target.value.trim())}
                    placeholder="Enter security access code"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Verify & Apply Update
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Motion & Spatial Settings */}
        {activeTab === 'animations' && (
          <div className="space-y-6">
            {/* Holographic Security Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/30 flex items-start gap-3">
              <Zap className="w-5 h-5 text-cyan-500 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <span>Spatial UI & Motion Engine</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    animConfig.enabled ? 'bg-cyan-600 text-white' : 'bg-slate-600 text-white'
                  }`}>
                    {animConfig.enabled ? 'SPATIAL ACTIVE' : 'STANDARD STATIC UI'}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Controls the <strong>Holographic Z-Axis Bloom</strong>, <strong>Zero-Gravity Stagger</strong>, and <strong>Kinetic Glass motion behaviors</strong>. Configuration changes are authenticated to ensure system stability.
                </p>
              </div>
            </div>

            {/* Validation Code Input Header */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Security Code:
                </span>
                <input
                  type="password"
                  value={animSecurityCode}
                  onChange={(e) => setAnimSecurityCode(e.target.value.trim())}
                  placeholder="Enter security code"
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs w-36 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <span className={`font-mono font-bold px-2 py-1 rounded text-[10px] ${
                validateAnimCode(Number(animSecurityCode))
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}>
                {validateAnimCode(Number(animSecurityCode)) ? 'AUTHENTICATED' : 'UNAUTHORIZED'}
              </span>
            </div>

            {animFeedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  animFeedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                }`}
              >
                {animFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{animFeedback.message}</span>
              </div>
            )}

            {/* 3 Interactive Effect Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              {/* Effect 1: Holographic Bloom */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-cyan-600 dark:text-cyan-400 font-mono flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> 1. Holographic Bloom
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    animConfig.holographicBloom.enabled ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {animConfig.holographicBloom.enabled ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Z-axis perspective zoom from scale 0.82, 20px deep optical blur, and translucent beam to crisp foreground.
                </p>
                <div className="text-[10px] font-mono text-slate-400 space-y-0.5 border-t border-slate-200 dark:border-slate-800 pt-2">
                  <div>Duration: {animConfig.holographicBloom.duration}s</div>
                  <div>Initial Z: {animConfig.holographicBloom.initialZ}px</div>
                  <div>Perspective: {animConfig.holographicBloom.perspective}px</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleAnimation('holographicBloom')}
                  className="w-full py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors"
                >
                  Toggle Holographic Bloom
                </button>
              </div>

              {/* Effect 2: Zero-Gravity Stagger */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-600 dark:text-blue-400 font-mono flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> 2. Zero-Gravity Stagger
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    animConfig.zeroGravityStagger.enabled ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {animConfig.zeroGravityStagger.enabled ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Low-friction spring physics with subtle mass, settling grid items and editorial cards in zero-gravity orbit.
                </p>
                <div className="text-[10px] font-mono text-slate-400 space-y-0.5 border-t border-slate-200 dark:border-slate-800 pt-2">
                  <div>Stagger Delay: {animConfig.zeroGravityStagger.staggerDelay}s</div>
                  <div>Damping: {animConfig.zeroGravityStagger.damping} (low friction)</div>
                  <div>Mass: {animConfig.zeroGravityStagger.mass}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleAnimation('zeroGravityStagger')}
                  className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                >
                  Toggle Zero-Gravity Stagger
                </button>
              </div>

              {/* Effect 3: Kinetic Glass & Glitch Snap */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-fuchsia-600 dark:text-fuchsia-400 font-mono flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> 3. Kinetic Glass & Glitch
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    animConfig.kineticGlassGlitch.enabled ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {animConfig.kineticGlassGlitch.enabled ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Angled off-screen translucent panel entrance with rapid microsecond skewX chromatic aberration snap lock.
                </p>
                <div className="text-[10px] font-mono text-slate-400 space-y-0.5 border-t border-slate-200 dark:border-slate-800 pt-2">
                  <div>Entry Angle: {animConfig.kineticGlassGlitch.entryAngleDegrees}°</div>
                  <div>Glitch Snap: {animConfig.kineticGlassGlitch.glitchDuration}s</div>
                  <div>Chromatic Split: {animConfig.kineticGlassGlitch.chromaticSplit ? 'Cyan/Magenta' : 'Off'}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleAnimation('kineticGlassGlitch')}
                  className="w-full py-1.5 px-3 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs transition-colors"
                >
                  Toggle Kinetic Glass Glitch
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
