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

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return Response.json({ success: false, error: '未登录' }, { status: 401 })

    const phone = authUser.user_metadata?.phone || ''
    const { data: userRecord } = await supabase.from('users').select('id').eq('phone', phone).single()
    if (!userRecord) return Response.json({ success: false, error: '用户不存在' }, { status: 404 })

    const { data: experiences } = await supabase
      .from('experiences')
      .select('*')
      .eq('user_id', userRecord.id)
      .order('start_date', { ascending: false })

    return Response.json({ success: true, experiences: experiences || [] })
  } catch {
    return Response.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}

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

    const { data, error } = await supabase.from('experiences').insert({
      user_id: userRecord.id,
      type: body.type,
      organization: body.organization,
      role: body.role,
      start_date: body.start_date,
      end_date: body.end_date || null,
      description: body.description || null,
      achievements: body.achievements || null,
      skills: body.skills || [],
      visibility: body.visibility || 'public',
      source: 'manual',
    }).select().single()

    if (error) return Response.json({ success: false, error: error.message }, { status: 400 })
    return Response.json({ success: true, experience: data })
  } catch {
    return Response.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
