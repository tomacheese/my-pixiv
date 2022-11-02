from starlette.websockets import WebSocket
from tweepy import HTTPException

from api import get_search_tweets, get_shadow_ban, init_twitter_api


class SearchTweetApi:
    @staticmethod
    async def execute(client: WebSocket,
                      data: dict):
        illust_id = data.get("illust_id")
        if illust_id is None:
            await client.send_json({
                "status": False,
                "rid": data["rid"],
                "type": data["type"],
                "message": "illust_id is required"
            })
            return

        result = await get_search_tweets(illust_id)
        if result is None:
            await client.send_json({
                "status": False,
                "rid": data["rid"],
                "type": data["type"],
                "message": "failed to search tweet"
            })
            return

        await client.send_json({
            "status": True,
            "rid": data["rid"],
            "type": data["type"],
            "screen_names": list(result["screen_names"]),
            "tweets": result["tweets"]
        })


class CheckShadowBanApi:
    @staticmethod
    async def execute(client: WebSocket,
                      data: dict):
        screen_name = data.get("screen_name")
        if screen_name is None:
            await client.send_json({
                "status": False,
                "rid": data["rid"],
                "type": data["type"],
                "message": "screen_name is required"
            })
            return

        result = get_shadow_ban(screen_name)
        if result is None:
            await client.send_json({
                "status": False,
                "rid": data["rid"],
                "type": data["type"],
                "message": "failed to check shadow ban"
            })
            return

        await client.send_json({
            "status": True,
            "rid": data["rid"],
            "type": data["type"],
            "result": result
        })


class GetTweetsLikeApi:
    @staticmethod
    async def execute(client: WebSocket,
                      data: dict):
        account = data.get("account")
        if account is None:
            await client.send_json({
                "status": False,
                "rid": data["rid"],
                "type": data["type"],
                "message": "account is required"
            })
            return
        tweet_ids = data.get("tweet_ids")
        if tweet_ids is None:
            await client.send_json({
                "status": False,
                "rid": data["rid"],
                "type": data["type"],
                "message": "tweet_ids is required"
            })
            return
        if not isinstance(tweet_ids, list):
            await client.send_json({
                "status": False,
                "rid": data["rid"],
                "type": data["type"],
                "message": "tweet_ids must be list"
            })
            return

        api = init_twitter_api(account)
        if api is None:
            await client.send_json({
                "status": False,
                "rid": data["rid"],
                "type": data["type"],
                "message": "failed to init twitter api"
            })
            return

        try:
            tweets = api.lookup_statuses(tweet_ids)
            results = list(map(lambda tweet: {
                "id": tweet.id_str,
                "liked": tweet.favorited
            }, tweets))

            await client.send_json({
                "status": True,
                "rid": data["rid"],
                "type": data["type"],
                "tweets": results
            })
        except HTTPException as e:
            message = str(list(map(
                lambda x: f"{x['code']} {x['message']}" if "code" in x and "message" in x else str(x),
                e.api_errors)))
            await client.send_json({
                "status": False,
                "rid": data["rid"],
                "type": data["type"],
                "message": message
            })


class AddTweetLikeApi:
    @staticmethod
    async def execute(client: WebSocket,
                      data: dict):
        account = data.get("account")
        if account is None:
            await client.send_json({
                "status": False,
                "rid": data["rid"],
                "type": data["type"],
                "message": "account is required"
            })
            return
        tweet_id = data.get("tweet_id")
        if tweet_id is None:
            await client.send_json({
                "status": False,
                "rid": data["rid"],
                "type": data["type"],
                "message": "tweet_id is required"
            })
            return

        api = init_twitter_api(account)
        if api is None:
            await client.send_json({
                "status": False,
                "rid": data["rid"],
                "type": data["type"],
                "message": "failed to init twitter api"
            })
            return

        try:
            api.create_favorite(tweet_id)

            await client.send_json({
                "status": True,
                "rid": data["rid"],
                "type": data["type"]
            })
        except HTTPException as e:
            message = str(list(map(
                lambda x: f"{x['code']} {x['message']}" if "code" in x and "message" in x else str(x),
                e.api_errors)))
            await client.send_json({
                "status": False,
                "rid": data["rid"],
                "type": data["type"],
                "message": message
            })


class RemoveTweetLikeApi:
    @staticmethod
    async def execute(client: WebSocket,
                      data: dict):
        account = data.get("account")
        if account is None:
            await client.send_json({
                "status": False,
                "rid": data["rid"],
                "type": data["type"],
                "message": "account is required"
            })
            return
        tweet_id = data.get("tweet_id")
        if tweet_id is None:
            await client.send_json({
                "status": False,
                "rid": data["rid"],
                "type": data["type"],
                "message": "tweet_id is required"
            })
            return

        api = init_twitter_api(account)
        if api is None:
            await client.send_json({
                "status": False,
                "rid": data["rid"],
                "type": data["type"],
                "message": "failed to init twitter api"
            })
            return

        try:
            api.destroy_favorite(tweet_id)

            await client.send_json({
                "status": True,
                "rid": data["rid"],
                "type": data["type"]
            })
        except HTTPException as e:
            message = str(list(map(
                lambda x: f"{x['code']} {x['message']}" if "code" in x and "message" in x else str(x),
                e.api_errors)))
            await client.send_json({
                "status": False,
                "rid": data["rid"],
                "type": data["type"],
                "message": message
            })
