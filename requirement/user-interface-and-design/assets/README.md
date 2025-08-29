# Academia Pro - Assets & Resources

## 📁 Assets Organization

This directory contains all static assets, media files, and resources used throughout the Academia Pro application.

## Directory Structure

```
assets/
├── images/                    # Static images and graphics
│   ├── logos/                # Brand logos and variants
│   ├── icons/                # Custom icons and illustrations
│   ├── illustrations/        # Hero images and illustrations
│   ├── avatars/              # Default avatar placeholders
│   └── backgrounds/          # Background images and patterns
├── fonts/                    # Custom font files
│   ├── inter/                # Primary font family
│   ├── poppins/              # Secondary font family
│   └── icons/                # Icon font files
├── videos/                   # Video assets
│   ├── tutorials/            # Tutorial and onboarding videos
│   ├── demos/                # Feature demonstration videos
│   └── placeholders/         # Video placeholder thumbnails
├── audio/                    # Audio assets
│   ├── notifications/        # Notification sounds
│   └── accessibility/        # Screen reader audio cues
├── documents/                # Static documents
│   ├── templates/            # Document templates
│   ├── guides/               # User guides and manuals
│   └── legal/                # Terms, policies, and legal docs
├── data/                     # Static data files
│   ├── countries.json        # Country and region data
│   ├── languages.json        # Language and locale data
│   ├── currencies.json       # Currency and payment data
│   └── constants.json        # Application constants
└── favicons/                 # Favicon and app icons
    ├── favicon.ico           # Standard favicon
    ├── apple-touch-icon.png  # Apple touch icon
    ├── android-chrome-*.png  # Android icons
    └── manifest.json         # Web app manifest
```

## 🎨 Image Guidelines

### **Formats & Optimization**
- **WebP** for modern browsers (primary format)
- **JPEG** for photographs (quality: 80-90%)
- **PNG** for graphics with transparency
- **SVG** for icons and simple graphics
- **AVIF** for next-generation compression

### **Naming Convention**
```
[category]_[description]_[variant]_[size].[extension]
```

**Examples:**
- `logo_primary_horizontal_400x100.webp`
- `icon_user_profile_24x24.svg`
- `illustration_welcome_students_800x600.webp`
- `avatar_default_student_128x128.png`

### **Responsive Images**
```typescript
// Next.js Image component with responsive srcSet
<Image
  src="/images/hero_students.webp"
  srcSet="/images/hero_students_400.webp 400w,
          /images/hero_students_800.webp 800w,
          /images/hero_students_1200.webp 1200w"
  sizes="(max-width: 768px) 400px,
         (max-width: 1024px) 800px,
         1200px"
  alt="Students learning"
/>
```

## 🔤 Typography & Fonts

### **Font Loading Strategy**
```typescript
// Preload critical fonts
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="">

// Font face declarations
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
}
```

### **Font Stacks**
```typescript
// Font family definitions
const fontFamilies = {
  primary: [
    'Inter',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ],
  secondary: [
    'Poppins',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ],
};
```

## 🎵 Audio Guidelines

### **Audio Formats**
- **MP3** for broad compatibility
- **AAC** for better compression
- **WebM** for web-native audio
- **WAV** for high-quality originals

### **Audio Usage**
```typescript
// Audio context for notifications
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Play notification sound
const playNotification = async (soundFile: string) => {
  const response = await fetch(`/audio/notifications/${soundFile}`);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
};
```

## 📄 Document Assets

### **Document Types**
- **PDF** for printable documents
- **DOCX** for editable templates
- **XLSX** for data exports
- **CSV** for bulk data operations

### **Document Templates**
```typescript
// Certificate template structure
interface CertificateTemplate {
  id: string;
  name: string;
  type: 'achievement' | 'completion' | 'participation';
  layout: {
    size: 'A4' | 'Letter';
    orientation: 'portrait' | 'landscape';
    margins: { top: number; right: number; bottom: number; left: number };
  };
  elements: Array<{
    type: 'text' | 'image' | 'qr' | 'signature';
    position: { x: number; y: number };
    content: string;
    style: Record<string, any>;
  }>;
}
```

## 🌐 Internationalization Assets

### **Translation Files**
```json
// en-US.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "loading": "Loading...",
    "error": "An error occurred"
  },
  "student": {
    "name": "Student Name",
    "grade": "Grade",
    "enrollmentDate": "Enrollment Date"
  }
}
```

### **Locale-Specific Assets**
```
assets/
├── images/
│   ├── flags/                 # Country flags
│   └── cultural/              # Culturally relevant images
├── fonts/
│   ├── ar/                    # Arabic fonts
│   ├── zh/                    # Chinese fonts
│   └── hi/                    # Hindi fonts
└── documents/
    ├── privacy-policy/        # Localized privacy policies
    └── terms-of-service/      # Localized terms
```

## 📱 Progressive Web App Assets

### **Web App Manifest**
```json
// public/manifest.json
{
  "name": "Academia Pro",
  "short_name": "Academia",
  "description": "Comprehensive School Management System",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2196f3",
  "icons": [
    {
      "src": "/favicons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/favicons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### **Service Worker Assets**
```typescript
// Service worker caching strategy
const CACHE_NAME = 'academia-pro-v1';
const STATIC_ASSETS = [
  '/favicon.ico',
  '/manifest.json',
  '/fonts/inter-var.woff2',
  '/images/logo.webp',
  // Critical CSS and JS files
];
```

## 🖼️ Icon System

### **Icon Categories**
- **Navigation** - Menu and navigation icons
- **Actions** - CRUD operations and interactions
- **Status** - Success, error, warning states
- **Content** - Document, media, and content types
- **Communication** - Messages, notifications, calls
- **Education** - Books, students, teachers, subjects

### **Icon Implementation**
```typescript
// Icon component usage
import { Icon } from '@/design-system/components';

<Icon
  name="user-profile"
  size="md"
  color="primary"
  aria-label="User profile"
/>

// Custom icon with SVG
const CustomIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z" />
  </svg>
);
```

## 📊 Data Assets

### **Static Data Structure**
```typescript
// Countries data
interface Country {
  code: string;           // ISO 3166-1 alpha-2
  name: string;           // Country name
  flag: string;           // Flag emoji or image path
  currency: string;       // ISO 4217 currency code
  languages: string[];    // Official languages
  timezone: string;       // Primary timezone
}

// Languages data
interface Language {
  code: string;           // ISO 639-1
  name: string;           // Language name
  nativeName: string;     // Native language name
  direction: 'ltr' | 'rtl'; // Text direction
  flag: string;           // Associated flag
}
```

## 🔧 Asset Optimization

### **Build-Time Optimization**
```typescript
// Next.js image optimization
import Image from 'next/image';

<Image
  src="/images/hero.webp"
  alt="Hero image"
  width={1200}
  height={600}
  priority={true}         // Above the fold
  placeholder="blur"      // Blur placeholder
  blurDataURL="..."       // Custom blur data
/>
```

### **Runtime Optimization**
```typescript
// Lazy loading for non-critical images
import { useState, useRef, useEffect } from 'react';

const LazyImage = ({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete) {
      setIsLoaded(true);
    }
  }, []);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      onLoad={() => setIsLoaded(true)}
      style={{ opacity: isLoaded ? 1 : 0.5 }}
      {...props}
    />
  );
};
```

## 📋 Asset Management Guidelines

### **File Organization**
- Group related assets in subdirectories
- Use consistent naming conventions
- Maintain version control for assets
- Document asset usage and ownership

### **Performance Considerations**
- Optimize images for web (WebP, responsive)
- Use font-display: swap for fonts
- Implement lazy loading for below-the-fold content
- Cache static assets with appropriate headers

### **Accessibility Requirements**
- Provide alt text for all images
- Ensure sufficient color contrast
- Support high contrast mode
- Include text alternatives for audio/video

### **SEO Optimization**
- Optimize images with descriptive filenames
- Include structured data for images
- Use appropriate meta tags
- Implement lazy loading for better Core Web Vitals

## 🚀 Deployment Considerations

### **CDN Integration**
```typescript
// CDN configuration for assets
const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_URL || '';

const getAssetUrl = (path: string): string => {
  return `${CDN_BASE_URL}${path}`;
};

// Usage
const logoUrl = getAssetUrl('/images/logo.webp');
```

### **Asset Versioning**
```typescript
// Cache busting with file hashes
const assetManifest = {
  'logo.webp': 'logo-abc123.webp',
  'main.css': 'main-def456.css',
  'app.js': 'app-ghi789.js',
};
```

This comprehensive asset structure ensures optimal performance, accessibility, and maintainability for the Academia Pro application.