<template>
  <aside
    id="dashboard-sidebar"
    aria-label="Main navigation"
    :aria-hidden="isMobile && !isMobileOpen ? 'true' : undefined"
    :inert="isMobile && !isMobileOpen"
    :class="[
      'dashboard-sidebar fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-[calc(100dvh-4rem)] lg:h-screen transition-all duration-300 ease-in-out z-99999 border-r border-gray-200',
      {
        'lg:w-[290px]': isExpanded || isMobileOpen || isHovered,
        'lg:w-[90px]': !isExpanded && !isHovered,
        'translate-x-0 w-[290px]': isMobileOpen,
        '-translate-x-full': !isMobileOpen,
        'lg:translate-x-0': true,
      },
    ]"
    @mouseenter="!isExpanded && (isHovered = true)"
    @mouseleave="isHovered = false"
    @focusin="!isExpanded && !isMobile && (isHovered = true)"
    @focusout="handleSidebarFocusout"
  >
    <div
      :class="[
        'py-8 flex',
        !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start',
      ]"
    >
      <router-link to="/">
        <img
          v-if="isExpanded || isHovered || isMobileOpen"
          class="dark:hidden"
          src="/images/logo/dixitcoder-logo.svg?v=2"
          alt="DixitCoder"
          width="220"
          height="44"
        />
        <img
          v-if="isExpanded || isHovered || isMobileOpen"
          class="hidden dark:block"
          src="/images/logo/dixitcoder-logo-dark.svg?v=2"
          alt="DixitCoder"
          width="220"
          height="44"
        />
        <img v-else src="/images/logo/dixitcoder-logo-icon.svg?v=2" alt="DixitCoder" width="40" height="40" />
      </router-link>
    </div>
    <div class="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
      <nav class="mb-6" aria-label="Dashboard modules">
        <div class="flex flex-col gap-4">
          <div v-for="(menuGroup, groupIndex) in visibleMenuGroups" :key="groupIndex">
            <h2
              :class="[
                'mb-4 text-xs uppercase flex leading-[20px] text-gray-400',
                !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start',
              ]"
            >
              <template v-if="isExpanded || isHovered || isMobileOpen">
                {{ translateLabel(menuGroup.title) }}
              </template>
              <HorizontalDots v-else />
            </h2>
            <ul class="flex flex-col gap-4">
              <li v-for="(item, index) in menuGroup.items" :key="index">
                <!-- Items with Submenu -->
                <button
                  v-if="item.subItems"
                  :id="`sidebar-menu-${groupIndex}-${index}`"
                  type="button"
                  :aria-label="translateLabel(item.name)"
                  :aria-expanded="isSubmenuOpen(groupIndex, index)"
                  :aria-controls="`sidebar-submenu-${groupIndex}-${index}`"
                  @click="toggleSubmenu(groupIndex, index)"
                  :class="[
                    'menu-item group w-full',
                    {
                      'menu-item-active': isSubmenuOpen(groupIndex, index),
                      'menu-item-inactive': !isSubmenuOpen(groupIndex, index),
                    },
                    !isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start',
                  ]"
                >
                  <span
                    :class="[
                      isSubmenuOpen(groupIndex, index)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span
                    v-if="isExpanded || isHovered || isMobileOpen"
                    class="menu-item-text"
                  >{{ translateLabel(item.name) }}</span>
                  <ChevronDownIcon
                    v-if="isExpanded || isHovered || isMobileOpen"
                    :class="[
                      'ml-auto w-5 h-5 transition-transform duration-200',
                      {
                        'rotate-180 text-brand-500': isSubmenuOpen(groupIndex, index),
                      },
                    ]"
                  />
                </button>

                <!-- Single Items with Path -->
                <router-link
                  v-else-if="item.path"
                  :to="item.path"
                  :aria-label="translateLabel(item.name)"
                  :aria-current="isActive(item.path) ? 'page' : undefined"
                  :data-sidebar-initial-focus="groupIndex === 0 && index === 0 ? '' : undefined"
                  :class="[
                    'menu-item group',
                    {
                      'menu-item-active': isActive(item.path),
                      'menu-item-inactive': !isActive(item.path),
                    },
                    !isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start',
                  ]"
                >
                  <span
                    :class="[
                      isActive(item.path)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span
                    v-if="isExpanded || isHovered || isMobileOpen"
                    class="menu-item-text"
                  >{{ translateLabel(item.name) }}</span>

                  <!-- Badge for single items -->
                  <span
                    v-if="item.badge && (isExpanded || isHovered || isMobileOpen)"
                    class="ml-auto"
                  >
                    <span
                      v-if="item.badge === 'pro'"
                      class="menu-dropdown-badge bg-amber-500/20 text-amber-500"
                    >
                      PRO
                    </span>
                    <span
                      v-else-if="item.badge === 'new'"
                      class="menu-dropdown-badge bg-emerald-500/20 text-emerald-500"
                    >
                      NEW
                    </span>
                  </span>
                </router-link>

                <!-- Submenu Items -->
                <transition
                  @enter="startTransition"
                  @after-enter="endTransition"
                  @before-leave="startTransition"
                  @after-leave="endTransition"
                >
                  <div
                    :id="`sidebar-submenu-${groupIndex}-${index}`"
                    :aria-labelledby="`sidebar-menu-${groupIndex}-${index}`"
                    :aria-hidden="!isSubmenuOpen(groupIndex, index)"
                    v-show="
                      isSubmenuOpen(groupIndex, index) &&
                      (isExpanded || isHovered || isMobileOpen)
                    "
                  >
                    <ul class="mt-2 space-y-1 ml-9">
                      <li v-for="subItem in item.subItems" :key="subItem.name">
                        <router-link
                          :to="subItem.path"
                          :aria-current="isActive(subItem.path) ? 'page' : undefined"
                          :class="[
                            'menu-dropdown-item',
                            {
                              'menu-dropdown-item-active': isActive(subItem.path),
                              'menu-dropdown-item-inactive': !isActive(subItem.path),
                            },
                          ]"
                        >
                          <span class="flex items-center gap-1">
                            <span class="w-1 h-1 rounded-full"
                              :class="isActive(subItem.path) ? 'bg-brand-500' : 'bg-gray-400'">
                            </span>
                            {{ translateLabel(subItem.name) }}
                          </span>
                          <span class="flex items-center gap-1 ml-auto">
                            <span
                              v-if="subItem.new"
                              :class="[
                                'menu-dropdown-badge',
                                {
                                  'menu-dropdown-badge-active': isActive(subItem.path),
                                  'menu-dropdown-badge-inactive': !isActive(subItem.path),
                                },
                              ]"
                            >
                              new
                            </span>
                            <span
                              v-if="subItem.pro"
                              :class="[
                                'menu-dropdown-badge',
                                {
                                  'menu-dropdown-badge-active': isActive(subItem.path),
                                  'menu-dropdown-badge-inactive': !isActive(subItem.path),
                                },
                              ]"
                            >
                              pro
                            </span>
                          </span>
                        </router-link>
                      </li>
                    </ul>
                  </div>
                </transition>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <SidebarWidget v-if="isExpanded || isHovered || isMobileOpen" />
    </div>
  </aside>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import {
  GridIcon,
  CalenderIcon,
  UserCircleIcon,
  PieChartIcon,
  ChevronDownIcon,
  HorizontalDots,
  PageIcon,
  TableIcon,
  ListIcon,
  PlugInIcon,
} from "../../icons";
import SidebarWidget from "./SidebarWidget.vue";
import BoxCubeIcon from "@/icons/BoxCubeIcon.vue";
import { useSidebar } from "@/composables/useSidebar";
import { translateLabel } from "@/composables/useDashboardPreferences";

const route = useRoute();
const { isExpanded, isMobile, isMobileOpen, isHovered, openSubmenu, toggleMobileSidebar } = useSidebar();
const isAdministrator = ref(false);

onMounted(async () => {
  try {
    const response = await fetch('/api/auth/me');
    if (!response.ok) return;
    const { user } = await response.json();
    isAdministrator.value = user?.role === 'admin';
  } catch (error) {
    console.error('Unable to load current user permissions:', error);
  }
});

const handleSidebarFocusout = (event) => {
  if (!event.currentTarget.contains(event.relatedTarget)) isHovered.value = false
}

watch(
  () => route.fullPath,
  () => {
    if (isMobile.value && isMobileOpen.value) toggleMobileSidebar()
  },
)

// ફિક્સ્ડ મેનુ ગ્રુપ્સ - router names સાથે match
const menuGroups = ref([
  {
    title: "MENU",
    items: [
      {
        icon: GridIcon,
        name: "Dashboard",
        path: "/",
        badge: "new"
      },
    ],
  },
  {
    title: "NETWORK TOOLS",
    items: [
      {
        icon: ListIcon,
        name: "IP & Network Tools",
        subItems: [
          { name: "🌐 IP Info", path: "/ip" },
          { name: "🔍 Port Scanner", path: "/port-scanner" },
          { name: "📶 Ping Sweep", path: "/ping-sweep", pro: true },
          { name: "🛠️ Service Detector", path: "/service-detector", pro: true },
        ],
      },
      {
        icon: ListIcon,
        name: "Web & Vulnerability",
        subItems: [
          { name: "🌐 Web Scanner", path: "/web-scan", pro: true },
          { name: "🌍 Network Mapper", path: "/network-mapper", pro: true },
          { name: "🛡️ Vuln Scanner", path: "/vuln-scanner" },
          { name: "📜 Scan History", path: "/scan-reports" },
          { name: "🛡️ Security Center", path: "/security-center", badge: "new" },
          { name: "📊 Security Dashboard", path: "/security-dashboard", badge: "new" },
          { name: "API Diagnostics", path: "/api-diagnostics" },
        ],
      },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      {
        icon: ListIcon,
        name: "Intelligence Tools",
        subItems: [
          { name: "🖼️ Image OSINT", path: "/image-osint-analyzer" },
          { name: "🧨 Vuln Finder", path: "/vuln-finder", pro: true },
          { name: "🎨 Color Picker", path: "/color-picker" },
          { name: "📡 API Call", path: "/api/call" },
        ],
      },
    ],
  },
  {
    title: "ROUTER & DIAGNOSTICS",
    items: [
      {
        icon: ListIcon,
        name: "Router Tools",
        subItems: [
          { name: "📡 Router Info", path: "/router-info" },
        ],
      },
      {
        icon: ListIcon,
        name: "Diagnostics",
        subItems: [
          { name: "🧰 System Info", path: "/system-info" },
          { name: "💻 CPU Monitor", path: "/cpu-monitor", pro: true },
          { name: "📊 Network Stats", path: "/network-stats", pro: true },
          { name: "🔧 Debug Tools", path: "/debug-tools", pro: true },
        ],
      },
    ],
  },
  {
    title: "SECURITY",
    items: [
      {
        icon: ListIcon,
        name: "Security Tools",
        subItems: [
          { name: "🕵️ Whois Lookup", path: "/whois" },
          { name: "🔑 SSL Checker", path: "/ssl-checker" },
          { name: "🛡️ HTTP Security Headers", path: "/http-security-headers", new: true },
          { name: "📡 DNS Records Lookup", path: "/dns-records", new: true },
          { name: "⏱️ Uptime & SSL Monitors", path: "/security-monitors", new: true },
          { name: "🛡️ Firewall Test", path: "/firewall-test", pro: true },
          { name: "🔏 DNS Leak", path: "/dns-leak", pro: true },
        ],
      },
      {
        icon: CalenderIcon,
        name: "Android Payload",
        path: "/android-payload",
        badge: "pro"
      },
    ],
  },
  {
    title: "DEVELOPER",
    items: [
      {
        icon: ListIcon,
        name: "Dev Utilities",
        subItems: [
          { name: "🔤 Base64", path: "/base64" },
          { name: "🔑 Hash Generator", path: "/hash-generator" },
          { name: "📑 JSON Formatter", path: "/json-formatter" },
          { name: "🔎 Regex Tester", path: "/regex-tester" },
        ],
      },
      {
        icon: ListIcon,
        name: "Advanced Network",
        subItems: [
          { name: "📶 Traceroute", path: "/traceroute" },
          { name: "🌍 GeoIP", path: "/geoip" },
          { name: "🔄 Packet Sniffer", path: "/packet-sniffer", pro: true },
          { name: "🚦 Bandwidth Test", path: "/bandwidth-test", pro: true },
        ],
      },
    ],
  },
  {
    title: "SYSTEM ADMIN",
    items: [
      {
        icon: ListIcon,
        name: "Admin Tools",
        subItems: [
          { name: "🖧 ARP Table", path: "/arp-table" },
          { name: "🖥️ Process List", path: "/process-list" },
          { name: "📂 File Checker", path: "/file-checker", pro: true },
          { name: "📦 Port Forwarding", path: "/port-forwarding", pro: true },
        ],
      },
    ],
  },
  {
    title: "APPLICATIONS",
    items: [
      {
        icon: UserCircleIcon,
        name: "User Management",
        path: "/user-management",
        adminOnly: true,
      },
      {
        icon: CalenderIcon,
        name: "Calendar",
        path: "/calendar",
      },
      {
        icon: UserCircleIcon,
        name: "User Profile",
        path: "/profile",
      },
    ],
  },
  {
    title: "UI ELEMENTS",
    items: [
      {
        icon: ListIcon,
        name: "Forms",
        subItems: [
          { name: "Form Elements", path: "/form-elements" },
        ],
      },
      {
        icon: TableIcon,
        name: "Tables",
        subItems: [
          { name: "Basic Tables", path: "/basic-tables" },
        ],
      },
      {
        icon: PageIcon,
        name: "Pages",
        subItems: [
          { name: "Blank Page", path: "/blank" },
          { name: "404 Page", path: "/error-404" },
        ],
      },
    ],
  },
  {
    title: "OTHERS",
    items: [
      {
        icon: PageIcon,
        name: "Help & Learning",
        path: "/documentation",
        badge: "new",
      },
      {
        icon: PieChartIcon,
        name: "Charts",
        subItems: [
          { name: "Line Chart", path: "/line-chart" },
          { name: "Bar Chart", path: "/bar-chart" },
        ],
      },
      {
        icon: PlugInIcon,
        name: "Settings",
        path: "/settings",
      },
      {
        icon: BoxCubeIcon,
        name: "UI Components",
        subItems: [
          { name: "Alerts", path: "/alerts" },
          { name: "Avatars", path: "/avatars" },
          { name: "Badge", path: "/badge" },
          { name: "Buttons", path: "/buttons" },
          { name: "Images", path: "/images" },
          { name: "Videos", path: "/videos" },
        ],
      },
      {
        icon: PlugInIcon,
        name: "Authentication",
        subItems: [
          { name: "Sign In", path: "/signin" },
          { name: "Sign Up", path: "/signup" },
        ],
      },
    ],
  },
]);

const visibleMenuGroups = computed(() => menuGroups.value.map((group) => ({
  ...group,
  items: group.items.filter((item) => !item.adminOnly || isAdministrator.value),
})));

const isActive = (path) => route.path === path;

const toggleSubmenu = (groupIndex, itemIndex) => {
  const key = `${groupIndex}-${itemIndex}`;
  openSubmenu.value = openSubmenu.value === key ? null : key;
};

const isSubmenuOpen = (groupIndex, itemIndex) => {
  const key = `${groupIndex}-${itemIndex}`;
  const item = menuGroups.value[groupIndex]?.items[itemIndex];

  return (
    openSubmenu.value === key ||
    (item?.subItems?.some((subItem) => isActive(subItem.path)) ?? false)
  );
};

const startTransition = (el) => {
  el.style.height = "auto";
  const height = el.scrollHeight;
  el.style.height = "0px";
  void el.offsetHeight;
  el.style.height = height + "px";
};

const endTransition = (el) => {
  el.style.height = "";
};
</script>
