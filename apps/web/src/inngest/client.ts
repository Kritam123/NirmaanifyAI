import { Inngest } from 'inngest';

const eventKey =
  process.env.NEXT_PUBLIC_INNGEST_EVENT_KEY ||
  process.env.INNGEST_EVENT_KEY ||
  undefined;

export const inngest = new Inngest({
  id: 'nirmaanify-web',
  name: 'Nirmaanify Web Platform',
  ...(eventKey ? { eventKey } : {}),
  ...(process.env.INNGEST_BASE_URL ? { baseUrl: process.env.INNGEST_BASE_URL } : {}),
});

