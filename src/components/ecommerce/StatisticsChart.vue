<template>
  <div
    class="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"
  >
    <div class="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
      <div class="w-full">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Statistics</h3>
        <p class="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
          Illustrative sales and revenue trends
        </p>
      </div>

      <div class="relative">
        <div class="inline-flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
          <button
            v-for="option in options"
            :key="option.value"
            :aria-pressed="selected === option.value"
            @click="selected = option.value"
            :class="[
              selected === option.value
                ? 'shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800'
                : 'text-gray-500 dark:text-gray-400',
              'px-3 py-2 font-medium rounded-md text-theme-sm hover:text-gray-900 hover:shadow-theme-xs dark:hover:bg-gray-800 dark:hover:text-white',
            ]"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>
    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <div id="dashboard-statistics-chart" class="-ml-4 min-w-[1000px] xl:min-w-full pl-2">
        <VueApexCharts type="area" height="310" :options="chartOptions" :series="series" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'

type Period = 'monthly' | 'quarterly' | 'annually'

const options = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
] as const

const selected = ref<Period>('monthly')

const prefersReducedMotion = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const periods: Record<Period, { categories: string[]; sales: number[]; revenue: number[] }> = {
  monthly: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    sales: [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235],
    revenue: [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140],
  },
  quarterly: {
    categories: ['Q1', 'Q2', 'Q3', 'Q4'],
    sales: [540, 500, 605, 685],
    revenue: [120, 135, 280, 410],
  },
  annually: {
    categories: ['2023', '2024', '2025'],
    sales: [1840, 2210, 2680],
    revenue: [520, 760, 1120],
  },
}

const selectedPeriod = computed(() => periods[selected.value])
const series = computed(() => [
  { name: 'Sales', data: selectedPeriod.value.sales },
  { name: 'Revenue', data: selectedPeriod.value.revenue },
])

const chartOptions = computed<ApexOptions>(() => ({
  legend: {
    show: false,
    position: 'top',
    horizontalAlign: 'left',
  },
  colors: ['#465FFF', '#9CB9FF'],
  chart: {
    fontFamily: 'Outfit, sans-serif',
    type: 'area',
    animations: {
      enabled: !prefersReducedMotion,
      easing: 'easeinout',
      speed: 650,
      animateGradually: {
        enabled: true,
        delay: 90,
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350,
      },
    },
    toolbar: {
      show: false,
    },
  },
  fill: {
    gradient: {
      opacityFrom: 0.55,
      opacityTo: 0,
    },
  },
  stroke: {
    curve: 'straight',
    width: [2, 2],
  },
  markers: {
    size: 0,
  },
  grid: {
    xaxis: {
      lines: {
        show: false,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    x: {
      format: 'dd MMM yyyy',
    },
  },
  xaxis: {
    type: 'category',
    categories: selectedPeriod.value.categories,
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    tooltip: {
      enabled: false,
    },
  },
  yaxis: {
    title: {
      style: {
        fontSize: '0px',
      },
    },
  },
}))
</script>

<style scoped>
.area-chart {
  width: 100%;
}
</style>
