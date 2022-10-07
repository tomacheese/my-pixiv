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
