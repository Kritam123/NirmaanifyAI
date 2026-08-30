import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@nirmaanify/ui';
import { ToastProvider } from '@nirmaanify/ui';
import { AuthProvider } from '../context/auth-context';

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
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#F8FAFC] dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 antialiased font-sans transition-colors duration-200">
        <AuthProvider>
          <ThemeProvider defaultTheme="dark">
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
