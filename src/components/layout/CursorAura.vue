<template>
  <div ref="aura" class="cursor-aura" aria-hidden="true">
    <span class="cursor-aura__ring"></span>
    <span class="cursor-aura__core"></span>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const aura = ref<HTMLDivElement | null>(null)
let frame = 0
let pointerX = 0
let pointerY = 0

function handlePointerMove(event: PointerEvent) {
  pointerX = event.clientX
  pointerY = event.clientY

  if (frame) return
  frame = window.requestAnimationFrame(() => {
    if (!aura.value) return

    aura.value.style.left = `${pointerX}px`
    aura.value.style.top = `${pointerY}px`
    aura.value.classList.add('is-visible')
    aura.value.classList.toggle(
      'is-hovering',
      event.target instanceof Element &&
        Boolean(event.target.closest('a, button, input, select, textarea, [role="button"]')),
    )
    frame = 0
  })
}

function hideAura() {
  aura.value?.classList.remove('is-visible', 'is-hovering')
}

onMounted(() => {
  const canShowAura = window.matchMedia(
    '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
  )
  if (!canShowAura.matches) return

  window.addEventListener('pointermove', handlePointerMove, { passive: true })
  window.addEventListener('pointerleave', hideAura)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerleave', hideAura)
  if (frame) window.cancelAnimationFrame(frame)
})
</script>
