import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { id } = await request.json()
    if (!id) return Response.json({ success: false, error: '缺少ID' }, { status: 400 })

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

    const { error } = await supabase
      .from('access_codes')
      .update({ status: 'revoked' })
      .eq('id', id)

    if (error) return Response.json({ success: false, error: error.message }, { status: 400 })
    return Response.json({ success: true })
  } catch {
    return Response.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
