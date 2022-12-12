$ErrorActionPreference = "stop"

Set-Location $PSScriptRoot
Set-Location ..

. .\scripts\env.ps1

Start-Process -FilePath yarn -WorkingDirectory "api" -NoNewWindow -Wait
Start-Process -FilePath yarn -ArgumentList "build-test" -WorkingDirectory "api" -NoNewWindow -Wait