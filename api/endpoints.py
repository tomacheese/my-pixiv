from fastapi import APIRouter

from fastapi import APIRouter

from api import get_illusts, get_image, get_novels, get_search_tweets

router = APIRouter(prefix="/api")


@router.get("/")
def get_root():
    return {"message": "my-pixiv api"}


@router.get("/illusts/{word}")
def get_illusts_req(word: str):
    return get_illusts(word)


@router.get("/novels/{word}")
def get_novels_req(word: str):
    return get_novels(word)


@router.get("/images/{illust_id}")
def get_image_req(illust_id: str, url: str):
    return get_image(url, illust_id)


@router.get("/tweet/{illust_id}")
def search_tweet(illust_id: str):
    return get_search_tweets(illust_id)
