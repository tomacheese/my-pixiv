from starlette.websockets import WebSocket

from api import get_pixiv_item, get_pixiv_recommended, like_pixiv, search_pixiv


class GetMangaApi:
    @staticmethod
    async def execute(client: WebSocket, data: dict):
        manga_id = data.get("manga_id")
        if manga_id is None:
            await client.send_json({
                "status": False,
                "type": data["type"],
                "message": "manga_id is required"
            })
            return

        item = get_pixiv_item("manga", manga_id)
        if item is None:
            await client.send_json({
                "status": False,
                "type": data["type"],
                "message": "manga not found"
            })
            return

        await client.send_json({
            "status": True,
            "type": data["type"],
            "item": item
        })


class SearchMangaApi:
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

        items = search_pixiv("manga", word)
        if items is None:
            await client.send_json({
                "status": False,
                "type": data["type"],
                "message": "manga not found"
            })
            return

        await client.send_json({
            "status": True,
            "type": data["type"],
            "items": items
        })


class RecommendedMangaApi:
    @staticmethod
    async def execute(client: WebSocket, data: dict):
        next_url = data.get("next_url")

        result = get_pixiv_recommended("manga", next_url)
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


class AddMangaLikeApi:
    @staticmethod
    async def execute(client: WebSocket, data: dict):
        manga_id = data.get("manga_id")
        if manga_id is None:
            await client.send_json({
                "status": False,
                "type": data["type"],
                "message": "item_id is required"
            })
            return

        result = like_pixiv("manga", manga_id)

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
