
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const {
    research_opportunity_id,
    cover_letter_pdf,
    cv_vitae_pdf,
    academic_record_pdf,
  } = await req.json()

  if (
    !research_opportunity_id ||
    !cover_letter_pdf ||
    !cv_vitae_pdf ||
    !academic_record_pdf
  ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('applications')
    .insert([
      {
        research_opportunity_id,
        cover_letter_pdf,
        cv_vitae_pdf,
        academic_record_pdf,
        student_id: user.id,
      },
    ])
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
