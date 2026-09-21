import { redirect } from 'next/navigation';
import { ROUTES } from '../../../lib/routes';

export default function StoragePage() {
  // Storage is managed on a per-project basis; redirect global storage route to projects
  redirect(ROUTES.DASHBOARD.PROJECTS);
}
