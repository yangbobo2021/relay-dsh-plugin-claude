export type ClaudeSessionImportUiAction = 'cancel' | 'close' | 'import-selected' | 'importing' | 'retry'

export interface ClaudeSessionImportUiPolicy {
  readonly canClose: boolean
  readonly secondary?: ClaudeSessionImportUiAction
  readonly primary: ClaudeSessionImportUiAction
  readonly primaryDisabled: boolean
}

export function claudeSessionImportUiPolicy(
  phase: string,
  selected?: number,
  failed?: number,
): ClaudeSessionImportUiPolicy

export function claudeSessionImportUpdatedAtDate(value: number | string | null | undefined): Date | null
