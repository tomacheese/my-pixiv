import { spawn } from 'node:child_process'

export class Franc {
  private process
  constructor() {
    this.process = spawn('franc')
  }

  public run(text: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const stdoutHandler = (data: any) => {
        resolve(data.toString().trim())
        this.process.stdout.off('data', stdoutHandler)
        this.process.stderr.off('data', stderrHandler)
      }
      const stderrHandler = (data: any) => {
        reject(data.toString().trim())
        this.process.stdout.off('data', stdoutHandler)
        this.process.stderr.off('data', stderrHandler)
      }
      this.process.stdout.once('data', stdoutHandler)
      this.process.stderr.once('data', stderrHandler)
      this.process.stdin.write(text)
    })
  }

  public destroy() {
    this.process.kill()
  }
}
