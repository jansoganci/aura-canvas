'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { compressAndConvert } from '@/lib/compress';
import { hapticSelect, hapticSuccess } from '@/lib/haptics';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

// Simple 2-question flow
const ENERGY_OPTIONS = [
  { emoji: '😴', label: 'Low' },
  { emoji: '😌', label: 'Chill' },
  { emoji: '😊', label: 'Good' },
  { emoji: '🔥', label: 'High' },
];

const ELEMENT_OPTIONS = [
  { emoji: '🌊', label: 'Water' },
  { emoji: '🌿', label: 'Earth' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '⚡', label: 'Energy' },
];

// Color mappings for result
const glowColors: Record<string, string> = {
  RED: 'shadow-[0_0_60px_rgba(255,75,92,0.6)]',
  ORANGE: 'shadow-[0_0_60px_rgba(255,173,105,0.6)]',
  YELLOW: 'shadow-[0_0_60px_rgba(255,251,125,0.6)]',
  GREEN: 'shadow-[0_0_60px_rgba(117,247,174,0.6)]',
  BLUE: 'shadow-[0_0_60px_rgba(110,193,228,0.6)]',
  PURPLE: 'shadow-[0_0_60px_rgba(199,125,255,0.6)]',
  PINK: 'shadow-[0_0_60px_rgba(252,186,211,0.6)]',
  WHITE: 'shadow-[0_0_60px_rgba(242,242,242,0.6)]',
};

const textColors: Record<string, string> = {
  RED: 'text-aura-red',
  ORANGE: 'text-aura-orange',
  YELLOW: 'text-aura-yellow',
  GREEN: 'text-aura-green',
  BLUE: 'text-aura-blue',
  PURPLE: 'text-aura-purple',
  PINK: 'text-aura-pink',
  WHITE: 'text-gray-600',
};

interface AuraResult {
  color: string;
  description: string;
}

export default function CreatePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [energy, setEnergy] = useState<string | null>(null);
  const [element, setElement] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AuraResult | null>(null);

  const canSubmit = imagePreview && energy && element && !isSubmitting;

  // Handle image selection
  const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      const compressed = await compressAndConvert(file);
      setImagePreview(compressed);
      setResult(null);
      hapticSelect();
    } catch (err) {
      toast.error('Failed to process image');
      console.error(err);
    }
  }, []);

  // Trigger file input
  const handleTapToAdd = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Submit to AI
  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    hapticSelect();

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: imagePreview,
          energy,
          element,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to read aura');
        setIsSubmitting(false);
        return;
      }

      setResult({
        color: data.color,
        description: data.description,
      });
      hapticSuccess();
    } catch (err) {
      toast.error('Something went wrong');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, imagePreview, energy, element]);

  // Share to Twitter
  const handleShareTwitter = useCallback(() => {
    if (!result) return;
    const colorName = result.color.charAt(0) + result.color.slice(1).toLowerCase();
    const text = `My aura is ${colorName}! ✨\n\n"${result.description}"\n\nFind yours:`;
    const url = window.location.origin;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  }, [result]);

  // Reset
  const handleReset = useCallback(() => {
    setImagePreview(null);
    setEnergy(null);
    setElement(null);
    setResult(null);
  }, []);

  // Result view
  if (result && imagePreview) {
    const colorName = result.color.charAt(0) + result.color.slice(1).toLowerCase();

    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-aura-blue/20 dark:from-primary/10 dark:via-secondary/10 dark:to-aura-blue/10">
        <Navbar />

        <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-sm">
            {/* Photo with aura glow */}
            <div className={`mb-8 rounded-2xl ${glowColors[result.color]} transition-shadow duration-500`}>
              <img
                src={imagePreview}
                alt="Your photo"
                className="w-full aspect-square object-cover rounded-2xl"
              />
            </div>

            {/* Result */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Your Aura is</p>
              <h2 className={`text-4xl font-bold mb-4 ${textColors[result.color]}`}>
                {colorName}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                "{result.description}"
              </p>
            </div>

            {/* Save warning */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 mb-6">
              <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
                📸 Screenshot to save! We don't store your photo.
              </p>
            </div>

            {/* Share buttons */}
            <div className="space-y-3">
              <button
                onClick={handleShareTwitter}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X
              </button>

              <button
                onClick={handleReset}
                className="w-full py-3 px-6 bg-white dark:bg-gray-800 rounded-xl font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
              >
                Try Again
              </button>

              <Link
                href="/"
                className="block w-full text-center py-3 px-6 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Input view
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-aura-blue/20 dark:from-primary/10 dark:via-secondary/10 dark:to-aura-blue/10">
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm space-y-6">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>

          {/* Photo upload area */}
          <div
            onClick={handleTapToAdd}
            className={`
              aspect-square rounded-2xl cursor-pointer
              flex items-center justify-center
              transition-all duration-200
              ${imagePreview
                ? 'bg-transparent'
                : 'bg-white/50 dark:bg-white/10 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary'
              }
            `}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Your photo"
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  Tap to add photo
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Questions - only show after photo */}
          {imagePreview && (
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 space-y-6">
              {/* Energy question */}
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 text-center">
                  How's your energy?
                </p>
                <div className="flex justify-between gap-2">
                  {ENERGY_OPTIONS.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => {
                        setEnergy(option.label);
                        hapticSelect();
                      }}
                      className={`
                        flex-1 py-3 rounded-xl text-center
                        transition-all duration-200
                        ${energy === option.label
                          ? 'bg-primary text-white scale-105'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <span className="text-2xl block">{option.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Element question */}
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 text-center">
                  Pick your element
                </p>
                <div className="flex justify-between gap-2">
                  {ELEMENT_OPTIONS.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => {
                        setElement(option.label);
                        hapticSelect();
                      }}
                      className={`
                        flex-1 py-3 rounded-xl text-center
                        transition-all duration-200
                        ${element === option.label
                          ? 'bg-primary text-white scale-105'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <span className="text-2xl block">{option.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`
              w-full py-4 rounded-xl font-semibold text-lg
              transition-all duration-200
              ${canSubmit
                ? 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 active:scale-95'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Reading your aura...
              </span>
            ) : (
              'Read My Aura'
            )}
          </button>

          {/* Privacy note */}
          <p className="text-xs text-gray-400 text-center">
            🔒 Your photo is not stored • 🤖 Powered by AI
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
