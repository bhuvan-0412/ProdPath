import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Logo } from './Logo';
import { FeedbackLink } from './FeedbackLink';

// Server component: only the feedback button runs in the browser
export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-line bg-surface py-10 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
          {/* Brand & Feedback Column */}
          <div className="space-y-3">
            <Logo size={26} showWordmark />
            <p className="text-xs text-muted leading-relaxed max-w-xs">
              Free 6-week product management path.
            </p>
            <FeedbackLink />
          </div>

          {/* Contact Section */}
          <div className="space-y-2.5 sm:justify-self-end sm:text-right">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">
              Contact
            </h3>
            <ul className="space-y-2 text-xs text-muted">
              <li>
                <a
                  href="mailto:thotabhuvan@gmail.com"
                  className="inline-flex items-center gap-2 min-h-10 sm:min-h-0 hover:text-accent-dark transition-colors group"
                >
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hover:underline">thotabhuvan@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-line pt-6 flex flex-col sm:flex-row items-center sm:justify-between gap-2 text-xs text-muted">
          <span>&copy; {new Date().getFullYear()} ProdPath. All rights reserved.</span>
          <Link href="/privacy" className="font-semibold text-accent-dark hover:underline py-2 sm:py-0">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
};
