import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { cardId } = await request.json()

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

    const { data: card } = await supabase
      .from('cards')
      .select('*, users!inner(name, avatar_url, identity_verified)')
      .eq('card_id', cardId)
      .single()

    if (!card) return Response.json({ success: false, error: '名片不存在' }, { status: 404 })

    // Get public experiences
    const { data: experiences } = await supabase
      .from('experiences')
      .select('*')
      .eq('user_id', card.user_id)
      .eq('visibility', 'public')
      .order('start_date', { ascending: false })

    // Get public achievements
    const { data: achievements } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', card.user_id)
      .eq('visibility', 'public')

    return Response.json({
      success: true,
      profile: {
        user: card.users,
        card: {
          card_id: card.card_id,
          title: card.title,
          position: card.position,
          company: card.company,
        },
        experiences: experiences || [],
        achievements: achievements || [],
      },
    })
  } catch {
    return Response.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
