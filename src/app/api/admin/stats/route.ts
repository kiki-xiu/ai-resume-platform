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

    const [users, verified, avatars, cards, codes, conversations] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('identity_verified', true),
      supabase.from('ai_avatars').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('cards').select('*', { count: 'exact', head: true }),
      supabase.from('access_codes').select('*', { count: 'exact', head: true }),
      supabase.from('conversations').select('*', { count: 'exact', head: true }),
    ])

    return Response.json({
      success: true,
      stats: {
        totalUsers: users.count || 0,
        verifiedUsers: verified.count || 0,
        aiAvatars: avatars.count || 0,
        cards: cards.count || 0,
        accessCodes: codes.count || 0,
        conversations: conversations.count || 0,
      },
    })
  } catch {
    return Response.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
