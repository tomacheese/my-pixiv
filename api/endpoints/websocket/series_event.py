from starlette.websockets import WebSocket

from api import get_pixiv_item


class GetNovelSeriesApi:
    @staticmethod
    async def execute(client: WebSocket, data: dict):
        series_id = data.get("series_id")
        if series_id is None:
            await client.send_json({
                "status": False,
                "rid": data["rid"],
                "type": data["type"],
                "message": "series_id is required"
            })
            return

        item = get_pixiv_item("novel_series", series_id)
        if item is None:
            await client.send_json({
                "status": False,
                "rid": data["rid"],
                "type": data["type"],
                "message": "illust not found"
            })
            return

        await client.send_json({
            "status": True,
            "rid": data["rid"],
            "type": data["type"],
            "item": item
        })
