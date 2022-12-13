import { Tweet } from '../twitter'

/**
 * GET /statuses/user_timeline.json のレスポンス
 */
export type StatusesUserTimelineResponse = Tweet[]
