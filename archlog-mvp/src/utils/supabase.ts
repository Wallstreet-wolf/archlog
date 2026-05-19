import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

let cachedUserId: string | null = null

supabase.auth.onAuthStateChange((_event, session) => {
  cachedUserId = session?.user?.id ?? null
})

export const ensureAnonymousLogin = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) console.error('匿名登录失败:', error.message)
    else cachedUserId = data.session?.user?.id ?? null
  } else {
    cachedUserId = session.user.id
  }
}

/** 读取当前匿名用户 ID（依赖 ensureAnonymousLogin 已建立会话） */
export const getCurrentUserId = () => cachedUserId
