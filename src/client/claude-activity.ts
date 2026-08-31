import type { ConversationNodeDefinition } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { ChatConversationViewNode } from '@deepseek-ai/dsh-client-ui-chat/client'
import type { SessionEventMap } from '@deepseek-ai/dsh-session/types'

type SessionEventContractAnchor = SessionEventMap

export type ClaudeActivityStatus = 'running' | 'completed' | 'error'

export interface ClaudeActivityData {
  readonly type: string
  readonly status: ClaudeActivityStatus
  readonly title: string
  readonly summary?: string
  readonly input?: string
  readonly output?: string
  readonly provenance?: {
    readonly claudeSessionId: string
    readonly turnId: string
  }
}

export interface ClaudeActivityEventData {
  readonly version: 1
  readonly claudeSessionId: string
  readonly turnId: string
  readonly itemId: string
  readonly phase: 'started' | 'completed'
  readonly activity: ClaudeActivityData
}

declare module '@deepseek-ai/dsh-session/types' {
  interface SessionEventMap {
    'relay-claude/activity': ClaudeActivityEventData
  }
}

declare module '@deepseek-ai/dsh-client-ui-chat/client' {
  interface ChatNodeDataMap {
    'relay-claude-activity': ClaudeActivityData
  }
}

export const claudeActivityDefinition: ConversationNodeDefinition<ClaudeActivityData> = {
  kind: 'relay-claude-activity',
  target: 'chat',
  match: event => event.type === 'relay-claude/activity'
    ? { id: event.data.itemId, role: event.data.phase === 'started' ? 'start' : 'update' }
    : null,
  start: (_context, match) => {
    if (match.event.type !== 'relay-claude/activity') {
      throw new Error('Claude activity start requires relay-claude/activity')
    }
    return {
      ...match.event.data.activity,
      provenance: {
        claudeSessionId: match.event.data.claudeSessionId,
        turnId: match.event.data.turnId,
      },
    }
  },
  update: (context, match) => match.event.type === 'relay-claude/activity'
    ? {
        ...match.event.data.activity,
        provenance: {
          claudeSessionId: match.event.data.claudeSessionId,
          turnId: match.event.data.turnId,
        },
      }
    : context.state,
  buildViewNode: (context): ChatConversationViewNode | null => {
    if (context.start === undefined || context.state === undefined) return null
    return {
      key: context.key,
      kind: 'relay-claude-activity',
      id: context.id,
      target: 'chat',
      anchorSeq: context.start.event.seq,
      location: context.start.location,
      visibility: 'visible',
      data: context.state,
    }
  },
}
