'use client';

import { useState, useEffect } from 'react';
import MapboxGlobe from './MapboxGlobe';
import UserMenu from './UserMenu';
import styles from '../styles/welcomeModal.module.css';
import { X } from 'lucide-react';

export default function HomePage() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure we're on the client side
    setIsClient(true);
    
    // Check if user has seen the welcome modal before
    const hasSeenWelcome = localStorage.getItem('geospirits_welcome_seen');
    if (!hasSeenWelcome) {
      // Small delay to ensure smooth appearance
      setTimeout(() => {
        setShowWelcome(true);
      }, 300);
    }
  }, []);

  const handleEnter = () => {
    localStorage.setItem('geospirits_welcome_seen', 'true');
    setShowWelcome(false);
  };

  const handleHeaderClick = () => {
    setShowWelcome(true);
  };

  return (
    <>
      <main>
        <UserMenu />
        <MapboxGlobe onHeaderClick={handleHeaderClick} />
      </main>

      {showWelcome && (
        <div className={styles.modalOverlay}>
          <div className={styles.starsLayer1}></div>
          <div className={styles.starsLayer2}></div>
          <div className={styles.starsLayer3}></div>
          <div className={styles.modal}>
            <button onClick={handleEnter} className={styles.closeButton}>
              <X size={20} />
            </button>

            <div className={styles.ghostContainer}>
              <img src="/ghost-flying.gif" alt="Ghost" className={styles.ghost} />
            </div>

            <h1 className={styles.title}>GeoSpirits</h1>
            <p className={styles.subtitle}>haunt the world with your stories</p>

            <div className={styles.features}>
              <div className={styles.feature}>
                <span className={styles.emoji}>🌍</span>
                <div>
                  <h3>Global Presence</h3>
                  <p>pin your pages anywhere on earth</p>
                </div>
              </div>

              <div className={styles.feature}>
                <span className={styles.emoji}>✨</span>
                <div>
                  <h3>Spooky Themes</h3>
                  <p>dark aesthetics with custom animations</p>
                </div>
              </div>

              <div className={styles.feature}>
                <span className={styles.emoji}>🤖</span>
                <div>
                  <h3>AI Chatbots</h3>
                  <p>add intelligent assistants to your pages</p>
                </div>
              </div>

              <div className={styles.feature}>
                <span className={styles.emoji}>🎨</span>
                <div>
                  <h3>Page Builder</h3>
                  <p>drag & drop components with ease</p>
                </div>
              </div>
            </div>

            <button onClick={handleEnter} className={styles.enterButton}>
              explore the world
            </button>
          </div>
        </div>
      )}
    </>
  );
}
