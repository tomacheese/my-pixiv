import json
import os
import re
import time
from datetime import datetime, timedelta
from pprint import pprint

import imagehash
import requests
import tweepy
from fastapi import HTTPException
from pixivpy3 import AppPixivAPI
from starlette.responses import FileResponse
from PIL import Image

TOKEN_FILE = os.environ.setdefault('PIXIVPY_TOKEN_FILE', '/data/token.json')
CONFIG_FILE = os.environ.setdefault('CONFIG_FILE', '/data/config.json')
ILLUST_CACHE_DIR = os.environ.setdefault('IMAGE_CACHE_DIR', '/cache/illusts/')
NOVEL_CACHE_DIR = os.environ.setdefault('NOVEL_CACHE_DIR', '/cache/novels/')
IMAGE_CACHE_DIR = os.environ.setdefault('IMAGE_CACHE_DIR', '/cache/images/')
TWEET_CACHE_DIR = os.environ.setdefault('TWEET_CACHE_DIR', '/cache/tweets/')


def init_twitter_api():
    if not os.path.exists(CONFIG_FILE):
        return None

    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        config = json.load(f)

    auth = tweepy.OAuthHandler(config["consumer_key"], config["consumer_secret"])
    return tweepy.API(auth)


def search_tweet(word: str):
    api = init_twitter_api()
    if api is None:
        return None
    return api.search_tweets(word, result_type="recent", count=100)


def init_pixiv_api():
    api = AppPixivAPI()

    if not os.path.exists(TOKEN_FILE):
        raise Exception('Token file not found')

    with open(TOKEN_FILE, 'r') as f:
        prev = json.load(f)
        token = api.auth(None, None, prev["refresh_token"])
    with open(TOKEN_FILE, "w", encoding="utf-8") as f:
        f.write(json.dumps(token))

    return api


def pixiv_download(url: str,
                   illust_id: str):
    path = os.path.join(IMAGE_CACHE_DIR, illust_id, url.split("/")[-1])
    os.makedirs(os.path.dirname(path), exist_ok=True)

    if os.path.exists(path):
        return path

    response = requests.get(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
                      "Chrome/80.0.3987.149 Safari/537.36",
        "Referer": "https://www.pixiv.net/"
    }, stream=True)

    with open(path, "wb") as f:
        for chunk in response.iter_content(chunk_size=1024):
            f.write(chunk)

    return path


def twi_img_download(url: str,
                     tweet_id: str,
                     num: int):

    os.makedirs(TWEET_CACHE_DIR, exist_ok=True)
    path = os.path.join(TWEET_CACHE_DIR, tweet_id + "-" + str(num) + ".png")

    if os.path.exists(path):
        return path

    response = requests.get(url, stream=True)
    with open(path, "wb") as f:
        for chunk in response.iter_content(chunk_size=1024):
            f.write(chunk)

    return path


def get_illusts(word: str):
    api = init_pixiv_api()
    # キャッシュ
    os.makedirs(ILLUST_CACHE_DIR, exist_ok=True)

    path = os.path.join(ILLUST_CACHE_DIR, word.replace(" ", "-") + ".json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            cache = json.load(f)
            # 1時間以内のキャッシュか
            if cache["updated_at"] > time.time() - 3600:
                return cache["items"]

    # とりあえず90件取得
    items = []
    for i in range(3):
        results = api.search_illust(word, offset=i * 30)
        if "illusts" not in results:
            raise HTTPException(status_code=500, detail="illusts not found (" + results["message"] + ")")
        items.extend(results["illusts"])

    with open(path, "w", encoding="utf-8") as f:
        f.write(json.dumps({"items": items, "updated_at": time.time()}))

    return items


def get_novels(word: str):
    api = init_pixiv_api()
    # キャッシュ
    os.makedirs(NOVEL_CACHE_DIR, exist_ok=True)

    path = os.path.join(NOVEL_CACHE_DIR, word.replace(" ", "-") + ".json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            cache = json.load(f)
            # 1時間以内のキャッシュか
            if cache["updated_at"] > time.time() - 3600:
                return cache["items"]

    # とりあえず90件取得
    items = []
    for i in range(3):
        results = api.search_novel(word, offset=i * 30)
        if "novels" not in results:
            print(results)
            raise HTTPException(status_code=500, detail="novels not found (" + results["message"] + ")")
        items.extend(results["novels"])

    with open(path, "w", encoding="utf-8") as f:
        f.write(json.dumps({"items": items, "updated_at": time.time()}))

    return items


def get_image(url: str,
              illust_id: str):
    path = pixiv_download(url, illust_id)
    return FileResponse(path, media_type="image/png")


def get_search_tweets(illust_id: str):
    pixiv_api = init_pixiv_api()

    result = pixiv_api.illust_detail(illust_id)
    if "illust" not in result:
        pprint(result)
        raise HTTPException(status_code=500, detail="illust not found (" + result["message"] + ")")
    illust_url = result["illust"]["image_urls"]["large"]

    # 画像をダウンロード
    path = pixiv_download(illust_url, illust_id)

    screen_names = get_illust_screen_names(pixiv_api, result["illust"])
    if len(screen_names) == 0:
        raise HTTPException(status_code=404, detail="screen_names not found")

    # create_date: 2022-08-21T04:48:53+09:00
    posted_at = result["illust"]["create_date"]
    posted_at = datetime.fromisoformat(posted_at)

    # ツイートを検索
    tweets = get_match_tweets(screen_names, posted_at, path)
    if len(tweets) == 0:
        raise HTTPException(status_code=404, detail="tweets not found")
    return {"screen_names": screen_names, "tweets": tweets}


def get_illust_screen_names(pixiv_api: AppPixivAPI,
                            illust) -> set[str]:
    # キャプションから探す
    regex_url = r"twitter.com/(\w+)"
    regex_screen_name = r"@(\w+)"

    screen_names = set()
    if re.search(regex_url, illust["caption"]):
        screen_names.add(re.search(regex_url, illust["caption"]).group(1))
    if re.search(regex_screen_name, illust["caption"]):
        screen_names.add(re.search(regex_screen_name, illust["caption"]).group(1))

    # ユーザーの情報から探す
    user_id = illust["user"]["id"]
    user = pixiv_api.user_detail(user_id)
    if "profile" in user:
        if "twitter_account" in user["profile"]:
            screen_names.add(user["profile"]["twitter_account"])

    return set(filter(lambda x: x != "", screen_names))


def get_match_tweets(screen_names: set[str],
                     posted_at: datetime,
                     image_path: str):
    # 投稿日の1日前
    posted_at_before_1day = posted_at - timedelta(days=1)
    posted_at_before_1day = posted_at_before_1day.date().isoformat()
    # 投稿日の1日後
    posted_at_after_1day = posted_at + timedelta(days=1)
    posted_at_after_1day = posted_at_after_1day.date().isoformat()

    rets = []

    for screen_name in screen_names:
        word = "from:{0} filter:images since:{1} until:{2} exclude:nativeretweets".format(screen_name,
                                                                                          posted_at_before_1day,
                                                                                          posted_at_after_1day)
        tweets = search_tweet(word)
        if not tweets:
            raise HTTPException(status_code=404, detail="tweets not found")
        for tweet in tweets:
            if "media" not in tweet.entities:
                continue
            for i in range(len(tweet.entities["media"])):
                media = tweet.entities["media"][i]
                if media["type"] != "photo":
                    continue

                media_url = media["media_url"]

                twi_img_path = twi_img_download(media_url, tweet.id_str, i)
                similarity = calc_image_similarity(image_path, twi_img_path)

                rets.append({"tweet": {
                    "id": tweet.id_str,
                    "text": tweet.text,
                    "media_url": media_url,
                    "user": {
                        "id": tweet.user.id_str,
                        "name": tweet.user.name,
                        "screen_name": tweet.user.screen_name,
                        "profile_image_url": tweet.user.profile_image_url
                    },
                }, "similarity": similarity})

    return rets


def calc_image_similarity(image_path: str,
                          tweet_image_path: str) -> float:
    print("image_path: " + image_path)
    print("tweet_image_path: " + tweet_image_path)
    hash_1a = imagehash.phash(Image.open(image_path))
    hash_2a = imagehash.phash(Image.open(tweet_image_path))

    return hash_2a-hash_1a
