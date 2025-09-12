
'use client';

import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ChatView from '@/components/chat/ChatView';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-destructive">
          Oops! Something went wrong
        </h2>
        <p className="text-muted-foreground mb-4">
          {error.message || 'An unexpected error occurred while loading the chat.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    </div>
  );
}

export default function MayaChatPage() {
  // Provide default props for ChatView to avoid TypeScript errors
  const defaultProps = {
    messages: [],
    aiAvatarUrl: '/maya-avatar.png',
    aiName: 'Maya',
    isAiTyping: false,
    onTriggerAd: () => {}
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingFallback />}>
        <ChatView {...defaultProps} />
      </Suspense>
    </ErrorBoundary>
  );
}
