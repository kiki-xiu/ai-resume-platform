import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return Response.json({ success: false, error: '请输入账号和密码' }, { status: 400 })
    }

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

    const { data: admin } = await supabase
      .from('admin_users')
      .select('*, admin_roles(*)')
      .eq('username', username)
      .single()

    if (!admin) {
      return Response.json({ success: false, error: '账号或密码错误' }, { status: 401 })
    }

    // Simple password verification for MVP (production should use bcrypt)
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex')
    const storedHash = admin.password_hash

    // For MVP, accept: if stored hash is placeholder, allow default password
    const isValid = passwordHash === storedHash ||
                    (storedHash?.includes('PLACEHOLDER') && password === 'admin123')

    if (!isValid) {
      return Response.json({ success: false, error: '账号或密码错误' }, { status: 401 })
    }

    await supabase.from('admin_users').update({ last_login_at: new Date().toISOString() }).eq('id', admin.id)

    return Response.json({ success: true, admin: { id: admin.id, username: admin.username, role: admin.admin_roles?.name } })
  } catch {
    return Response.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
