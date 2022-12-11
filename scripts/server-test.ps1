$ErrorActionPreference = "stop"

Set-Location $PSScriptRoot
Set-Location ..

$env:PIXIVPY_TOKEN_FILE = "../data/token.json"
$env:CONFIG_FILE = "../data/config.json"
$env:VIEWED_FILE = "../data/viewed.json"
$env:ITEM_MUTES_FILE = "../data/item_mutes.json"
$env:IMAGE_CACHE_DIR = "../cache/images/"
$env:ILLUST_CACHE_DIR = "../cache/illusts/"
$env:MANGA_CACHE_DIR = "../cache/mangas/"
$env:NOVEL_CACHE_DIR = "../cache/novels/"
$env:USER_CACHE_DIR = "../cache/users/"
$env:IMAGE_CACHE_DIR = "../cache/images/"
$env:TWEET_CACHE_DIR = "../cache/tweets/"
$env:SHADOW_BAN_CACHE_DIR = "../cache/shadow_bans/"

Start-Process -FilePath yarn -WorkingDirectory "api" -NoNewWindow -Wait
Start-Process -FilePath yarn -ArgumentList "build-test" -WorkingDirectory "api" -NoNewWindow -Wait