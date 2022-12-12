import fs from 'fs'
import { ItemMute, MuteTargetType } from 'my-pixiv-types'
import { PATH } from './utils'

type ItemMuteJsonSchema = ItemMute[]

export class ItemMuteApi {
  private mutes: ItemMute[]
  private static cache: {
    mutes: ItemMute[]
    timestamp: number
  } | null = null

  constructor(mutes: ItemMute[]) {
    this.mutes = mutes
  }

  isMuted(type: MuteTargetType, id: number): boolean {
    return this.mutes.some((mute) => mute.type === type && mute.id === id)
  }

  add(type: MuteTargetType, id: number): void {
    if (this.isMuted(type, id)) {
      return
    }
    this.mutes.push({ type, id })

    this.save()
  }

  remove(type: MuteTargetType, id: number): void {
    this.mutes = this.mutes.filter(
      (mute) => !(mute.type === type && mute.id === id)
    )

    this.save()
  }

  get(): ItemMute[] {
    return this.mutes
  }

  set(mutes: ItemMute[]): void {
    this.mutes = mutes

    this.save()
  }

  clear(): void {
    this.mutes = []

    this.save()
  }

  save(): void {
    fs.writeFileSync(
      PATH.ITEM_MUTES_FILE,
      JSON.stringify(this.mutes as ItemMuteJsonSchema)
    )

    ItemMuteApi.cache = {
      mutes: this.mutes,
      timestamp: Date.now(),
    }
  }

  public static of() {
    // 1時間キャッシュ
    if (
      !ItemMuteApi.cache ||
      Date.now() - ItemMuteApi.cache.timestamp > 1000 * 60 * 60
    ) {
      if (!fs.existsSync(PATH.ITEM_MUTES_FILE)) {
        return new ItemMuteApi([])
      }
      const mutes = JSON.parse(fs.readFileSync(PATH.ITEM_MUTES_FILE, 'utf8'))
      ItemMuteApi.cache = {
        mutes,
        timestamp: Date.now(),
      }
      return new ItemMuteApi(mutes)
    }

    return new ItemMuteApi(ItemMuteApi.cache.mutes)
  }
}
