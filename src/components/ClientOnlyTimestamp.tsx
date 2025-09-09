
"use client";

import { useState, useEffect } from 'react';

interface ClientOnlyTimestampProps {
  timestamp: string | Date;
  className?: string;
  format?: 'time' | 'relative' | 'full';
}

// This component ensures that the timestamp is only formatted and rendered on the client.
// It prevents hydration mismatches by rendering a placeholder on the server and during the initial client render,
// then rendering the formatted time in a useEffect hook.
export const ClientOnlyTimestamp: React.FC<ClientOnlyTimestampProps> = ({ 
  timestamp, 
  className,
  format = 'time'
}) => {
  const [hasMounted, setHasMounted] = useState(false);
  const [formattedTime, setFormattedTime] = useState('');

  useEffect(() => {
    setHasMounted(true);
    
    if (timestamp) {
      const date = new Date(timestamp);
      
      switch (format) {
        case 'time':
          setFormattedTime(date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }));
          break;
        case 'relative':
          const now = new Date();
          const diffMs = now.getTime() - date.getTime();
          const diffMins = Math.floor(diffMs / (1000 * 60));
          
          if (diffMins < 1) {
            setFormattedTime('just now');
          } else if (diffMins < 60) {
            setFormattedTime(`${diffMins}m ago`);
          } else if (diffMins < 1440) {
            const hours = Math.floor(diffMins / 60);
            setFormattedTime(`${hours}h ago`);
          } else {
            setFormattedTime(date.toLocaleDateString());
          }
          break;
        case 'full':
          setFormattedTime(date.toLocaleString());
          break;
        default:
          setFormattedTime(date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }));
      }
    }
  }, [timestamp, format]);

  if (!hasMounted) {
    // Render a consistent placeholder on the server and during hydration
    return <span className={className}>&nbsp;</span>;
  }

  if (!timestamp) {
    return <span className={className}>--:--</span>;
  }

  return (
    <span className={className}>
      {formattedTime}
    </span>
  );
};
