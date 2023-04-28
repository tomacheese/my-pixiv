import { AxiosResponse } from 'axios'
import fs from 'node:fs'

export class PixivSaver {
  public static execute(response: AxiosResponse) {
    const url = response.request.res.responseUrl
    const requestPath = new URL(url).pathname.replace(/^\//, '')
    const method = response.config.method
    const data = response.data

    const saveBaseDirectory = process.env.BASE_DIRECTORY || './data'
    const saveDirectory = `${saveBaseDirectory}/debug/${method}/${requestPath}`
    const saveRequestPath = `${saveDirectory}/${Date.now()}-req.json`
    const saveResponseBodyPath = `${saveDirectory}/${Date.now()}-resBody.json`
    const saveResponseHeadersPath = `${saveDirectory}/${Date.now()}-resHeaders.json`

    fs.mkdirSync(saveDirectory, { recursive: true })

    fs.writeFileSync(
      saveRequestPath,
      JSON.stringify({ url, requestPath, method, data }, null, 2)
    )
    fs.writeFileSync(
      saveResponseHeadersPath,
      JSON.stringify(
        {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        },
        null,
        2
      )
    )
    fs.writeFileSync(
      saveResponseBodyPath,
      JSON.stringify(response.data, null, 2)
    )
  }
}
