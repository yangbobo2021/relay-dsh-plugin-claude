export interface WorkspaceImportWorkspace {
  workspaceId: string
  title: string
  path: string
  sessionIds: readonly string[]
}

export interface WorkspaceImportSummary {
  found: number
  existing: number
  recoverable: number
  ready: number
}

export interface WorkspaceImportCandidate {
  id: string
  title: string
  cwd: string
  updatedAt: number | string | null
  status: 'ready' | 'recoverable'
}

export interface WorkspaceImportResult {
  found: number
  imported: number
  existing: number
  failed: number
  failures: readonly { session: string; message: string }[]
}

export interface WorkspaceImportProgress extends WorkspaceImportResult {
  completed: number
  total: number
}

export function resolveImportWorkspace(
  workspaces: {
    items?: readonly WorkspaceImportWorkspace[]
    recentWorkspaceId?: string
  } | null | undefined,
  sessions: { current?: string } | null | undefined,
): WorkspaceImportWorkspace | null

export function scanClaudeWorkspace(
  cwd: string,
  fetchImpl?: typeof fetch,
): Promise<{
  workspace: WorkspaceImportWorkspace
  summary: WorkspaceImportSummary
  candidates: readonly WorkspaceImportCandidate[]
}>

export function importClaudeWorkspace(
  cwd: string,
  options?: {
    sessionIds?: readonly string[]
    onProgress?: ((progress: WorkspaceImportProgress) => void) | null
  },
  fetchImpl?: typeof fetch,
): Promise<WorkspaceImportResult>

export function refreshImportedWorkspace(
  sessions: { refresh(): Promise<void> },
  workspaces: { refresh(): Promise<void> },
): Promise<void>

export function ndjsonFrames(body: ReadableStream<Uint8Array> | null): AsyncGenerator<unknown>
