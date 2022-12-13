import fs from 'fs'
import { ItemMute, MuteTargetType } from 'my-pixiv-types'
import { PATH } from './utils'

type ItemMuteJsonSchema = ItemMute[]

/**
 * アイテムミュート API
 */
export class ItemMuteApi {
  private mutes: ItemMute[]
  private static cache: {
    mutes: ItemMute[]
    timestamp: number
  } | null = null

  private constructor(mutes: ItemMute[]) {
    this.mutes = mutes
  }

  /**
   * アイテムがミュート済みかどうかを返す
   *
   * @param type ミュートの対象種別
   * @param id アイテム ID
   * @returns ミュート済みなら true
   */
  isMuted(type: MuteTargetType, id: number): boolean {
    return this.mutes.some((mute) => mute.type === type && mute.id === id)
  }

  /**
   * アイテムをミュートする
   *
   * @param type ミュートの対象種別
   * @param id アイテム ID
   */
  add(type: MuteTargetType, id: number): void {
    if (this.isMuted(type, id)) {
      return
    }
    this.mutes.push({ type, id })

    this.save()
  }

  /**
   * アイテムのミュートを解除する
   *
   * @param type ミュートの対象種別
   * @param id アイテム ID
   */
  remove(type: MuteTargetType, id: number): void {
    this.mutes = this.mutes.filter(
      (mute) => !(mute.type === type && mute.id === id)
    )

    this.save()
  }

  /**
   * ミュート済みのアイテムを返す
   *
   * @returns ミュート済みのアイテム
   */
  get(): ItemMute[] {
    return this.mutes
  }

  /**
   * ミュート済みのアイテムを設定する
   *
   * @param mutes ミュート済みのアイテム
   */
  set(mutes: ItemMute[]): void {
    this.mutes = mutes

    this.save()
  }

  /**
   * すべてのミュートを解除する
   */
  clear(): void {
    this.mutes = []

    this.save()
  }

  /**
   * ミュート済みのアイテムを保存する
   */
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

  /**
   * インスタンスを生成する。インスタンスは1時間キャッシュされる。
   *
   * @returns インスタンス
   */
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
