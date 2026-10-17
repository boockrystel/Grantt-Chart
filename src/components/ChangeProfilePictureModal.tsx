import React, { useState } from 'react';
import { X, Upload, Camera, Check, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { UserAccount } from '../types';

interface ChangeProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onUpdateAvatar: (newAvatarUrl: string) => Promise<void>;
}

// 8 stylish preset avatars for instant selection
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
];

export const ChangeProfilePictureModal: React.FC<ChangeProfilePictureModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateAvatar,
}) => {
  if (!isOpen) return null;

  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentUser.avatar);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle local file upload (converts to Base64 data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5MB limit. Please upload a smaller photo.');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = event => {
      if (event.target?.result) {
        setSelectedAvatar(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (customUrl.trim()) {
      setSelectedAvatar(customUrl.trim());
      setErrorMsg('');
    }
  };

  const handleSave = async () => {
    if (!selectedAvatar) {
      setErrorMsg('Please select or upload a profile picture.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg('');
      await onUpdateAvatar(selectedAvatar);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile picture.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-black border border-pink-900/60 rounded-3xl w-full max-w-lg shadow-2xl shadow-pink-950/50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-900 bg-zinc-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-600/20 text-pink-400 border border-pink-500/30 flex items-center justify-center">
              <Camera className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Change Profile Picture
              </h3>
              <p className="text-xs text-pink-300/80">
                Update picture for {currentUser.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current / Selected Preview */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative group">
              <img
                src={selectedAvatar}
                alt="Avatar Preview"
                className="w-28 h-28 rounded-3xl object-cover ring-4 ring-pink-500 shadow-2xl shadow-pink-600/30 transition-all duration-200"
              />
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-3xl flex flex-col items-center justify-center text-white text-[11px] font-bold cursor-pointer transition">
                <Camera className="w-6 h-6 mb-1 text-pink-400" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="text-center">
              <p className="text-xs font-bold text-white">{currentUser.name}</p>
              <p className="text-[11px] text-pink-400 font-mono">@{currentUser.username}</p>
            </div>
          </div>

          {/* Upload Button */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-pink-300 mb-2">
              Upload from Device
            </label>
            <label className="w-full flex items-center justify-center space-x-2 p-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-900 border-2 border-dashed border-pink-900/50 hover:border-pink-500 text-xs font-semibold text-zinc-200 cursor-pointer transition">
              <Upload className="w-4 h-4 text-pink-400" />
              <span>Choose photo from your computer/phone...</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <p className="text-[10px] text-zinc-500 mt-1 text-center">
              Supports PNG, JPG, WebP (up to 5MB)
            </p>
          </div>

          {/* Preset Avatars */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-pink-300 mb-2 flex items-center justify-between">
              <span>Or Choose a Preset Avatar</span>
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            </label>
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_PRESETS.map((presetUrl, idx) => {
                const isChosen = selectedAvatar === presetUrl;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(presetUrl)}
                    className={`relative p-1 rounded-2xl border transition-all cursor-pointer group ${
                      isChosen
                        ? 'border-pink-500 bg-pink-950/60 ring-2 ring-pink-500 shadow-md shadow-pink-600/30'
                        : 'border-zinc-850 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <img
                      src={presetUrl}
                      alt={`Preset ${idx + 1}`}
                      className="w-full h-14 object-cover rounded-xl group-hover:scale-105 transition"
                    />
                    {isChosen && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-pink-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paste Image URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Or Paste Direct Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                type="button"
                onClick={handleApplyCustomUrl}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-pink-300 border border-pink-900/40 cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950/80 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center space-x-2 px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 rounded-xl shadow-lg shadow-pink-600/30 transition disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Profile Picture'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
