<template>
  <view class="box-border flex h-screen flex-col overflow-hidden bg-gray-50">
    <view class="flex shrink-0 items-center justify-between bg-gray-50 px-4 pb-2 pt-12">
      <view
        v-if="viewMode === 'detail'"
        class="text-base text-blue-600"
        @tap="backToList"
      >
        ＜ 返回
      </view>
      <view v-else class="w-12"></view>
      <text class="text-base font-medium">{{
        viewMode === 'list' ? '练习记录' : '练习详情'
      }}</text>
      <view class="flex w-12 items-center justify-end">
        <view
          v-if="viewMode === 'list'"
          class="relative flex items-center justify-center active:opacity-70"
          @tap="isFilterPanelOpen = !isFilterPanelOpen"
        >
          <text class="text-sm text-blue-600">筛选</text>
          <view
            v-if="hasActiveFilter"
            class="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500"
          ></view>
        </view>
      </view>
    </view>

    <!-- 列表视图 -->
    <template v-if="viewMode === 'list'">
      <!-- 筛选面板 -->
      <view v-show="isFilterPanelOpen" class="box-border shrink-0 px-4 pb-3">
        <view class="mb-2 flex items-center justify-between">
          <text class="text-sm font-medium text-gray-800">筛选条件</text>
          <text
            v-if="hasActiveFilter"
            class="text-sm text-blue-600 active:opacity-70"
            @tap="clearFilters"
          >
            清除筛选
          </text>
        </view>

        <!-- 弓种 -->
        <view class="mb-3">
          <text class="mb-1.5 block text-xs font-medium text-gray-600">弓种</text>
          <view class="flex flex-wrap gap-2">
            <view
              v-for="opt in bowFilterOptions"
              :key="opt"
              class="min-h-[40px] shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-medium active:opacity-90"
              :class="
                selectedBowType === opt
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700'
              "
              @tap="selectedBowType = opt"
            >
              {{ opt === 'all' ? '全部' : bowTypeMap[opt] || opt }}
            </view>
          </view>
        </view>

        <!-- 距离 -->
        <view class="mb-3">
          <text class="mb-1.5 block text-xs font-medium text-gray-600">距离</text>
          <view class="flex flex-wrap gap-2">
            <view
              v-for="opt in distanceFilterOptions"
              :key="opt"
              class="min-h-[40px] shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-medium active:opacity-90"
              :class="
                selectedDistance === opt
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700'
              "
              @tap="selectedDistance = opt"
            >
              {{ opt === 'all' ? '全部' : opt }}
            </view>
          </view>
        </view>

        <!-- 靶纸 -->
        <view>
          <text class="mb-1.5 block text-xs font-medium text-gray-600">靶纸</text>
          <view class="flex flex-wrap gap-2">
            <view
              v-for="opt in targetPaperFilterOptions"
              :key="opt"
              class="min-h-[40px] shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-medium active:opacity-90"
              :class="
                selectedTargetPaper === opt
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700'
              "
              @tap="selectedTargetPaper = opt"
            >
              {{ opt === 'all' ? '全部' : targetPaperMap[opt] || opt }}
            </view>
          </view>
        </view>
      </view>

      <scroll-view scroll-y class="box-border min-h-0 flex-1">
        <view class="box-border p-4 pb-8">
          <view
            v-if="practicesList.length === 0"
            class="flex flex-col items-center justify-center py-24 text-gray-500"
          >
            <text class="text-base">暂无练习记录</text>
          </view>

          <view
            v-else-if="filteredPracticesList.length === 0"
            class="flex flex-col items-center justify-center py-24 text-gray-500"
          >
            <text class="text-base">暂无符合条件的记录</text>
            <view
              class="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white active:opacity-90"
              @tap="clearFilters"
            >
              清除筛选
            </view>
          </view>

          <view v-else>
            <view
              v-for="item in filteredPracticesList"
              :key="item.id"
              class="mb-3 rounded-lg bg-white p-4 shadow"
              @tap="openDetail(item.id)"
            >
              <text class="block text-base font-semibold text-gray-900">
                {{ bowTypeMap[item.bow_type] || item.bow_type }} · {{ item.distance }} ·
                {{ targetPaperMap[item.target_paper] || item.target_paper }}
              </text>
              <text class="mt-1 block text-sm text-gray-700">
                每组 {{ item.arrows_per_end }} 支
              </text>
              <text class="mt-2 block text-right text-lg font-medium text-blue-600">
                总计 {{ item.total_score }} 环
              </text>
              <text class="mt-1 block text-right text-xs text-gray-400">
                {{ formatCreatedAt(item.created_at) }}
              </text>
            </view>
          </view>
        </view>
      </scroll-view>
    </template>

    <!-- 详情视图 -->
    <scroll-view v-else scroll-y class="box-border min-h-0 flex-1">
      <view class="box-border p-4 pb-8">
        <view v-if="practice == null" class="py-16 text-center text-gray-500">
          <text class="text-base">加载中…</text>
        </view>

        <view v-else>
          <view class="mb-4 rounded-lg bg-white p-4 shadow">
            <text class="block text-base text-gray-900">
              {{ bowTypeMap[practice.bow_type] || practice.bow_type }} · {{ practice.distance }} ·
              {{ targetPaperMap[practice.target_paper] || practice.target_paper }}
            </text>
            <text class="mt-1 block text-sm text-gray-700">
              每组 {{ practice.arrows_per_end }} 支
            </text>
            <text class="mt-2 block text-sm text-gray-800">
              总计 {{ practice.total_score }} 环
            </text>
            <text class="mt-1 block text-sm text-gray-600">
              {{ formatCreatedAt(practice.created_at) }}
            </text>
          </view>

          <view
            v-for="group in groupedArrows"
            :key="group.endIndex"
            class="mb-3 rounded-lg bg-white p-4 shadow"
          >
            <text class="mb-2 block text-base font-semibold text-gray-900">
              第 {{ group.endIndex }} 组
            </text>
            <view class="overflow-hidden rounded-md border border-gray-200">
              <table class="w-full border-collapse text-left text-sm text-gray-800">
                <thead>
                  <tr class="border-b border-gray-200">
                    <th
                      class="border-r border-b border-gray-200 px-3 py-2 font-semibold text-gray-900"
                    >
                      箭序
                    </th>
                    <th
                      class="border-r border-b border-gray-200 px-3 py-2 font-semibold text-gray-900"
                    >
                      位置
                    </th>
                    <th class="border-b border-gray-200 px-3 py-2 font-semibold text-gray-900">
                      环值
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="arrow in group.arrows" :key="arrowKey(group.endIndex, arrow)">
                    <td class="border-r border-b border-gray-200 px-3 py-2">
                      {{ (arrow.arrow_index ?? 0) + 1 }}
                    </td>
                    <td class="border-r border-b border-gray-200 px-3 py-2">
                      {{ arrow.position }}
                    </td>
                    <td class="border-b border-gray-200 px-3 py-2">{{ arrow.ring ?? arrow.score }}</td>
                  </tr>
                </tbody>
              </table>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed, ref, watch } from 'vue'
import { bowTypeMap, targetPaperMap } from '../../utils/dict'
import { ensureAnonymousLogin, getCurrentUserId, supabase } from '../../utils/supabase'

type PracticeRow = {
  id: string
  bow_type: string
  distance: string
  target_paper: string
  arrows_per_end: number
  total_score: number
  created_at: string | null
}

const viewMode = ref<'list' | 'detail'>('list')
const currentPracticeId = ref('')

const practicesList = ref<PracticeRow[]>([])

const selectedBowType = ref<string>('all')
const selectedDistance = ref<string>('all')
const selectedTargetPaper = ref<string>('all')

const isFilterPanelOpen = ref(false)

const hasActiveFilter = computed(
  () =>
    selectedBowType.value !== 'all' ||
    selectedDistance.value !== 'all' ||
    selectedTargetPaper.value !== 'all',
)

const bowFilterOptions = computed(() => {
  const used = new Set(practicesList.value.map((p) => p.bow_type).filter((v) => v !== ''))
  return ['all', ...Object.keys(bowTypeMap).filter((key) => used.has(key))]
})

const distanceFilterOptions = computed(() => {
  const distances = practicesList.value
    .map((p) => p.distance)
    .filter((d) => d != null && d !== '')
  const unique = [...new Set(distances)].sort((a, b) => {
    const na = Number(a)
    const nb = Number(b)
    if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb
    return String(a).localeCompare(String(b))
  })
  return ['all', ...unique]
})

const targetPaperFilterOptions = computed(() => {
  const used = new Set(practicesList.value.map((p) => p.target_paper).filter((v) => v !== ''))
  return ['all', ...Object.keys(targetPaperMap).filter((key) => used.has(key))]
})

const filteredPracticesList = computed(() => {
  return practicesList.value.filter((item) => {
    const bowOk = selectedBowType.value === 'all' || item.bow_type === selectedBowType.value
    const distOk = selectedDistance.value === 'all' || item.distance === selectedDistance.value
    const paperOk =
      selectedTargetPaper.value === 'all' || item.target_paper === selectedTargetPaper.value
    return bowOk && distOk && paperOk
  })
})

function clearFilters() {
  selectedBowType.value = 'all'
  selectedDistance.value = 'all'
  selectedTargetPaper.value = 'all'
}

const practice = ref<any>(null)
const arrows = ref<any[]>([])

const groupedArrows = computed(() => {
  const byEnd = new Map<number, any[]>()
  for (const row of arrows.value) {
    const end = Number(row.end_index)
    const key = Number.isFinite(end) ? end : 0
    if (!byEnd.has(key)) byEnd.set(key, [])
    byEnd.get(key)!.push(row)
  }
  return [...byEnd.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([endIndex, list]) => ({
      endIndex,
      arrows: [...list].sort(
        (x, y) => Number(x.arrow_index ?? 0) - Number(y.arrow_index ?? 0),
      ),
    }))
})

onShow(() => {
  void (async () => {
    await ensureAnonymousLogin()
    const { data, error } = await supabase
      .from('practices')
      .select('*')
      .eq('user_id', getCurrentUserId())
      .order('created_at', { ascending: false })
    if (error) {
      console.error(error)
      practicesList.value = []
      return
    }
    practicesList.value = (data ?? []) as PracticeRow[]
  })()
})

watch(
  [viewMode, currentPracticeId],
  ([mode, id]) => {
    if (mode !== 'detail' || id === '') return

    practice.value = null
    arrows.value = []

    void (async () => {
      const { data: pRow, error: pErr } = await supabase
        .from('practices')
        .select('*')
        .eq('id', id)
        .single()
      if (pErr) {
        console.error(pErr)
        uni.showToast({ title: '加载练习失败', icon: 'none' })
        practice.value = null
        arrows.value = []
        return
      }
      practice.value = pRow

      const { data: aRows, error: aErr } = await supabase
        .from('arrows')
        .select('*')
        .eq('practice_id', id)
        .order('end_index', { ascending: true })
        .order('arrow_index', { ascending: true })
      if (aErr) {
        console.error(aErr)
        uni.showToast({ title: '加载箭支失败', icon: 'none' })
        arrows.value = []
        return
      }
      arrows.value = (aRows ?? []) as any[]
    })()
  },
)

function formatCreatedAt(iso: string | null | undefined): string {
  if (iso == null || iso === '') return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

function arrowKey(endIndex: number, arrow: any): string {
  const idx = arrow?.arrow_index ?? 0
  const id = arrow?.id
  return id != null ? String(id) : `${endIndex}-${idx}`
}

function openDetail(practiceId: string) {
  currentPracticeId.value = practiceId
  viewMode.value = 'detail'
}

function backToList() {
  viewMode.value = 'list'
  currentPracticeId.value = ''
}
</script>
