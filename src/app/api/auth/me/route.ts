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

    if (phone) {
      const { data: userRecord } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single()

      if (userRecord) {
        return Response.json({ success: true, user: userRecord })
      }
    }

    // Return basic info if no user record yet
    return Response.json({
      success: true,
      user: {
        phone,
        name: authUser.user_metadata?.name || null,
        email: authUser.email,
      },
    })
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}
