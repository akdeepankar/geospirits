# Page Animation Feature

## Overview
Added ability to select animated GIFs (anim1.gif to anim4.gif) that will fly across published pages.

## Database Changes
- Added `page_animation` column to pages table (TEXT, default 'none')
- Updated supabase-setup.sql with migration

## Backend Changes (✅ Complete)
- Updated `publishPage()` function to accept `pageAnimation` parameter
- Updated `updatePage()` function to accept `pageAnimation` parameter
- Both functions now save animation choice to database

## Frontend Changes Needed

### 1. PageBuilder Component
Add animation selector in the publish modal (after header image field):

```tsx
<label className={styles.publishLabel}>Page Animation (Optional)</label>
<select
  value={pageAnimation}
  onChange={(e) => setPageAnimation(e.target.value)}
  className={styles.publishInput}
  disabled={publishing}
>
  <option value="none">None</option>
  <option value="anim1">Animation 1</option>
  <option value="anim2">Animation 2</option>
  <option value="anim3">Animation 3</option>
  <option value="anim4">Animation 4</option>
</select>
```

### 2. Update handlePublish function
Add `pageAnimation` to the pageData object:

```tsx
const pageData = {
  title: pageTitle,
  siteName: siteName || undefined,
  components,
  theme,
  headerImage: headerImage || undefined,
  latitude: selectedLat,
  longitude: selectedLng,
  locationName,
  pageAnimation, // Add this line
};
```

### 3. PublicPageView Component
Add animation effect similar to the ghost on MapboxGlobe:

```tsx
useEffect(() => {
  if (!pageData.page_animation || pageData.page_animation === 'none') return;
  
  const createAnimation = () => {
    const anim = document.createElement('img');
    anim.src = `/${pageData.page_animation}.gif`;
    anim.style.position = 'fixed';
    anim.style.width = '60px';
    anim.style.height = 'auto';
    anim.style.zIndex = '999';
    anim.style.pointerEvents = 'none';
    anim.style.opacity = '0.7';
    
    // Random starting position from edges
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
  
  const interval = setInterval(() => {
    if (Math.random() > 0.4) createAnimation();
  }, 12000);
  
  const timeout = setTimeout(createAnimation, 2000);
  
  return () => {
    clearInterval(interval);
    clearTimeout(timeout);
  };
}, [pageData.page_animation]);
```

## Animation Files Required
Place these GIF files in the `public` folder:
- anim1.gif
- anim2.gif
- anim3.gif
- anim4.gif

## Status
- ✅ Database schema updated
- ✅ Backend actions updated
- ⏳ PageBuilder UI needs animation selector
- ⏳ PageBuilder needs to pass pageAnimation to publish/update
- ⏳ PublicPageView needs animation effect implementation
