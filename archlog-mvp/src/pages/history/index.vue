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
      <view class="w-12"></view>
    </view>

    <!-- 列表视图 -->
    <template v-if="viewMode === 'list'">
      <scroll-view scroll-y class="box-border min-h-0 flex-1">
        <view class="box-border p-4 pb-8">
          <view
            v-if="practicesList.length === 0"
            class="flex flex-col items-center justify-center py-24 text-gray-500"
          >
            <text class="text-base">暂无练习记录</text>
          </view>

          <view v-else>
            <view
              v-for="item in practicesList"
              :key="item.id"
              class="mb-3 rounded-lg bg-white p-4 shadow"
              @tap="openDetail(item.id)"
            >
              <text class="block text-base font-semibold text-gray-900">
                {{ item.bow_type }} · {{ item.distance }} · {{ item.target_paper }}
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
              {{ practice.bow_type }} · {{ practice.distance }} · {{ practice.target_paper }}
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
                    <td class="border-b border-gray-200 px-3 py-2">{{ arrow.score }}</td>
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
