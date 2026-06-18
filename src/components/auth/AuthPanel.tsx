'use client';

import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

export function AuthPanel() {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) return;
    const supabase = createClient();
    if (!supabase) return;

    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.subscription.unsubscribe();
  }, [configured]);

  if (!configured) {
    return (
      <p className="font-ui text-sm text-ui-text-muted">
        Add Supabase env vars to enable cloud sync and the daily leaderboard.
      </p>
    );
  }

  async function sendMagicLink() {
    const supabase = createClient();
    if (!supabase || !email.trim()) return;

    setLoading(true);
    setStatus(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    setStatus(error ? error.message : 'Check your email for a sign-in link.');
  }

  async function signOut() {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setStatus('Signed out.');
  }

  if (user) {
    return (
      <div className="space-y-3">
        <p className="font-ui text-sm text-ui-text">
          Signed in as <span className="font-medium">{user.email}</span>
        </p>
        <p className="font-ui text-sm text-ui-text-muted">
          Wins and stats sync when you finish a game.
        </p>
        <Button variant="secondary" fullWidth onClick={signOut}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="font-ui text-sm text-ui-text-muted">
        Optional — sign in with a magic link to sync across devices.
      </p>
      <label className="block">
        <span className="sr-only">Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-ui border border-ui-surface-2 bg-ui-surface px-3 py-2 font-ui text-hud text-ui-text outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
      </label>
      <Button fullWidth onClick={sendMagicLink} disabled={loading || !email.trim()}>
        {loading ? 'Sending…' : 'Send magic link'}
      </Button>
      {status ? (
        <p className="font-ui text-sm text-ui-text-muted" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
