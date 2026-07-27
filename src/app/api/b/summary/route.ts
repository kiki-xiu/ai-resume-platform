import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { generateConversationSummary } from '@/lib/ai/deepseek'

export async function POST(request: Request) {
  try {
    const { conversationId } = await request.json()

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

    const { data: messages } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (!messages || messages.length === 0) {
      return Response.json({ success: false, error: '暂无对话记录' }, { status: 400 })
    }

    const summaryData = await generateConversationSummary(messages)

    // Save summary
    await supabase.from('conversation_summaries').insert({
      conversation_id: conversationId,
      core_skills: summaryData.core_skills || [],
      project_highlights: summaryData.project_highlights || [],
      source_stats: summaryData.source_stats || {},
      summary_text: summaryData.summary_text || '',
    })

    // End conversation
    await supabase.from('conversations').update({
      ended_at: new Date().toISOString(),
    }).eq('id', conversationId)

    return Response.json({ success: true, summary: summaryData })
  } catch {
    return Response.json({ success: false, error: '生成摘要失败' }, { status: 500 })
  }
}
