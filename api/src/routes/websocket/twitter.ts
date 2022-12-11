import { BaseWSRouter } from '@/base-ws-router'
import {
  AddTweetLikeRequest,
  AddTweetLikeResponse,
  CheckShadowBanRequest,
  CheckShadowBanResponse,
  GetTweetsLikeRequest,
  GetTweetsLikeResponse,
  RemoveTweetLikeRequest,
  RemoveTweetLikeResponse,
  SearchTweetRequest,
  SearchTweetResponse,
} from 'my-pixiv-types'

export class SearchTweet extends BaseWSRouter<
  SearchTweetRequest,
  SearchTweetResponse
> {
  validate(): boolean {
    return false
  }

  async execute() {
    console.log(this.data)
  }
}

export class CheckShadowBan extends BaseWSRouter<
  CheckShadowBanRequest,
  CheckShadowBanResponse
> {
  validate(): boolean {
    return false
  }

  async execute() {
    console.log(this.data)
  }
}

export class GetTweetsLike extends BaseWSRouter<
  GetTweetsLikeRequest,
  GetTweetsLikeResponse
> {
  validate(): boolean {
    return false
  }

  async execute() {
    console.log(this.data)
  }
}

export class AddTweetLike extends BaseWSRouter<
  AddTweetLikeRequest,
  AddTweetLikeResponse
> {
  validate(): boolean {
    return false
  }

  async execute() {
    console.log(this.data)
  }
}

export class RemoveTweetLike extends BaseWSRouter<
  RemoveTweetLikeRequest,
  RemoveTweetLikeResponse
> {
  validate(): boolean {
    return false
  }

  async execute() {
    console.log(this.data)
  }
}
