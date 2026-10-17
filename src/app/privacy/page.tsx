import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { NoteCard } from '@/components/landing/Illustrations';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'What ProdPath collects, why, and how to have it deleted. A short, plain-language summary.',
};

const LAST_UPDATED = '17 October 2026';
const CONTACT = 'thotabhuvan@gmail.com';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="pt-8 mt-8 border-t border-line first:border-t-0 first:pt-0 first:mt-0">
    <h2 className="text-xl sm:text-2xl font-display font-semibold text-ink">{title}</h2>
    <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink/85">{children}</div>
  </section>
);

const List: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ul className="space-y-2.5 pl-5 list-disc marker:text-accent">{children}</ul>
);

const Mail = () => (
  <a href={`mailto:${CONTACT}`} className="font-semibold text-accent-dark underline decoration-accent/40 underline-offset-2 hover:decoration-accent">
    {CONTACT}
  </a>
);

// Every statement here is based on what the code does (sign-in callback, ProgressContext, the feedback
// and admin email routes, the Supabase schema and the root layout). Update it when any of those change.
export default function PrivacyPage() {
  return (
    <div className="animate-fade-in relative max-w-2xl mx-auto py-6 sm:py-10">
      <NoteCard className="hidden lg:block absolute -right-40 top-8 w-24" />

      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Privacy</p>
      <h1 className="mt-3 text-4xl sm:text-5xl font-display font-semibold tracking-tight text-ink">
        Your data on ProdPath
      </h1>
      <p className="mt-4 text-muted">Last updated: {LAST_UPDATED}</p>
      <p className="mt-6 text-[15px] leading-relaxed text-ink/85">
        ProdPath is a free learning site run by one person, Bhuvan. It keeps only what it needs to save your
        progress. Here is all of it, in plain words.
      </p>

      <div className="mt-10 rounded-card border border-line bg-surface p-6 sm:p-8">
        <Section title="What we collect">
          <List>
            <li>
              <strong className="text-ink">Your Google account basics.</strong> When you sign in with Google, our
              sign-in provider (Supabase) receives your name, email address and profile picture. ProdPath saves your
              name and email in your profile, with the date you joined.
            </li>
            <li>
              <strong className="text-ink">Your progress.</strong> Which lessons, case studies and sessions you tick
              off, and the date and time you ticked each one.
            </li>
            <li>
              <strong className="text-ink">Resources you add.</strong> The title, link, type, week and note of any
              resource you add yourself.
            </li>
            <li>
              <strong className="text-ink">Your notes.</strong> Any notes you write on a resource with the pencil
              button.
            </li>
            <li>
              <strong className="text-ink">Your email choice.</strong> Whether you said yes or no to occasional email
              updates.
            </li>
            <li>
              <strong className="text-ink">Feedback you send.</strong> Your message is emailed to the site owner
              together with your name and email address, so the owner can reply. It is not saved in the ProdPath database.
            </li>
          </List>
          <p>A few small things also happen in your browser:</p>
          <List>
            <li>Sign-in cookies from Supabase keep you signed in.</li>
            <li>Your light or dark theme choice is saved in your own browser only. It is never sent to us.</li>
            <li>
              Vercel Analytics counts visits to pages (for example which pages are viewed, and the kind of device and
              country they come from). It shows totals, not who you are, and according to Vercel it does not use
              cookies.
            </li>
          </List>
        </Section>

        <Section title="Why we collect it">
          <List>
            <li>To save your progress, notes and added resources so they follow you across devices.</li>
            <li>To send your feedback to the site owner.</li>
            <li>To send occasional updates, only to people who said yes.</li>
          </List>
          <p>
            The site owner&apos;s admin page shows the list of people who have signed up (name, email, join date and email
            choice) and how many items each person has completed. It does not show your notes or the resources you
            added, though as the owner of the database the site owner can technically access everything stored in it.
          </p>
        </Section>

        <Section title="Who provides the services">
          <List>
            <li>
              <strong className="text-ink">Supabase</strong>: Google sign-in and the database that stores your
              account and progress.
            </li>
            <li>
              <strong className="text-ink">Resend</strong>: sends the feedback emails and the opt-in updates.
            </li>
            <li>
              <strong className="text-ink">Vercel</strong>: hosts the website, and runs Vercel Analytics.
            </li>
          </List>
          <p>We do not sell your data, and there are no ads on ProdPath.</p>
        </Section>

        <Section title="Stopping emails or deleting your account">
          <p>
            To stop update emails, or to have your account and everything linked to it deleted, email <Mail />. You can
            also delete your own notes and added resources at any time from the course page, and reset your progress
            from the dashboard.
          </p>
        </Section>
      </div>

      <p className="mt-8 text-sm text-muted">This is a plain-language summary, not legal advice.</p>
      <p className="mt-6">
        <Link href="/" className="text-sm font-semibold text-accent-dark hover:underline">
          &larr; Back to ProdPath
        </Link>
      </p>
    </div>
  );
}
