# CGPA CUMULATIVE TRACKER

A real, working GPA/CGPA calculator and academic record tracker built with
Next.js (App Router), TypeScript, Tailwind CSS, and Supabase (Auth +
PostgreSQL with Row Level Security).

- Nigerian 5-point grading scale (A–F)
- 100L–700L, First/Second Semester (14 semesters)
- CGPA is always `Total Quality Points ÷ Total Credit Units` across every
  saved course — never an average of semester GPAs
- Real Supabase authentication and persistence — sign out, come back later,
  everything is still there
- PDF academic report, JSON export/import
- Works as a guest (entries kept on-device) until you sign up, then your
  guest entries are copied into your new account automatically

## 1. Create a Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, paste the contents of `supabase/schema.sql` and run it.
   This creates the `profiles`, `semesters`, and `courses` tables, enables
   Row Level Security so a user can only ever see their own records, and
   sets up the triggers that auto-create a profile on signup and
   auto-compute `grade_point` / `quality_point` server-side.
3. In **Authentication → Providers**, Email/Password is enabled by default —
   nothing else to configure to get started. (Optional: turn off "Confirm
   email" under **Authentication → Settings** while developing, so signups
   log you in immediately instead of waiting on a confirmation email.)
4. In **Project Settings → API**, copy the **Project URL** and **anon
   public** key.

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Install and run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — the tracker itself is the homepage, no landing
page in front of it.

## 4. Run the calculation engine tests

```bash
npm test
```

Covers grade points, quality points, semester GPA, and — most importantly —
that CGPA is computed from total credit-weighted quality points and never by
averaging semester GPAs.

## 5. Deploy

The app is ready for Vercel:

```bash
npm i -g vercel
vercel
```

Add the same two `NEXT_PUBLIC_SUPABASE_*` environment variables in the
Vercel project settings, then also add your deployed URL to Supabase under
**Authentication → URL Configuration → Redirect URLs** (needed for the
password-reset email link, e.g. `https://your-app.vercel.app/auth/callback`).

## Project structure

```
src/
  app/
    page.tsx              Main dashboard (the whole app after auth pages)
    login/                /login
    signup/               /signup
    forgot-password/      /forgot-password
    reset-password/       Completes the forgot-password email flow
    auth/callback/        Exchanges Supabase email links for a session
  components/              UI building blocks (header, cards, modal, table…)
  hooks/useAcademicData.ts  All data access — Supabase when signed in,
                            localStorage when browsing as a guest
  lib/
    calculations.ts        Pure calculation engine (grade point → CGPA →
                            classification → progress), unit tested
    supabase/               Browser + server Supabase clients
    pdf.ts                  Academic report PDF generation
    importExport.ts         JSON export + validated import
supabase/schema.sql         Tables, RLS policies, and triggers
```

## Design notes / where this improves on a literal reading of the brief

- **Grade point and quality point are computed by a Postgres trigger**, not
  trusted from the client, so results can't be tampered with even if someone
  calls the API directly.
- **"Save & PDF" doesn't need to do a bulk save** — every add/edit/delete is
  already written straight to Supabase as it happens, so nothing is ever
  sitting unsaved. The button confirms this and generates the report.
- **Guest entries auto-migrate on sign-in**, rather than requiring a manual
  "import my guest data" step, so nothing typed before creating an account
  is ever lost.
