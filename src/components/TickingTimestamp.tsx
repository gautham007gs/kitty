'use client';

import { useState, useEffect } from 'react';

interface TickingTimestampProps {
  date: string | Date | undefined;
  className?: string;
}

export const TickingTimestamp: React.FC<TickingTimestampProps> = ({ date, className }) => {
  const [isClient, setIsClient] = useState(false);
  const [displayTime, setDisplayTime] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!date) return;

    const updateDisplayTime = () => {
      const messageDate = new Date(date);
      const now = new Date();
      const diffSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);

      if (diffSeconds < 60) {
        setDisplayTime('just now');
      } else if (diffSeconds < 3600) {
        const minutes = Math.floor(diffSeconds / 60);
        setDisplayTime(`${minutes}m ago`);
      } else if (diffSeconds < 86400) {
        const hours = Math.floor(diffSeconds / 3600);
        setDisplayTime(`${hours}h ago`);
      } else {
        setDisplayTime(messageDate.toLocaleDateString());
      }
    };

    updateDisplayTime();
    const interval = setInterval(updateDisplayTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [date]);

  if (!isClient || !date) {
    return <span className={className}>&nbsp;</span>;
  }

  return <span className={className}>{displayTime}</span>;
};
