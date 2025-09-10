'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CircularAvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: React.ReactNode;
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

export function CircularAvatar({ 
  src, 
  alt = 'Avatar', 
  size = 'md', 
  className,
  fallback,
  onClick 
}: CircularAvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div 
      className={cn(
        'rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0',
        sizeClasses[size],
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={onClick}
    >
      {src && !imageError ? (
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : fallback ? (
        fallback
      ) : (
        <div className="text-gray-500 dark:text-gray-400 text-xs font-medium">
          {alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

export default CircularAvatar;