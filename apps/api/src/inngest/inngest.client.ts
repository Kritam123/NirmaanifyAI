import { Inngest } from 'inngest';
import * as fs from 'fs';
import * as path from 'path';

function loadEnvFileSync(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      for (const line of content.split('\n')) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match && match[1] && match[2] !== undefined) {
          const key = match[1].trim();
          const val = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch {}
}

// Pre-load environment files synchronously
loadEnvFileSync(path.resolve(process.cwd(), '.env'));
loadEnvFileSync(path.resolve(process.cwd(), 'apps/api/.env'));
loadEnvFileSync(path.resolve(__dirname, '../../.env'));
loadEnvFileSync(path.resolve(__dirname, '../../../../.env'));

const fallbackKey = 'kyqVV1z2H6h7KNX1ypg86-mN-s0ror1HpssAm0dK4caBTNeFeoZbhtwwGcyioIBZk-Yp--N22WO7pxSw1D9u4Q';

export function getInngestEventKey(): string {
  return (
    process.env.INNGEST_EVENT_KEY ||
    process.env.NEXT_PUBLIC_INNGEST_EVENT_KEY ||
    fallbackKey
  );
}

export const inngest = new Inngest({
  id: 'nirmaanify-agentic-coder',
  name: 'Nirmaanify Autonomous Coding Agent',
  eventKey: getInngestEventKey(),
  ...(process.env.INNGEST_BASE_URL ? { baseUrl: process.env.INNGEST_BASE_URL } : {}),
});


