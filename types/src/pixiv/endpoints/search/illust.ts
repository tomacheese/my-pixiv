import { PixivIllustItem } from '../../pixivIllust'

export interface SearchIllustApiResponse {
  illusts: PixivIllustItem[]
  next_url: string
  search_span_limit: number
}
