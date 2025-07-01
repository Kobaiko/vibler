# Vibler Setup Guide

## Environment Variables Configuration

To complete the setup of your Vibler project, you need to configure the following environment variables:

### 1. Create `.env.local` file

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration (Required for AI-powered Edge Functions)
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Service Role Key (for Edge Functions)
# Get this from your Supabase project settings > API
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 2. Get Required API Keys

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Replace `your_openai_api_key_here` with your actual key

#### Supabase Service Role Key
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `vibler`
3. Go to Settings > API
4. Copy the `service_role` key (not the anon key)
5. Replace `your_service_role_key_here` with your actual key

### 3. Edge Functions Status

✅ **All Edge Functions Deployed Successfully:**

1. **generate-funnel** - Full funnel generation with GPT-4o
2. **generate-icp** - Standalone ICP generation  
3. **store-funnel** - Database storage (✅ Tested)
4. **get-funnel** - Retrieval by ID/user (✅ Tested)
5. **update-funnel** - PUT/PATCH updates

### 4. Database Schema

✅ **Database table `funnels` is properly configured with:**
- UUID primary key
- All required columns (snake_case in DB, camelCase in API)
- Proper JSONB fields for complex data

### 5. Testing

Once you've added the API keys, you can test the full functionality:

```bash
node test-edge-functions.js
```

This will test all Edge Functions including the AI-powered ones.

### 6. Next Steps

After setting up the environment variables:

1. Test the AI-powered functions (generate-funnel, generate-icp)
2. Integrate the Edge Functions into your Next.js frontend
3. Build the user interface for funnel creation and management
4. Implement authentication and user management

## Task 4.2 Status: ✅ COMPLETE

All Supabase Edge Functions have been successfully:
- ✅ Created with proper TypeScript interfaces
- ✅ Deployed to Supabase
- ✅ Database schema fixed and tested
- ✅ CORS handling implemented
- ✅ Error management added
- ✅ Column mapping (camelCase ↔ snake_case) working

**Ready for frontend integration!** 