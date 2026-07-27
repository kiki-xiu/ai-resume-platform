import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function phoneToEmail(phone: string) {
  return `${phone.replace(/\D/g, '')}@resume.ai`
}

export async function POST(request: Request) {
  try {
    const { phone, password, name } = await request.json()

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

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { phone, name: name || '' } },
    })

    if (authError) {
      if (authError.message.includes('already')) {
        return Response.json({ success: false, error: '该手机号已注册，请直接登录' }, { status: 409 })
      }
      return Response.json({ success: false, error: authError.message }, { status: 400 })
    }

    const authUserId = authData.user?.id
    if (authUserId) {
      // Wait briefly for Supabase to settle, then create users table record
      await new Promise(r => setTimeout(r, 500))

      // Check if user already exists in our table
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone)
        .single()

      if (!existing) {
        await supabase.from('users').insert({
          phone,
          phone_verified: false,
          name: name || null,
          status: 'active',
        })
      }
    }

    // Get the user record
    const { data: userRecord } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()

    return Response.json({
      success: true,
      user: userRecord || { phone, name: name || null },
    })
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}
