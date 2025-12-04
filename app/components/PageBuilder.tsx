'use client';

import { useState, useEffect } from 'react';
import { PageComponent, DraggableItem, ComponentStyle, ButtonAction } from '../types/pageBuilder';
import { publishPage, updatePage } from '../actions/pages';
import LocationPicker from './LocationPicker';
import styles from '../styles/pageBuilder.module.css';
import { 
  Type, 
  AlignLeft, 
  Image as ImageIcon, 
  Grid3x3, 
  MousePointerClick, 
  Minus, 
  Code, 
  Settings, 
  Trash2, 
  Eye, 
  Edit, 
  Moon, 
  Sun, 
  Upload,
  X,
  Plus,
  ArrowLeft,
  MessageCircle
} from 'lucide-react';

const SPOOKY_EMOJIS = ['🎃', '👻', '🦇', '🕷️', '🕸️', '💀', '🧛', '🧟', '🧙', '🍬', '🍭', '🌙', '⚰️', '🔮', '🕯️'];

const AVAILABLE_COMPONENTS: DraggableItem[] = [
  { type: 'heading', label: 'Heading', defaultContent: 'New Heading' },
  { type: 'text', label: 'Text', defaultContent: 'New text' },
  { type: 'paragraph', label: 'Paragraph', defaultContent: 'This is a paragraph. Add your content here.' },
  { type: 'image', label: 'Image', defaultContent: 'https://via.placeholder.com/600x400' },
  { type: 'gallery', label: 'Gallery', defaultContent: '' },
  { type: 'button', label: 'Button', defaultContent: 'Click Me' },
  { type: 'divider', label: 'Divider', defaultContent: '' },
  { type: 'html', label: 'Custom HTML', defaultContent: '<div>Custom HTML</div>' },
];

const getComponentIcon = (type: string) => {
  const iconProps = { size: 14 };
  switch (type) {
    case 'heading': return <Type {...iconProps} />;
    case 'text': return <AlignLeft {...iconProps} />;
    case 'paragraph': return <AlignLeft {...iconProps} />;
    case 'image': return <ImageIcon {...iconProps} />;
    case 'gallery': return <Grid3x3 {...iconProps} />;
    case 'button': return <MousePointerClick {...iconProps} />;
    case 'divider': return <Minus {...iconProps} />;
    case 'html': return <Code {...iconProps} />;
    default: return <Plus {...iconProps} />;
  }
};

interface PageBuilderProps {
  editMode?: boolean;
  initialData?: any;
}

export default function PageBuilder({ editMode = false, initialData }: PageBuilderProps) {
  const [components, setComponents] = useState<PageComponent[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [pageSlug, setPageSlug] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [pageAnimation, setPageAnimation] = useState<string>('none');
  const [animationIntensity, setAnimationIntensity] = useState<number>(1);
  const [publishMessage, setPublishMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [headerImage, setHeaderImage] = useState<string>('');
  const [siteName, setSiteName] = useState<string>('');
  const [editPageId, setEditPageId] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [showChatbotModal, setShowChatbotModal] = useState(false);
  const [chatbotEnabled, setChatbotEnabled] = useState(false);
  const [chatbotApiKey, setChatbotApiKey] = useState('');
  const [chatbotCharacterName, setChatbotCharacterName] = useState('');
  const [chatbotCharacterPrompt, setChatbotCharacterPrompt] = useState('');
  const [chatbotButtonImage, setChatbotButtonImage] = useState('');
  const [chatbotButtonEmoji, setChatbotButtonEmoji] = useState('');
  const [chatbotButtonType, setChatbotButtonType] = useState<'emoji' | 'image'>('emoji');
  const [themeColor, setThemeColor] = useState('#8b008b');

  // Load initial data in edit mode
  useEffect(() => {
    if (editMode && initialData) {
      setComponents(initialData.components || []);
      setSiteName(initialData.site_name || '');
      setPageSlug(initialData.slug || '');
      setTheme(initialData.theme || 'light');
      setHeaderImage(initialData.header_image || '');
      setSelectedLat(initialData.latitude);
      setSelectedLng(initialData.longitude);
      setLocationName(initialData.location_name || '');
      setPageAnimation(initialData.page_animation || 'none');
      setAnimationIntensity(initialData.animation_intensity || 1);
      setChatbotEnabled(initialData.chatbot_enabled || false);
      setChatbotApiKey(initialData.chatbot_api_key || '');
      setChatbotCharacterName(initialData.chatbot_character_name || '');
      setChatbotCharacterPrompt(initialData.chatbot_character_prompt || '');
      setChatbotButtonImage(initialData.chatbot_button_image || '');
      setChatbotButtonEmoji(initialData.chatbot_button_emoji || '');
      setChatbotButtonType(initialData.chatbot_button_emoji ? 'emoji' : 'image');
      setThemeColor(initialData.theme_color || '#8b008b');
      setEditPageId(initialData.id);
      setSlugManuallyEdited(true); // In edit mode, consider slug as manually set
    }
  }, [editMode, initialData]);

  // Auto-generate slug from site name
  const generateSlugFromName = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);
  };

  // Update slug when site name changes (only if not manually edited)
  useEffect(() => {
    if (siteName && !slugManuallyEdited) {
      const autoSlug = generateSlugFromName(siteName);
      setPageSlug(autoSlug);
    }
  }, [siteName, slugManuallyEdited]);

  // Handle site name change
  const handleSiteNameChange = (value: string) => {
    setSiteName(value);
    // Reset manual edit flag when site name changes (unless in edit mode)
    if (!editMode) {
      setSlugManuallyEdited(false);
    }
  };

  // Handle slug change
  const handleSlugChange = (value: string) => {
    const cleanedSlug = value.toLowerCase().replace(/[^\w-]/g, '-').replace(/-+/g, '-');
    setPageSlug(cleanedSlug);
    setSlugManuallyEdited(true);
  };

  // Animation preview effect
  useEffect(() => {
    if (!isPreview || !pageAnimation || pageAnimation === 'none') return;
    
    const createAnimation = () => {
      const anim = document.createElement('img');
      anim.src = `/${pageAnimation}.gif`;
      anim.style.position = 'fixed';
      anim.style.width = '60px';
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
    const intervalTime = Math.max(5000, 12000 / animationIntensity);
    const spawnChance = Math.min(0.9, 0.4 + (animationIntensity * 0.15));
    
    const interval = setInterval(() => {
      if (Math.random() > (1 - spawnChance)) createAnimation();
    }, intervalTime);
    
    const timeout = setTimeout(createAnimation, 2000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isPreview, pageAnimation, animationIntensity]);

  const addComponent = (item: DraggableItem) => {
    const newComponent: PageComponent = {
      id: `${item.type}-${Date.now()}`,
      type: item.type,
      content: item.defaultContent,
      style: {
        textAlign: 'left',
        fontSize: '16px',
        color: '#000000',
        backgroundColor: 'transparent',
        padding: '8px',
        margin: '8px 0',
        width: '100%',
        borderRadius: '0px',
        galleryColumns: 3,
        galleryGap: '16px',
      },
      action: item.type === 'button' ? { type: 'none' } : undefined,
      images: item.type === 'gallery' ? ['https://via.placeholder.com/400x300'] : undefined,
    };
    setComponents([...components, newComponent]);
  };

  const updateComponent = (id: string, content: string) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, content } : comp
    ));
  };

  const updateComponentStyle = (id: string, styleKey: keyof ComponentStyle, value: string | boolean | number) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, style: { ...comp.style, [styleKey]: value } } : comp
    ));
  };

  const toggleSpooky = (id: string) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, style: { ...comp.style, spooky: !comp.style?.spooky } } : comp
    ));
  };

  const updateButtonAction = (id: string, action: ButtonAction) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, action } : comp
    ));
  };

  const addGalleryImage = (id: string) => {
    setComponents(components.map(comp => 
      comp.id === id ? { 
        ...comp, 
        images: [...(comp.images || []), 'https://via.placeholder.com/400x300'] 
      } : comp
    ));
  };

  const updateGalleryImage = (id: string, index: number, url: string) => {
    setComponents(components.map(comp => {
      if (comp.id === id && comp.images) {
        const newImages = [...comp.images];
        newImages[index] = url;
        return { ...comp, images: newImages };
      }
      return comp;
    }));
  };

  const removeGalleryImage = (id: string, index: number) => {
    setComponents(components.map(comp => {
      if (comp.id === id && comp.images) {
        const newImages = comp.images.filter((_, i) => i !== index);
        return { ...comp, images: newImages };
      }
      return comp;
    }));
  };

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

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setComponents(components.filter(comp => comp.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const handlePublish = async () => {
    if (!siteName.trim()) {
      setPublishMessage({ type: 'error', text: 'Please enter a site name' });
      return;
    }

    if (!pageSlug.trim()) {
      setPublishMessage({ type: 'error', text: 'Please enter a page slug' });
      return;
    }

    if (components.length === 0) {
      setPublishMessage({ type: 'error', text: 'Please add at least one component to your page' });
      return;
    }

    if (selectedLat === null || selectedLng === null) {
      setPublishMessage({ type: 'error', text: 'Please select a location on the map' });
      return;
    }

    setPublishing(true);
    setPublishMessage(null);
    setPublishedSlug(null);

    const pageData = {
      title: siteName,
      siteName: siteName,
      customSlug: pageSlug,
      components,
      theme,
      headerImage: headerImage || undefined,
      latitude: selectedLat,
      longitude: selectedLng,
      locationName,
      pageAnimation,
      animationIntensity,
      chatbotEnabled,
      chatbotApiKey: chatbotEnabled ? chatbotApiKey : undefined,
      chatbotCharacterName: chatbotEnabled ? chatbotCharacterName : undefined,
      chatbotCharacterPrompt: chatbotEnabled ? chatbotCharacterPrompt : undefined,
      chatbotButtonImage: chatbotEnabled && chatbotButtonType === 'image' ? chatbotButtonImage : undefined,
      chatbotButtonEmoji: chatbotEnabled && chatbotButtonType === 'emoji' ? chatbotButtonEmoji : undefined,
      themeColor,
    };

    const result = editMode && editPageId
      ? await updatePage(editPageId, pageData)
      : await publishPage(pageData);

    setPublishing(false);

    if (result.error) {
      setPublishMessage({ type: 'error', text: result.error });
    } else {
      setPublishedSlug(result.slug || null);
      setPublishMessage({ 
        type: 'success', 
        text: editMode ? 'Page updated successfully!' : 'Page published successfully!' 
      });
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newComponents = [...components];
    const draggedItem = newComponents[draggedIndex];
    newComponents.splice(draggedIndex, 1);
    newComponents.splice(index, 0, draggedItem);
    
    setComponents(newComponents);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const renderComponent = (comp: PageComponent, isEditable: boolean) => {
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

    if (!isEditable) {
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
      }
    }

    return (
      <div className={styles.componentEditor}>
        <div className={styles.componentHeader}>
          <span className={styles.componentType}>{comp.type}</span>
          <div className={styles.headerButtons}>
            <button 
              onClick={() => setSelectedComponentId(selectedComponentId === comp.id ? null : comp.id)}
              className={styles.styleButton}
            >
              <Settings size={14} />
            </button>
            <button 
              onClick={() => handleDeleteClick(comp.id)}
              className={styles.deleteButton}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        
        {comp.type === 'html' ? (
          <textarea
            value={comp.content}
            onChange={(e) => updateComponent(comp.id, e.target.value)}
            className={styles.htmlEditor}
            rows={4}
          />
        ) : comp.type === 'divider' ? (
          <div className={styles.dividerPreview}>Horizontal Line</div>
        ) : comp.type === 'emoji' ? (
          <div className={styles.emojiPicker}>
            <div className={styles.emojiPreview}>{comp.content}</div>
            <div className={styles.emojiGrid}>
              {SPOOKY_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => updateComponent(comp.id, emoji)}
                  className={styles.emojiOption}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ) : comp.type === 'gallery' ? (
          <div className={styles.galleryEditor}>
            {comp.images?.map((url, idx) => (
              <div key={idx} className={styles.galleryImageRow}>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => updateGalleryImage(comp.id, idx, e.target.value)}
                  className={styles.textInput}
                  placeholder="Enter image URL"
                />
                <button
                  onClick={() => removeGalleryImage(comp.id, idx)}
                  className={styles.removeImageButton}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={() => addGalleryImage(comp.id)}
              className={styles.addImageButton}
            >
              <Plus size={14} />
              <span>add image</span>
            </button>
          </div>
        ) : (
          <input
            type="text"
            value={comp.content}
            onChange={(e) => updateComponent(comp.id, e.target.value)}
            className={styles.textInput}
            placeholder={comp.type === 'image' ? 'Enter image URL' : 'Enter content'}
          />
        )}

        {selectedComponentId === comp.id && (
          <div className={styles.stylePanel}>
            <div className={styles.styleRow}>
              <label>Align:</label>
              <select 
                value={comp.style?.textAlign || 'left'}
                onChange={(e) => updateComponentStyle(comp.id, 'textAlign', e.target.value)}
                className={styles.styleSelect}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div className={styles.styleRow}>
              <label>Font Size:</label>
              <input
                type="text"
                value={comp.style?.fontSize || '16px'}
                onChange={(e) => updateComponentStyle(comp.id, 'fontSize', e.target.value)}
                className={styles.styleInput}
                placeholder="16px"
              />
            </div>

            <div className={styles.styleRow}>
              <label>Color:</label>
              <input
                type="color"
                value={comp.style?.color || '#000000'}
                onChange={(e) => updateComponentStyle(comp.id, 'color', e.target.value)}
                className={styles.colorInput}
              />
            </div>

            <div className={styles.styleRow}>
              <label>Background:</label>
              <input
                type="color"
                value={comp.style?.backgroundColor === 'transparent' ? '#ffffff' : comp.style?.backgroundColor || '#ffffff'}
                onChange={(e) => updateComponentStyle(comp.id, 'backgroundColor', e.target.value)}
                className={styles.colorInput}
              />
            </div>

            <div className={styles.styleRow}>
              <label>Padding:</label>
              <input
                type="text"
                value={comp.style?.padding || '8px'}
                onChange={(e) => updateComponentStyle(comp.id, 'padding', e.target.value)}
                className={styles.styleInput}
                placeholder="8px"
              />
            </div>

            <div className={styles.styleRow}>
              <label>Width:</label>
              <input
                type="text"
                value={comp.style?.width || '100%'}
                onChange={(e) => updateComponentStyle(comp.id, 'width', e.target.value)}
                className={styles.styleInput}
                placeholder="100%"
              />
            </div>

            <div className={styles.styleRow}>
              <label>Border Radius:</label>
              <input
                type="text"
                value={comp.style?.borderRadius || '0px'}
                onChange={(e) => updateComponentStyle(comp.id, 'borderRadius', e.target.value)}
                className={styles.styleInput}
                placeholder="0px"
              />
            </div>

            <div className={styles.styleRow}>
              <label>🎃 Spooky Mode:</label>
              <button
                onClick={() => toggleSpooky(comp.id)}
                className={comp.style?.spooky ? styles.spookyButtonActive : styles.spookyButton}
              >
                {comp.style?.spooky ? '👻 ON' : '🦇 OFF'}
              </button>
            </div>

            {comp.type === 'gallery' && (
              <>
                <div className={styles.styleDivider}>Gallery Settings</div>
                <div className={styles.styleRow}>
                  <label>Columns:</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={comp.style?.galleryColumns || 3}
                    onChange={(e) => updateComponentStyle(comp.id, 'galleryColumns', parseInt(e.target.value))}
                    className={styles.styleInput}
                  />
                </div>
                <div className={styles.styleRow}>
                  <label>Gap:</label>
                  <input
                    type="text"
                    value={comp.style?.galleryGap || '16px'}
                    onChange={(e) => updateComponentStyle(comp.id, 'galleryGap', e.target.value)}
                    className={styles.styleInput}
                    placeholder="16px"
                  />
                </div>
              </>
            )}

            {comp.type === 'button' && (
              <>
                <div className={styles.styleDivider}>Button Action</div>
                <div className={styles.styleRow}>
                  <label>Action Type:</label>
                  <select 
                    value={comp.action?.type || 'none'}
                    onChange={(e) => updateButtonAction(comp.id, { type: e.target.value as ButtonAction['type'], value: comp.action?.value, emoji: comp.action?.emoji })}
                    className={styles.styleSelect}
                  >
                    <option value="none">None</option>
                    <option value="link">Open Link</option>
                    <option value="confetti">🎉 Confetti</option>
                    <option value="spookyEmojis">🎃 All Spooky Emojis</option>
                    <option value="singleEmoji">Single Emoji Rain</option>
                    <option value="alert">Show Alert</option>
                  </select>
                </div>

                {comp.action?.type === 'singleEmoji' && (
                  <div className={styles.styleRow}>
                    <label>Select Emoji:</label>
                    <div className={styles.emojiGrid}>
                      {SPOOKY_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => updateButtonAction(comp.id, { type: 'singleEmoji', emoji })}
                          className={comp.action?.emoji === emoji ? styles.emojiOptionSelected : styles.emojiOption}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(comp.action?.type === 'link' || comp.action?.type === 'alert') && (
                  <div className={styles.styleRow}>
                    <label>{comp.action.type === 'link' ? 'URL:' : 'Message:'}</label>
                    <input
                      type="text"
                      value={comp.action?.value || ''}
                      onChange={(e) => updateButtonAction(comp.id, { type: comp.action!.type, value: e.target.value })}
                      className={styles.styleInput}
                      placeholder={comp.action.type === 'link' ? 'https://example.com' : 'Enter message'}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {!isPreview && (
        <div className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>components</h2>
          <div className={styles.componentList}>
            {AVAILABLE_COMPONENTS.map((item) => (
              <button
                key={item.type}
                onClick={() => addComponent(item)}
                className={styles.componentButton}
              >
                {getComponentIcon(item.type)}
                <span>{item.label.toLowerCase()}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.mainArea}>
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <a href="/" className={styles.backButton}>
              <ArrowLeft size={14} />
              <span>home</span>
            </a>
            <h1 className={styles.title}>page builder</h1>
          </div>
          <div className={styles.toolbarButtons}>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={styles.themeButton}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <div className={styles.colorPickerGroup}>
              <label htmlFor="themeColor" className={styles.colorLabel}>accent</label>
              <input
                id="themeColor"
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className={styles.colorPicker}
                title="Theme Color"
              />
            </div>
            <div className={styles.animationGroup}>
              <select
                value={pageAnimation}
                onChange={(e) => setPageAnimation(e.target.value)}
                className={styles.animationSelect}
                title="Page Animation"
              >
                <option value="none">no animation</option>
                <option value="anim1">animation 1</option>
                <option value="anim2">animation 2</option>
                <option value="anim3">animation 3</option>
                <option value="anim4">animation 4</option>
              </select>
              {pageAnimation !== 'none' && (
                <>
                  <div className={styles.animationPreview}>
                    <img 
                      src={`/${pageAnimation}.gif`} 
                      alt="Animation preview"
                      className={styles.animationPreviewImg}
                    />
                  </div>
                  <select
                    value={animationIntensity}
                    onChange={(e) => setAnimationIntensity(Number(e.target.value))}
                    className={styles.intensitySelect}
                    title="Animation Intensity"
                  >
                    <option value="1">low</option>
                    <option value="2">medium</option>
                    <option value="3">high</option>
                  </select>
                </>
              )}
            </div>
            <button
              onClick={() => setShowChatbotModal(true)}
              className={chatbotEnabled ? styles.chatbotButtonActive : styles.chatbotButton}
              title="Configure Chatbot"
            >
              <MessageCircle size={14} />
              <span>chatbot</span>
            </button>
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={styles.previewButton}
            >
              {isPreview ? <Edit size={14} /> : <Eye size={14} />}
              <span>{isPreview ? 'edit' : 'preview'}</span>
            </button>
            <button
              onClick={() => setShowPublishModal(true)}
              className={styles.publishButton}
              disabled={components.length === 0}
            >
              <Upload size={14} />
              <span>{editMode ? 'update' : 'publish'}</span>
            </button>
          </div>
        </div>

        <div 
          className={isPreview ? styles.previewCanvas : styles.canvas}
          style={{
            backgroundColor: theme === 'dark' ? '#1a1a1a' : 'white',
            color: theme === 'dark' ? '#ffffff' : '#000000',
          }}
        >
          {components.length === 0 && !isPreview ? (
            <div className={styles.emptyState}>
              Click components on the left to add them to your page
            </div>
          ) : (
            components.map((comp, index) => (
              <div
                key={comp.id}
                draggable={!isPreview}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={isPreview ? styles.previewComponent : styles.component}
              >
                {renderComponent(comp, !isPreview)}
              </div>
            ))
          )}
        </div>
      </div>

      {deleteConfirmId && (
        <div className={styles.modalOverlay} onClick={cancelDelete}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>delete component?</h3>
            <p className={styles.modalText}>this action cannot be undone</p>
            <div className={styles.modalButtons}>
              <button onClick={cancelDelete} className={styles.cancelButton}>
                <X size={14} />
                <span>cancel</span>
              </button>
              <button onClick={confirmDelete} className={styles.confirmButton}>
                <Trash2 size={14} />
                <span>delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showPublishModal && (
        <div className={styles.modalOverlay} onClick={() => !publishing && setShowPublishModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{editMode ? 'update page' : 'publish page'}</h3>
            <div className={styles.publishForm}>
              {!publishedSlug && (
                <>
                  <label className={styles.publishLabel}>Site Name *</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => handleSiteNameChange(e.target.value)}
                    className={styles.publishInput}
                    placeholder="e.g., My Travel Blog, John's Portfolio"
                    disabled={publishing}
                    required
                  />
                  <div className={styles.fieldHint}>
                    This name will appear in the navbar and on the globe marker
                  </div>

                  <label className={styles.publishLabel}>Page Slug *</label>
                  <input
                    type="text"
                    value={pageSlug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className={styles.publishInput}
                    placeholder="my-page-url"
                    disabled={publishing}
                    required
                  />
                  <div className={styles.fieldHint}>
                    Your page will be available at: /{pageSlug || 'your-slug'}
                  </div>

                  <label className={styles.publishLabel}>Header Image (Optional)</label>
                  <input
                    type="text"
                    value={headerImage}
                    onChange={(e) => setHeaderImage(e.target.value)}
                    className={styles.publishInput}
                    placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                    disabled={publishing}
                  />
                  {headerImage && (
                    <div className={styles.imagePreview}>
                      <img src={headerImage} alt="Header preview" className={styles.previewImage} />
                    </div>
                  )}

                  <label className={styles.publishLabel}>Select Location</label>
                  <LocationPicker
                    onLocationSelect={(lat, lng, name) => {
                      setSelectedLat(lat);
                      setSelectedLng(lng);
                      setLocationName(name);
                    }}
                  />
                </>
              )}
              
              {publishMessage && (
                <div className={`${styles.publishMessage} ${styles[publishMessage.type]}`}>
                  {publishMessage.text}
                </div>
              )}

              {publishedSlug && (
                <div className={styles.publishedUrl}>
                  <label className={styles.publishLabel}>Your page is live at:</label>
                  <div className={styles.urlBox}>
                    <a 
                      href={`/${publishedSlug}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.urlLink}
                    >
                      {typeof window !== 'undefined' ? window.location.origin : ''}/{publishedSlug}
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/${publishedSlug}`);
                        setPublishMessage({ type: 'success', text: 'URL copied to clipboard!' });
                      }}
                      className={styles.copyButton}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className={styles.modalButtons}>
              {!publishedSlug ? (
                <>
                  <button 
                    onClick={() => setShowPublishModal(false)} 
                    className={styles.cancelButton}
                    disabled={publishing}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handlePublish} 
                    className={styles.confirmButton}
                    disabled={publishing}
                  >
                    {publishing ? (editMode ? 'Updating...' : 'Publishing...') : (editMode ? 'Update' : 'Publish')}
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    setShowPublishModal(false);
                    setPublishMessage(null);
                    setPublishedSlug(null);
                  }} 
                  className={styles.confirmButton}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showChatbotModal && (
        <div className={styles.modalOverlay} onClick={() => setShowChatbotModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>configure chatbot</h3>
            <div className={styles.publishForm}>
              <div className={styles.chatbotToggle}>
                <label className={styles.publishLabel}>Enable Chatbot</label>
                <button
                  onClick={() => setChatbotEnabled(!chatbotEnabled)}
                  className={chatbotEnabled ? styles.toggleButtonActive : styles.toggleButton}
                >
                  {chatbotEnabled ? 'enabled' : 'disabled'}
                </button>
              </div>

              {chatbotEnabled && (
                <>
                  <label className={styles.publishLabel}>OpenAI API Key *</label>
                  <input
                    type="password"
                    value={chatbotApiKey}
                    onChange={(e) => setChatbotApiKey(e.target.value)}
                    className={styles.publishInput}
                    placeholder="sk-..."
                  />
                  <div className={styles.fieldHint}>
                    Your API key is stored securely and only used for your chatbot
                  </div>

                  <label className={styles.publishLabel}>Character Name *</label>
                  <input
                    type="text"
                    value={chatbotCharacterName}
                    onChange={(e) => setChatbotCharacterName(e.target.value)}
                    className={styles.publishInput}
                    placeholder="e.g., Alex, Travel Guide, Support Bot"
                  />

                  <label className={styles.publishLabel}>Character Prompt *</label>
                  <textarea
                    value={chatbotCharacterPrompt}
                    onChange={(e) => setChatbotCharacterPrompt(e.target.value)}
                    className={styles.publishTextarea}
                    placeholder="Describe your chatbot's personality and role. E.g., 'You are a friendly travel guide who helps visitors explore the city...'"
                    rows={4}
                  />

                  <label className={styles.publishLabel}>Button Icon</label>
                  <div className={styles.buttonTypeSelector}>
                    <button
                      onClick={() => setChatbotButtonType('emoji')}
                      className={chatbotButtonType === 'emoji' ? styles.typeSelectorActive : styles.typeSelector}
                    >
                      emoji
                    </button>
                    <button
                      onClick={() => setChatbotButtonType('image')}
                      className={chatbotButtonType === 'image' ? styles.typeSelectorActive : styles.typeSelector}
                    >
                      image
                    </button>
                  </div>

                  {chatbotButtonType === 'emoji' ? (
                    <>
                      <label className={styles.publishLabel}>Select Emoji</label>
                      <div className={styles.emojiGrid}>
                        {SPOOKY_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => setChatbotButtonEmoji(emoji)}
                            className={chatbotButtonEmoji === emoji ? styles.emojiOptionSelected : styles.emojiOption}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      {chatbotButtonEmoji && (
                        <div className={styles.emojiPreview}>
                          Selected: <span className={styles.selectedEmoji}>{chatbotButtonEmoji}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <label className={styles.publishLabel}>Button Image URL</label>
                      <input
                        type="text"
                        value={chatbotButtonImage}
                        onChange={(e) => setChatbotButtonImage(e.target.value)}
                        className={styles.publishInput}
                        placeholder="https://example.com/avatar.jpg"
                      />
                      {chatbotButtonImage && (
                        <div className={styles.imagePreview}>
                          <img src={chatbotButtonImage} alt="Button preview" className={styles.previewImage} />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
            <div className={styles.modalButtons}>
              <button 
                onClick={() => setShowChatbotModal(false)} 
                className={styles.cancelButton}
              >
                <X size={14} />
                <span>cancel</span>
              </button>
              <button 
                onClick={() => setShowChatbotModal(false)} 
                className={styles.confirmButton}
              >
                save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
