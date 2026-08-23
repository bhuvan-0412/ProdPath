'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useProgress } from '@/context/ProgressContext';
import { X, MessageSquare, Send, CheckCircle2, AlertCircle, Loader2, Lock, LogIn } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { user } = useProgress();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const minChars = 10;
  const maxChars = 2000;
  const charCount = feedback.length;
  const isValidLength = charCount >= minChars && charCount <= maxChars;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isValidLength || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong, try again.');
      }

      setSuccessMessage('Thanks — feedback sent!');
      setFeedback('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong, try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden bg-white dark:bg-[#12121a] rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5 p-6 sm:p-7 text-zinc-900 dark:text-zinc-100">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-zinc-900 dark:text-zinc-100">
              Send Feedback
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Share your thoughts, suggestions, or issues
            </p>
          </div>
        </div>

        {/* Guest Guard State */}
        {!user ? (
          <div className="py-6 px-4 rounded-2xl bg-violet-950/10 dark:bg-violet-950/20 border border-violet-500/20 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-100">
                Log in to send feedback
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                Feedback submissions are reserved for logged-in users so we can follow up with you.
              </p>
            </div>
            <Link
              href="/login"
              onClick={handleClose}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Continue</span>
            </Link>
          </div>
        ) : (
          /* Form for Authenticated Users */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Success Alert Banner */}
            {successMessage && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Error Alert Banner */}
            {errorMessage && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="feedback-input" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Your Feedback
              </label>
              <textarea
                id="feedback-input"
                rows={5}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell me what's working, what's not, or what you'd like to see"
                maxLength={maxChars}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all resize-none disabled:opacity-50"
              />
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 px-1">
                <span>Min {minChars} characters</span>
                <span className={charCount > maxChars ? 'text-rose-500 font-bold' : ''}>
                  {charCount} / {maxChars}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValidLength || isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 text-white disabled:text-zinc-500 text-xs font-bold shadow-sm transition-all disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
