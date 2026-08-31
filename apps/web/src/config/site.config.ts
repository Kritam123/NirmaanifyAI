export const siteConfig = {
  name: 'Nirmaanify AI',
  description: 'AI-Powered Autonomous Platform to Build, Manage, Customize, and Deploy Full-Stack Applications',
  tagline: 'Imagine. Build. Launch.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  version: '1.0.0',
  links: {
    docs: '/docs',
    github: 'https://github.com/nirmaanify/nirmaanify-ai',
  },
  theme: {
    primaryColor: '#635BFF',
    accentColor: '#22D3EE',
    defaultTheme: 'dark' as const,
  },
};
