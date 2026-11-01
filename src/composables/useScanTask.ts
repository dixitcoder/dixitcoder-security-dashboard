import { computed, ref } from 'vue'

export interface ActiveScanTask {
  id: number
  tool: string
  target: string
  elapsedSeconds: number
  progress: number | null
  cancelling: boolean
}

export interface ScanTaskHandle {
  signal: AbortSignal
  setProgress: (completed: number, total: number) => void
  finish: () => void
}

const activeTask = ref<ActiveScanTask | null>(null)
let controller: AbortController | null = null
let timerId: number | undefined
let nextTaskId = 0

export function useScanTask() {
  return {
    activeTask: computed(() => activeTask.value),
    cancelActiveScan,
  }
}

export function beginScanTask(tool: string, target: string): ScanTaskHandle | null {
  if (activeTask.value) return null

  const taskId = ++nextTaskId
  const startedAt = Date.now()
  controller = new AbortController()
  activeTask.value = {
    id: taskId,
    tool,
    target,
    elapsedSeconds: 0,
    progress: null,
    cancelling: false,
  }
  timerId = window.setInterval(() => {
    if (activeTask.value?.id === taskId) {
      activeTask.value.elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000)
    }
  }, 1000)

  return {
    signal: controller.signal,
    setProgress(completed, total) {
      if (activeTask.value?.id !== taskId || total <= 0) return
      activeTask.value.progress = Math.min(100, Math.floor((completed / total) * 100))
    },
    finish() {
      if (activeTask.value?.id !== taskId) return
      if (timerId !== undefined) window.clearInterval(timerId)
      timerId = undefined
      activeTask.value = null
      controller = null
    },
  }
}

export function cancelActiveScan(): void {
  if (!activeTask.value || !controller || activeTask.value.cancelling) return
  activeTask.value.cancelling = true
  controller.abort()
}

export function isScanCancellation(error: unknown): boolean {
  return error instanceof Error && (error.name === 'CanceledError' || error.name === 'AbortError')
}
