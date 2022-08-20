import json
import os

from fastapi import HTTPException
from pixivpy3 import AppPixivAPI

TOKEN_FILE = os.environ.setdefault('PIXIVPY_TOKEN_FILE', '/data/token.json')


def init_api():
    api = AppPixivAPI()

    if not os.path.exists(TOKEN_FILE):
        raise Exception('Token file not found')

    with open(TOKEN_FILE, 'r') as f:
        prev = json.load(f)
        token = api.auth(None, None, prev["refresh_token"])
    with open(TOKEN_FILE, "w", encoding="utf-8") as f:
        f.write(json.dumps(token))

    return api


def get_illusts(word: str):
    api = init_api()
    # とりあえず90件取得
    items = []
    for i in range(3):
        results = api.search_illust(word, offset=i*30)
        if "illusts" not in results:
            print(results)
            raise HTTPException(status_code=500)
        items.extend(results["illusts"])
    return items


def get_novels(word: str):
    api = init_api()
    # とりあえず90件取得
    items = []
    for i in range(3):
        results = api.search_novel(word, offset=i*30)
        if "novels" not in results:
            print(results)
            raise HTTPException(status_code=500)
        items.extend(results["novels"])
    return items
