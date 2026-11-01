<template>
  <div>
    <button
      ref="trigger"
      type="button"
      class="flex h-10 items-center justify-center gap-1 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
      aria-label="Keyboard shortcuts and help"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      @click="open"
    >
      <span aria-hidden="true">?</span><span class="hidden sm:inline">Help</span>
    </button>
    <Teleport to="body">
      <div v-if="isOpen" class="fixed inset-0 z-[100000] grid place-items-center bg-slate-950/55 p-4" @click.self="close()">
        <section ref="dialog" class="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900" role="dialog" aria-modal="true" aria-labelledby="keyboard-help-title" @keydown.esc.stop.prevent="close(true)" @keydown.tab="trapFocus">
          <div class="flex items-start justify-between gap-4">
            <div><p class="text-xs font-bold tracking-widest text-cyan-700 dark:text-cyan-300">QUICK HELP</p><h2 id="keyboard-help-title" class="mt-1 text-xl font-bold text-gray-900 dark:text-white">Keyboard shortcuts</h2></div>
            <button ref="closeButton" type="button" class="rounded-lg px-3 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close help" @click="close(true)">Esc</button>
          </div>
          <dl class="mt-5 divide-y divide-gray-200 dark:divide-gray-800">
            <div v-for="shortcut in shortcuts" :key="`${shortcut.action}-${shortcut.keys}`" class="flex items-center justify-between gap-4 py-3">
              <dt class="text-sm text-gray-700 dark:text-gray-300">{{ shortcut.action }}</dt>
              <dd><kbd class="rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">{{ shortcut.keys }}</kbd></dd>
            </div>
          </dl>
          <p class="mt-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">Use Tab to move between controls and Enter or Space to activate them. Windows reserves <kbd class="rounded border px-1">Win+K</kbd> for system casting; use <kbd class="rounded border px-1">Ctrl+K</kbd> to open dashboard search. Mac uses <kbd class="rounded border px-1">⌘K</kbd>.</p>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const isOpen = ref(false)
const trigger = ref<HTMLButtonElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const dialog = ref<HTMLElement | null>(null)
const route = useRoute()
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const shortcuts = computed(() => {
  const items = [
    { action: 'Open or close dashboard search', keys: isMac ? '⌘ K' : 'Ctrl K' },
    { action: 'Move through search results', keys: '↑ / ↓' },
    { action: 'Open selected search result', keys: 'Enter' },
    { action: 'Close the active dialog or menu', keys: 'Esc' },
    { action: 'Show this help panel', keys: '?' },
  ]
  if (route.path === '/http-security-headers') {
    items.unshift({ action: 'Check HTTP security headers', keys: 'Ctrl+Enter' })
  } else if (route.path === '/dns-records') {
    items.unshift({ action: 'Look up DNS records', keys: 'Ctrl+Enter' })
  } else if (route.path === '/security-monitors') {
    items.unshift({ action: 'Add the selected monitor', keys: 'Ctrl+Enter' })
    items.unshift({ action: 'Check monitor 1–9', keys: 'Ctrl+Shift+1–9' })
    items.unshift({ action: 'Remove monitor 1–9', keys: 'Ctrl+Alt+1–9' })
  } else if (route.path === '/security-dashboard') {
    items.unshift({ action: 'Refresh service status', keys: 'R' })
  }
  return items
})

function open(): void {
  isOpen.value = true
  requestAnimationFrame(() => closeButton.value?.focus())
}

function close(restoreFocus = false): void {
  isOpen.value = false
  if (restoreFocus) requestAnimationFrame(() => trigger.value?.focus())
}

function trapFocus(event: KeyboardEvent): void {
  const focusable = dialog.value?.querySelectorAll<HTMLElement>('button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])')
  if (!focusable?.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function handleHelpShortcut(event: KeyboardEvent): void {
  const target = event.target
  const editing = target instanceof HTMLElement
    && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)
  if (editing || event.ctrlKey || event.metaKey || event.altKey) return
  if (event.key === '?') {
    event.preventDefault()
    if (isOpen.value) close()
    else open()
  }
}

onMounted(() => window.addEventListener('keydown', handleHelpShortcut))
onUnmounted(() => window.removeEventListener('keydown', handleHelpShortcut))
</script>
