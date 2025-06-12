# Supabase Setup for Vibler

This directory contains the database schema and configuration for the Vibler application.

## Database Schema

The database is designed to support the core Vibler features:

### Core Tables

1. **users** - Extended user profiles (linked to Supabase auth.users)
2. **teams** - Organizations/workspaces for collaboration
3. **team_members** - Team membership with role-based access
4. **icps** - Ideal Customer Personas
5. **strategies** - Marketing strategies linked to ICPs
6. **funnels** - Marketing funnels with stages and metadata
7. **creative_assets** - Ad copy, images, videos, and other creative content
8. **analytics** - KPI tracking and performance metrics
9. **subscriptions** - Stripe billing integration

### Security

- **Row Level Security (RLS)** is enabled on all tables
- **Policies** ensure users can only access data for teams they belong to
- **Automatic user profile creation** when users sign up
- **Role-based permissions** (admin, member, viewer)

## Setup Instructions

### 1. Run the Migration

Execute the SQL migration in your Supabase dashboard:

```sql
-- Copy and paste the contents of migrations/001_initial_schema.sql
-- into the Supabase SQL Editor and run it
```

### 2. Configure Authentication

In your Supabase dashboard:

1. Go to **Authentication > Settings**
2. Enable **Email confirmation** if desired
3. Configure **OAuth providers** (Google, GitHub, etc.)
4. Set up **Magic Links** if needed

### 3. Configure Storage (Optional)

For file uploads (creative assets):

1. Go to **Storage** in Supabase dashboard
2. Create a bucket named `creative-assets`
3. Set appropriate policies for file access

### 4. Environment Variables

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Database Relationships

```
auth.users
    ↓
public.users
    ↓
teams ← team_members → users
    ↓
icps → strategies → funnels
    ↓         ↓         ↓
creative_assets   analytics
    ↓
subscriptions
```

## Type Safety

TypeScript types are automatically generated and available in:
- `src/types/database.ts` - Main database types
- `src/lib/supabase.ts` - Typed Supabase client

## Future Enhancements

- **Real-time subscriptions** for collaborative editing
- **File upload policies** for creative assets
- **Analytics aggregation** for dashboard views
- **Audit logging** for compliance 