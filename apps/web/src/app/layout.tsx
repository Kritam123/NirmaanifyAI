import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@nirmaanify/ui';
import { ToastProvider } from '@nirmaanify/ui';
import { AuthProvider } from '../context/auth-context';

import { NextAuthSessionProvider } from '../components/auth/NextAuthSessionProvider';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nirmaanify AI — Imagine. Build. Launch.',
  description: 'AI-first full-stack application builder platform.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <body className={`${poppins.variable} min-h-screen bg-[#F8FAFC] dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 antialiased font-sans transition-colors duration-200`}>
        <NextAuthSessionProvider>
          <AuthProvider>
            <ThemeProvider defaultTheme="dark">
              <ToastProvider>
                {children}
              </ToastProvider>
            </ThemeProvider>
          </AuthProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
