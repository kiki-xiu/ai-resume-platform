import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cs) { cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
        },
      }
    )

    const { data: reviews } = await supabase
      .from('ai_reviews')
      .select('*, users(name, phone)')
      .order('created_at', { ascending: false })
      .limit(50)

    return Response.json({ success: true, reviews: reviews || [] })
  } catch {
    return Response.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status, comment } = await request.json()

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cs) { cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
        },
      }
    )

    // Update review
    await supabase.from('ai_reviews').update({
      manual_review_status: status,
      manual_review_comment: comment,
      manual_reviewed_at: new Date().toISOString(),
      status: status,
    }).eq('id', id)

    // Get review to find avatar
    const { data: review } = await supabase.from('ai_reviews').select('avatar_id').eq('id', id).single()

    if (review) {
      await supabase.from('ai_avatars').update({
        status: status === 'approved' ? 'approved' : 'rejected',
      }).eq('id', review.avatar_id)
    }

    return Response.json({ success: true })
  } catch {
    return Response.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
