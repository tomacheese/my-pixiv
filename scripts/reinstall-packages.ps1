$ErrorActionPreference = "stop"

Set-Location $PSScriptRoot
Set-Location ..

Get-ChildItem */node_modules | Remove-Item -Force -Recurse -Verbose -ErrorAction Stop
Start-Process -FilePath yarn -ArgumentList install -NoNewWindow -Wait