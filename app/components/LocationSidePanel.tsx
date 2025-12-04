'use client';

import { MarkerData } from '../types/marker';
import styles from '../styles/sidePanel.module.css';

interface LocationSidePanelProps {
  location: MarkerData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationSidePanel({ location, isOpen, onClose }: LocationSidePanelProps) {
  return (
    <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
      {location && (
        <>
          <div className={styles.header}>
            <button 
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close panel"
            >
              ×
            </button>
          </div>
          
          <div className={styles.content}>
            <div className={styles.headerImageContainer}>
              <img 
                src={location.headerImageUrl} 
                alt={location.name}
                className={styles.headerImage}
              />
            </div>
            
            <h2 className={styles.locationName}>{location.name}</h2>
            
            <p className={styles.description}>{location.description}</p>
            
            {location.galleryImages && location.galleryImages.length > 0 && (
              <div className={styles.gallery}>
                {location.galleryImages.map((imgUrl, idx) => (
                  <img 
                    key={idx}
                    src={imgUrl} 
                    alt={`${location.name} gallery ${idx + 1}`}
                    className={styles.galleryImage}
                  />
                ))}
              </div>
            )}
            
            <a 
              href={location.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.visitButton}
            >
              Visit Site
            </a>
          </div>
        </>
      )}
    </div>
  );
}
