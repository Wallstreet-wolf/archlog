<template>
  <view class="box-border flex min-h-screen flex-col bg-gray-50">
    <view class="flex items-center justify-between bg-gray-50 px-4 pb-2 pt-12">
      <view class="text-base text-blue-600" @tap="handleGoBack">＜ 返回</view>
      <text class="text-base font-medium">计分中</text>
      <view class="w-12"></view>
    </view>

    <view class="box-border flex min-h-0 flex-1 flex-col p-4">
    <!-- 顶部状态栏 -->
    <view class="mb-4 shrink-0 space-y-1">
      <text class="block text-center text-base font-medium text-gray-900">
        第 {{ currentEnd }} 组 / 第 {{ currentArrow }} 支
      </text>
      <text class="block text-center text-sm text-gray-600">
        本组总计: {{ currentEndTotal }} 环
      </text>
    </view>

    <!-- 录入操作区卡片 -->
    <view
      v-if="isDbReady"
      class="mb-4 box-border flex flex-col items-center justify-center gap-8 rounded-lg bg-white p-4 shadow"
    >
      <!-- 九宫格 3x3 -->
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

      <!-- 环值数字键盘 -->
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

      <!-- 确认主按钮 -->
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

    <!-- 当前组成绩表格区卡片 -->
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
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { ensureAnonymousLogin, supabase } from '../../utils/supabase'

type ArrowEntry = { position: string; score: number; ring?: string }

type CompletedEnd = { endNumber: number; arrows: ArrowEntry[]; total: number }

/** 来自练习配置页，供后续扩展使用 */
const bowType = ref('')
const targetPaper = ref('')
const distance = ref('')

const currentEnd = ref(1)
const currentArrow = ref(1)
const maxArrows = ref(0)
const selectedPosition = ref('')
const selectedScore = ref('')
const currentEndScores = ref<ArrowEntry[]>([])

/** 每组完成时追加，供「结束练习」时一次性打印 */
const practiceData = ref<CompletedEnd[]>([])

/** 本次练习累计总环数（已确认录入的箭） */
const totalScore = ref(0)

/** 当前练习在数据库 practices 表中的 ID */
const practiceId = ref('')

/** practices 建档成功后才允许录入 */
const isDbReady = ref(false)

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

onLoad((options = {}) => {
  if (options.bowType) bowType.value = options.bowType
  if (options.targetPaper) targetPaper.value = options.targetPaper
  if (options.distance) distance.value = options.distance
  maxArrows.value = Number(options.arrowsPerEnd)

  void (async () => {
    await ensureAnonymousLogin()
    const { data, error } = await supabase
      .from('practices')
      .insert({
        bow_type: bowType.value,
        target_paper: targetPaper.value,
        distance: distance.value,
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
  })()
})

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

async function finishAndExit() {
  if (!practiceId.value) {
    uni.navigateBack()
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
  uni.navigateBack()
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
  })
  if (error) {
    uni.showToast({ title: '同步箭支失败', icon: 'none' })
    console.error(error)
    return
  }
  currentEndScores.value.push({
    position: selectedPosition.value,
    score,
    ...(ring === 'X' ? { ring: 'X' } : {}),
  })
  totalScore.value += score
  selectedPosition.value = ''
  selectedScore.value = ''
  currentArrow.value += 1
  if (currentArrow.value > maxArrows.value) {
    handleEndEnd()
  }
}

function handleGoBack() {
  if (currentEndScores.value.length === 0 && currentArrow.value === 1) {
    void finishAndExit()
    return
  }
  uni.showModal({
    title: '提示',
    content: `当前已完成 ${currentEnd.value - 1} 组，总计 ${totalScore.value} 环。是否保存成绩并退出？`,
    confirmText: '保存并退出',
    cancelText: '取消',
    success(res) {
      if (res.confirm) {
        void finishAndExit()
      }
    },
  })
}

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
        currentEnd.value += 1
        selectedPosition.value = ''
        selectedScore.value = ''
      } else {
        void finishAndExit()
      }
    },
  })
}
</script>
