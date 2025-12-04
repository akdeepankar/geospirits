'use client'

import { useEffect } from 'react';
import { PageComponent } from '../types/pageBuilder';
import styles from '../styles/publicPage.module.css';
import { Home } from 'lucide-react';
import ChatbotButton from './ChatbotButton';

const SPOOKY_EMOJIS = ['🎃', '👻', '🦇', '🕷️', '🕸️', '💀', '🧛', '🧟', '🧙', '🍬', '🍭', '🌙', '⚰️', '🔮', '🕯️'];

interface PublicPageViewProps {
  page: {
    title: string;
    site_name?: string | null;
    creator_email?: string | null;
    components: PageComponent[];
    theme: 'light' | 'dark';
    header_image?: string | null;
    page_animation?: string | null;
    animation_intensity?: number | null;
    chatbot_enabled?: boolean;
    chatbot_api_key?: string | null;
    chatbot_character_name?: string | null;
    chatbot_character_prompt?: string | null;
    chatbot_button_image?: string | null;
    chatbot_button_emoji?: string | null;
    theme_color?: string | null;
  };
}

export default function PublicPageView({ page }: PublicPageViewProps) {
  const themeColor = page.theme_color || '#8b008b';
  
  // Inject CSS variables for theme color
  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color', themeColor);
    document.documentElement.style.setProperty('--theme-color-light', `${themeColor}33`);
    document.documentElement.style.setProperty('--theme-color-medium', `${themeColor}66`);
    document.documentElement.style.setProperty('--theme-color-dark', `${themeColor}99`);
  }, [themeColor]);

  // Page animation effect
  useEffect(() => {
    if (!page.page_animation || page.page_animation === 'none') return;
    
    const intensity = page.animation_intensity || 1;
    
    const createAnimation = () => {
      const anim = document.createElement('img');
      anim.src = `/${page.page_animation}.gif`;
      anim.style.position = 'fixed';
      anim.style.width = '100px';
      anim.style.height = 'auto';
      anim.style.zIndex = '999';
      anim.style.pointerEvents = 'none';
      anim.style.opacity = '0.7';
      
      const startSide = Math.floor(Math.random() * 4);
      let x, y, targetX, targetY;
      
      switch(startSide) {
        case 0: x = Math.random() * window.innerWidth; y = -50; targetX = Math.random() * window.innerWidth; targetY = window.innerHeight + 50; break;
        case 1: x = window.innerWidth + 50; y = Math.random() * window.innerHeight; targetX = -50; targetY = Math.random() * window.innerHeight; break;
        case 2: x = Math.random() * window.innerWidth; y = window.innerHeight + 50; targetX = Math.random() * window.innerWidth; targetY = -50; break;
        default: x = -50; y = Math.random() * window.innerHeight; targetX = window.innerWidth + 50; targetY = Math.random() * window.innerHeight;
      }
      
      anim.style.left = `${x}px`;
      anim.style.top = `${y}px`;
      document.body.appendChild(anim);
      
      const duration = 8000 + Math.random() * 4000;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress >= 1) {
          anim.remove();
          return;
        }
        
        const easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        const currentX = x + (targetX - x) * easeProgress;
        const currentY = y + (targetY - y) * easeProgress;
        const wave = Math.sin(progress * Math.PI * 4) * 30;
        
        anim.style.left = `${currentX + wave}px`;
        anim.style.top = `${currentY}px`;
        
        const angle = Math.atan2(targetY - y, targetX - x) * (180 / Math.PI);
        anim.style.transform = `rotate(${angle}deg)`;
        
        requestAnimationFrame(animate);
      };
      
      animate();
    };
    
    // Adjust interval based on intensity (1=12s, 2=8s, 3=5s)
    const intervalTime = Math.max(5000, 12000 / intensity);
    const spawnChance = Math.min(0.9, 0.4 + (intensity * 0.15));
    
    const interval = setInterval(() => {
      if (Math.random() > (1 - spawnChance)) createAnimation();
    }, intervalTime);
    
    const timeout = setTimeout(createAnimation, 2000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [page.page_animation, page.animation_intensity]);

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      const timeLeft = end - Date.now();
      
      if (timeLeft <= 0) return;

      const particleCount = 3;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = styles.confetti;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.backgroundColor = ['#ff6b00', '#8b008b', '#ffd700', '#ff1493', '#00ff00'][Math.floor(Math.random() * 5)];
        particle.style.animationDuration = (Math.random() * 2 + 1) + 's';
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 3000);
      }

      requestAnimationFrame(frame);
    };

    frame();
  };

  const triggerSpookyEmojis = () => {
    const duration = 4000;
    const end = Date.now() + duration;

    const frame = () => {
      const timeLeft = end - Date.now();
      
      if (timeLeft <= 0) return;

      const emojiCount = 2;
      
      for (let i = 0; i < emojiCount; i++) {
        const emoji = document.createElement('div');
        emoji.className = styles.spookyEmoji;
        emoji.textContent = SPOOKY_EMOJIS[Math.floor(Math.random() * SPOOKY_EMOJIS.length)];
        emoji.style.left = Math.random() * 100 + '%';
        emoji.style.fontSize = (Math.random() * 20 + 30) + 'px';
        emoji.style.animationDuration = (Math.random() * 2 + 2) + 's';
        document.body.appendChild(emoji);
        
        setTimeout(() => emoji.remove(), 4000);
      }

      requestAnimationFrame(frame);
    };

    frame();
  };

  const triggerSingleEmoji = (selectedEmoji: string) => {
    const duration = 4000;
    const end = Date.now() + duration;

    const frame = () => {
      const timeLeft = end - Date.now();
      
      if (timeLeft <= 0) return;

      const emojiCount = 2;
      
      for (let i = 0; i < emojiCount; i++) {
        const emoji = document.createElement('div');
        emoji.className = styles.spookyEmoji;
        emoji.textContent = selectedEmoji;
        emoji.style.left = Math.random() * 100 + '%';
        emoji.style.fontSize = (Math.random() * 20 + 30) + 'px';
        emoji.style.animationDuration = (Math.random() * 2 + 2) + 's';
        document.body.appendChild(emoji);
        
        setTimeout(() => emoji.remove(), 4000);
      }

      requestAnimationFrame(frame);
    };

    frame();
  };

  const handleButtonClick = (comp: PageComponent) => {
    if (!comp.action) return;

    switch (comp.action.type) {
      case 'link':
        if (comp.action.value) {
          window.open(comp.action.value, '_blank');
        }
        break;
      case 'confetti':
        triggerConfetti();
        break;
      case 'spookyEmojis':
        triggerSpookyEmojis();
        break;
      case 'singleEmoji':
        if (comp.action.emoji) {
          triggerSingleEmoji(comp.action.emoji);
        }
        break;
      case 'alert':
        alert(comp.action.value || 'Button clicked!');
        break;
    }
  };

  const renderComponent = (comp: PageComponent) => {
    const isSpooky = comp.style?.spooky;
    
    const componentStyle = {
      textAlign: comp.style?.textAlign || 'left',
      fontSize: comp.style?.fontSize || '16px',
      color: isSpooky ? '#ff6b00' : (comp.style?.color || '#000000'),
      backgroundColor: isSpooky ? '#1a0a00' : (comp.style?.backgroundColor || 'transparent'),
      padding: comp.style?.padding || '8px',
      margin: comp.style?.margin || '8px 0',
      width: comp.style?.width || '100%',
      borderRadius: comp.style?.borderRadius || '0px',
      ...(isSpooky && {
        boxShadow: '0 0 20px rgba(255, 107, 0, 0.5), inset 0 0 20px rgba(139, 0, 139, 0.3)',
        border: '2px solid #8b008b',
        textShadow: '0 0 10px #ff6b00, 0 0 20px #ff6b00',
        animation: 'spookyPulse 2s ease-in-out infinite',
        fontFamily: '"Creepster", cursive',
      }),
    };

    switch (comp.type) {
      case 'heading':
        return <h1 style={componentStyle}>{comp.content}</h1>;
      case 'text':
        return <span style={componentStyle}>{comp.content}</span>;
      case 'paragraph':
        return <p style={componentStyle}>{comp.content}</p>;
      case 'image':
        return <img src={comp.content} alt="User content" style={componentStyle} />;
      case 'gallery':
        return (
          <div style={{
            ...componentStyle,
            display: 'grid',
            gridTemplateColumns: `repeat(${comp.style?.galleryColumns || 3}, 1fr)`,
            gap: comp.style?.galleryGap || '16px',
          }}>
            {comp.images?.map((url, idx) => (
              <img 
                key={idx} 
                src={url} 
                alt={`Gallery image ${idx + 1}`} 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  borderRadius: comp.style?.borderRadius || '0px',
                  objectFit: 'cover',
                }} 
              />
            ))}
          </div>
        );
      case 'button':
        return (
          <button 
            style={{ ...componentStyle, cursor: 'pointer' }} 
            onClick={() => handleButtonClick(comp)}
          >
            {comp.content}
          </button>
        );
      case 'divider':
        return <hr style={{ ...componentStyle, border: 'none', borderTop: `2px solid ${comp.style?.color || '#ccc'}` }} />;
      case 'emoji':
        return <span style={{ ...componentStyle, fontSize: comp.style?.fontSize || '48px' }}>{comp.content}</span>;
      case 'html':
        return <div style={componentStyle} dangerouslySetInnerHTML={{ __html: comp.content }} />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={styles.container}
      style={{
        backgroundColor: page.theme === 'dark' ? '#1a1a1a' : 'white',
        color: page.theme === 'dark' ? '#ffffff' : '#000000',
      }}
    >
      <nav 
        className={styles.navbar}
        style={{
          background: page.theme === 'light' 
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 245, 250, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(10, 10, 15, 0.95) 0%, rgba(20, 5, 25, 0.95) 100%)',
          borderBottom: page.theme === 'light'
            ? `1px solid ${themeColor}33`
            : `1px solid ${themeColor}66`,
        }}
      >
        <div className={styles.navLeft}>
          {page.site_name && (
            <div 
              className={styles.siteInfo}
              style={{
                color: page.theme === 'light' ? '#000000' : '#ffffff',
              }}
            >
              <span 
                className={styles.siteName}
                style={{
                  color: page.theme === 'light' ? '#1a1a1a' : 'rgba(255, 255, 255, 0.98)',
                  textShadow: page.theme === 'light' 
                    ? `0 0 20px ${themeColor}40, 0 2px 4px rgba(0, 0, 0, 0.1)`
                    : `0 0 30px ${themeColor}cc, 0 0 60px ${themeColor}66, 0 2px 4px rgba(0, 0, 0, 0.5)`,
                }}
              >
                {page.site_name}
              </span>
              {page.creator_email && (
                <span 
                  className={styles.creatorName}
                  style={{
                    color: page.theme === 'light' ? '#666666' : 'rgba(255, 255, 255, 0.95)',
                  }}
                >
                  by {page.creator_email}
                </span>
              )}
            </div>
          )}
        </div>
        <a 
          href="/" 
          className={styles.homeButton}
          style={{
            background: page.theme === 'light'
              ? `linear-gradient(135deg, ${themeColor}20 0%, ${themeColor}30 100%)`
              : `linear-gradient(135deg, ${themeColor}33 0%, ${themeColor}33 100%)`,
            color: page.theme === 'light' ? '#1a1a1a' : 'rgba(255, 255, 255, 0.95)',
            border: page.theme === 'light' ? `1px solid ${themeColor}80` : `1px solid ${themeColor}80`,
          }}
        >
          <Home size={14} />
          <span>home</span>
        </a>
      </nav>
      
      <div className={styles.content}>
        {page.components.map((comp) => (
          <div key={comp.id} className={styles.component}>
            {renderComponent(comp)}
          </div>
        ))}
      </div>

      {page.chatbot_enabled && page.chatbot_api_key && page.chatbot_character_name && page.chatbot_character_prompt && (
        <ChatbotButton
          apiKey={page.chatbot_api_key}
          characterName={page.chatbot_character_name}
          characterPrompt={page.chatbot_character_prompt}
          buttonImage={page.chatbot_button_image || undefined}
          buttonEmoji={page.chatbot_button_emoji || undefined}
          theme={page.theme}
        />
      )}
    </div>
  );
}
