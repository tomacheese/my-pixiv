from fastapi import APIRouter, HTTPException

from api import init_twitter_api, like_pixiv

router = APIRouter(prefix="/like")


@router.get("/illust/{item_id}")
def get_illusts_req(item_id: str):
    return like_pixiv("illust", item_id)


@router.get("/{account}/{tweet_id}")
def get_like(account: str, tweet_id: str):
    api = init_twitter_api(account)
    if api is None:
        raise HTTPException(status_code=404, detail="account not found")

    tweet = api.get_status(tweet_id)
    if tweet is None:
        raise HTTPException(status_code=404, detail="tweet not found")

    return {
        "liked": tweet.favorited,
    }


@router.post("/{account}/{tweet_id}")
def post_like(account: str, tweet_id: str):
    api = init_twitter_api(account)
    if api is None:
        raise HTTPException(status_code=404, detail="account not found")

    api.create_favorite(tweet_id)


@router.delete("/{account}/{tweet_id}")
def delete_like(account: str, tweet_id: str):
    api = init_twitter_api(account)
    if api is None:
        raise HTTPException(status_code=404, detail="account not found")

    api.destroy_favorite(tweet_id)
