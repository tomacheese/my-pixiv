import crypto from 'node:crypto'
import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { PATH } from '@/utils/utils'
import fs, { ReadStream } from 'node:fs'
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
  GetUserDetailApiResponse,
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
  GetUserDetailOptions,
} from './options'
import { dirname, join } from 'node:path'

interface RequestOptions {
  method: 'GET' | 'POST'
  path: string
  params?: Record<string, any>
  data?: Record<string, any>
}

/**
 * pixiv API
 */
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

  /**
   * コンストラクタ。外部からインスタンス化できないので、of メソッドを使うこと。
   *
   * @param userId ユーザー ID
   * @param accessToken アクセストークン
   * @param refreshToken リフレッシュトークン
   */
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

  /**
   * リフレッシュトークンからインスタンスを生成する。
   *
   * @param refreshToken リフレッシュトークン
   * @returns Pixiv インスタンス
   */
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

  /**
   * 画像をダウンロードする。
   *
   * @param itemType アイテムの種類
   * @param itemId アイテムの ID
   * @param url 画像の URL
   * @returns 画像のファイルパス (ダウンロードに失敗した場合は存在しない可能性あり)
   */
  public static async downloadImage(
    itemType: string,
    itemId: string,
    url: string
  ): Promise<string> {
    // 画像は変更されないことを前提に恒久的にキャッシュする
    const extension: string | undefined = url.split('.').pop()

    // オリジナルサイズの場合は img-original が含まれる
    // それ以外の場合は 600x600 のようなサイズが含まれる
    let size: string | undefined
    if (url.includes('img-original')) {
      size = 'original'
    } else {
      const sizeRegex = /\d+x\d+/
      const match = url.match(sizeRegex)
      size = match ? match[0] : undefined
    }
    if (!extension || !size) {
      throw new Error('Invalid input url')
    }
    const pageRegex = /p\d+/
    const match = url.match(pageRegex)
    const page: string | undefined = match ? match[0] : undefined
    const filename = [
      size,
      page ? `-${page}` : '',
      extension ? `.${extension}` : '',
    ].join('')

    const path = join(PATH.IMAGE_CACHE_DIR, itemType, itemId, filename)

    fs.mkdirSync(dirname(path), { recursive: true })

    // なければダウンロード
    if (!fs.existsSync(path)) {
      const response = await this.getAxiosImageStream(url)
      if (response.status !== 200 && response.status !== 404) {
        throw new Error(`Failed to download image: ${url} (${response.status})`)
      }
      await new Promise<void>((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(path))
        response.data.on('end', () => {
          resolve()
        })
        response.data.on('error', (error: Error) => {
          reject(error)
        })
      })
    }

    return path
  }

  public static async getAxiosImageStream(url: string) {
    return axios.get<ReadStream>(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
        Referer: 'https://www.pixiv.net/',
      },
      responseType: 'stream',
    })
  }

  /**
   * イラストの詳細情報を取得する。
   *
   * @param options オプション
   * @returns レスポンス
   */
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

  /**
   * イラストを検索する。
   *
   * @param options オプション
   * @returns レスポンス
   */
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

  /**
   * おすすめイラストを取得する。
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async recommendedIllust(options: RecommendedIllustOptions) {
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
      path: '/v1/illust/recommended',
      params,
    })
  }

  /**
   * イラストをブックマークする。
   *
   * @param options オプション
   * @returns レスポンス
   */
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

  /**
   * 小説の詳細情報を取得する。
   *
   * @param options オプション
   * @returns レスポンス
   */
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

  /**
   * 小説を検索する。
   *
   * @param options オプション
   * @returns レスポンス
   */
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

  /**
   * おすすめ小説を取得する。
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async recommendedNovel(options: RecommendedNovelOptions = {}) {
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
      path: '/v1/novel/recommended',
      params,
    })
  }

  /**
   * 小説シリーズの詳細情報を取得する。
   *
   * @param options オプション
   * @returns レスポンス
   */
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

  /**
   * ユーザーの詳細情報を取得する。
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async getUserDetail(options: GetUserDetailOptions) {
    const params = {
      user_id: options.userId,
      filter: options.filter || 'for_ios',
    }

    return this.request<GetUserDetailApiResponse>({
      method: 'GET',
      path: '/v1/user/detail',
      params,
    })
  }

  /**
   * クエリストリングをパースする。
   *
   * @param url URL
   * @returns パースしたクエリストリングオブジェクト
   */
  public static parseQueryString(url: string) {
    let query = url
    if (url.includes('?')) {
      query = url.split('?')[1]
    }

    return qs.parse(query)
  }

  /**
   * MD5ハッシュを生成する。
   *
   * @param str 文字列
   * @returns ハッシュ
   */
  private static hash(str: string) {
    const hash = crypto.createHash('md5')
    return hash.update(str + this.hashSecret).digest('hex')
  }

  /**
   * リクエストを送信する。
   *
   * @param options オプション
   * @returns レスポンス
   */
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
}

/**
 * Pixivインスタンスのキャッシュ
 */
const cache: {
  pixiv: Pixiv | undefined
  timestamp: number
} = {
  pixiv: undefined,
  timestamp: 0,
}

/**
 * Pixivインスタンスを取得する。インスタンスは10分間キャッシュされる。
 *
 * @returns Pixivインスタンス
 */
export async function loadPixiv() {
  // 10分以内に呼ばれたらキャッシュを返す
  if (cache.pixiv && cache.timestamp + 10 * 60 * 1000 > Date.now()) {
    return cache.pixiv
  }

  const data = fs.readFileSync(PATH.TOKEN_FILE, 'utf8')
  const json = JSON.parse(data)
  const pixiv = await Pixiv.of(json.refresh_token)

  if (json.refresh_token !== pixiv.refreshToken) {
    fs.writeFileSync(
      PATH.TOKEN_FILE,
      JSON.stringify(
        {
          refresh_token: pixiv.refreshToken,
          datetime: new Date().toISOString(),
        },
        // eslint-disable-next-line unicorn/no-null
        null,
        2
      )
    )
  }

  cache.pixiv = pixiv
  cache.timestamp = Date.now()

  return pixiv
}
