/**
 * 配列から null を除外する
 *
 * @param array 配列
 * @returns null を除外した配列
 */
export function filterNull<T>(array: (T | null)[]): T[] {
  return array.filter((item) => !!item) as T[]
}

/**
 * 配列から undefined を除外する
 *
 * @param array 配列
 * @returns undefined を除外した配列
 */
export function filterUndefined<T>(array: (T | undefined)[]): T[] {
  return array.filter((item) => !!item) as T[]
}
