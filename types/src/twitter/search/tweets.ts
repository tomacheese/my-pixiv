import { Tweet } from '../twitter'

/**
 * ツイート検索メタデータ
 */
interface SearchMetadata {
  /**
   * 完了までの時間
   */
  completed_in: number

  /**
   * 検索結果の最大ID
   */
  max_id: number

  /**
   * 検索結果の最大ID (文字列)
   */
  max_id_str: string

  /**
   * 次の検索結果のURLクエリ
   */
  next_results: string

  /**
   * 検索クエリ
   */
  query: string

  /**
   * 更新用のURLクエリ
   */
  refresh_url: string

  /**
   * 検索結果アイテム数
   */
  count: number

  /**
   * 検索結果の最小ID
   */
  since_id: number

  /**
   * 検索結果の最小ID (文字列)
   */
  since_id_str: string
}

/**
 * GET /search/tweets.json のレスポンス
 */
export interface SearchTweetsResponse {
  /**
   * ツイート一覧
   */
  statuses: Tweet[]

  /**
   * 検索メタデータ
   */
  search_metadata: SearchMetadata
}
