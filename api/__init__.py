import json
import os
import time

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
    # キャッシュ
    if not os.path.exists("/cache"):
        os.mkdir("/cache")
    if not os.path.exists("/cache/illusts"):
        os.mkdir("/cache/illusts")

    path = "/cache/illusts/" + word.replace(" ", "-") + ".json"
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            cache = json.load(f)
            # 1時間以内のキャッシュか
            if cache["updated_at"] > time.time() - 3600:
                return cache["items"]

    # とりあえず90件取得
    items = []
    for i in range(3):
        results = api.search_illust(word, offset=i*30)
        if "illusts" not in results:
            raise HTTPException(status_code=500)
        items.extend(results["illusts"])

    with open(path, "w", encoding="utf-8") as f:
        f.write(json.dumps({"items": items, "updated_at": time.time()}))

    return items


def get_novels(word: str):
    api = init_api()
    # キャッシュ
    if not os.path.exists("/cache"):
        os.mkdir("/cache")
    if not os.path.exists("/cache/novels"):
        os.mkdir("/cache/novels")

    path = "/cache/novels/" + word.replace(" ", "-") + ".json"
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            cache = json.load(f)
            # 1時間以内のキャッシュか
            if cache["updated_at"] > time.time() - 3600:
                return cache["items"]

    # とりあえず90件取得
    items = []
    for i in range(3):
        results = api.search_novel(word, offset=i*30)
        if "novels" not in results:
            print(results)
            raise HTTPException(status_code=500)
        items.extend(results["novels"])

    with open(path, "w", encoding="utf-8") as f:
        f.write(json.dumps({"items": items, "updated_at": time.time()}))

    return items
