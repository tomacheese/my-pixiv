import { openUrlScheme } from './utils'
import { accessorType } from '@/store'

/**
 * イラストを Pixiv アプリを開く。アプリがインストールされていない場合はブラウザで開く。
 *
 * @param $accessor Vuex アクセサー
 * @param illustId イラスト ID
 * @returns Promise
 */
export function openPixivIllust(
  $accessor: typeof accessorType,
  illustId: number
): Promise<void> {
  return openUrlScheme(
    `pixiv://illusts/${illustId}`,
    `https://www.pixiv.net/artworks/${illustId}`,
    $accessor.settings.appCheckTimeout
  )
}

/**
 * 小説を Pixiv アプリを開く。アプリがインストールされていない場合はブラウザで開く。
 *
 * @param $accessor Vuex アクセサー
 * @param novelId 小説 ID
 * @returns Promise
 */
export function openPixivNovel(
  $accessor: typeof accessorType,
  novelId: number
): Promise<void> {
  return openUrlScheme(
    `pixiv://novels/${novelId}`,
    `https://www.pixiv.net/novel/show.php?id=${novelId}`,
    $accessor.settings.appCheckTimeout
  )
}
