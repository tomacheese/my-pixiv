/**
 * URLスキームを開く。指定したタイムアウトまでに開けなかった場合は Web URL を開く。
 *
 * @param schemeUrl URLスキーム
 * @param webUrl Web URL
 * @param timeout タイムアウト時間
 * @returns Promise
 */
export function openUrlScheme(
  schemeUrl: string,
  webUrl: string,
  timeout: number
): Promise<void> {
  if (!window) {
    return Promise.resolve()
  }
  return new Promise<void>((resolve) => {
    let change = false
    setTimeout(() => {
      if (!change) {
        window.open(webUrl, '_blank')
      }
      resolve()
    }, timeout)
    window.location.href = schemeUrl
    window.onblur = function () {
      change = true
    }
    window.onfocus = function () {
      change = false
    }
  })
}
