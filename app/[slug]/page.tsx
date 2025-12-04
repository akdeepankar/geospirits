import { notFound } from 'next/navigation';
import { getPageBySlug } from '../actions/pages';
import PublicPageView from '@/app/components/PublicPageView';

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getPageBySlug(slug);

  if (result.error || !result.page) {
    notFound();
  }

  return <PublicPageView page={result.page} />;
}
