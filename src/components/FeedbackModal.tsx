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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden bg-surface rounded-xl border border-line space-y-5 p-6 sm:p-7 text-ink">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-muted hover:text-ink/80 hover:bg-line/40 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent-dark flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-ink">
              Send Feedback
            </h2>
            <p className="text-xs text-muted">
              Share your thoughts, suggestions, or issues
            </p>
          </div>
        </div>

        {/* Guest Guard State */}
        {!user ? (
          <div className="py-6 px-4 rounded-xl bg-accent-soft border border-accent/40 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-accent-dark text-paper flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-base text-ink">
                Log in to send feedback
              </h3>
              <p className="text-xs text-muted max-w-xs mx-auto">
                Feedback submissions are reserved for logged-in users so we can follow up with you.
              </p>
            </div>
            <Link
              href="/login"
              onClick={handleClose}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-accent-dark hover:bg-accent-dark/90 text-paper text-xs font-bold transition-all"
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
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-success/10 border border-success/30 text-success text-xs font-semibold animate-fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Error Alert Banner */}
            {errorMessage && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs font-semibold animate-fade-in">
                <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="feedback-input" className="block text-xs font-semibold text-ink/80">
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
                className="w-full px-4 py-3 rounded-lg bg-paper border border-line text-base sm:text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all resize-none disabled:opacity-50"
              />
              <div className="flex justify-between items-center text-xs sm:text-[10px] font-mono text-muted px-1">
                <span>Min {minChars} characters</span>
                <span className={charCount > maxChars ? 'text-danger font-bold' : ''}>
                  {charCount} / {maxChars}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-lg border border-ink hover:bg-ink/5 text-ink text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValidLength || isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-dark hover:bg-accent-dark/90 disabled:bg-line text-paper disabled:text-muted text-xs font-bold transition-all disabled:cursor-not-allowed"
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
