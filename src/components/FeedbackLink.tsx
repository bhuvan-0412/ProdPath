'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useProgress } from '@/context/ProgressContext';

// The footer's "Send Feedback" button: the only part of the footer that needs the browser
export const FeedbackLink: React.FC = () => {
  const { openFeedbackModal } = useProgress();
  return (
    <button
      onClick={openFeedbackModal}
      className="hover:underline text-accent-dark text-xs font-semibold inline-flex items-center gap-1.5 transition-colors min-h-10 sm:min-h-0"
    >
      <MessageSquare className="w-3.5 h-3.5" />
      <span>Send Feedback</span>
    </button>
  );
};
