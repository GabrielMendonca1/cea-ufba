import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { postId, title, description, content_json } = await request.json()

    if (!postId || !title || !description || !content_json) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user is authenticated and is the owner
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
    
    // 1. Update the scientific_outreach entry (title, description)
    const { error: outreachError } = await supabase
      .from('scientific_outreach')
      .update({ title, description, updated_at: new Date().toISOString() })
      .eq('id', postId)

    if (outreachError) {
      console.error('Error updating scientific outreach:', outreachError)
      return NextResponse.json({ error: 'Failed to update scientific outreach entry' }, { status: 500 })
    }

    // 2. Update the actual post entry (content)
    const { error: postError } = await supabase
      .from('posts')
      .update({ content: content_json, updated_at: new Date().toISOString() })
      .eq('id', outreach.post_id)

    if (postError) {
      console.error('Error updating post:', postError)
      return NextResponse.json({ error: 'Failed to update post entry' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Post updated successfully' })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 