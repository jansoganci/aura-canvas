'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

// Color classes for dots
const colorClasses = [
  'bg-aura-red',
  'bg-aura-orange',
  'bg-aura-yellow',
  'bg-aura-green',
  'bg-aura-blue',
  'bg-aura-purple',
  'bg-aura-pink',
  'bg-aura-white border border-gray-300',
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-aura-blue/20 dark:from-primary/10 dark:via-secondary/10 dark:to-aura-blue/10">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-lg mx-auto">
          {/* Hero Section */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
              What's Your <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Aura</span>?
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Upload your photo and let AI reveal your true aura color.
            </p>
          </div>

          {/* CTA Button */}
          <Link
            href="/create"
            className="
              inline-flex items-center justify-center
              px-8 py-4
              bg-gradient-to-r from-primary to-secondary
              text-white text-lg font-semibold
              rounded-2xl
              shadow-lg shadow-primary/30
              hover:scale-105 hover:shadow-xl hover:shadow-primary/40
              active:scale-95
              transition-all duration-300
              mb-8
            "
          >
            Discover My Aura
          </Link>

          {/* 8 Color Dots */}
          <div className="flex justify-center gap-3 mb-8">
            {colorClasses.map((colorClass, index) => (
              <div
                key={index}
                className={`
                  w-4 h-4 rounded-full
                  ${colorClass}
                  transition-transform duration-200
                  hover:scale-125
                `}
              />
            ))}
          </div>

          {/* AI disclaimer */}
          <p className="text-xs text-gray-400">
            🤖 Powered by AI • For entertainment only
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
