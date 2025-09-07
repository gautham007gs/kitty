"use client";

import { useState, useEffect } from 'react';

interface ClientOnlyTimestampProps {
  timestamp: string | Date;
  className?: string;
}

// This component ensures that the timestamp is only formatted and rendered on the client.
// It prevents hydration mismatches by rendering null on the server and during the initial client render,
// then rendering the formatted time in a useEffect hook.
export const ClientOnlyTimestamp: React.FC<ClientOnlyTimestampProps> = ({ timestamp, className }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    // Render nothing on the server and on the initial client-side pass.
    // This can be a placeholder/spinner as well.
    return null;
  }

  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <span className={className}>
      {formattedTime}
    </span>
  );
};
