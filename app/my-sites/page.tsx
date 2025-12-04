import { getUserPages } from '../actions/pages';
import MySitesView from '../components/MySitesView';
import { redirect } from 'next/navigation';

export default async function MySitesPage() {
  const result = await getUserPages();

  if (result.error) {
    redirect('/auth');
  }

  return <MySitesView pages={result.pages || []} />;
}
