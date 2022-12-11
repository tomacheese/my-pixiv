import { BaseWSRouter } from '@/base-ws-router'
import { GetUserRequest, GetUserResponse } from 'my-pixiv-types'

export class GetUser extends BaseWSRouter<GetUserRequest, GetUserResponse> {
  validate(): boolean {
    return false
  }

  async execute() {
    console.log(this.data)
  }
}
