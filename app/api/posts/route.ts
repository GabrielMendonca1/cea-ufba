import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit
    
    // Fetch scientific outreach posts with pagination
    const { data: posts, error } = await supabase
      .from('scientific_outreach')
      .select(`
        id,
        title,
        description,
        created_at,
        updated_at,
        professor_id,
        user_profiles:professor_id (
          full_name,
          email,
          department,
          research_area,
          avatar_url
        ),
        posts:post_id (
          id,
          content_markdown,
          created_at,
          updated_at
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      posts: posts || [],
      page,
      limit,
      hasMore: (posts || []).length === limit
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 