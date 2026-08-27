/** 切到历史 Tab 时是否跳过拦截（手动放行后的二次 switchTab） */
let skipGuard = false
let installed = false

export const NEED_RESET_SETUP_KEY = 'needResetSetup'

type GuardHandler = () => boolean

let handler: GuardHandler | null = null

export function setHistoryTabGuard(fn: GuardHandler | null) {
  handler = fn
}

export function navigateToHistoryTab() {
  skipGuard = true
  uni.switchTab({
    url: '/pages/history/index',
    complete() {
      skipGuard = false
    },
  })
}

function isHistoryTabUrl(url: string) {
  return url.includes('pages/history/index')
}

export function installHistoryTabGuard() {
  if (installed) return
  installed = true
  uni.addInterceptor('switchTab', {
    invoke(args: { url?: string }) {
      if (skipGuard) return
      const url = String(args?.url ?? '')
      if (!isHistoryTabUrl(url)) return
      if (!handler) return
      const allow = handler()
      if (allow === false) return false
    },
  })
}
