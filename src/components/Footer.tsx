'use client';

import React from 'react';
import { Compass, MessageSquare, Mail, Phone, ExternalLink } from 'lucide-react';
import { useProgress } from '@/context/ProgressContext';

export const Footer: React.FC = () => {
  const { openFeedbackModal } = useProgress();

  return (
    <footer className="w-full border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/40 dark:bg-[#0a0a0f]/40 py-10 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 items-start">
          {/* Brand & Feedback Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-xs">
                <Compass className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">ProdPath</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
              Personal AI + Product Management learning hub and progress tracker.
            </p>
            <button
              onClick={openFeedbackModal}
              className="hover:underline text-violet-600 dark:text-violet-400 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Send Feedback</span>
            </button>
          </div>

          {/* Get in Touch Contact Section */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Get in Touch
            </h3>
            <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <li>
                <a
                  href="mailto:thotabhuvan@gmail.com"
                  className="inline-flex items-center gap-2 hover:text-violet-600 dark:hover:text-violet-300 transition-colors group"
                >
                  <Mail className="w-3.5 h-3.5 text-violet-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="hover:underline">thotabhuvan@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+918341237836"
                  className="inline-flex items-center gap-2 hover:text-violet-600 dark:hover:text-violet-300 transition-colors group"
                >
                  <Phone className="w-3.5 h-3.5 text-violet-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="hover:underline">+91 83412 37836</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Curriculum Credit & Attribution */}
          <div className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400 md:text-right">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Reference
            </h3>
            <p className="leading-relaxed">
              Curriculum resources curated with reference to{' '}
              <a
                href="https://product-matters.ecelliitg.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-violet-600 dark:text-violet-400 font-semibold inline-flex items-center gap-1"
              >
                <span>Product Matters by E-Cell IIT Guwahati</span>
                <ExternalLink className="w-3 h-3 inline" />
              </a>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-200/60 dark:border-zinc-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-zinc-400">
          <span>&copy; {new Date().getFullYear()} ProdPath. All rights reserved.</span>
          <span>Built for Product Managers</span>
        </div>
      </div>
    </footer>
  );
};
