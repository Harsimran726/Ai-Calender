'use client';

import { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { updateProfileAction } from '@/app/actions/users';
import { User, Mail, Shield, Camera, CheckCircle2 } from 'lucide-react';
import { BackButton } from '@/components/back-button';

type ProfileClientProps = {
  initialProfile: UserProfile;
};

export function ProfileClient({ initialProfile }: ProfileClientProps) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [name, setName] = useState(initialProfile.name);
  const [email, setEmail] = useState(initialProfile.email);
  const [pictureUrl, setPictureUrl] = useState(initialProfile.profile_picture_url || '');
  const [savedMsg, setSavedMsg] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSaving(true);
    try {
      const result = await updateProfileAction(profile.id, {
        name: name.trim(),
        email: email.trim(),
        profile_picture_url: pictureUrl.trim() || null
      });
      if (result.success) {
        // Update local state with what we submitted
        setProfile((prev) => ({
          ...prev,
          name: name.trim(),
          email: email.trim(),
          profile_picture_url: pictureUrl.trim() || null
        }));
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 3500);
      } else {
        alert(result.error || 'Failed to save profile.');
      }
    } catch (err) {
      console.error('Profile update failed:', err);
      alert('An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <BackButton href="/dashboard" label="Dashboard" />
      <div className="border-b border-border pb-5">
        <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Account Management</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary mt-0.5">
          Profile Settings
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Update your personal account preferences and profile picture.</p>
      </div>

      {savedMsg && (
        <div className="flex items-center gap-3 rounded-2xl bg-accent-class/15 px-5 py-4 text-sm font-semibold text-accent-class border border-accent-class/30">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          Profile updated successfully! Changes saved.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar Preview Card */}
        <div className="flex items-center gap-6 rounded-[24px] border border-white/8 bg-black/15 p-6">
          <div className="relative flex-shrink-0 h-20 w-20">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary/20 text-2xl font-bold text-primary">
              {pictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pictureUrl} alt={name} className="h-full w-full object-cover" />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 hover:opacity-100 transition cursor-pointer">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold text-text-primary">{profile.name}</h3>
            <p className="text-sm text-text-secondary">{profile.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold capitalize text-primary">
                <Shield className="h-3 w-3" />
                {profile.role}
              </span>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4 rounded-[24px] border border-white/8 bg-black/15 p-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
              Display Name <span className="text-accent-danger">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-4 top-3 h-4 w-4 text-text-secondary pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-2xl border border-white/10 bg-black/30 pl-11 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
              Email Address <span className="text-accent-danger">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3 h-4 w-4 text-text-secondary pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-2xl border border-white/10 bg-black/30 pl-11 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
              Profile Picture URL <span className="text-text-secondary font-normal">(optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://avatars.githubusercontent.com/..."
              value={pictureUrl}
              onChange={(e) => setPictureUrl(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
              Role Access
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm font-medium capitalize text-text-primary">
              <Shield className="h-4 w-4 text-primary" />
              <span>{profile.role}</span>
              <span className="ml-auto text-xs text-text-secondary">(Managed by system)</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-2xl bg-primary px-7 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-hover disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
