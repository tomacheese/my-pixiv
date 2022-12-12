import fs from 'fs'
import { ViewedItem } from 'my-pixiv-types'
import { PATH } from './utils/utils'

interface OldViewed {
  illust: number[]
  novel: number[]
}

type ViewedJson = OldViewed | ViewedItem[]

const isOldViewed = (json: ViewedJson): json is OldViewed => {
  return (
    (json as OldViewed).illust !== undefined &&
    (json as OldViewed).novel !== undefined
  )
}

export function migrateViewed() {
  console.log('migrateViewed()')
  const path = PATH.VIEWED_FILE
  if (!fs.existsSync(path)) {
    return
  }
  const json = JSON.parse(fs.readFileSync(path, 'utf8'))
  if (!isOldViewed(json)) {
    return
  }
  console.warn('既読情報ファイルのマイグレーションを開始します。')
  const vieweds: ViewedItem[] = [
    ...json.illust.map((illustId) => {
      return {
        type: 'illust',
        id: illustId,
        addedAt: new Date().toISOString(),
      } as ViewedItem
    }),
    ...json.novel.map((novelId) => {
      return {
        type: 'novel',
        id: novelId,
        addedAt: new Date().toISOString(),
      } as ViewedItem
    }),
  ]
  fs.writeFileSync(path, JSON.stringify(vieweds))
  console.warn('既読情報ファイルのマイグレーションが完了しました。')
}
