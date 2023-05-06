import { BaseWSRouter } from '@/base-ws-router'
import { PATH } from '@/utils/utils'
import { GetUserRequest, GetUserResponse, PixivUserItem } from 'my-pixiv-types'
import { dirname, join } from 'node:path'
import fs from 'node:fs'
import { loadSearchPixiv } from '@/pixiv/pixiv'

/**
 * ユーザーキャッシュモデル
 */
interface CacheGetUser {
  timestamp: number
  data: PixivUserItem
}

/**
 * ユーザー詳細取得 WebSocket API
 *
 * 結果は1時間キャッシュする。
 */
export class GetUser extends BaseWSRouter<GetUserRequest, GetUserResponse> {
  validate(): boolean {
    // user_idが存在し、数値かつ0以上であること
    return !!this.data.user_id && this.isVaildUserId(this.data.user_id)
  }

  async execute() {
    const pixiv = await loadSearchPixiv()

    const userId = this.data.user_id

    // キャッシュの存在確認、1時間以内ならキャッシュを返す
    const cachePath = this.getCachePath()
    if (fs.existsSync(cachePath)) {
      const cache: CacheGetUser = JSON.parse(fs.readFileSync(cachePath, 'utf8'))
      if (cache.timestamp + 3600 * 1000 > Date.now()) {
        this.send(cache.data)
        return
      }
    }

    // キャッシュがないか、古い場合はAPIから取得
    const userDetail = await pixiv.getUserDetail({
      userId,
    })

    if (userDetail.status !== 200) {
      this.sendError('user not found')
      return
    }

    const data = userDetail.data.user

    // キャッシュを保存
    const cache: CacheGetUser = {
      timestamp: Date.now(),
      data,
    }
    fs.mkdirSync(dirname(cachePath), { recursive: true })
    fs.writeFileSync(cachePath, JSON.stringify(cache))

    this.send(data)
  }

  getCachePath() {
    return join(PATH.USER_CACHE_DIR, 'items', this.data.user_id + '.json')
  }

  isVaildUserId(rawUserId: any) {
    return (
      !Number.isNaN(Number.parseInt(rawUserId, 10)) ||
      Number.parseInt(rawUserId, 10) < 0
    )
  }
}
