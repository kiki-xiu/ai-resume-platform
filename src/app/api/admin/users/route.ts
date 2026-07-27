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

    const { data: users } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    return Response.json({ success: true, users: users || [] })
  } catch {
    return Response.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json()

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

    const { error } = await supabase.from('users').update({ status }).eq('id', id)
    if (error) return Response.json({ success: false, error: error.message }, { status: 400 })

    return Response.json({ success: true })
  } catch {
    return Response.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
