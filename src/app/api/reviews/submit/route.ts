import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { aiReviewContent } from '@/lib/ai/deepseek'

export async function POST() {
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

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return Response.json({ success: false, error: '未登录' }, { status: 401 })

    const phone = authUser.user_metadata?.phone || ''
    const { data: userRecord } = await supabase.from('users').select('id, name').eq('phone', phone).single()
    if (!userRecord) return Response.json({ success: false, error: '用户不存在' }, { status: 404 })

    // Get user data for review
    const { data: experiences } = await supabase
      .from('experiences').select('*').eq('user_id', userRecord.id)

    const { data: card } = await supabase
      .from('cards').select('*').eq('user_id', userRecord.id).single()

    // Check existing avatar
    const { data: existingAvatar } = await supabase
      .from('ai_avatars').select('id, status').eq('user_id', userRecord.id).single()

    if (existingAvatar && existingAvatar.status === 'reviewing') {
      return Response.json({ success: false, error: '已有审核中的分身，请等待审核完成' }, { status: 400 })
    }

    // Create or update avatar status
    let avatarId = existingAvatar?.id
    if (!avatarId) {
      const { data: avatar } = await supabase.from('ai_avatars').insert({
        user_id: userRecord.id,
        status: 'reviewing',
        personality_style: 'professional',
        training_version: 1,
      }).select().single()
      avatarId = avatar?.id
    } else {
      await supabase.from('ai_avatars').update({ status: 'reviewing' }).eq('id', avatarId)
    }

    // AI review
    const reviewData = JSON.stringify({
      name: userRecord.name,
      experiences: experiences || [],
      card: card || {},
    })

    const reviewResult = await aiReviewContent(reviewData)

    await supabase.from('ai_reviews').insert({
      user_id: userRecord.id,
      avatar_id: avatarId,
      review_type: 'initial',
      ai_result: reviewResult.result || 'pass',
      risk_level: reviewResult.risk_level || 'low',
      risk_details: { items: reviewResult.items || [] },
      status: reviewResult.result === 'fail' ? 'rejected' : reviewResult.result === 'flag' ? 'pending' : 'approved',
      manual_review_status: reviewResult.result === 'flag' ? 'pending' : null,
    })

    // Auto-approve if pass
    if (reviewResult.result === 'pass') {
      await supabase.from('ai_avatars').update({ status: 'approved' }).eq('id', avatarId)
    }

    return Response.json({
      success: true,
      result: reviewResult.result,
      risk_level: reviewResult.risk_level,
      items: reviewResult.items || [],
    })
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}
