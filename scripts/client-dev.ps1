Set-Location $PSScriptRoot
Set-Location ..

Start-Process -FilePath yarn -ArgumentList "dev" -WorkingDirectory "view" -NoNewWindow -Wait