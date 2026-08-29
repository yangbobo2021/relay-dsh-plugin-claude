import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import { installModelSelection, type ModelSelectionContext } from '../../model-selection.mjs'
import { ClaudeSessionImportAction, type ClaudeSessionImportInjected } from './ClaudeSessionImportAction.tsx'
import { ClaudeActivityView } from './ClaudeActivityView.tsx'
import { claudeActivityDefinition } from './claude-activity.ts'
import { en, zh, type ClaudeLocaleKey } from './locales.ts'
import {
  importClaudeWorkspace,
  refreshImportedWorkspace,
  scanClaudeWorkspace,
} from './claude-session-import-client.mjs'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'relay.claude': ClaudeLocaleKey
  }
}

export const inject = ['slots', 'theme', 'locale', 'remote', 'sessions', 'workspaces', 'connection', 'conversationEvents']

export async function apply(ctx: ClientContext): Promise<() => Promise<void>> {
  ctx.effect(() => ctx.locale.register('relay.claude', { zh, en }), 'relay-claude: dictionaries')
  ctx.conversationEvents.register(claudeActivityDefinition)
  ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
    name: 'conversation.chat.node', key: 'relay-claude-activity',
  }, ClaudeActivityView))
  applySessionImport(ctx)
  const unsubscribe = installModelSelection(ctx as ModelSelectionContext, 'relay-claude', 'relay-claude', 'relay-codex')
  return async () => { unsubscribe() }
}

function applySessionImport(ctx: ClientContext): void {
  const injected = (): ClaudeSessionImportInjected => ({
    hooks: {
      claudeSessionImportWorkspaces: ctx.workspaces.list,
      claudeSessionImportSessions: ctx.sessions.list,
    },
    scanWorkspace: cwd => scanClaudeWorkspace(cwd),
    importWorkspace: (cwd, sessionIds, onProgress) => importClaudeWorkspace(cwd, { sessionIds, onProgress }),
    refreshWorkspaceState: () => refreshImportedWorkspace(
      ctx.sessions as typeof ctx.sessions & { refresh(): Promise<void> },
      ctx.workspaces as typeof ctx.workspaces & { refresh(): Promise<void> },
    ),
  })
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'relay-claude-session-import',
    order: -9,
    inject: injected,
    locale: 'relay.claude',
  }, ClaudeSessionImportAction))
}
