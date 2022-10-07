import { openUrlScheme } from './utils'
import { accessorType } from '@/store'

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
