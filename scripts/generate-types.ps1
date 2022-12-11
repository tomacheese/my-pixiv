Set-Location $PSScriptRoot
Set-Location ..

Start-Process -FilePath yarn -WorkingDirectory "types" -NoNewWindow -Wait
Start-Process -FilePath yarn -ArgumentList "generate" -WorkingDirectory "types" -NoNewWindow -Wait