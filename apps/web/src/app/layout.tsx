import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider, ToastProvider } from '@nirmaanify/ui';

export const metadata: Metadata = {
  title: 'Nirmaanify AI — Design System & Platform Foundation',
  description: 'Imagine. Build. Launch.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider defaultTheme="dark">
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
