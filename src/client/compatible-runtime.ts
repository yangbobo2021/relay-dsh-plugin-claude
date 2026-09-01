import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'

export function conversationEvents(ctx: Context): Context['uiConversation']['events'] {
  const events = ctx.get('uiConversation')?.events ?? ctx.get('conversationEvents')
  if (!events) throw new Error('DSH conversation events service is unavailable')
  return events
}

/** Bind setup and disposal to the service family actually present in this DSH. */
export function withConversationRuntime(ctx: Context, setup: (ctx: Context) => (() => void)): () => void {
  const current = ctx.inject(['uiConversation', 'modelDirectories'], inner => setup(inner))
  const legacy = ctx.inject(['conversationEvents'], inner => {
    if (inner.get('uiConversation')) return
    return setup(inner)
  })
  return () => { void current.dispose(); void legacy.dispose() }
}
