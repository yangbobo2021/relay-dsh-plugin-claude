// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@deepseek-ai/dsh-client-ui-primitives', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
  IconSparkle16: () => <svg aria-hidden="true" />,
  Modal: ({ open, title, children, footer }: {
    open: boolean
    title: string
    children: React.ReactNode
    footer: React.ReactNode
  }) => open ? <div role="dialog" aria-label={title}>{children}{footer}</div> : null,
}))

import { ClaudeSessionImportProvider } from '../src/client/ClaudeSessionImportAction.tsx'
import { en } from '../src/client/locales.ts'
import type { SessionImportProviderDescriptor } from 'relay-dsh-plugin-session-import/contracts'

const workspaces = {
  recentWorkspaceId: 'workspace-beta',
  items: [
    { workspaceId: 'workspace-alpha', title: 'Alpha', path: '/work/alpha', sessionIds: ['session-alpha'] },
    { workspaceId: 'workspace-beta', title: 'Beta', path: '/work/beta', sessionIds: [] },
  ],
}

afterEach(cleanup)

describe('ClaudeSessionImportProvider', () => {
  it('registers one explicit Claude provider and removes it on unmount', async () => {
    const registered: SessionImportProviderDescriptor[] = []
    const dispose = vi.fn()
    const view = renderAction({
      registerProvider: provider => { registered.push(provider); return dispose },
    })

    await waitFor(() => { expect(registered).toHaveLength(1) })
    expect(registered[0]).toMatchObject({ id: 'claude', label: en.importAction, order: 20 })
    expect(registered[0]!.icon).not.toBeNull()
    expect(screen.queryByRole('button', { name: en.importAction })).toBeNull()

    view.unmount()
    expect(dispose).toHaveBeenCalledTimes(1)
  })

  it('waits for explicit Workspace confirmation and scans the visible selection', async () => {
    const scanWorkspace = vi.fn().mockResolvedValue({
      workspace: { title: 'Beta', path: '/work/beta' },
      summary: { found: 0, existing: 0, recoverable: 0, ready: 0 },
      candidates: [],
    })
    const { provider } = renderAction({ scanWorkspace })

    await waitFor(() => { expect(provider.current).not.toBeNull() })
    act(() => { provider.current!.open() })
    expect(scanWorkspace).not.toHaveBeenCalled()

    const selector = screen.getByRole('combobox', { name: en.importWorkspaceLabel }) as HTMLSelectElement
    expect(selector.value).toBe('workspace-alpha')
    expect(screen.getByText('/work/alpha')).not.toBeNull()

    fireEvent.change(selector, { target: { value: 'workspace-beta' } })
    expect(selector.value).toBe('workspace-beta')
    expect(screen.getByText('/work/beta')).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: en.importScanAction }))
    await waitFor(() => { expect(scanWorkspace).toHaveBeenCalledWith('/work/beta') })
    expect(scanWorkspace).toHaveBeenCalledTimes(1)
  })

  it('shows a no-Workspace state and never scans when the list is empty', async () => {
    const scanWorkspace = vi.fn()
    const { provider } = renderAction({
      workspaceState: { items: [], recentWorkspaceId: undefined },
      sessionState: { current: undefined },
      scanWorkspace,
    })

    await waitFor(() => { expect(provider.current).not.toBeNull() })
    act(() => { provider.current!.open() })
    expect(screen.getByText(en.importNoWorkspace)).not.toBeNull()
    expect(screen.queryByRole('combobox')).toBeNull()
    expect(scanWorkspace).not.toHaveBeenCalled()
  })
})

function renderAction({
  workspaceState = workspaces,
  sessionState = { current: 'session-alpha' },
  scanWorkspace = vi.fn(),
  registerProvider,
}: {
  workspaceState?: typeof workspaces | { items: readonly never[]; recentWorkspaceId?: undefined }
  sessionState?: { current?: string }
  scanWorkspace?: ReturnType<typeof vi.fn>
  registerProvider?: (provider: SessionImportProviderDescriptor) => () => void
} = {}) {
  const provider = { current: null as SessionImportProviderDescriptor | null }
  const view = render(<ClaudeSessionImportProvider
    registerProvider={descriptor => {
      provider.current = descriptor
      return registerProvider?.(descriptor) ?? (() => { provider.current = null })
    }}
    useClaudeSessionImportWorkspaces={selector => selector(workspaceState as never)}
    useClaudeSessionImportSessions={selector => selector(sessionState as never)}
    scanWorkspace={scanWorkspace as never}
    importWorkspace={vi.fn() as never}
    refreshWorkspaceState={vi.fn() as never}
    t={(key => en[key]) as never}
  />)
  return { ...view, provider }
}
