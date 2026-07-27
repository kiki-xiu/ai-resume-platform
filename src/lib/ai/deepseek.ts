const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface DeepSeekConfig {
  temperature?: number
  max_tokens?: number
  model?: string
}

export async function chatCompletion(
  messages: ChatMessage[],
  config: DeepSeekConfig = {}
) {
  const {
    temperature = 0.7,
    max_tokens = 2048,
    model = 'deepseek-chat',
  } = config

  const res = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DeepSeek API error: ${res.status} ${err}`)
  }

  const data = await res.json()
  return data.choices[0].message.content as string
}

/** 简历解析专用：解析简历文本为结构化经历数据 */
export async function parseResume(resumeText: string) {
  const systemPrompt = `你是一个专业的简历解析助手。请从以下简历文本中提取结构化信息，返回JSON格式。
提取字段包括：name, phone, email, education(数组,含school,major,degree,startDate,endDate),
workExperience(数组,含company,position,startDate,endDate,description,achievements,skills),
skills(数组), certifications(数组,含name,issuer,date)

注意：只返回JSON，不要包含markdown代码块标记。未找到的字段用null。`

  const content = await chatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: resumeText },
  ], { temperature: 0.1, max_tokens: 4096 })

  try {
    return JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, ''))
  } catch {
    return { raw: content }
  }
}

/** 生成AI分身回应（面试官对话） */
export async function generateAvatarResponse(
  userExperiences: string,
  userSkills: string[],
  messageHistory: { role: 'user' | 'assistant'; content: string }[],
  newQuestion: string,
  visibilityFilter: string[] = []
) {
  const systemPrompt = `你是一个求职者的AI分身。你的任务是基于用户提供的经历数据回答面试官的问题。

## 核心规则：
1. 只回答与用户经历相关的问题
2. 不编造用户未提供的信息（如果问到未涉及的领域，回答"该用户未提供此信息"）
3. 拒绝回答无关/敏感问题（个人隐私、政治、宗教等）
4. 每条回答最后标注信息来源：
   - 🟢 经认证信息（来自认证资料）
   - 🟡 用户自述（来自用户自行填写的内容）
   - ⚠️ AI推断（基于已有信息的合理推断）

## 用户经历数据：
${userExperiences}

## 用户技能：
${userSkills?.join(', ') || '未提供'}

## 隐藏信息（不要在回答中提及以下内容）：
${visibilityFilter.length > 0 ? visibilityFilter.join(', ') : '无'}

请用专业、简洁的中文回答。`

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messageHistory.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: newQuestion },
  ]

  return chatCompletion(messages, { temperature: 0.6, max_tokens: 1024 })
}

/** 生成对话摘要 */
export async function generateConversationSummary(messages: { role: string; content: string }[]) {
  const conversationText = messages
    .map(m => `${m.role === 'visitor' ? '面试官' : '候选人'}: ${m.content}`)
    .join('\n')

  const systemPrompt = `你是一个对话分析助手。请分析以下面试官与AI分身的对话，生成结构化摘要。

返回JSON格式：
{
  "core_skills": ["技能1", "技能2", ...],  // 3-5个核心能力标签
  "project_highlights": ["亮点1", "亮点2", ...],  // 2-3个项目亮点
  "source_stats": {"certified": 0, "self_reported": 0, "ai_inferred": 0},  // 信息来源统计
  "summary_text": "完整摘要文本（200字以内）"
}

注意：只返回JSON，不要包含markdown代码块标记。`

  const content = await chatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: conversationText },
  ], { temperature: 0.3, max_tokens: 2048 })

  try {
    return JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, ''))
  } catch {
    return { summary_text: content }
  }
}

/** AI审核：检测用户信息中的风险 */
export async function aiReviewContent(userData: string) {
  const systemPrompt = `你是一个AI审核助手。请审核以下用户信息，检测是否存在以下问题：
1. 明显虚假或矛盾的信息
2. 夸大或无法验证的成就
3. 涉嫌违规的内容（代写简历、虚假学历等）
4. 信息不一致（日期矛盾、逻辑冲突等）

返回JSON格式：
{
  "result": "pass" | "flag" | "fail",
  "risk_level": "low" | "medium" | "high",
  "items": [
    {
      "field": "问题字段",
      "issue": "问题描述",
      "severity": "low" | "medium" | "high"
    }
  ]
}

- pass: 无明显问题
- flag: 存在可疑项，需要人工复核
- fail: 存在严重问题，直接驳回

注意：只返回JSON，不要包含markdown代码块标记。`

  const content = await chatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userData },
  ], { temperature: 0.1, max_tokens: 2048 })

  try {
    return JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, ''))
  } catch {
    return { result: 'pass', risk_level: 'low', items: [] }
  }
}
