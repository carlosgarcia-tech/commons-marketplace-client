import type { Metadata } from 'next';
import { Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Navbar, Footer } from '@/components/layout';
import { ChatWidgetLoader } from '@/components/chat/chat-widget-loader';
import { ErrorBoundary } from '@/components/ui/error-boundary';

const inter = Inter({
  weight: ['300', '400', '500', '600', '800'],
  subsets: ['latin'],
  variable: '--font-body',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Commons Marketplace',
  description: 'Tu marketplace de productos locales',
  icons: {
    icon: '/LogoCommons.png',
    apple: '/LogoCommons.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background font-body text-foreground">
        <div className="liquid-bg" aria-hidden>
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>
        <Navbar />
        <main className="relative z-10 flex-1">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <ChatWidgetLoader />
        <Footer />
      </body>
    </html>
  );
}
