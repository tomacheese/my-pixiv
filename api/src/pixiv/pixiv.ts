import crypto from 'crypto'
import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { PATH } from '@/utils'
import fs from 'fs'
import qs from 'qs'
import {
  GetIllustDetailApiResponse,
  SearchIllustApiResponse,
  RecommendedIllustApiResponse,
  IllustBookmarkAddApiResponse,
  GetNovelDetailApiResponse,
  SearchNovelApiResponse,
  RecommendedNovelApiResponse,
  GetNovelSeriesApiResponse,
} from 'my-pixiv-types'
import {
  GetIllustDetailOptions,
  SearchIllustOptions,
  RecommendedIllustOptions,
  IllustBookmarkAddOptions,
  GetNovelDetailOptions,
  SearchNovelOptions,
  RecommendedNovelOptions,
  GetNovelSeriesOptions,
} from './options'

interface RequestOptions {
  method: 'GET' | 'POST'
  path: string
  params?: Record<string, any>
  data?: Record<string, any>
}

export class Pixiv {
  private static clientId = 'MOBrBDS8blbauoSck0ZfDbtuzpyT'
  private static clientSecret = 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj'
  private static hashSecret =
    '28c1fdd170a5204386cb1313c7077b34f83e4aaf4aa829ce78c231e05b0bae2c'

  private hosts = 'https://app-api.pixiv.net'

  readonly userId: string
  readonly accessToken: string
  readonly refreshToken: string
  readonly axios: AxiosInstance

  private constructor(
    userId: string,
    accessToken: string,
    refreshToken: string
  ) {
    this.userId = userId
    this.accessToken = accessToken
    this.refreshToken = refreshToken

    this.axios = axios.create({
      baseURL: this.hosts,
      headers: {
        Host: 'app-api.pixiv.net',
        'App-OS': 'ios',
        'App-OS-Version': '14.6',
        'User-Agent': 'PixivIOSApp/7.13.3 (iOS 14.6; iPhone13,2)',
        Authorization: `Bearer ${this.accessToken}`,
      },
      validateStatus: () => true,
    })
  }

  public static async of(refreshToken: string) {
    // @see https://github.com/upbit/pixivpy/blob/master/pixivpy3/api.py#L120

    // UTCで YYYY-MM-DDTHH:mm:ss+00:00 の形式で現在時刻を取得
    const localTime = new Date().toISOString().replace(/Z$/, '+00:00')

    const headers = {
      'x-client-time': localTime,
      'x-client-hash': this.hash(localTime),
      'app-os': 'ios',
      'app-os-version': '14.6',
      'user-agent': 'PixivIOSApp/7.13.3 (iOS 14.6; iPhone13,2)',
      header: 'application/x-www-form-urlencoded',
    }

    const authUrl = 'https://oauth.secure.pixiv.net/auth/token'

    const data = qs.stringify({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      get_secure_url: 1,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })

    const response = await axios.post(authUrl, data, {
      headers,
      validateStatus: () => true,
    })

    if (response.status !== 200) {
      throw new Error('Failed to refresh token')
    }

    const options = {
      userId: response.data.user.id,
      accessToken: response.data.response.access_token,
      refreshToken: response.data.response.refresh_token,
    }

    return new Pixiv(options.userId, options.accessToken, options.refreshToken)
  }

  private static hash(time: string) {
    const hash = crypto.createHash('md5')
    return hash.update(time + this.hashSecret).digest('hex')
  }

  private request<T>(options: RequestOptions): Promise<AxiosResponse<T>> {
    if (options.method === 'GET') {
      return this.axios.get<T>(options.path, { params: options.params })
    }
    if (options.method === 'POST') {
      return this.axios.post<T>(options.path, qs.stringify(options.data), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
    }
    throw new Error('Invalid method')
  }

  public async getIllustDetail(options: GetIllustDetailOptions) {
    const params = {
      illust_id: options.illustId,
    }

    return this.request<GetIllustDetailApiResponse>({
      method: 'GET',
      path: '/v1/illust/detail',
      params,
    })
  }

  public async searchIllust(options: SearchIllustOptions) {
    const params = {
      word: options.word, // required
      searchTarget: options.searchTarget || 'partial_match_for_tags',
      sort: options.sort || 'date_desc',
      duration: options.duration,
      startDate: options.startDate,
      endDate: options.endDate,
      filter: options.filter || 'for_ios',
      offset: options.offset,
    }

    return this.request<SearchIllustApiResponse>({
      method: 'GET',
      path: '/v1/search/illust',
      params,
    })
  }

  public async recommendedIllust(options: RecommendedIllustOptions) {
    const path =
      options.requireAuth === undefined || options.requireAuth === true
        ? `/v1/illust/recommended`
        : `/v1/illust/recommended-nologin`

    const params = {
      content_type: options.contentType,
      include_ranking_label: options.includeRankingLabel || true,
      filter: options.filter || 'for_ios',
      max_bookmark_id_for_recommend:
        options.maxBookmarkIdForRecommend || undefined,
      min_bookmark_id_for_recent_illust:
        options.minBookmarkIdForRecentIllust || undefined,
      offset: options.offset || undefined,
      include_ranking_illusts: options.includeRankingIllusts || undefined,
      bookmark_illust_ids: options.bookmarkIllustIds
        ? options.bookmarkIllustIds.join(',')
        : undefined,
      include_privacy_policy: options.includePrivacyPolicy || undefined,
    }

    return this.request<RecommendedIllustApiResponse>({
      method: 'GET',
      path,
      params,
    })
  }

  public async illustBookmarkAdd(options: IllustBookmarkAddOptions) {
    const data = {
      illust_id: options.illustId,
      restrict: options.restrict || 'public',
      'tags[]': (options.tags || []).join(' '),
    }

    return this.request<IllustBookmarkAddApiResponse>({
      method: 'POST',
      path: '/v2/illust/bookmark/add',
      data,
    })
  }

  public async getNovelDetail(options: GetNovelDetailOptions) {
    const params = {
      novel_id: options.novelId,
    }

    return this.request<GetNovelDetailApiResponse>({
      method: 'GET',
      path: '/v2/novel/detail',
      params,
    })
  }

  public async searchNovel(options: SearchNovelOptions) {
    const params = {
      word: options.word, // required
      searchTarget: options.searchTarget || 'partial_match_for_tags',
      sort: options.sort || 'date_desc',
      merge_plain_keyword_results: options.mergePlainKeywordResults || true,
      include_translated_tag_results:
        options.includeTranslatedTagResults || true,
      startDate: options.startDate,
      endDate: options.endDate,
      filter: options.filter || 'for_ios',
      offset: options.offset,
    }

    return this.request<SearchNovelApiResponse>({
      method: 'GET',
      path: '/v1/search/novel',
      params,
    })
  }

  public async recommendedNovel(options: RecommendedNovelOptions = {}) {
    const path =
      options.requireAuth === undefined || options.requireAuth === true
        ? `/v1/novel/recommended`
        : `/v1/novel/recommended-nologin` // 未チェック

    const params = {
      include_ranking_label: options.includeRankingLabel || true,
      filter: options.filter || 'for_ios',
      offset: options.offset || undefined,
      include_ranking_novels: options.includeRankingNovels || undefined,
      already_recommended: options.alreadyRecommended,
      max_bookmark_id_for_recommend: options.maxBookmarkIdForRecommend,
      include_privacy_policy: options.includePrivacyPolicy || undefined,
    }

    return this.request<RecommendedNovelApiResponse>({
      method: 'GET',
      path,
      params,
    })
  }

  public async getNovelSeries(options: GetNovelSeriesOptions) {
    const params = {
      series_id: options.seriesId,
      filter: options.filter || 'for_ios',
      last_order: options.lastOrder || undefined,
    }

    return this.request<GetNovelSeriesApiResponse>({
      method: 'GET',
      path: '/v2/novel/series',
      params,
    })
  }

  public static parseQueryString(url: string) {
    let query = url
    if (url.indexOf('?') !== -1) {
      query = url.split('?')[1]
    }

    return qs.parse(query)
  }
}

const cache: {
  pixiv: Pixiv | null
  timestamp: number
} = {
  pixiv: null,
  timestamp: 0,
}

export async function loadPixiv() {
  // 10分以内に呼ばれたらキャッシュを返す
  if (cache.pixiv && cache.timestamp + 10 * 60 * 1000 > Date.now()) {
    return cache.pixiv
  }

  const data = fs.readFileSync(PATH.TOKEN_FILE, 'utf-8')
  const json = JSON.parse(data)
  const pixiv = await Pixiv.of(json.refresh_token)

  cache.pixiv = pixiv
  cache.timestamp = Date.now()

  return pixiv
}
