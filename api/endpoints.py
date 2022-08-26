from fastapi import APIRouter

from api import get_image, get_pixiv, get_search_tweets, like_pixiv

router = APIRouter(prefix="/api")


@router.get("/")
def get_root():
    return {"message": "my-pixiv api"}


@router.get("/illust/{word}")
def get_illusts_req(word: str):
    return get_pixiv("illust", word)


@router.get("/like/illust/{item_id}")
def get_illusts_req(item_id: str):
    return like_pixiv("illust", item_id)


@router.get("/novel/{word}")
def get_novels_req(word: str):
    return get_pixiv("novel", word)


@router.get("/manga/{word}")
def get_novels_req(word: str):
    return get_pixiv("manga", word)


@router.get("/images/{illust_id}")
def get_image_req(illust_id: str, url: str):
    return get_image(url, illust_id)


@router.get("/tweet/{illust_id}")
def search_tweet(illust_id: str):
    return get_search_tweets(illust_id)
