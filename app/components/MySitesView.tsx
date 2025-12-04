'use client'

import { useState } from 'react';
import { deletePage } from '../actions/pages';
import styles from '../styles/mySites.module.css';
import { Home, Plus, Eye, Edit, Copy, Check, Trash2, X } from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  latitude: number;
  longitude: number;
  location_name: string;
  published_at: string;
  header_image?: string | null;
}

interface MySitesViewProps {
  pages: Page[];
}

export default function MySitesView({ pages }: MySitesViewProps) {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const copyUrl = (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = async (pageId: string) => {
    setDeletingId(pageId);
    const result = await deletePage(pageId);
    
    if (result.error) {
      alert(`Error: ${result.error}`);
      setDeletingId(null);
    } else {
      // Refresh the page to show updated list
      window.location.reload();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>my sites</h1>
        <div className={styles.headerButtons}>
          <a href="/" className={styles.homeButton}>
            <Home size={14} />
            <span>home</span>
          </a>
          <a href="/create" className={styles.createButton}>
            <Plus size={14} />
            <span>new</span>
          </a>
        </div>
      </div>

      {pages.length === 0 ? (
        <div className={styles.emptyState}>
          <h2 className={styles.emptyTitle}>nothing here yet</h2>
          <a href="/create" className={styles.createButton}>
            <Plus size={14} />
            <span>create first page</span>
          </a>
        </div>
      ) : (
        <div className={styles.grid}>
          {pages.map((page) => (
            <div key={page.id} className={styles.card}>
              {page.header_image && (
                <div className={styles.cardImage}>
                  <img src={page.header_image} alt={page.title} className={styles.cardImg} />
                </div>
              )}

              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{page.title}</h3>
                <p className={styles.cardLocation}>{page.location_name || 'unknown location'}</p>
                <a 
                  href={`/${page.slug}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.cardUrl}
                >
                  /{page.slug}
                </a>
              </div>

              <div className={styles.cardActions}>
                <a 
                  href={`/${page.slug}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.actionButton}
                >
                  <Eye size={16} />
                  <span>view</span>
                </a>
                <a
                  href={`/create?edit=${page.id}`}
                  className={styles.actionButton}
                >
                  <Edit size={16} />
                  <span>edit</span>
                </a>
                <button
                  onClick={() => copyUrl(page.slug)}
                  className={styles.actionButton}
                >
                  {copiedSlug === page.slug ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedSlug === page.slug ? 'copied' : 'copy'}</span>
                </button>
                <button
                  onClick={() => setDeleteConfirmId(page.id)}
                  className={styles.deleteButton}
                  disabled={deletingId === page.id}
                >
                  <Trash2 size={16} />
                  <span>{deletingId === page.id ? '...' : 'delete'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirmId && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirmId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>delete this page?</h3>
            <p className={styles.modalText}>this action cannot be undone</p>
            <div className={styles.modalButtons}>
              <button 
                onClick={() => setDeleteConfirmId(null)} 
                className={styles.cancelButton}
                disabled={deletingId !== null}
              >
                <X size={14} />
                <span>cancel</span>
              </button>
              <button 
                onClick={() => {
                  handleDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }} 
                className={styles.confirmDeleteButton}
                disabled={deletingId !== null}
              >
                <Trash2 size={14} />
                <span>{deletingId === deleteConfirmId ? 'deleting...' : 'delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
