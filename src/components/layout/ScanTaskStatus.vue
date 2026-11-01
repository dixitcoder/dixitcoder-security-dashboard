<template>
  <section
    v-if="activeTask"
    class="scan-task-status"
    aria-live="polite"
    aria-atomic="true"
    aria-label="Scan progress"
  >
    <div class="scan-task-copy">
      <strong>
        <span class="scan-live-dot" :class="{ 'is-cancelling': activeTask.cancelling }" aria-hidden="true"></span>
        {{ activeTask.cancelling ? 'Cancelling scan…' : `${activeTask.tool} is running` }}
      </strong>
      <span>{{ activeTask.target || 'Waiting for results from the API' }} · {{ elapsed }}</span>
      <span v-if="activeTask.progress !== null">{{ activeTask.progress }}% completed</span>
      <span v-else>Waiting for the scanner to respond; progress is indeterminate.</span>
      <span>Cancel stops this browser request; backend cancellation depends on its disconnect handling.</span>
    </div>
    <div
      class="scan-task-track"
      :class="{ 'is-indeterminate': activeTask.progress === null }"
      role="progressbar"
      :aria-label="`${activeTask.tool} progress`"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="activeTask.progress ?? undefined"
    >
      <div
        v-if="activeTask.progress !== null"
        class="scan-task-fill"
        :style="{ width: `${activeTask.progress}%` }"
      />
    </div>
    <button
      type="button"
      class="scan-task-cancel"
      :disabled="activeTask.cancelling"
      @click="cancelActiveScan"
    >
      {{ activeTask.cancelling ? 'Cancelling…' : 'Cancel scan' }}
    </button>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cancelActiveScan, useScanTask } from '@/composables/useScanTask'

const { activeTask } = useScanTask()
const elapsed = computed(() => {
  const seconds = activeTask.value?.elapsedSeconds ?? 0
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} elapsed`
})
</script>

<style scoped>
.scan-task-status {
  position: fixed;
  z-index: 100000;
  right: 16px;
  bottom: 16px;
  display: grid;
  width: min(420px, calc(100vw - 32px));
  gap: 9px;
  padding: 14px;
  border: 1px solid rgb(6 182 212 / 35%);
  border-radius: 14px;
  color: #e2e8f0;
  background: #0f172a;
  box-shadow: 0 16px 40px rgb(15 23 42 / 30%);
}

.scan-task-copy {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.scan-task-copy strong {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f8fafc;
  font-size: 13px;
}

.scan-live-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 0 3px rgb(52 211 153 / 14%);
  animation: scan-status-pulse 1.8s ease-in-out infinite;
}

.scan-live-dot.is-cancelling {
  background: #fbbf24;
  box-shadow: 0 0 0 3px rgb(251 191 36 / 14%);
  animation: none;
}

.scan-task-copy span {
  overflow-wrap: anywhere;
  color: #a6b3c5;
  font-size: 11px;
}

.scan-task-track {
  position: relative;
  overflow: hidden;
  height: 5px;
  border-radius: 99px;
  background: rgb(148 163 184 / 25%);
}

.scan-task-fill {
  height: 100%;
  border-radius: inherit;
  background: #06b6d4;
  transition: width 180ms ease;
}

.scan-task-track.is-indeterminate::after {
  position: absolute;
  inset: 0 auto 0 0;
  width: 38%;
  border-radius: inherit;
  background: #06b6d4;
  content: '';
  animation: scan-progress 1.25s ease-in-out infinite alternate;
}

.scan-task-cancel {
  justify-self: end;
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid rgb(248 113 113 / 50%);
  border-radius: 8px;
  color: #fecaca;
  font-size: 11px;
  font-weight: 700;
}

.scan-task-cancel:disabled {
  cursor: wait;
  opacity: 0.65;
}

@keyframes scan-progress {
  to { transform: translateX(165%); }
}

@keyframes scan-status-pulse {
  50% { box-shadow: 0 0 0 6px rgb(52 211 153 / 4%); }
}

@media (prefers-reduced-motion: reduce) {
  .scan-task-track.is-indeterminate::after {
    animation: none;
  }

  .scan-live-dot {
    animation: none;
  }
}
</style>
