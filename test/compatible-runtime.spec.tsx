import { Context } from '@deepseek-ai/cordis'
import { expect, it, vi } from 'vitest'
import { conversationEvents, withConversationRuntime } from '../src/client/compatible-runtime.ts'

it.each(['legacy', 'current'])('%s activates once and disposes when its provider disappears', async generation => {
  const root = new Context()
  const eventRegistry = { register() {} }
  const setup = vi.fn((ctx: Context) => {
    expect(conversationEvents(ctx)).toBe(eventRegistry)
    ctx.effect(() => cleanupEffect)
    return cleanupSelection
  })
  const cleanupEffect = vi.fn()
  const cleanupSelection = vi.fn()
  const consumer = await root.plugin({ name: 'consumer', apply: ctx => withConversationRuntime(ctx, setup) })
  expect(setup).not.toHaveBeenCalled()
  const provider = await root.plugin({ name: 'provider', apply(ctx) {
    if (generation === 'current') {
      ctx.provide('uiConversation', { events: eventRegistry } as never)
      ctx.provide('modelDirectories', {} as never)
    } else ctx.provide('conversationEvents', eventRegistry as never)
  } })
  try {
    await vi.waitFor(() => expect(setup).toHaveBeenCalledTimes(1))
    await provider.dispose()
    await vi.waitFor(() => expect(cleanupSelection).toHaveBeenCalledTimes(1))
    expect(cleanupEffect).toHaveBeenCalledTimes(1)
    await consumer.dispose()
    expect(cleanupSelection).toHaveBeenCalledTimes(1)
  } finally { await provider.dispose(); await consumer.dispose() }
})
