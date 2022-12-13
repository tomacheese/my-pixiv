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
  SearchTweetResult,
  ShadowBanResult,
  StatusLookupResponse,
  Tweet,
  SearchTweetsResponse,
  StatusesUserTimelineResponse,
} from 'my-pixiv-types'
import fs from 'fs'
import { loadTwitterApi, PATH } from '@/utils/utils'
import axios from 'axios'
import { dirname, join } from 'path'
import jimp from 'jimp'

export class SearchTweet extends BaseWSRouter<
  SearchTweetRequest,
  SearchTweetResponse
> {
  validate(): boolean {
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

    const postedAtRaw = illustDetail.data.illust.create_date
    const postedAt = new Date(postedAtRaw)

    const tweets = await Promise.all(
      screenNames.map((screenName) =>
        this.getTweets(screenName, postedAt, path)
      )
    )

    this.send({
      screen_names: screenNames,
      tweets: tweets.flat(),
    })
  }

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

  private async getTweets(
    screenName: string,
    postedAt: Date,
    imagePath: string
  ) {
    const searchResults = await this.searchTweets(
      screenName,
      postedAt,
      imagePath
    )
    if (searchResults.length !== 0) {
      return searchResults
    }

    // 検索APIでヒットしなかった場合、ユーザーのツイートから画像を探す
    const userTweets = await this.huntingUserTweets(
      screenName,
      postedAt,
      imagePath
    )
    return userTweets
  }

  private async searchTweets(
    screenName: string,
    postedAt: Date,
    imagePath: string
  ): Promise<SearchTweetResult[]> {
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

    const promises = tweets.statuses.map((tweet) =>
      this.analysisTweet(tweet, imagePath, 'search')
    )
    const results = await Promise.all(promises)
    return this.sortSimilarity(
      this.filterMediaDuplication(
        this.filterNull(results.filter((result) => !!result).flat())
      )
    )
  }

  private async huntingUserTweets(
    screenName: string,
    postedAt: Date,
    imagePath: string
  ): Promise<SearchTweetResult[]> {
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

    const promises = response.map((tweet) =>
      this.analysisTweet(tweet, imagePath, 'user_timeline')
    )
    const results = await Promise.all(promises)
    return this.sortSimilarity(
      this.filterMediaDuplication(
        this.filterNull(results.filter((result) => !!result).flat())
      )
    )
  }

  private filterNull<T>(array: (T | null)[]): T[] {
    return array.filter((item) => !!item) as T[]
  }

  private filterMediaDuplication(
    results: SearchTweetResult[]
  ): SearchTweetResult[] {
    return results.filter(
      (result, _, self) =>
        result &&
        self.filter((r) => r && r.tweet.media_url === result.tweet.media_url)
          .length === 1
    )
  }

  private sortSimilarity(results: SearchTweetResult[]): SearchTweetResult[] {
    return results.sort((a, b) => {
      if (!a || !b) {
        return 0
      }
      return b.similarity - a.similarity
    })
  }

  private async analysisTweet(
    tweet: Tweet,
    imagePath: string,
    identity: 'search' | 'user_timeline'
  ): Promise<SearchTweetResult[] | null> {
    if (!tweet.entities.media) {
      return null
    }
    // ツイートテキストは text か full_text に入っている
    const text = tweet.text || tweet.full_text
    if (!text) {
      return null
    }
    // RT は除外
    if (text.startsWith('RT @')) {
      return null
    }

    const tweets: SearchTweetResult[] = []

    const tweetId = tweet.id_str
    let num = -1
    for (const media of tweet.entities.media) {
      num++
      if (media.type !== 'photo') {
        continue
      }

      const mediaUrl = media.media_url
      const path = await this.downloadImage(mediaUrl, tweetId, num)
      if (!path) {
        continue
      }

      const similarity = await this.calculateSimilarity(imagePath, path)

      tweets.push({
        tweet: {
          id: tweetId,
          text,
          media_url: mediaUrl,
          user: {
            id: tweet.user.id_str,
            name: tweet.user.name,
            screen_name: tweet.user.screen_name,
            profile_image_url: tweet.user.profile_image_url_https,
          },
        },
        similarity,
        identity,
      })
    }

    return tweets
  }

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

  private async calculateSimilarity(imagePath: string, tweetImagePath: string) {
    // https://www.codedrome.com/comparing-images-node-jimp/

    // jimp で画像を読み込む
    const image = await jimp.read(imagePath)
    const tweetImage = await jimp.read(tweetImagePath)

    // 画像の差のパーセンテージを求める。1 が完全一致、0 が完全に異なる
    const diff = jimp.diff(image, tweetImage)
    // 画像の距離(異なるビット数)を求める。0 が完全一致、1 が完全に異なる
    const distance = jimp.distance(image, tweetImage)

    // 差分の割合を求める。画像差パーセンテージと距離の差を掛け合わせることで、双方の影響を受けるようにする
    return diff.percent * (1 - distance)
  }

  private dateToSnowflake(date: Date) {
    // https://pronama.jp/2015/02/18/generate-twitter-status-id/
    // timestamp を求め 22bit 上位へシフトする
    return (BigInt(date.getTime() - 1288834974657) << BigInt(22)).toString()
  }

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

export class CheckShadowBan extends BaseWSRouter<
  CheckShadowBanRequest,
  CheckShadowBanResponse
> {
  validate(): boolean {
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

export class GetTweetsLike extends BaseWSRouter<
  GetTweetsLikeRequest,
  GetTweetsLikeResponse
> {
  validate(): boolean {
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
    const tweets = await twitterApi.get<StatusLookupResponse>(
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

export class AddTweetLike extends BaseWSRouter<
  AddTweetLikeRequest,
  AddTweetLikeResponse
> {
  validate(): boolean {
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
    await twitterApi.post('favorites/create.json', {
      id: tweetId,
    })
    this.send({
      result: true,
    })
  }
}

export class RemoveTweetLike extends BaseWSRouter<
  RemoveTweetLikeRequest,
  RemoveTweetLikeResponse
> {
  validate(): boolean {
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
    await twitterApi.post('favorites/destroy.json', {
      id: tweetId,
    })
    this.send({
      result: true,
    })
  }
}
