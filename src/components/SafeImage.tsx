import React, { useState, useEffect } from 'react';

const LOCAL_IMAGE_FALLBACKS: Record<string, string> = {
  'hero_woman_phone': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
  'hero_man_tablet': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
  'about_team': 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=800&auto=format&fit=crop',
  'about_woman_tablet': 'https://images.unsplash.com/photo-1580894732444-8fecef2271ff?q=80&w=600&auto=format&fit=crop',
  'about_cash': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600&auto=format&fit=crop',
  'about_wallet': 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=600&auto=format&fit=crop',
  'about_coins': 'https://images.unsplash.com/photo-1618044733300-9472054094ee?q=80&w=600&auto=format&fit=crop',
  'faq_man': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop',
};

interface SafeImageProps {
  src: string;
  fallbackSrc?: string;
  alt?: string;
  className?: string;
  referrerPolicy?: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url" | string;
  onClick?: (e: any) => void;
  style?: React.CSSProperties;
  onError?: (e: any) => void;
  [key: string]: any;
}

export default function SafeImage({ src, fallbackSrc, alt, onError, ...props }: SafeImageProps) {
  const [retryCount, setRetryCount] = useState<number>(0);
  const [currentSrc, setCurrentSrc] = useState<string>(src);

  useEffect(() => {
    setCurrentSrc(src);
    setRetryCount(0);
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn(`[SafeImage Info] Initial image URL failed to load. Initiating self-healing fallback: "${currentSrc}"`);
    
    // Check if the URL matches any of our template local assets keys
    const matchKey = Object.keys(LOCAL_IMAGE_FALLBACKS).find(key => src && src.includes(key));
    
    if (retryCount < 1) {
      console.log(`[SafeImage] Retry initial load once for image URL: "${src}"`);
      setRetryCount(1);
      // Force reload by appending a query parameter or simple timestamp
      const hasQueryParams = src.includes('?');
      const retryUrl = hasQueryParams ? `${src}&retry=1` : `${src}?retry=1`;
      setCurrentSrc(retryUrl);
    } else if (matchKey) {
      const unsplashUrl = LOCAL_IMAGE_FALLBACKS[matchKey];
      console.log(`[SafeImage] Local asset failed. Switching to beautiful Unsplash fallback: "${unsplashUrl}"`);
      setCurrentSrc(unsplashUrl);
    } else if (fallbackSrc && currentSrc !== fallbackSrc) {
      console.log(`[SafeImage] Primary retry failed. Switching to specified fallback URL: "${fallbackSrc}"`);
      setCurrentSrc(fallbackSrc);
    } else {
      console.warn(`[SafeImage] Retries exhausted for URL: "${src}"`);
    }
    
    if (onError) {
      onError(e);
    }
  };

  // Prevent rendering if URL is blocked or undefined as requested in rules
  if (!currentSrc) {
    return null;
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
}
