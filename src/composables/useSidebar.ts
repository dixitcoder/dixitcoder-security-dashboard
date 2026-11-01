// import { ref } from 'vue'

// export function useSidebar() {
//   const isMobileOpen = ref(false)
//   const isDesktopOpen = ref(true)

//   const toggleSidebar = () => {
//     isDesktopOpen.value = !isDesktopOpen.value
//   }

//   const toggleMobileSidebar = () => {
//     isMobileOpen.value = !isMobileOpen.value
//   }

//   return {
//     isMobileOpen,
//     isDesktopOpen,
//     toggleSidebar,
//     toggleMobileSidebar,
//   }
// }

import { ref, computed, nextTick, onMounted, onUnmounted, provide, inject, watch } from 'vue'
import type { Ref } from 'vue' //

interface SidebarContextType {
  isExpanded: Ref<boolean>
  isMobileOpen: Ref<boolean>
  isMobile: Ref<boolean>
  isHovered: Ref<boolean>
  activeItem: Ref<string | null>
  openSubmenu: Ref<string | null>
  toggleSidebar: () => void
  toggleMobileSidebar: () => void
  setIsHovered: (isHovered: boolean) => void
  setActiveItem: (item: string | null) => void
  toggleSubmenu: (item: string) => void
}

const SidebarSymbol = Symbol()

export function useSidebarProvider() {
  const isExpanded = ref(true)
  const isMobileOpen = ref(false)
  const isMobile = ref(false)
  const isHovered = ref(false)
  const activeItem = ref<string | null>(null)
  const openSubmenu = ref<string | null>(null)

  const handleResize = () => {
    const mobile = window.innerWidth < 1024
    isMobile.value = mobile
    if (!mobile) {
      isMobileOpen.value = false
    }
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (!isMobileOpen.value) return

    if (event.key === 'Escape') {
      event.preventDefault()
      isMobileOpen.value = false
      return
    }

    if (event.key !== 'Tab') return

    const sidebar = document.getElementById('dashboard-sidebar')
    if (!sidebar) return

    const focusable = Array.from(
      sidebar.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.getClientRects().length > 0)

    if (focusable.length === 0) {
      event.preventDefault()
      sidebar.focus()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && (document.activeElement === first || !sidebar.contains(document.activeElement))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (document.activeElement === last || !sidebar.contains(document.activeElement))) {
      event.preventDefault()
      first.focus()
    }
  }

  let previousBodyOverflow = ''
  let bodyScrollLocked = false
  watch(isMobileOpen, async (isOpen, wasOpen) => {
    if (isOpen && isMobile.value) {
      previousBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      bodyScrollLocked = true
      await nextTick()
      if (isMobileOpen.value && isMobile.value) {
        document.querySelector<HTMLElement>('[data-sidebar-initial-focus]')?.focus()
      }
      return
    }

    if (wasOpen) {
      if (bodyScrollLocked) {
        document.body.style.overflow = previousBodyOverflow
        bodyScrollLocked = false
      }
      document.getElementById('sidebar-toggle')?.focus()
    }
  })

  onMounted(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    document.removeEventListener('keydown', handleKeydown)
    if (bodyScrollLocked) document.body.style.overflow = previousBodyOverflow
  })

  const toggleSidebar = () => {
    if (isMobile.value) {
      isMobileOpen.value = !isMobileOpen.value
    } else {
      isExpanded.value = !isExpanded.value
    }
  }

  const toggleMobileSidebar = () => {
    isMobileOpen.value = !isMobileOpen.value
  }

  const setIsHovered = (value: boolean) => {
    isHovered.value = value
  }

  const setActiveItem = (item: string | null) => {
    activeItem.value = item
  }

  const toggleSubmenu = (item: string) => {
    openSubmenu.value = openSubmenu.value === item ? null : item
  }

  const context: SidebarContextType = {
    isExpanded: computed(() => (isMobile.value ? false : isExpanded.value)),
    isMobileOpen,
    isMobile: computed(() => isMobile.value),
    isHovered,
    activeItem,
    openSubmenu,
    toggleSidebar,
    toggleMobileSidebar,
    setIsHovered,
    setActiveItem,
    toggleSubmenu,
  }

  provide(SidebarSymbol, context)

  return context
}

export function useSidebar(): SidebarContextType {
  const context = inject<SidebarContextType>(SidebarSymbol)
  if (!context) {
    throw new Error(
      'useSidebar must be used within a component that has SidebarProvider as an ancestor',
    )
  }
  return context
}
