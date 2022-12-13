$ErrorActionPreference = "stop"

Set-Location $PSScriptRoot
Set-Location ..

. .\scripts\env.ps1

$args = "workspace my-pixiv-api run test"
Start-Process -FilePath yarn -ArgumentList $args -NoNewWindow -Wait
