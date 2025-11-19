'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { getSession, createSession } from '@/lib/api';

export const Navbar: React.FC = () => {
  const [credits, setCredits] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadSession() {
      const { data, error } = await getSession();

      if (error || !data?.session) {
        // Create new session if none exists
        const { data: newData } = await createSession();
        if (newData?.session) {
          setCredits(newData.session.credits);
        }
      } else {
        setCredits(data.session.credits);
      }
    }

    loadSession();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="px-4 py-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h1M3 12H2m15.325-4.675l.707-.707M6.071 18.071l-.707.707M17.325 18.675l.707.707M6.071 5.325l-.707-.707M7 12a5 5 0 1110 0 5 5 0 01-10 0z"
              />
            </svg>
          </div>
          <span className="font-bold text-lg">
            Aura Canvas
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-card/80 backdrop-blur-sm text-muted hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          )}

          {/* Credits */}
          {credits !== null && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 bg-card/80 backdrop-blur-sm rounded-full text-sm font-medium text-card-foreground shadow-sm"
              title="Credits remaining"
            >
              <span>🎟️</span>
              <span>{credits}</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
