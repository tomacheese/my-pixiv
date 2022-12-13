import { Tweet } from '../twitter'

/**
 * GET /statuses/lookup.json のレスポンス
 */
export type StatusLookupResponse = Tweet[]
