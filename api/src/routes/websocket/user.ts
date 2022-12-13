import { BaseWSRouter } from '@/base-ws-router'
import { PATH } from '@/utils/utils'
import { GetUserRequest, GetUserResponse, PixivUserItem } from 'my-pixiv-types'
import { dirname, join } from 'path'
import fs from 'fs'
import { loadPixiv } from '@/pixiv/pixiv'

interface CacheGetUser {
  timestamp: number
  data: PixivUserItem
}

export class GetUser extends BaseWSRouter<GetUserRequest, GetUserResponse> {
  validate(): boolean {
    return !!this.data.user_id && this.isVaildUserId(this.data.user_id)
  }

  async execute() {
    const pixiv = await loadPixiv()

    const userId = this.data.user_id

    // キャッシュの存在確認、1時間以内ならキャッシュを返す
    const cachePath = this.getCachePath()
    if (fs.existsSync(cachePath)) {
      const cache: CacheGetUser = JSON.parse(
        fs.readFileSync(cachePath, 'utf-8')
      )
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
    return !Number.isNaN(parseInt(rawUserId, 10)) || parseInt(rawUserId, 10) < 0
  }
}
