Set-Location $PSScriptRoot
Set-Location ..

Start-Process -FilePath yarn -WorkingDirectory "view" -NoNewWindow -Wait
Start-Process -FilePath yarn -ArgumentList "dev" -WorkingDirectory "view" -NoNewWindow -Wait