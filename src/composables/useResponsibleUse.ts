import { useDashboardPreferences } from './useDashboardPreferences'

export const RESPONSIBLE_USE_CANCELLATION_MESSAGE =
  'Scan cancelled because authorization was not confirmed'

export function isResponsibleUseCancellation(error: unknown): boolean {
  return error instanceof Error
    && (
      error.name === 'AbortError'
      || (error.name === 'CanceledError'
        && (error.message === RESPONSIBLE_USE_CANCELLATION_MESSAGE || error.message === 'canceled'))
    )
}

export function confirmResponsibleUse(tool: string, target = ''): boolean {
  const { rememberTarget } = useDashboardPreferences()
  const isAuthorized = window.confirm(
    `Responsible-use reminder\n\nOnly run ${tool} against systems you own or are explicitly authorized to test.${target ? `\n\nTarget: ${target}` : ''}\n\nContinue only if you have permission.`,
  )
  if (isAuthorized && target) rememberTarget(tool, target)
  return isAuthorized
}

export function recordCompletedScan(
  tool: string,
  target: string,
  startedAt: number,
  results: unknown[],
): void {
  useDashboardPreferences().recordScan({
    tool,
    target,
    durationMs: Math.max(0, Date.now() - startedAt),
    resultCount: results.length,
    results,
  })
}
