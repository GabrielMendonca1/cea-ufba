import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile to check if they are a professor
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile || userProfile.user_type !== 'professor') {
      return NextResponse.json(
        { error: 'Only professors can create posts' },
        { status: 403 }
      )
    }

    // Parse request body
    const { title, description, content_markdown } = await request.json()

    if (!title || !description || !content_markdown) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, content_markdown' },
        { status: 400 }
      )
    }

    // Create the post first
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert([
        {
          content_markdown
        }
      ])
      .select()
      .single()

    if (postError) {
      console.error('Error creating post:', postError)
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      )
    }

    // Create the scientific outreach entry
    const { data: outreachData, error: outreachError } = await supabase
      .from('scientific_outreach')
      .insert([
        {
          professor_id: user.id,
          post_id: postData.id,
          title,
          description
        }
      ])
      .select()
      .single()

    if (outreachError) {
      console.error('Error creating scientific outreach:', outreachError)
      
      // If scientific outreach creation fails, delete the post
      await supabase.from('posts').delete().eq('id', postData.id)
      
      return NextResponse.json(
        { error: 'Failed to create scientific outreach entry' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      post: postData,
      outreach: outreachData
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 