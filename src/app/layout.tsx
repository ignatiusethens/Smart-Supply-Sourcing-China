import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { RootLayoutClient } from '@/components/RootLayoutClient';
import './globals.css';

// Load only Inter — the primary design-system font.
// Geist fonts are no longer used after the design-system migration.
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  // Preload only the weights we actually use to reduce font payload
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Smart Supply Sourcing Platform',
  description: 'B2B industrial equipment sourcing platform for Kenya',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
