import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SessionProvider } from '@/components/SessionProvider';
import { Header } from '@/components/Header';
import { AppMessage } from '@/components/AppMessage';
import { appConfig } from '@/lib/config';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: appConfig.title,
  description: 'Democratic voting for your group decisions',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-zinc-50 antialiased dark:bg-zinc-950`}
      >
        <SessionProvider>
          <AppMessage />
          <Header />
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
