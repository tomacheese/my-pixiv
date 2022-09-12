Set-Location $PSScriptRoot

Set-Location ..
venv\Scripts\activate
pip install -r requirements.txt

$env:PIXIVPY_TOKEN_FILE = "data/token.json"
$env:CONFIG_FILE = "data/config.json"
$env:VIEWED_FILE = "data/viewed.json"
$env:IMAGE_CACHE_DIR = "cache/illusts/"
$env:MANGA_CACHE_DIR = "cache/mangas/"
$env:NOVEL_CACHE_DIR = "cache/novels/"
$env:IMAGE_CACHE_DIR = "cache/images/"
$env:TWEET_CACHE_DIR = "cache/tweets/"

python -m uvicorn api.__main__:app --host=0.0.0.0 --port=8000 --reload