import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import {
  recordCompletedScan,
  RESPONSIBLE_USE_CANCELLATION_MESSAGE,
} from '@/composables/useResponsibleUse'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

axios.defaults.baseURL = API_BASE_URL
axios.defaults.timeout = 15000

const scanEndpoint = /(?:advanced-scan|network-mapper|vuln-scanner|ping-sweep|traceroute|packet-sniffer|firewall-test|web-scan|port-scan|ssl-checker|dns-leak|bandwidth-test)/i
const scanStartedAt = new WeakMap<InternalAxiosRequestConfig, number>()

function requestBody(data: unknown): Record<string, unknown> {
  if (typeof data === 'string') {
    try {
      const parsed: unknown = JSON.parse(data)
      return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {}
    } catch {
      return {}
    }
  }
  return data && typeof data === 'object' && !(data instanceof FormData)
    ? data as Record<string, unknown>
    : {}
}

axios.interceptors.request.use((config) => {
  if (typeof window === 'undefined' || !scanEndpoint.test(config.url || '')) return config

  const body = requestBody(config.data)
  const rawTarget = body.host ?? body.domain ?? body.target ?? body.hostname ?? body.hosts
  const target = Array.isArray(rawTarget) ? rawTarget.join(', ') : String(rawTarget || '')
  if (!window.confirm(
    `Responsible-use reminder\n\nOnly run this scan against systems you own or are explicitly authorized to test.${target ? `\n\nTarget: ${target}` : ''}\n\nContinue only if you have permission.`,
  )) {
    return Promise.reject(new axios.CanceledError(RESPONSIBLE_USE_CANCELLATION_MESSAGE))
  }
  scanStartedAt.set(config, Date.now())
  return config
})

axios.interceptors.response.use((response) => {
  const startedAt = scanStartedAt.get(response.config)
  if (startedAt === undefined) return response
  scanStartedAt.delete(response.config)
  const body = requestBody(response.config.data)
  const rawTarget = body.host ?? body.domain ?? body.target ?? body.hostname ?? body.hosts
  const target = Array.isArray(rawTarget) ? rawTarget.join(', ') : String(rawTarget || 'Unknown target')
  const tool = (response.config.url || '').split('?')[0].split('/').filter(Boolean).pop() || 'Security scan'
  const payload: unknown = response.data
  const results =
    payload && typeof payload === 'object' && 'results' in payload && Array.isArray(payload.results)
      ? payload.results
      : payload && typeof payload === 'object' && 'result' in payload
        ? [payload.result]
        : Array.isArray(payload) ? payload : []
  recordCompletedScan(tool, target, startedAt, results)
  return response
}, (error: unknown) => Promise.reject(error))
