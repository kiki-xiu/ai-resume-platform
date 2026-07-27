import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
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
    const { data: userRecord } = await supabase.from('users').select('id').eq('phone', phone).single()
    if (!userRecord) return Response.json({ success: false, error: '用户不存在' }, { status: 404 })

    const { data: card } = await supabase.from('cards').select('card_id').eq('user_id', userRecord.id).single()
    if (!card) return Response.json({ success: false, error: '请先创建名片' }, { status: 400 })

    const { ttlHours = 168, maxUses = 10 } = await request.json()
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + ttlHours * 3600000).toISOString()

    const { data, error } = await supabase.from('access_codes').insert({
      user_id: userRecord.id,
      code,
      card_id: card.card_id,
      max_uses: maxUses,
      expires_at: expiresAt,
      status: 'active',
    }).select().single()

    if (error) return Response.json({ success: false, error: error.message }, { status: 400 })
    return Response.json({ success: true, code: data })
  } catch {
    return Response.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
