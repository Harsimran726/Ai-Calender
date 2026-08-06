'use client';

import { useState } from 'react';
import { Mail, Lock, KeyRound, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { signInAction, sendMagicLinkAction } from '@/app/actions/auth';

export function AuthForm({ sent, error }: { sent?: boolean; error?: string }) {
  const [authMode, setAuthMode] = useState<'password' | 'magic_link'>('password');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Password Strength Criteria
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.exec(password) !== null;
  const hasLower = /[a-z]/.exec(password) !== null;
  const hasNumber = /[0-9]/.exec(password) !== null;
  const hasSpecial = /[^A-Za-z0-9]/.exec(password) !== null;
  
  const score = [hasMinLen, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  
  const strengthLabel = 
    score === 0 ? '' :
    score <= 2 ? 'Weak' :
    score <= 4 ? 'Medium' : 'Strong & Secure';

  const strengthColor =
    score <= 2 ? 'bg-accent-danger text-accent-danger' :
    score <= 4 ? 'bg-accent-demo text-accent-demo' : 'bg-accent-class text-accent-class';

  return (
    <div className="rounded-[24px] border border-white/8 bg-white/5 p-6 space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between border-b border-white/8 pb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-text-secondary">Authentication</p>
          <h2 className="font-display text-2xl font-semibold text-text-primary mt-0.5">
            {authMode === 'password' ? 'Password Login' : 'Passwordless Magic Link'}
          </h2>
        </div>
        <div className="flex rounded-2xl border border-white/10 bg-black/40 p-1 text-xs">
          <button
            type="button"
            onClick={() => setAuthMode('password')}
            className={`rounded-xl px-3 py-1.5 font-semibold transition ${
              authMode === 'password' ? 'bg-primary text-white shadow-glow' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('magic_link')}
            className={`rounded-xl px-3 py-1.5 font-semibold transition ${
              authMode === 'magic_link' ? 'bg-primary text-white shadow-glow' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Magic Link
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-accent-danger/30 bg-accent-danger/10 px-4 py-3 text-xs font-semibold text-accent-danger">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {decodeURIComponent(error)}
        </div>
      )}

      {/* Magic Link Sent Confirmation */}
      {sent ? (
        <div className="space-y-3 rounded-2xl border border-accent-class/30 bg-accent-class/10 p-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-class/20 text-accent-class">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">Magic Link Dispatched</h3>
          <p className="text-xs text-text-secondary">
            Check your email inbox. Click the link to complete sign in automatically.
          </p>
        </div>
      ) : authMode === 'password' ? (
        /* Password Form with Live Security Analyzer */
        <form className="space-y-4" action={signInAction}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-4 w-4 text-text-secondary pointer-events-none" />
              <input
                type="email"
                name="email"
                required
                placeholder="admin@company.com"
                className="w-full rounded-2xl border border-white/10 bg-black/30 pl-11 pr-4 py-3 text-sm text-text-primary placeholder:text-text-secondary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-4 w-4 text-text-secondary pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-2xl border border-white/10 bg-black/30 pl-11 pr-11 py-3 text-sm text-text-primary placeholder:text-text-secondary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-text-secondary hover:text-text-primary"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Live Security Strength Analyzer */}
            {password.length > 0 && (
              <div className="mt-3 space-y-2 rounded-2xl border border-white/8 bg-black/20 p-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-text-secondary">Password Security Rating</span>
                  <span className={strengthColor.split(' ')[1]}>{strengthLabel}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strengthColor.split(' ')[0]}`}
                    style={{ width: `${(score / 5) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] text-text-secondary">
                  <span className={hasMinLen ? 'text-accent-class font-bold' : ''}>
                    {hasMinLen ? '✓' : '○'} 8+ characters
                  </span>
                  <span className={hasUpper ? 'text-accent-class font-bold' : ''}>
                    {hasUpper ? '✓' : '○'} Uppercase letter
                  </span>
                  <span className={hasLower ? 'text-accent-class font-bold' : ''}>
                    {hasLower ? '✓' : '○'} Lowercase letter
                  </span>
                  <span className={hasNumber ? 'text-accent-class font-bold' : ''}>
                    {hasNumber ? '✓' : '○'} Number (0-9)
                  </span>
                  <span className={hasSpecial ? 'text-accent-class font-bold' : ''}>
                    {hasSpecial ? '✓' : '○'} Special character
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-hover flex items-center justify-center gap-2"
          >
            Sign In with Password
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      ) : (
        /* Passwordless Magic Link Form */
        <form className="space-y-4" action={sendMagicLinkAction}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-4 w-4 text-text-secondary pointer-events-none" />
              <input
                type="email"
                name="email"
                required
                placeholder="name@company.com"
                className="w-full rounded-2xl border border-white/10 bg-black/30 pl-11 pr-4 py-3 text-sm text-text-primary placeholder:text-text-secondary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-hover flex items-center justify-center gap-2"
          >
            <KeyRound className="h-4 w-4" />
            Send Secure Magic Link
          </button>
        </form>
      )}

      {/* Dev Mode Quick Access */}
      <div className="pt-3 border-t border-white/8">
        <a
          href="/dashboard"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-text-secondary transition hover:bg-white/10 hover:text-text-primary"
        >
          <ShieldCheck className="h-4 w-4 text-primary" />
          Quick Access (Bypass Auth for Dev)
        </a>
      </div>
    </div>
  );
}
