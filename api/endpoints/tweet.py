from fastapi import APIRouter

from api import get_search_tweets, get_shadow_ban

router = APIRouter(prefix="/tweet")


@router.get("/search/{illust_id}")
async def search_tweet(illust_id: str):
    return await get_search_tweets(illust_id)


@router.get("/shadow-ban/{screen_name}")
def shadow_ban(screen_name: str):
    return get_shadow_ban(screen_name)
