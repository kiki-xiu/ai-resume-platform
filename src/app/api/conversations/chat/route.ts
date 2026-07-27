import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { generateAvatarResponse, generateConversationSummary } from '@/lib/ai/deepseek'

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

    const { conversationId, message, accessCodeId, userId } = await request.json()

    if (!message) {
      return Response.json({ success: false, error: '消息不能为空' }, { status: 400 })
    }

    // Get user experiences for AI context
    const { data: experiences } = await supabase
      .from('experiences')
      .select('*')
      .eq('user_id', userId)
      .eq('visibility', 'public')
      .order('start_date', { ascending: false })

    // Build experience summary for AI
    const expSummary = (experiences || []).map((e: any) =>
      `[${e.type === 'work' ? '工作' : '教育'}] ${e.organization} - ${e.role} (${e.start_date}~${e.end_date || '至今'}): ${e.description || ''} 成果: ${e.achievements || ''} 技能: ${(e.skills || []).join(', ')}`
    ).join('\n')

    const allSkills = [...new Set((experiences || []).flatMap((e: any) => e.skills || []))]

    // Get or create conversation
    let convId = conversationId
    if (!convId) {
      const { data: conv } = await supabase.from('conversations').insert({
        access_code_id: accessCodeId,
        user_id: userId,
        message_count: 0,
      }).select().single()
      convId = conv?.id
      if (!convId) return Response.json({ success: false, error: '创建对话失败' }, { status: 500 })
    }

    // Get message history
    const { data: prevMessages } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })

    const history = (prevMessages || []).map(m => ({
      role: m.role === 'visitor' ? 'user' as const : 'assistant' as const,
      content: m.content,
    }))

    // Save visitor message
    await supabase.from('conversation_messages').insert({
      conversation_id: convId,
      role: 'visitor',
      content: message,
    })

    // Generate AI response
    const aiResponse = await generateAvatarResponse(
      expSummary,
      allSkills,
      history,
      message
    )

    // Determine source tag
    const sourceTag = aiResponse.includes('🟢') ? 'certified'
      : aiResponse.includes('⚠️') ? 'ai_inferred'
      : 'self_reported'

    // Save AI response
    await supabase.from('conversation_messages').insert({
      conversation_id: convId,
      role: 'ai_avatar',
      content: aiResponse,
      source_tag: sourceTag,
    })

    // Update message count
    await supabase.from('conversations')
      .update({ message_count: (prevMessages?.length || 0) + 2 })
      .eq('id', convId)

    return Response.json({ success: true, response: aiResponse, conversationId: convId })
  } catch (err: any) {
    return Response.json({ success: false, error: err.message || 'AI服务暂时不可用' }, { status: 500 })
  }
}
