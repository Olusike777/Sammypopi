import React, { useState } from 'react';
import { User, Shield, Key, Sliders, CheckCircle2, X } from 'lucide-react';
import { UserProfile } from '../types/orchestration';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  hasApiKey: boolean;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  hasApiKey,
}) => {
  const [profile, setProfile] = useState<UserProfile>({ ...userProfile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-950 p-6 space-y-5 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <User className="h-5 w-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-semibold text-neutral-100">User Account & Workspace Preferences</h3>
              <div className="text-xs text-neutral-400">Manage user identity, taste profile, and orchestration policies</div>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          
          {/* User Identity Details */}
          <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/60 p-3.5">
            <div className="font-semibold text-neutral-200">Profile Identity</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-neutral-400">Patron Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="mt-1 w-full rounded border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-neutral-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400">Title</label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="mt-1 w-full rounded border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="text-neutral-400">Company / Atelier</label>
                <input
                  type="text"
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  className="mt-1 w-full rounded border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-neutral-100 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/60 p-3.5">
            <div className="font-semibold text-neutral-200">Atelier Design Taste & Delegation Mode</div>
            
            <div>
              <label className="text-neutral-400">Default Aesthetic Baseline</label>
              <select
                value={profile.preferences.designAesthetic}
                onChange={(e) => setProfile({
                  ...profile,
                  preferences: { ...profile.preferences, designAesthetic: e.target.value as any }
                })}
                className="mt-1 w-full rounded border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-neutral-100 focus:outline-none"
              >
                <option value="editorial_minimal">Editorial Minimal & Monolithic (High-End Travertine/Basalt)</option>
                <option value="modern_saas">High-Density SaaS Dashboard (Precision Tabular)</option>
                <option value="warm_crafted">Warm Crafted Botanical</option>
                <option value="high_contrast">High-Contrast Technical</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-400">Maestro Communication Tone</label>
              <select
                value={profile.preferences.communicationTone}
                onChange={(e) => setProfile({
                  ...profile,
                  preferences: { ...profile.preferences, communicationTone: e.target.value as any }
                })}
                className="mt-1 w-full rounded border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-neutral-100 focus:outline-none"
              >
                <option value="executive_concise">Executive & Concise (Strategic highlights only)</option>
                <option value="collaborative">Collaborative Atelier (Shows debates & reasoning)</option>
                <option value="detailed_technical">Detailed Technical (Full code & spec breakdown)</option>
              </select>
            </div>
          </div>

          {/* Security & Secrets Info */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3 flex items-center justify-between text-[11px] text-neutral-400">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-amber-400" />
              <span>Server-Side Gemini API Proxy</span>
            </div>
            <span className="font-mono text-emerald-400">
              {hasApiKey ? 'GEMINI_API_KEY Configured' : 'Local Fallback Engine Active'}
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between">
            {savedSuccess && (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Preferences updated
              </span>
            )}
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded px-3 py-1.5 text-neutral-400 hover:text-neutral-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-amber-400 px-4 py-1.5 font-semibold text-neutral-950 hover:bg-amber-300 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
