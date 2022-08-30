from fastapi import APIRouter

from api import get_search_tweets

router = APIRouter(prefix="/tweet")


@router.get("/{illust_id}")
def search_tweet(illust_id: str):
    return get_search_tweets(illust_id)
