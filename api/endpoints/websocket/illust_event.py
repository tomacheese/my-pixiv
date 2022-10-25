from starlette.websockets import WebSocket

from api import get_pixiv_item, get_pixiv_recommended, like_pixiv, search_pixiv


class GetIllustApi:
    @staticmethod
    async def execute(client: WebSocket, data: dict):
        illust_id = data.get("illust_id")
        if illust_id is None:
            await client.send_json({
                "status": False,
                "type": data["type"],
                "message": "illust_id is required"
            })
            return

        item = get_pixiv_item("illust", illust_id)
        if item is None:
            await client.send_json({
                "status": False,
                "type": data["type"],
                "message": "illust not found"
            })
            return

        await client.send_json({
            "status": True,
            "type": data["type"],
            "item": item
        })


class SearchIllustApi:
    @staticmethod
    async def execute(client: WebSocket, data: dict):
        word = data.get("word")
        if word is None:
            await client.send_json({
                "status": False,
                "type": data["type"],
                "message": "word is required"
            })
            return

        items = search_pixiv("illust", word)
        if items is None:
            await client.send_json({
                "status": False,
                "type": data["type"],
                "message": "illust not found"
            })
            return

        await client.send_json({
            "status": True,
            "type": data["type"],
            "items": items
        })


class RecommendedIllustApi:
    @staticmethod
    async def execute(client: WebSocket, data: dict):
        next_url = data.get("next_url")

        result = get_pixiv_recommended("illusts", next_url)
        if "illusts" not in result:
            await client.send_json({
                "status": False,
                "type": data["type"],
                "message": "illusts not found"
            })
            return

        await client.send_json({
            "status": True,
            "type": data["type"],
            "items": result["illusts"],
            "next_url": result["next_url"]
        })


class AddIllustLikeApi:
    @staticmethod
    async def execute(client: WebSocket, data: dict):
        illust_id = data.get("illust_id")
        if illust_id is None:
            await client.send_json({
                "status": False,
                "type": data["type"],
                "message": "item_id is required"
            })
            return

        result = like_pixiv("illust", illust_id)

        if "error" in result:
            await client.send_json({
                "status": False,
                "type": data["type"],
                "message": result["error"]["user_message"]
            })
            return

        await client.send_json({
            "status": True,
            "type": data["type"]
        })
