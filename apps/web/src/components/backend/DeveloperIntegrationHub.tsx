'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  useToast,
} from '@nirmaanify/ui';
import {
  Copy,
  Check,
  Globe,
  Terminal,
  Smartphone,
  Webhook,
  FileCode,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface DeveloperIntegrationHubProps {
  workspaceSlug: string;
  apiBaseUrl?: string;
}

export const DeveloperIntegrationHub: React.FC<DeveloperIntegrationHubProps> = ({
  workspaceSlug,
  apiBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://api.nirmaanify.ai',
}) => {
  const { toast } = useToast();
  const [activeSnippetTab, setActiveSnippetTab] = useState<'nextjs' | 'webhook' | 'curl' | 'mobile' | 'env'>('nextjs');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const cleanBaseUrl = apiBaseUrl.replace(/\/+$/, '');
  const deliveryEndpoint = `${cleanBaseUrl}/api/v1/cms/delivery/workspaces/${workspaceSlug}/[collectionSlug]`;

  const snippets = {
    nextjs: `// app/blog/page.tsx (Next.js 15 App Router with ISR)
interface Article {
  id: string;
  slug: string;
  data: {
    title: string;
    content: string;
    coverImage?: string;
  };
}

async function getArticles(): Promise<Article[]> {
  const res = await fetch(
    \`\${process.env.NIRMAANIFY_API_URL}/api/v1/cms/delivery/workspaces/${workspaceSlug}/articles\`,
    {
      headers: {
        'x-api-key': process.env.NIRMAANIFY_API_KEY!,
      },
      next: {
        revalidate: 3600, // Revalidate every hour, or on-demand via webhook
        tags: ['cms-articles'],
      },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch CMS content');
  }

  const json = await res.json();
  return json.data;
}

export default async function BlogPage() {
  const articles = await getArticles();

  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Latest Articles</h1>
      <div className="grid gap-6">
        {articles.map((item) => (
          <article key={item.id} className="p-6 rounded-xl border border-slate-200">
            <h2 className="text-xl font-semibold">{item.data.title}</h2>
            <p className="mt-2 text-slate-600">{item.data.content}</p>
          </article>
        ))}
      </div>
    </main>
  );
}`,

    webhook: `// app/api/revalidate/route.ts (Next.js On-Demand Revalidation)
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-nirmaanify-signature');
  const webhookSecret = process.env.NIRMAANIFY_WEBHOOK_SECRET;

  // Verify HMAC-SHA256 signature
  if (webhookSecret && signature) {
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSig !== signature) {
      return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
    }
  }

  try {
    const payload = JSON.parse(rawBody);
    const { event, collectionSlug } = payload;

    if (event === 'content.published' || event === 'content.archived') {
      // Revalidate cache tag associated with this collection
      revalidateTag(\`cms-\${collectionSlug}\`);
      revalidatePath(\`/\${collectionSlug}\`);
      console.log(\`[Nirmaanify] Purged ISR cache for collection: \${collectionSlug}\`);
    }

    return NextResponse.json({ revalidated: true, timestamp: Date.now() });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 });
  }
}`,

    curl: `# 1. Fetch live published content items (Public or with x-api-key)
curl -X GET "${cleanBaseUrl}/api/v1/cms/delivery/workspaces/${workspaceSlug}/posts" \\
  -H "x-api-key: nrm_live_YOUR_WORKSPACE_API_KEY" \\
  -H "Accept: application/json"

# 2. Query BaaS Gateway status & health
curl -X GET "${cleanBaseUrl}/api/v1/workspaces/${workspaceSlug}/services/status" \\
  -H "Authorization: Bearer YOUR_TOKEN_OR_SESSION"

# 3. Request a presigned asset upload URL
curl -X POST "${cleanBaseUrl}/api/v1/external/storage/presigned-url" \\
  -H "x-api-key: nrm_live_YOUR_WORKSPACE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"filename": "banner.png", "mimeType": "image/png"}'`,

    mobile: `// Mobile (React Native / Flutter / Expo / Axios)
import axios from 'axios';

const nirmaanify = axios.create({
  baseURL: '${cleanBaseUrl}/api/v1',
  headers: {
    'x-api-key': 'nrm_live_YOUR_WORKSPACE_API_KEY',
    'Content-Type': 'application/json',
  },
});

// Fetch CMS entries for mobile feed
export const getMobileFeed = async () => {
  const { data } = await nirmaanify.get(
    '/cms/delivery/workspaces/${workspaceSlug}/feed-items'
  );
  return data.data;
};

// Authenticate mobile app user directly via BaaS
export const loginAppUser = async (email, password) => {
  const { data } = await nirmaanify.post('/external/auth/login', {
    email,
    password,
  });
  return data.data; // { user, token }
};`,

    env: `# .env.local (Environment Variables for your project)
NIRMAANIFY_API_URL=${cleanBaseUrl}
NIRMAANIFY_WORKSPACE_SLUG=${workspaceSlug}
NIRMAANIFY_API_KEY=nrm_live_YOUR_WORKSPACE_API_KEY_HERE
NIRMAANIFY_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE`,
  };

  const handleCopy = async (tabKey: keyof typeof snippets) => {
    try {
      await navigator.clipboard.writeText(snippets[tabKey]);
      setCopiedTab(tabKey);
      toast({
        title: 'Copied to clipboard',
        description: 'Code snippet is ready to paste into your external project.',
      });
      setTimeout(() => setCopiedTab(null), 2000);
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Please select and copy the snippet manually.',
        type: 'error',
      });
    }
  };

  return (
    <Card className="border border-slate-200 dark:border-[#24293D] shadow-sm overflow-hidden">
      <CardHeader className="border-b border-slate-100 dark:border-[#24293D] pb-4 bg-slate-50/50 dark:bg-[#1E2333]/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-500" />
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Developer Integration Hub
              </CardTitle>
              <Badge variant="outline" className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800">
                Workspace BaaS
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Connect external Next.js, mobile apps, or static site generators directly to this workspace without maintaining full visual projects.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 text-xs bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#2E354B] px-3 py-1.5 rounded-lg shadow-2xs font-mono">
            <span className="text-slate-500">Workspace Slug:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{workspaceSlug}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-[#24293D] bg-slate-100/60 dark:bg-[#161922] px-4 pt-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSnippetTab('nextjs')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap border-b-2 -mb-px ${
              activeSnippetTab === 'nextjs'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#1B202E]'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Next.js 15 (ISR)
          </button>

          <button
            type="button"
            onClick={() => setActiveSnippetTab('webhook')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap border-b-2 -mb-px ${
              activeSnippetTab === 'webhook'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#1B202E]'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Webhook className="w-3.5 h-3.5" />
            On-Demand Revalidate Route
          </button>

          <button
            type="button"
            onClick={() => setActiveSnippetTab('curl')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap border-b-2 -mb-px ${
              activeSnippetTab === 'curl'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#1B202E]'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            cURL / Terminal
          </button>

          <button
            type="button"
            onClick={() => setActiveSnippetTab('mobile')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap border-b-2 -mb-px ${
              activeSnippetTab === 'mobile'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#1B202E]'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            React Native / Flutter
          </button>

          <button
            type="button"
            onClick={() => setActiveSnippetTab('env')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap border-b-2 -mb-px ${
              activeSnippetTab === 'env'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#1B202E]'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            .env.local
          </button>
        </div>

        {/* Code Snippet Box */}
        <div className="relative p-4 bg-[#0d1117] text-slate-200">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(activeSnippetTab)}
              className="h-7 text-xs bg-[#161b22] border-slate-700 hover:bg-[#21262d] text-slate-300 gap-1.5"
            >
              {copiedTab === activeSnippetTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </Button>
          </div>

          <pre className="font-mono text-xs leading-relaxed overflow-x-auto p-2 pr-28 text-slate-300">
            <code>{snippets[activeSnippetTab]}</code>
          </pre>
        </div>

        {/* Informative Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#141824] border-t border-slate-200 dark:border-[#24293D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Delivery Endpoint: <code className="text-indigo-600 dark:text-indigo-400 font-mono text-2xs">{deliveryEndpoint}</code></span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`${cleanBaseUrl}/api/docs`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              <span>Swagger OpenAPI Spec</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
