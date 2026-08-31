import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-client-ui-model-selection/client'

export type ModelSelectionContext = Pick<Context, 'sessions' | 'modelDirectories'>

export function installModelSelection(
  ctx: ModelSelectionContext,
  preset: string,
  provider: string,
  otherProvider: string,
): () => void
