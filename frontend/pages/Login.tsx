import React, { useState } from 'react';
import { User } from '../types';
import {
  BoltIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  UserIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  InboxIcon,
  ArrowRightIcon,
  ClipboardDocumentIcon,
  QuestionMarkCircleIcon,
  WrenchIcon,
  LinkIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { supabase, supabaseUrl } from '../supabase';
import { MOCK_USER } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [showDebug, setShowDebug] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [debugTab, setDebugTab] = useState<'magic' | 'google'>('magic');

  const [customRedirectUrl, setCustomRedirectUrl] = useState<string>("");

  const getDetectedOrigin = () => {
    try {
      let origin = window.location.origin;
      return origin.replace(/\/+$/, "").trim();
    } catch (e) {
      return "https://arcade-vaibe.web.app";
    }
  };

  const FINAL_REDIRECT_URL = customRedirectUrl || getDetectedOrigin();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setStatus('sending');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: FINAL_REDIRECT_URL,
        },
      });

      if (error) throw error;
      setStatus('sent');
    } catch (err: any) {
      setError(err.message || "Failed to send magic link");
      setStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'discord') => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: FINAL_REDIRECT_URL,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `Failed to initialize ${provider} login`);
      setIsLoading(false);
    }
  };

  const handleRefreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      setError("Manual sync failed. Please try a fresh login.");
    } else if (data.session) {
      window.location.reload();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const loginAsMockUser = (role: 'Player' | 'Creator') => {
    onLogin({
      ...MOCK_USER,
      role: role,
      name: role === 'Creator' ? 'Mock Creator' : 'Mock Player',
      id: role === 'Creator' ? 'mock-creator' : 'mock-player'
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-950">
      <div className="max-w-md w-full p-8 md:p-10 rounded-[40px] bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-3xl group-hover:bg-fuchsia-500/20 transition-all duration-700"></div>

        <div className="relative z-10 text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-slate-950 rounded-[24px] border border-slate-800 flex items-center justify-center shadow-inner group-hover:border-cyan-500/50 transition-colors">
              <BoltIcon className="w-10 h-10 text-cyan-400" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-black font-orbitron tracking-tighter uppercase text-white italic">
              VAIBE <span className="text-cyan-400">ARCADE</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Instant access enabled. No verification required.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-2xl flex flex-col gap-1 text-red-400 text-xs text-left animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 font-bold uppercase tracking-widest">
                <ExclamationCircleIcon className="w-4 h-4" />
                Auth Warning
              </div>
              <span className="opacity-80">{error}</span>
            </div>
          )}

          {status === 'sent' ? (
            <div className="space-y-6 py-4 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                <PaperAirplaneIcon className="w-10 h-10 text-green-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Access Link Dispatched</h3>
                <p className="text-sm text-slate-400">Link sent to <span className="text-cyan-400 font-bold">{email}</span></p>
              </div>

              <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 text-left space-y-3">
                <div className="flex items-start gap-3">
                  <InboxIcon className="w-5 h-5 text-slate-500 shrink-0" />
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Click the link in your email to be <strong className="text-white">instantly</strong> logged in. No confirmation steps needed.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowDebug(true)}
                  className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <WrenchIcon className="w-4 h-4" />
                  Stuck? Connection Helper
                </button>
                <button
                  onClick={() => setStatus('idle')}
                  className="text-xs font-black text-slate-600 hover:text-cyan-400 uppercase tracking-widest transition-colors"
                >
                  Try different email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Universal Entry</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-slate-200 placeholder:text-slate-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-cyan-500 text-slate-950 font-black rounded-2xl hover:bg-cyan-400 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 group"
              >
                {isLoading ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Send Access Link
                    <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="pt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowDebug(true)}
                  className="flex items-center gap-2 text-[9px] font-black text-slate-700 hover:text-cyan-400 uppercase tracking-widest transition-colors"
                >
                  <QuestionMarkCircleIcon className="w-4 h-4" />
                  Connection Troubleshooter
                </button>
              </div>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-600">
                  <span className="bg-slate-900 px-3 tracking-widest">Social Gateway</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-all text-xs uppercase tracking-[0.1em] active:scale-[0.98] shadow-xl shadow-white/5"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={() => onLogin(MOCK_USER)}
                  className="flex items-center justify-center gap-2 py-3 bg-slate-950 border border-slate-800 text-slate-500 font-bold rounded-2xl hover:bg-slate-800 hover:text-white transition-all text-[10px] uppercase active:scale-[0.98]"
                >
                  <UserIcon className="w-4 h-4 text-cyan-400" />
                  Try Demo Mode
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-8">
                <button
                  onClick={() => loginAsMockUser('Player')}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all border border-slate-700 flex items-center justify-center gap-3 group"
                >
                  <UserIcon className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                  Log in as Registered Player
                </button>
                <button
                  onClick={() => loginAsMockUser('Creator')}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-3 group"
                >
                  <WrenchIcon className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
                  Log in as Game Creator
                </button>
              </div>

              <div className="relative flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-slate-800"></div>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Or Magic Link</span>
                <div className="flex-1 h-px bg-slate-800"></div>
              </div>
            </form>
          )}
        </div>
      </div>

      {showDebug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-[40px] p-8 space-y-6 animate-in zoom-in-95 duration-200 my-8 text-left">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black font-orbitron text-cyan-400 uppercase">Auth troubleshooter</h2>
              <button onClick={() => setShowDebug(false)} className="text-slate-500 hover:text-white">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setDebugTab('magic')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${debugTab === 'magic' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}
              >
                DNS / Link Errors
              </button>
              <button
                onClick={() => setDebugTab('google')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${debugTab === 'google' ? 'bg-fuchsia-500 text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Google 403 / OAuth
              </button>
            </div>

            <div className="space-y-6">
              {debugTab === 'magic' ? (
                <div className="space-y-6">
                  <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Redirect URL</p>
                      <button
                        onClick={() => copyToClipboard(FINAL_REDIRECT_URL)}
                        className="flex items-center gap-1.5 text-[10px] font-black text-cyan-400 hover:text-cyan-300"
                      >
                        {copySuccess ? 'COPIED!' : 'COPY URL'}
                        <ClipboardDocumentIcon className="w-3 h-3" />
                      </button>
                    </div>
                    <code className="block bg-slate-900 p-4 rounded-xl text-xs text-cyan-400 break-all border border-slate-800 font-mono">
                      {FINAL_REDIRECT_URL}
                    </code>

                    <div className="space-y-2 pt-2">
                      <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        Manual URL Override (Fixes "googhttps" errors)
                      </label>
                      <input
                        type="text"
                        placeholder="Paste your correct site URL here..."
                        value={customRedirectUrl}
                        onChange={(e) => setCustomRedirectUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-400 focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-3xl space-y-4">
                    <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                      <GlobeAltIcon className="w-4 h-4" />
                      Fixing DNS Mangling
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      If your link takes you to a "DNS Not Found" error containing <strong>googhttps</strong>, the proxy is mangling the protocol. Use the <strong>Manual URL Override</strong> above to set your base URL explicitly.
                    </p>
                    <button
                      onClick={handleRefreshSession}
                      className="w-full py-3 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      Force Session Sync
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                  <div className="p-6 bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-3xl space-y-4">
                    <h3 className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheckIcon className="w-4 h-4" />
                      Fixing Google 403 (Access Denied)
                    </h3>
                    <div className="space-y-4 text-xs text-slate-400">
                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                        <p className="font-bold text-slate-200">REQUIRED ACTION:</p>
                        <ol className="list-decimal pl-4 space-y-1">
                          <li>Go to Google Cloud Console.</li>
                          <li>Navigate to <strong>OAuth Consent Screen</strong>.</li>
                          <li>Add your email to the <strong>Test Users</strong> list.</li>
                          <li>Ensure <strong>Authorized Redirect URIs</strong> contains the Supabase callback below.</li>
                        </ol>
                      </div>

                      <div className="space-y-1">
                        <p className="font-bold text-slate-200">Supabase Callback URI:</p>
                        <code className="block mt-2 bg-slate-900 p-3 rounded-lg text-fuchsia-400 break-all border border-slate-800">
                          {supabaseUrl}/auth/v1/callback
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowDebug(false)}
              className="w-full py-4 bg-white text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-cyan-400 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
