'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPageForEdit } from '../actions/pages';
import PageBuilder from '../components/PageBuilder';

function CreatePageContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (editId) {
      const loadPage = async () => {
        const result = await getPageForEdit(editId);
        if (result.page) {
          setPageData(result.page);
        } else {
          alert(result.error || 'Failed to load page');
        }
        setLoading(false);
      };
      loadPage();
    }
  }, [editId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold mb-2">Loading page...</div>
          <div className="text-gray-600">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <PageBuilder editMode={!!editId} initialData={pageData} />
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold mb-2">Loading...</div>
          <div className="text-gray-600">Please wait</div>
        </div>
      </div>
    }>
      <CreatePageContent />
    </Suspense>
  );
}
