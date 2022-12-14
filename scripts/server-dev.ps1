$ErrorActionPreference = "stop"

Set-Location $PSScriptRoot
Set-Location ..

. .\scripts\env.ps1

Start-Process -FilePath yarn -ArgumentList "dev" -WorkingDirectory "api" -NoNewWindow -Wait