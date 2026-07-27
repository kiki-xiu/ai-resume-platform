import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import crypto from 'crypto'

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

    const body = await request.json()

    // Check if card exists
    const { data: existing } = await supabase.from('cards').select('id').eq('user_id', userRecord.id).single()

    if (existing) {
      await supabase.from('cards').update({
        template_id: body.template_id,
        title: body.title,
        position: body.position,
        company: body.company,
        contact_email: body.contact_email,
        contact_phone: body.contact_phone,
      }).eq('id', existing.id)
    } else {
      const cardId = crypto.randomBytes(6).toString('base64url')
      await supabase.from('cards').insert({
        user_id: userRecord.id,
        card_id: cardId,
        template_id: body.template_id,
        title: body.title,
        position: body.position,
        company: body.company,
        contact_email: body.contact_email,
        contact_phone: body.contact_phone,
        status: 'draft',
      })
    }

    return Response.json({ success: true })
  } catch {
    return Response.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}

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

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return Response.json({ success: false, error: '未登录' }, { status: 401 })

    const phone = authUser.user_metadata?.phone || ''
    const { data: userRecord } = await supabase.from('users').select('id').eq('phone', phone).single()
    if (!userRecord) return Response.json({ success: false, error: '用户不存在' }, { status: 404 })

    const { data: card } = await supabase.from('cards').select('*').eq('user_id', userRecord.id).single()

    return Response.json({ success: true, card })
  } catch {
    return Response.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
