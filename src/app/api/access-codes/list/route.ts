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

    const { data: codes } = await supabase
      .from('access_codes')
      .select('*')
      .eq('user_id', userRecord.id)
      .order('created_at', { ascending: false })

    return Response.json({ success: true, codes: codes || [] })
  } catch {
    return Response.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
