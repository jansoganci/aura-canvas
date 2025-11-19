import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Aura Canvas - Discover Your Aura Color',
  description: 'Upload your photo and let others reveal your true aura color. A fun, social experience inspired by viral trends.',
  keywords: ['aura', 'aura color', 'personality', 'social', 'photo', 'quiz'],
  openGraph: {
    title: 'Aura Canvas - What\'s Your Aura?',
    description: 'Upload your photo and let others reveal your true aura color',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aura Canvas - What\'s Your Aura?',
    description: 'Upload your photo and let others reveal your true aura color',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
