import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { cardId, code } = await request.json()

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

    // Verify access code
    const { data: accessCode } = await supabase
      .from('access_codes')
      .select('*, cards!inner(card_id, user_id)')
      .eq('code', code)
      .eq('card_id', cardId)
      .single()

    if (!accessCode) {
      return Response.json({ success: false, error: '访问码无效' }, { status: 400 })
    }

    if (accessCode.status !== 'active') {
      const msg = accessCode.status === 'expired' ? '访问码已过期' :
                  accessCode.status === 'exhausted' ? '访问次数已用尽' : '访问码已被撤销'
      return Response.json({ success: false, error: msg }, { status: 400 })
    }

    if (new Date(accessCode.expires_at) < new Date()) {
      await supabase.from('access_codes').update({ status: 'expired' }).eq('id', accessCode.id)
      return Response.json({ success: false, error: '访问码已过期' }, { status: 400 })
    }

    // Increment usage
    await supabase.from('access_codes').update({
      current_uses: (accessCode.current_uses || 0) + 1,
    }).eq('id', accessCode.id)

    // Check if exhausted
    if (accessCode.max_uses && (accessCode.current_uses || 0) + 1 >= accessCode.max_uses) {
      await supabase.from('access_codes').update({ status: 'exhausted' }).eq('id', accessCode.id)
    }

    // Log access
    await supabase.from('access_logs').insert({
      access_code_id: accessCode.id,
      visitor_ip: request.headers.get('x-forwarded-for') || '',
    })

    return Response.json({ success: true, accessCodeId: accessCode.id, userId: accessCode.cards.user_id })
  } catch {
    return Response.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
