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
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      }
    )

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return Response.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const phone = authUser.user_metadata?.phone || ''

    const { data: userRecord } = await supabase
      .from('users')
      .select('*, cards(*), ai_avatars(*), experiences(count)')
      .eq('phone', phone)
      .single()

    return Response.json({
      success: true,
      user: userRecord,
    })
  } catch {
    return Response.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
