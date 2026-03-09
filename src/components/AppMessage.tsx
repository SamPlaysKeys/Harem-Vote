'use client';

import { useEffect, useState } from 'react';
import { appConfig } from '@/lib/config';

const STORAGE_KEY = 'app_message_dismissed';

export function AppMessage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!appConfig.message) return;

    const dismissedMessage = localStorage.getItem(STORAGE_KEY);
    if (dismissedMessage !== appConfig.message) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, appConfig.message);
    setVisible(false);
  };

  if (!visible || !appConfig.message) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          {appConfig.message}
        </p>
        <button
          onClick={handleDismiss}
          className="shrink-0 text-sm text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
