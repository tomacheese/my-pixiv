import { openUrlScheme } from './utils'
import { accessorType } from '@/store'

/**
 * ツイートを Twitter アプリを開く。アプリがインストールされていない場合はブラウザで開く。
 *
 * @param $accessor Vuex アクセサー
 * @param screenName ユーザー名
 * @param tweetId ツイート ID
 * @returns Promise
 */
export function openTwitterTweet(
  $accessor: typeof accessorType,
  screenName: string,
  tweetId: string
): Promise<void> {
  return openUrlScheme(
    `twitter://status?id=${tweetId}`,
    `https://twitter.com/${screenName}/status/${tweetId}`,
    $accessor.settings.appCheckTimeout
  )
}

/**
 * ユーザーを Twitter アプリを開く。アプリがインストールされていない場合はブラウザで開く。
 *
 * @param $accessor Vuex アクセサー
 * @param screenName ユーザー名
 * @returns Promise
 */
export function openTwitterUser(
  $accessor: typeof accessorType,
  screenName: string
): Promise<void> {
  return openUrlScheme(
    `twitter://user?screen_name=${screenName}`,
    `https://twitter.com/${screenName}`,
    $accessor.settings.appCheckTimeout
  )
}
