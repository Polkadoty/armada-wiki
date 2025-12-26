# Supabase Setup

This directory contains SQL migrations for the Armada Wiki database.

## Prerequisites

1. Create a Supabase project at https://supabase.com
2. Copy your project URL and anon key to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Running Migrations

### Option 1: Supabase CLI (Recommended)

1. Install Supabase CLI: `npm install -g supabase`
2. Link your project: `supabase link --project-ref your-project-ref`
3. Run migrations: `supabase db push`

### Option 2: Manual via SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste each migration file in order:
   - `001_create_bug_reports.sql`
   - `002_create_comments.sql`
4. Execute each migration

## Database Schema

### bug_reports
Stores user-submitted bug reports with the following fields:
- `id`: UUID primary key
- `title`: Bug title
- `description`: Detailed description
- `steps_to_reproduce`: Steps to reproduce the bug
- `expected_behavior`: What should happen
- `actual_behavior`: What actually happens
- `page_url`: URL where bug occurred
- `contact_email`: Optional contact email
- `status`: open | in_progress | resolved | closed
- `created_at`, `updated_at`: Timestamps

### comments
Stores comments on cards (ships, squadrons, upgrades, objectives):
- `id`: UUID primary key
- `card_type`: ship | squadron | upgrade | objective
- `card_id`: ID of the card
- `author_name`: Commenter's name
- `author_email`: Optional email
- `content`: Comment text
- `parent_id`: For nested replies (optional)
- `upvotes`, `downvotes`: Vote counts
- `is_pinned`: Moderator pin flag
- `is_moderated`: Hide inappropriate comments
- `moderation_reason`: Reason for moderation
- `created_at`, `updated_at`: Timestamps

## Row Level Security (RLS)

Both tables have RLS enabled:
- **Public users** can INSERT and SELECT (read)
- **Service role** (admin) can UPDATE and DELETE
- Comments marked as `is_moderated=true` are hidden from public
