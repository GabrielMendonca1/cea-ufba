import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    // Check if user is authenticated and is the owner of the post
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: outreach, error: fetchError } = await supabase
      .from('scientific_outreach')
      .select('post_id, professor_id')
      .eq('id', postId)
      .single()

    if (fetchError || !outreach) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (outreach.professor_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // 1. Delete the scientific_outreach entry first due to foreign key constraints
    const { error: outreachError } = await supabase
      .from('scientific_outreach')
      .delete()
      .eq('id', postId)

    if (outreachError) {
      console.error('Error deleting scientific outreach:', outreachError)
      return NextResponse.json({ error: 'Failed to delete scientific outreach entry' }, { status: 500 })
    }

    // 2. Delete the actual post entry
    const { error: postError } = await supabase
      .from('posts')
      .delete()
      .eq('id', outreach.post_id)

    if (postError) {
      console.error('Error deleting post:', postError)
      // Note: At this point, the outreach is deleted but the post is not. This may require manual cleanup.
      return NextResponse.json({ error: 'Failed to delete post entry' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Post deleted successfully' })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 