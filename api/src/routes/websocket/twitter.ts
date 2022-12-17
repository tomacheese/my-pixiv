import { BaseWSRouter } from '@/base-ws-router'
import { loadPixiv, Pixiv } from '@/pixiv/pixiv'
import {
  AddTweetLikeRequest,
  AddTweetLikeResponse,
  CheckShadowBanRequest,
  CheckShadowBanResponse,
  GetTweetsLikeRequest,
  GetTweetsLikeResponse,
  PixivIllustItem,
  RemoveTweetLikeRequest,
  RemoveTweetLikeResponse,
  SearchTweetRequest,
  SearchTweetResponse,
  ShadowBanResult,
  StatusLookupResponse,
  Tweet,
  SearchTweetsResponse,
  SearchTweetObject,
  StatusesUserTimelineResponse,
} from 'my-pixiv-types'
import fs from 'fs'
import { loadTwitterApi, PATH } from '@/utils/utils'
import axios from 'axios'
import jimp from 'jimp'
import { dirname, join } from 'path'

/**
 * イラストからツイートを検索 WebSocket API
 */
export class SearchTweet extends BaseWSRouter<
  SearchTweetRequest,
  SearchTweetResponse
> {
  validate(): boolean {
    // illust_idがあって、0以上の整数であること
    return !!this.data.illust_id && this.isVaildIllustId(this.data.illust_id)
  }

  async execute() {
    const pixiv = await loadPixiv()
    const illustDetail = await pixiv.getIllustDetail({
      illustId: this.data.illust_id,
    })
    if (illustDetail.status !== 200) {
      this.sendError('illust not found')
      return
    }
    const url = illustDetail.data.illust.image_urls.large
    const type = illustDetail.data.illust.type
    const path = await Pixiv.downloadImage(
      type,
      this.data.illust_id.toString(),
      url
    )

    // Pixiv.downloadImage が失敗した場合、パスの対象ファイルが存在しない場合がある
    if (!fs.existsSync(path)) {
      this.sendError('download failed')
      return
    }

    // イラスト説明欄 + プロフィール欄からTwitterアカウントを探す
    const screenNames = await this.getIllustScreenNames(
      pixiv,
      illustDetail.data.illust
    )

    // スクリーンネームは判明したので返す
    if (screenNames.length === 0) {
      this.send({
        responseType: 'error',
        message: 'screen name not found',
      })
      return
    }
    this.send({
      responseType: 'screen_names',
      screen_names: screenNames,
    })

    const postedAtRaw = illustDetail.data.illust.create_date
    const postedAt = new Date(postedAtRaw)

    screenNames.forEach((screenName) => {
      this.getTweets(screenName, postedAt, path)
    })
  }

  private async getTweets(
    screenName: string,
    postedAt: Date,
    imagePath: string
  ) {
    const tweetsBySearch = await this.searchTweets(screenName, postedAt)
    if (tweetsBySearch.length > 0) {
      tweetsBySearch.forEach((tweet) => {
        this.analysisTweet(tweet, imagePath)
      })
      return
    }

    // 検索APIでヒットしなかった場合、ユーザーのツイートから画像を探す
    const tweetsByUserTimeline = await this.huntingUserTweets(
      screenName,
      postedAt
    )
    if (tweetsByUserTimeline.length > 0) {
      tweetsByUserTimeline.forEach((tweet) => {
        this.analysisTweet(tweet, imagePath)
      })
      return
    }

    this.send({
      responseType: 'error',
      message: `@${screenName} tweet not found`,
    })
  }

  /**
   * ユーザーのツイートから画像ツイートを探す
   *
   * @param screenName スクリーンネーム
   * @param postedAt 投稿日時
   * @param imagePath 画像のパス
   * @returns ツイートの配列
   */
  private async huntingUserTweets(
    screenName: string,
    postedAt: Date
  ): Promise<SearchTweetObject[]> {
    const postedAtBefore3day = new Date(postedAt)
    postedAtBefore3day.setDate(postedAtBefore3day.getDate() - 3)
    const postedAtBefore3daySnowflake =
      this.dateToSnowflake(postedAtBefore3day).toString()
    const postedAtAfter3day = new Date(postedAt)
    postedAtAfter3day.setDate(postedAtAfter3day.getDate() + 3)
    const postedAtAfter3daySnowflake =
      this.dateToSnowflake(postedAtAfter3day).toString()

    const twitterApi = await loadTwitterApi(this.config, null)
    const response = await twitterApi.v1.get<StatusesUserTimelineResponse>(
      'statuses/user_timeline.json',
      {
        screen_name: screenName,
        count: 200,
        exclude_replies: true,
        include_rts: false,
        tweet_mode: 'extended',
        since_id: postedAtBefore3daySnowflake,
        max_id: postedAtAfter3daySnowflake,
      }
    )

    return this.filterMediaDuplication(
      response.flatMap((tweet) => this.getMedia(tweet))
    )
  }

  /**
   * Date を Twitter の Snowflake 形式に変換する
   *
   * @param date Date
   * @returns Snowflake
   */
  private dateToSnowflake(date: Date) {
    // https://pronama.jp/2015/02/18/generate-twitter-status-id/
    // timestamp を求め 22bit 上位へシフトする
    return (BigInt(date.getTime() - 1288834974657) << BigInt(22)).toString()
  }

  private async analysisTweet(tweet: SearchTweetObject, imagePath: string) {
    const tweetImagePath = await this.downloadImage(
      tweet.media_url,
      tweet.id,
      tweet.num
    )
    if (!tweetImagePath) {
      return
    }

    const similarity = await this.calculateSimilarity(imagePath, tweetImagePath)
    this.send({
      responseType: 'tweet',
      tweet: {
        tweet,
        similarity,
        identity: 'search',
      },
    })
  }

  /**
   * Twitterから画像をダウンロードする
   *
   * @param url 画像のURL
   * @param tweetId ツイート ID
   * @param imageNum 画像番号
   * @returns 画像のパス
   */
  private async downloadImage(url: string, tweetId: string, imageNum: number) {
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
    })
    if (res.status !== 200) {
      return null
    }
    const buffer = Buffer.from(res.data, 'binary')
    const path = join(PATH.TWEET_CACHE_DIR, `${tweetId}-${imageNum}.png`)
    fs.mkdirSync(dirname(path), { recursive: true })
    fs.writeFileSync(path, buffer)
    return path
  }

  /**
   * 画像の類似度を計算する。類似度計算には画像の差のパーセンテージと画像の異なるピクセル数を使用する。
   *
   * @param imagePath 画像のパス
   * @param tweetImagePath ツイート画像のパス
   * @returns 類似度 (0 ~ 1)
   */
  private async calculateSimilarity(imagePath: string, tweetImagePath: string) {
    // https://www.codedrome.com/comparing-images-node-jimp/

    // jimp で画像を読み込む
    const image = await jimp.read(imagePath)
    const tweetImage = await jimp.read(tweetImagePath)

    // 画像のサイズを揃える
    image.resize(tweetImage.getWidth(), tweetImage.getHeight())

    // 画像の差のパーセンテージを求める。0 が完全一致、1 が完全に異なる
    const diff = jimp.diff(image, tweetImage)
    // 画像の距離(異なるピクセル数)を求める。0 が完全一致、1 が完全に異なる
    const distance = jimp.distance(image, tweetImage)

    // 差分の割合を求める。画像差パーセンテージと距離の差を掛け合わせることで、双方の影響を受けるようにする
    return 1 - diff.percent * distance
  }

  /**
   * 検索APIで画像ツイートを探す
   *
   * @param screenName スクリーンネーム
   * @param postedAt 投稿日時
   * @returns ツイートの配列
   */
  private async searchTweets(
    screenName: string,
    postedAt: Date
  ): Promise<SearchTweetObject[]> {
    const postedAtBefore3day = new Date(postedAt)
    postedAtBefore3day.setDate(postedAtBefore3day.getDate() - 3)
    const postedAtAfter3day = new Date(postedAt)
    postedAtAfter3day.setDate(postedAtAfter3day.getDate() + 3)

    const searchWord = [
      `from:${screenName}`,
      'filter:images',
      `until:${postedAtAfter3day.toISOString().slice(0, 10)}`,
      `since:${postedAtBefore3day.toISOString().slice(0, 10)}`,
    ].join(' ')

    const twitterApi = await loadTwitterApi(this.config, null)
    // 3日間の間に100件以上ツイートしている場合は漏れてしまうので、今後検討
    const tweets = await twitterApi.v1.get<SearchTweetsResponse>(
      'search/tweets.json',
      {
        q: searchWord,
        result_type: 'recent',
        count: 100,
      }
    )

    return this.filterMediaDuplication(
      tweets.statuses.flatMap((tweet) => this.getMedia(tweet))
    )
  }

  private getMedia(tweet: Tweet): SearchTweetObject[] {
    if (!tweet.entities.media) {
      return []
    }
    // ツイートテキストは text か full_text に入っている
    const text = tweet.text || tweet.full_text
    if (!text) {
      return []
    }
    // RT は除外
    if (text.startsWith('RT @')) {
      return []
    }

    const tweets: SearchTweetObject[] = []

    const tweetId = tweet.id_str
    let num = -1
    for (const media of tweet.entities.media) {
      num++
      if (media.type !== 'photo') {
        continue
      }

      const mediaUrl = media.media_url

      tweets.push({
        id: tweetId,
        num,
        text,
        media_url: mediaUrl,
        user: {
          id: tweet.user.id_str,
          name: tweet.user.name,
          screen_name: tweet.user.screen_name,
          profile_image_url: tweet.user.profile_image_url_https,
        },
      })
    }

    return tweets
  }

  /**
   * 重複する画像を除外する
   *
   * @param results ツイート配列
   * @returns 重複を除外したツイート配列
   */
  private filterMediaDuplication(
    results: SearchTweetObject[]
  ): SearchTweetObject[] {
    return results.filter(
      (result, _, self) =>
        result &&
        self.filter((r) => r && r.media_url === result.media_url).length === 1
    )
  }

  /**
   * イラストからTwitterアカウントを探す
   *
   * @param pixiv Pixivインスタンス
   * @param illust イラスト情報
   * @returns Twitterスクリーンネームの配列
   */
  private async getIllustScreenNames(pixiv: Pixiv, illust: PixivIllustItem) {
    const screenNames = []

    // キャプションから探す
    const regexUrl = /twitter.com\/(\w+)/g
    const regexScreenName = /@(\w+)/g

    const caption = illust.caption
    screenNames.push(...this.getRegexMatches(regexUrl, caption))
    screenNames.push(...this.getRegexMatches(regexScreenName, caption))

    // プロフィールから探す
    const userDetail = await pixiv.getUserDetail({
      userId: illust.user.id,
    })
    if (userDetail.status === 200) {
      screenNames.push(userDetail.data.profile.twitter_account)
    }

    // 重複を削除
    return screenNames
      .filter((screenName) => !!screenName)
      .filter((screenName, index, self) => self.indexOf(screenName) === index)
  }

  /**
   * 正規表現にマッチした文字列を配列で返す
   *
   * @param regex 正規表現
   * @param text テキスト
   * @returns マッチした文字列の配列
   */
  private getRegexMatches(regex: RegExp, text: string) {
    const matches = []
    let match = regex.exec(text)
    while (match) {
      matches.push(match[1])
      match = regex.exec(text)
    }
    return matches
  }

  isVaildIllustId(rawIllustId: any) {
    return (
      !Number.isNaN(parseInt(rawIllustId, 10)) || parseInt(rawIllustId, 10) < 0
    )
  }
}

/**
 * シャドウバンされているかどうかを確認 WebSocket API
 */
export class CheckShadowBan extends BaseWSRouter<
  CheckShadowBanRequest,
  CheckShadowBanResponse
> {
  validate(): boolean {
    // screen_name が空でないこと
    return !!this.data.screen_name && this.data.screen_name.length > 0
  }

  async execute() {
    const url = 'https://taishin-miyamoto.com/ShadowBan/API/JSON'
    const result = await axios.get<ShadowBanResult>(url, {
      params: {
        screen_name: this.data.screen_name,
      },
    })
    if (result.status !== 200) {
      throw new Error('ShadowBan API Error')
    }
    this.send({
      result: result.data,
    })
  }
}

/**
 * ツイートをいいねしているかどうかを確認 WebSocket API
 */
export class GetTweetsLike extends BaseWSRouter<
  GetTweetsLikeRequest,
  GetTweetsLikeResponse
> {
  validate(): boolean {
    // account が空でないこと
    // tweet_ids が配列で、空でないこと
    return (
      !!this.data.account &&
      this.data.account.length > 0 &&
      !!this.data.tweet_ids &&
      Array.isArray(this.data.tweet_ids) &&
      this.data.tweet_ids.length > 0
    )
  }

  async execute() {
    const account = this.data.account
    const tweetIds = this.data.tweet_ids

    const twitterApi = await loadTwitterApi(this.config, account)
    const tweets = await twitterApi.v1.get<StatusLookupResponse>(
      'statuses/lookup.json',
      {
        id: tweetIds.join(','),
        include_entities: true,
      }
    )
    const results = tweets.map((tweet) => {
      return {
        id: tweet.id_str,
        liked: tweet.favorited,
      }
    })
    this.send({
      tweets: results,
    })
  }
}

/**
 * ツイートをいいねする WebSocket API
 */
export class AddTweetLike extends BaseWSRouter<
  AddTweetLikeRequest,
  AddTweetLikeResponse
> {
  validate(): boolean {
    // account が空でないこと
    // tweet_id が空でないこと
    return (
      !!this.data.account &&
      this.data.account.length > 0 &&
      !!this.data.tweet_id &&
      this.data.tweet_id.length > 0
    )
  }

  async execute() {
    const account = this.data.account
    const tweetId = this.data.tweet_id

    const twitterApi = await loadTwitterApi(this.config, account)
    await twitterApi.v1.post('favorites/create.json', {
      id: tweetId,
    })
    this.send({
      result: true,
    })
  }
}

/**
 * ツイートのいいねを解除する WebSocket API
 */
export class RemoveTweetLike extends BaseWSRouter<
  RemoveTweetLikeRequest,
  RemoveTweetLikeResponse
> {
  validate(): boolean {
    // account が空でないこと
    // tweet_id が空でないこと
    return (
      !!this.data.account &&
      this.data.account.length > 0 &&
      !!this.data.tweet_id &&
      this.data.tweet_id.length > 0
    )
  }

  async execute() {
    const account = this.data.account
    const tweetId = this.data.tweet_id

    const twitterApi = await loadTwitterApi(this.config, account)
    await twitterApi.v1.post('favorites/destroy.json', {
      id: tweetId,
    })
    this.send({
      result: true,
    })
  }
}
