import { openUrlScheme } from './utils'
import { accessorType } from '@/store'

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
