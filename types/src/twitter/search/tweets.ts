import { Tweet } from ".."

interface SearchMetadata {
  completed_in: number
  max_id: number
  max_id_str: string
  next_results: string
  query: string
  refresh_url: string
  count: number
  since_id: number
  since_id_str: string
}

export interface TwitterSearchResponse {
  statuses: Tweet[]
  search_metadata: SearchMetadata
}
