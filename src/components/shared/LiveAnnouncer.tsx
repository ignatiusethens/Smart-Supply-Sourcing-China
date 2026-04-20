/**
 * Live Announcer Component
 * Announces dynamic content changes to screen readers
 * Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5, 18.6
 */

'use client';

import React, { useEffect, useState } from 'react';

interface LiveAnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
  clearAfter?: number;
}

export function LiveAnnouncer({
  message,
  priority = 'polite',
  clearAfter = 1000,
}: LiveAnnouncerProps) {
  const [announcement, setAnnouncement] = useState(message);

  useEffect(() => {
    setAnnouncement(message);

    if (clearAfter > 0) {
      const timer = setTimeout(() => {
        setAnnouncement('');
      }, clearAfter);

      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  if (!announcement) return null;

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}

/**
 * Hook for announcing messages to screen readers
 */
export function useAnnouncer() {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'polite' | 'assertive'>('polite');

  const announce = (
    text: string,
    announcePriority: 'polite' | 'assertive' = 'polite'
  ) => {
    setMessage(text);
    setPriority(announcePriority);
  };

  return {
    message,
    priority,
    announce,
    LiveAnnouncer: () => (
      <LiveAnnouncer message={message} priority={priority} />
    ),
  };
}
