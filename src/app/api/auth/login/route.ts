import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function phoneToEmail(phone: string) {
  return `${phone.replace(/\D/g, '')}@resume.ai`
}

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json()

    if (!phone || !password) {
      return Response.json({ success: false, error: '手机号和密码不能为空' }, { status: 400 })
    }

    const email = phoneToEmail(phone)
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

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      if (signInError.message.includes('Invalid login')) {
        return Response.json({ success: false, error: '手机号或密码错误' }, { status: 401 })
      }
      return Response.json({ success: false, error: signInError.message }, { status: 401 })
    }

    // Fetch user record
    const { data: userRecord } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()

    return Response.json({
      success: true,
      user: userRecord || { phone },
    })
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}
