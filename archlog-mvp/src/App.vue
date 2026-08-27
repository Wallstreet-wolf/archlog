<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { installHistoryTabGuard } from './utils/historyTabGuard'

onLaunch(() => {
  installHistoryTabGuard()
})
</script>

<style></style>
