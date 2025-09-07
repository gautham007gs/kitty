'use client'
import React, { useEffect, useRef } from 'react';

interface BannerAdDisplayProps {
  adScript: string;
}

const BannerAdDisplay: React.FC<BannerAdDisplayProps> = ({ adScript }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adContainerRef.current) {
      // Clear previous ad content
      adContainerRef.current.innerHTML = '';
      
      const range = document.createRange();
      range.selectNode(adContainerRef.current);
      try {
        const documentFragment = range.createContextualFragment(adScript);
        adContainerRef.current.appendChild(documentFragment);
      } catch (e) {
        console.error("Error parsing and injecting ad script:", e);
      }
    }
  }, [adScript]);

  return <div ref={adContainerRef} className="banner-ad w-full flex justify-center" />;
};

export default BannerAdDisplay;
