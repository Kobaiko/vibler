import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { creative, userId } = body;

    if (!creative) {
      return NextResponse.json({ error: 'Creative data is required' }, { status: 400 });
    }

    // Save creative to database
    const { data, error } = await supabase
      .from('creatives')
      .insert([{
        platform: creative.platform,
        headline: creative.headline,
        description: creative.description,
        call_to_action: creative.call_to_action,
        tone: creative.tone,
        target_audience: creative.target_audience,
        product_service: creative.product_service,
        image_url: creative.image_url,
        conversion_score: creative.conversion_score,
        user_id: userId || null,
        composition: creative.composition || null,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save creative' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      creative: data,
      message: 'Creative saved successfully' 
    });

  } catch (error) {
    console.error('Error saving creative:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    let query = supabase
      .from('creatives')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch creatives' }, { status: 500 });
    }

    return NextResponse.json({ creatives: data || [] });

  } catch (error) {
    console.error('Error fetching creatives:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
