<template>
  <view class="box-border flex min-h-screen flex-col bg-gray-50">
    <!-- 顶部导航栏 -->
    <view
      class="box-border shrink-0 border-b border-gray-200 bg-white"
      :style="{ paddingTop: statusBarPx + 'px' }"
    >
      <view class="relative box-border flex h-12 items-center px-4">
        <view
          v-if="viewMode === 'scoring'"
          class="active:opacity-70"
          @tap="handleScoringBack"
        >
          <text class="text-base text-gray-700">＜ 返回</text>
        </view>
        <view v-else class="w-12"></view>
        <view
          class="pointer-events-none absolute inset-x-0 flex items-center justify-center"
        >
          <text class="text-lg font-semibold text-gray-900">{{
            viewMode === 'config' ? '练习配置' : '计分中'
          }}</text>
        </view>
      </view>
    </view>

    <!-- 配置视图 -->
    <template v-if="viewMode === 'config'">
      <scroll-view scroll-y class="box-border min-h-0 flex-1">
        <view class="box-border w-full max-w-full p-4 pb-44">
          <view class="space-y-4 rounded-xl bg-white p-4 shadow-sm">
            <!-- 弓种 -->
            <view class="space-y-3">
              <text class="text-sm font-medium text-gray-800">弓种</text>
              <view class="flex w-full flex-nowrap gap-2">
                <view
                  v-for="opt in bowOptions"
                  :key="opt.id"
                  class="min-h-[44px] flex-1 shrink-0 rounded-lg px-3 py-2.5 text-center text-sm font-medium active:opacity-90"
                  :class="
                    bowType === opt.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700'
                  "
                  @tap="bowType = opt.id"
                >
                  {{ opt.label }}
                </view>
              </view>
            </view>

            <!-- 靶纸种类 -->
            <view class="space-y-3">
              <text class="text-sm font-medium text-gray-800">靶纸种类</text>
              <view
                class="-mx-1 flex w-full max-w-full flex-nowrap gap-2 overflow-x-auto px-1 py-0.5"
              >
                <view
                  v-for="opt in targetPaperOptions"
                  :key="opt.id"
                  class="min-h-[44px] shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium active:opacity-90"
                  :class="
                    targetPaper === opt.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700'
                  "
                  @tap="targetPaper = opt.id"
                >
                  {{ opt.label }}
                </view>
              </view>
            </view>

            <!-- 距离 -->
            <view class="space-y-3">
              <text class="text-sm font-medium text-gray-800">距离</text>
              <view
                class="-mx-1 flex w-full max-w-full flex-nowrap gap-2 overflow-x-auto px-1 py-0.5"
              >
                <view
                  v-for="opt in distanceOptions"
                  :key="opt.id"
                  class="min-h-[44px] shrink-0 rounded-lg px-5 py-2.5 text-sm font-medium active:opacity-90"
                  :class="
                    distance === opt.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700'
                  "
                  @tap="distance = opt.id"
                >
                  {{ opt.label }}
                </view>
              </view>
            </view>

            <!-- 每组箭数 -->
            <view class="space-y-3">
              <text class="text-sm font-medium text-gray-800">每组箭数</text>
              <view class="flex w-full flex-nowrap gap-2">
                <view
                  v-for="opt in arrowsPerEndOptions"
                  :key="opt.id"
                  class="min-h-[44px] flex-1 shrink-0 rounded-lg px-3 py-2.5 text-center text-sm font-medium active:opacity-90"
                  :class="
                    arrowsPerEnd === opt.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700'
                  "
                  @tap="arrowsPerEnd = opt.id"
                >
                  {{ opt.label }}
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <view
        class="fixed bottom-0 left-0 right-0 z-10 box-border w-full max-w-full border-t border-gray-200 bg-gray-50 px-4 pt-3"
        style="padding-bottom: calc(env(safe-area-inset-bottom) + 50px)"
      >
        <view
          class="box-border flex min-h-[48px] w-full items-center justify-center rounded-xl bg-blue-600 py-3.5 text-base font-semibold text-white shadow-sm active:bg-blue-700"
          @tap="handleStartPractice"
        >
          开始练习
        </view>
      </view>
    </template>

    <!-- 计分视图 -->
    <view v-else class="box-border flex min-h-0 flex-1 flex-col overflow-hidden">
      <view class="box-border flex min-h-0 flex-1 flex-col p-4">
        <!-- 顶部状态栏 -->
        <view class="mb-4 shrink-0 space-y-1">
          <text
            v-if="currentEndCompleted"
            class="block text-center text-base font-medium text-gray-900"
          >
            第 {{ currentEnd }} 组 已完成
          </text>
          <text
            v-else
            class="block text-center text-base font-medium text-gray-900"
          >
            第 {{ currentEnd }} 组 / 第 {{ currentArrow }} 支
          </text>
          <text class="block text-center text-sm text-gray-600">
            本组总计: {{ currentEndTotal }} 环
          </text>
        </view>

        <view
          v-if="isDbReady"
          class="mb-4 box-border flex flex-col items-center justify-center gap-8 rounded-lg bg-white p-4 shadow"
        >
          <view class="grid w-full max-w-[280px] grid-cols-3 gap-2">
            <view
              v-for="pos in positionLabels"
              :key="pos"
              class="flex h-20 w-20 items-center justify-center self-center rounded-lg text-center text-sm"
              :class="positionBtnClass(pos)"
              @tap="togglePosition(pos)"
            >
              <text>{{ pos }}</text>
            </view>
          </view>

          <view class="w-full max-w-[320px] space-y-2">
            <text class="mb-1 block text-center text-sm text-gray-700">环值输入</text>
            <view class="flex w-full flex-col gap-2">
              <view class="flex w-full flex-row gap-2">
                <view
                  v-for="key in scoreKeysRow1"
                  :key="key"
                  class="box-border flex h-11 min-w-0 flex-1 basis-0 items-center justify-center rounded-lg text-sm font-medium"
                  :class="scoreBtnClass(key)"
                  @tap="toggleScore(key)"
                >
                  <text>{{ key }}</text>
                </view>
              </view>
              <view class="flex w-full flex-row gap-2">
                <view
                  v-for="key in scoreKeysRow2"
                  :key="key"
                  class="box-border flex h-11 min-w-0 flex-1 basis-0 items-center justify-center rounded-lg text-sm font-medium"
                  :class="scoreBtnClass(key)"
                  @tap="toggleScore(key)"
                >
                  <text>{{ key }}</text>
                </view>
              </view>
              <view class="flex flex-row justify-center gap-2">
                <view
                  v-for="key in scoreKeysBottom"
                  :key="key"
                  class="box-border flex h-11 w-[calc((100%-2rem)/5)] items-center justify-center rounded-lg text-sm font-medium"
                  :class="scoreBtnClass(key)"
                  @tap="toggleScore(key)"
                >
                  <text>{{ key }}</text>
                </view>
              </view>
            </view>
          </view>

          <view
            class="w-full max-w-[320px] rounded-lg bg-blue-600 py-3 text-center text-base font-semibold text-white shadow-sm active:opacity-90"
            @tap="handleAddArrow"
          >
            <text>确认录入本支箭</text>
          </view>
        </view>
        <view
          v-else
          class="mb-4 box-border flex flex-col items-center justify-center rounded-lg bg-white p-8 shadow"
        >
          <text class="text-center text-sm text-gray-600">网络异常，无法开始录入</text>
        </view>

        <view class="box-border min-h-0 flex-1 rounded-lg bg-white p-4 shadow">
          <view class="overflow-hidden rounded-md border border-gray-200">
            <table class="w-full border-collapse text-left text-sm text-gray-800">
              <thead class="sticky top-0 z-10 bg-gray-50">
                <tr class="border-b border-gray-200">
                  <th class="border-r border-gray-200 px-3 py-2.5 font-semibold text-gray-900">
                    箭序
                  </th>
                  <th class="border-r border-gray-200 px-3 py-2.5 font-semibold text-gray-900">
                    位置
                  </th>
                  <th class="px-3 py-2.5 font-semibold text-gray-900">环值</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in currentEndScores"
                  :key="index"
                  class="border-b border-gray-100"
                  :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'"
                >
                  <td class="border-r border-gray-200 px-3 py-2.5">{{ index + 1 }}</td>
                  <td class="border-r border-gray-200 px-3 py-2.5">{{ item.position }}</td>
                  <td class="px-3 py-2.5">{{ item.ring ?? item.score }}</td>
                </tr>
              </tbody>
            </table>
          </view>
        </view>
      </view>
    </view>

    <!-- 退出弹窗：根节点末尾，避免被计分区 overflow 裁剪 -->
    <view
      v-if="showQuitModal"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
    >
      <view class="w-4/5 rounded-lg bg-white p-6">
        <text class="mb-2 block text-lg font-semibold text-gray-900">提示</text>
        <text class="mb-6 block text-base text-gray-700">
          当前已完成 {{ currentEnd - 1 }} 组，总计 {{ totalScore }} 环。是否保存成绩并退出？
        </text>
        <view class="flex justify-end space-x-3">
          <view class="rounded bg-gray-200 px-4 py-2 text-gray-700" @tap="showQuitModal = false">
            取消
          </view>
          <view class="rounded bg-blue-600 px-4 py-2 text-white" @tap="handleConfirmQuit">
            保存并退出
          </view>
        </view>
      </view>
    </view>

    <!-- 切到历史 Tab：已录入箭支时拦截 -->
    <view
      v-if="showLeaveTabModal"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
    >
      <view class="w-4/5 rounded-lg bg-white p-6">
        <text class="mb-2 block text-lg font-semibold text-gray-900">提示</text>
        <text class="mb-6 block text-base text-gray-700">
          当前已录入 {{ getRecordedArrowCount() }} 支箭，总分为 {{ totalScore }}
        </text>
        <view class="flex justify-end space-x-3">
          <view
            class="rounded bg-gray-200 px-4 py-2 text-gray-700"
            :class="isPersistingLeave ? 'opacity-50' : ''"
            @tap="handleLeaveTabQuit"
          >
            不练了
          </view>
          <view
            class="rounded bg-blue-600 px-4 py-2 text-white"
            :class="isPersistingLeave ? 'opacity-50' : ''"
            @tap="handleLeaveTabContinueLater"
          >
            稍后继续练
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onHide, onLoad, onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import {
  NEED_RESET_SETUP_KEY,
  installHistoryTabGuard,
  navigateToHistoryTab,
  setHistoryTabGuard,
} from '../../utils/historyTabGuard'
import { ensureAnonymousLogin, supabase } from '../../utils/supabase'

onLoad(() => {
  installHistoryTabGuard()
  setHistoryTabGuard(() => {
    if (viewMode.value !== 'scoring') return true
    void handleSwitchTabToHistory()
    return false
  })
  void ensureAnonymousLogin()
})

onShow(() => {
  const flag = uni.getStorageSync(NEED_RESET_SETUP_KEY)
  if (flag === true || flag === 'true' || flag === 1) {
    uni.removeStorageSync(NEED_RESET_SETUP_KEY)
    resetScoringSession()
    viewMode.value = 'config'
    showLeaveTabModal.value = false
    showQuitModal.value = false
  }
})

const sys = uni.getSystemInfoSync()
const statusBarPx = ref(sys.statusBarHeight ?? 24)

const viewMode = ref<'config' | 'scoring'>('config')

type ScoringRouteParams = {
  bowType: string
  targetPaper: string
  distance: string
  arrowsPerEnd: string
}

const scoringOptions = ref<Partial<ScoringRouteParams>>({})

const bowOptions = [
  { id: 'recurve', label: '反曲弓' },
  { id: 'compound', label: '复合弓' },
  { id: 'traditional', label: '传统弓' },
  { id: 'barebow', label: '光弓' },
] as const

const targetPaperOptions = [
  { id: '80-half', label: '80半环' },
  { id: '40-full', label: '40全环' },
  { id: 'triple', label: '三联靶' },
  { id: '60-full', label: '60全环' },
  { id: '80-full', label: '80全环' },
  { id: '122-full', label: '122全环' },
] as const

const distanceOptions = [
  { id: '8', label: '8m' },
  { id: '10', label: '10m' },
  { id: '18', label: '18m' },
  { id: '25', label: '25m' },
  { id: '30', label: '30m' },
  { id: '40', label: '40m' },
  { id: '50', label: '50m' },
  { id: '60', label: '60m' },
  { id: '70', label: '70m' },
  { id: '90', label: '90m' },
] as const

const arrowsPerEndOptions = [
  { id: '3', label: '3支' },
  { id: '6', label: '6支' },
  { id: '12', label: '12支' },
] as const

const bowType = ref<(typeof bowOptions)[number]['id']>('recurve')
const targetPaper = ref<(typeof targetPaperOptions)[number]['id']>('80-half')
const distance = ref<(typeof distanceOptions)[number]['id']>('18')
const arrowsPerEnd = ref<(typeof arrowsPerEndOptions)[number]['id']>('6')

type ArrowEntry = { position: string; score: number; ring: string }
type CompletedEnd = { endNumber: number; arrows: ArrowEntry[]; total: number }

const scoringBowType = ref('')
const scoringTargetPaper = ref('')
const scoringDistance = ref('')

const currentEnd = ref(1)
const currentArrow = ref(1)
const currentEndCompleted = ref(false)
const maxArrows = ref(0)
const selectedPosition = ref('')
const selectedScore = ref('')
const currentEndScores = ref<ArrowEntry[]>([])

const practiceData = ref<CompletedEnd[]>([])
const totalScore = ref(0)
const practiceId = ref('')
const isDbReady = ref(false)
const showQuitModal = ref(false)
const showLeaveTabModal = ref(false)
const isPersistingLeave = ref(false)

const positionLabels = [
  '左上',
  '正上',
  '右上',
  '正左',
  '靶心',
  '正右',
  '左下',
  '正下',
  '右下',
] as const

const scoreKeysRow1 = ['0', '1', '2', '3', '4']
const scoreKeysRow2 = ['5', '6', '7', '8', '9']
const scoreKeys0to9 = [...scoreKeysRow1, ...scoreKeysRow2]
const scoreKeysBottom = ['10', 'X']

const BULLSEYE = '靶心'

function isLowRingScore(score: string) {
  return scoreKeys0to9.includes(score)
}

function positionBtnClass(pos: string) {
  if (selectedPosition.value === pos) {
    return 'bg-blue-600 text-white shadow-sm'
  }
  if (pos === BULLSEYE && isLowRingScore(selectedScore.value)) {
    return 'bg-gray-300 text-gray-500 opacity-50'
  }
  return 'bg-gray-100 text-gray-800'
}

function scoreBtnClass(key: string) {
  if (selectedScore.value === key) {
    return 'bg-blue-600 text-white shadow-sm'
  }
  if (scoreKeys0to9.includes(key) && selectedPosition.value === BULLSEYE) {
    return 'bg-gray-300 text-gray-500 opacity-50'
  }
  return 'bg-gray-100 text-gray-800'
}

/** X 环计分等同 10 环 */
function ringToPoints(ring: string) {
  return ring === 'X' ? 10 : Number(ring)
}

const currentEndTotal = computed(() =>
  currentEndScores.value.reduce((sum, item) => sum + item.score, 0),
)

function resetScoringSession() {
  scoringBowType.value = ''
  scoringTargetPaper.value = ''
  scoringDistance.value = ''
  currentEnd.value = 1
  currentArrow.value = 1
  currentEndCompleted.value = false
  maxArrows.value = 0
  selectedPosition.value = ''
  selectedScore.value = ''
  currentEndScores.value = []
  practiceData.value = []
  totalScore.value = 0
  practiceId.value = ''
  isDbReady.value = false
}

function exitScoringToConfig() {
  resetScoringSession()
  viewMode.value = 'config'
}

async function bootScoringFromOptions() {
  await ensureAnonymousLogin()
  const opts = scoringOptions.value as ScoringRouteParams
  scoringBowType.value = opts.bowType ?? ''
  scoringTargetPaper.value = opts.targetPaper ?? ''
  scoringDistance.value = opts.distance ?? ''
  maxArrows.value = Number(opts.arrowsPerEnd)

  const { data, error } = await supabase
    .from('practices')
    .insert({
      bow_type: scoringBowType.value,
      target_paper: scoringTargetPaper.value,
      distance: scoringDistance.value,
      arrows_per_end: maxArrows.value,
      total_score: 0,
    })
    .select()
  if (error) {
    uni.showToast({ title: '建档失败，请返回重试', icon: 'none' })
    console.error('建档失败详情:', JSON.stringify(error))
    return
  }
  const row = Array.isArray(data) ? data[0] : data
  if (row?.id == null) {
    uni.showToast({ title: '建档失败，请返回重试', icon: 'none' })
    return
  }
  practiceId.value = String(row.id)
  isDbReady.value = true
}

function handleStartPractice() {
  scoringOptions.value = {
    bowType: bowType.value,
    targetPaper: targetPaper.value,
    distance: distance.value,
    arrowsPerEnd: arrowsPerEnd.value,
  }
  resetScoringSession()
  viewMode.value = 'scoring'
  void bootScoringFromOptions()
}

function togglePosition(pos: string) {
  if (pos === BULLSEYE && isLowRingScore(selectedScore.value)) return
  selectedPosition.value = selectedPosition.value === pos ? '' : pos
}

function toggleScore(score: string) {
  if (scoreKeys0to9.includes(score) && selectedPosition.value === BULLSEYE) return
  selectedScore.value = selectedScore.value === score ? '' : score
}

function getRecordedArrowCount() {
  const fromCompleted = practiceData.value.reduce((sum, end) => sum + end.arrows.length, 0)
  return fromCompleted + currentEndScores.value.length
}

function collectLocalArrows() {
  const list: {
    practice_id: string
    end_index: number
    arrow_index: number
    position: string
    score: number
    ring: string
  }[] = []
  const pid = practiceId.value
  if (!pid) return list
  for (const end of practiceData.value) {
    end.arrows.forEach((arrow, i) => {
      list.push({
        practice_id: pid,
        end_index: end.endNumber,
        arrow_index: i,
        position: arrow.position,
        score: arrow.score,
        ring: arrow.ring,
      })
    })
  }
  currentEndScores.value.forEach((arrow, i) => {
    list.push({
      practice_id: pid,
      end_index: currentEnd.value,
      arrow_index: i,
      position: arrow.position,
      score: arrow.score,
      ring: arrow.ring,
    })
  })
  return list
}

async function savePractice() {
  if (!practiceId.value) return
  const { error } = await supabase
    .from('practices')
    .update({ total_score: totalScore.value })
    .eq('id', practiceId.value)
  if (error) {
    uni.showToast({ title: '保存总分失败', icon: 'none' })
    console.error(error)
  }
}

/** 补写未入库箭支，并更新 practices.total_score */
async function saveArrowsAndTotal(): Promise<boolean> {
  if (!practiceId.value) {
    uni.showToast({ title: '练习未就绪', icon: 'none' })
    return false
  }
  const local = collectLocalArrows()
  const { data: existing, error: fetchErr } = await supabase
    .from('arrows')
    .select('end_index,arrow_index')
    .eq('practice_id', practiceId.value)
  if (fetchErr) {
    uni.showToast({ title: '读取箭支失败', icon: 'none' })
    console.error(fetchErr)
    return false
  }
  const keys = new Set(
    (existing ?? []).map((row) => `${row.end_index}-${row.arrow_index}`),
  )
  const missing = local.filter((row) => !keys.has(`${row.end_index}-${row.arrow_index}`))
  if (missing.length > 0) {
    const { error: insertErr } = await supabase.from('arrows').insert(missing)
    if (insertErr) {
      uni.showToast({ title: '保存箭支失败', icon: 'none' })
      console.error(insertErr)
      return false
    }
  }
  const { error: updateErr } = await supabase
    .from('practices')
    .update({ total_score: totalScore.value })
    .eq('id', practiceId.value)
  if (updateErr) {
    uni.showToast({ title: '保存总分失败', icon: 'none' })
    console.error(updateErr)
    return false
  }
  return true
}

async function handleSwitchTabToHistory() {
  if (showLeaveTabModal.value || isPersistingLeave.value) return
  const count = getRecordedArrowCount()
  if (count === 0) {
    if (practiceId.value) {
      const { error } = await supabase.from('practices').delete().eq('id', practiceId.value)
      if (error) {
        uni.showToast({ title: '清理记录失败', icon: 'none' })
        console.error(error)
      }
    }
    exitScoringToConfig()
    navigateToHistoryTab()
    return
  }
  showQuitModal.value = false
  showLeaveTabModal.value = true
}

async function persistThenGoHistory(resetWhenBack: boolean) {
  if (isPersistingLeave.value) return
  isPersistingLeave.value = true
  const ok = await saveArrowsAndTotal()
  isPersistingLeave.value = false
  if (!ok) return
  showLeaveTabModal.value = false
  if (resetWhenBack) {
    uni.setStorageSync(NEED_RESET_SETUP_KEY, true)
  } else {
    uni.removeStorageSync(NEED_RESET_SETUP_KEY)
  }
  navigateToHistoryTab()
}

function handleLeaveTabContinueLater() {
  void persistThenGoHistory(false)
}

function handleLeaveTabQuit() {
  void persistThenGoHistory(true)
}

async function finishScoringAndExit() {
  if (!practiceId.value) {
    exitScoringToConfig()
    return
  }
  if (getRecordedArrowCount() === 0) {
    const { error } = await supabase.from('practices').delete().eq('id', practiceId.value)
    if (error) {
      uni.showToast({ title: '清理记录失败', icon: 'none' })
      console.error(error)
    }
  } else {
    await savePractice()
  }
  exitScoringToConfig()
}

async function handleAddArrow() {
  if (!selectedPosition.value || !selectedScore.value) {
    uni.showToast({ title: '请选择位置和环值', icon: 'none' })
    return
  }
  if (!practiceId.value) {
    uni.showToast({ title: '练习未就绪，请稍后重试', icon: 'none' })
    return
  }
  const ring = selectedScore.value
  const score = ringToPoints(ring)
  const { error } = await supabase.from('arrows').insert({
    practice_id: practiceId.value,
    end_index: currentEnd.value,
    arrow_index: currentArrow.value - 1,
    position: selectedPosition.value,
    score,
    ring,
  })
  if (error) {
    uni.showToast({ title: '同步箭支失败', icon: 'none' })
    console.error(error)
    return
  }
  currentEndScores.value.push({
    position: selectedPosition.value,
    score,
    ring,
  })
  totalScore.value += score
  selectedPosition.value = ''
  selectedScore.value = ''
  if (currentEndScores.value.length >= maxArrows.value) {
    currentEndCompleted.value = true
    handleEndEnd()
  } else {
    currentArrow.value += 1
  }
}

function handleScoringBack() {
  if (currentEndScores.value.length === 0 && currentArrow.value === 1) {
    void finishScoringAndExit()
    return
  }
  showQuitModal.value = true
}

function handleConfirmQuit() {
  showQuitModal.value = false
  void finishScoringAndExit()
}

onHide(() => {
  if (showQuitModal.value) {
    showQuitModal.value = false
  }
})

function handleEndEnd() {
  const total = currentEndScores.value.reduce((sum, item) => sum + item.score, 0)
  const endNum = currentEnd.value
  practiceData.value.push({
    endNumber: endNum,
    arrows: currentEndScores.value.map((a) => ({ ...a })),
    total,
  })
  uni.showModal({
    title: '提示',
    content: `第 ${endNum} 组完成！总计 ${total} 环`,
    confirmText: '继续下一组',
    cancelText: '结束练习',
    success(res) {
      if (res.confirm) {
        currentEndScores.value = []
        currentArrow.value = 1
        currentEndCompleted.value = false
        currentEnd.value += 1
        selectedPosition.value = ''
        selectedScore.value = ''
      } else {
        void finishScoringAndExit()
      }
    },
  })
}
</script>
