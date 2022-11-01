/**
 * 作品の画像URL群
 *
 * 単一画像の場合、オリジナル画像へは MetaSinglePage.original_image_url から取得
 *
 * 画像へのアクセスは適切なリファラを付与する必要がある
 */
export interface ImageUrls {
  /** 360x360 */
  square_medium: string
  /** 長辺が最大 540px */
  medium: string
  /** 横幅が最大 600px, 縦幅が最大 1200px */
  large: string
  /**
   * オリジナル画像
   *
   * MetaPages.image_urls の場合のみ存在？
   */
  original?: string
}

/**
 * タグ情報
 */
export interface Tag {
  /** タグ名 */
  name: string

  /** 翻訳済みタグ名 */
  translated_name: null | string

  /** 投稿者によって追加されたタグかどうか */
  added_by_uploaded_user?: boolean
}

/**
 * プロフィール画像URL群
 */
export interface ProfileImageUrls {
  medium: string
}

/**
 * ユーザー情報
 */
export interface User {
  /** ユーザー内部 ID */
  id: number

  /** ユーザー名 */
  name: string

  /** pixiv ID (URLに使用) */
  account: string

  /** プロフィール画像URL群 */
  profile_image_urls: ProfileImageUrls

  /** フォローしているかどうか */
  is_followed: boolean
}

/**
 * シリーズ情報
 */
export interface Series {
  /** シリーズ ID */
  id: number

  /** シリーズ名 */
  title: string
}

export interface PixivNovelItem {
  /**
   * 作品 ID
   *
   * イラスト・小説それぞれでIDの振り方が異なり、重複するので注意。
   */
  id: number

  /**
   * 作品タイトル
   */
  title: string

  /**
   * キャプション（説明文）
   */
  caption: string

  /**
   * 公開範囲
   *
   * 詳細不明。0 が公開なのは確定
   */
  restrict: number

  /**
   * 年齢制限
   *
   * 0 が全年齢、1 が R-18、2 が R-18G
   */
  x_restrict: number

  /**
   * オリジナル作品かどうか
   */
  is_original: boolean

  /**
   * 作品の画像URL群
   *
   * 小説の場合は表紙の画像が入っている。
   */
  image_urls: ImageUrls

  /**
   * 投稿日時
   *
   * ISO 8601 形式。YYYY-MM-DD'T'HH:mm:ss+09:00
   */
  create_date: string

  /**
   * 作品タグ
   */
  tags: Tag[]

  /**
   * ページ数
   */
  page_count: number

  /**
   * 文字数
   */
  text_length: number

  /**
   * 作品投稿者情報
   */
  user: User

  /**
   * シリーズ情報
   *
   * 小説の場合、シリーズに属していない場合空配列が入っている。
   */
  series: Series | unknown[]

  /**
   * ブックマークしているかどうか
   */
  is_bookmarked: boolean

  /**
   * ブックマーク数
   */
  total_bookmarks: number

  /**
   * 閲覧数
   */
  total_view: number

  /**
   * 閲覧可能かどうか
   */
  visible: boolean

  /**
   * コメント数
   */
  total_comments: number

  /**
   * この作品をミュートしているかどうか
   */
  is_muted: boolean

  /**
   * マイピクへの公開限定にしているかどう
   */
  is_mypixiv_only: boolean

  /**
   * 不明 (公開制限をしているかどうか？)
   */
  is_x_restricted: boolean

  /**
   * AI使用フラグ
   *
   * 0: 未使用
   * 1: 補助的に使用
   * 2: 使用
   *
   * 2022/11/02時点で投稿画面に「補助的に使用」を選択できるUIは存在しないように見えるが、実際に 1 が入っている作品はある。
   *
   * @see https://www.pixiv.help/hc/ja/articles/11866194231577
   * @see https://github.com/ArkoClub/async-pixiv/blob/fa45c81093a5c6f4eabfcc942915fc479e42174f/src/async_pixiv/model/other.py#L40-L48
   */
  novel_ai_type: number
}
