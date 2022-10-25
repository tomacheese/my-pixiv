from starlette.websockets import WebSocket

from api import get_pixiv_item, get_pixiv_recommended, like_pixiv, search_pixiv


class GetNovelApi:
    @staticmethod
    async def execute(client: WebSocket, data: dict):
        novel_id = data.get("novel_id")
        if novel_id is None:
            await client.send_json({
                "status": False,
                "type": data["type"],
                "message": "illust_id is required"
            })
            return

        item = get_pixiv_item("novel", novel_id)
        if item is None:
            await client.send_json({
                "status": False,
                "type": data["type"],
                "message": "novel not found"
            })
            return

        await client.send_json({
            "status": True,
            "type": data["type"],
            "item": item
        })


class SearchNovelApi:
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

        items = search_pixiv("novel", word)
        if items is None:
            await client.send_json({
                "status": False,
                "type": data["type"],
                "message": "novel not found"
            })
            return

        await client.send_json({
            "status": True,
            "type": data["type"],
            "items": items
        })


class RecommendedNovelApi:
    @staticmethod
    async def execute(client: WebSocket, data: dict):
        next_url = data.get("next_url")

        result = get_pixiv_recommended("novels", next_url)
        if "novels" not in result:
            await client.send_json({
                "status": False,
                "type": data["type"],
                "message": "novels not found"
            })
            return

        await client.send_json({
            "status": True,
            "type": data["type"],
            "items": result["novels"],
            "next_url": result["next_url"]
        })
