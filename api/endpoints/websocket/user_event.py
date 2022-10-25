from starlette.websockets import WebSocket

from api import get_pixiv_item


class GetUserApi:
    @staticmethod
    async def execute(client: WebSocket, data: dict):
        user_id = data.get("user_id")
        if user_id is None:
            await client.send_json({
                "status": False,
                "type": data["type"],
                "message": "user_id is required"
            })
            return

        item = get_pixiv_item("user", user_id)
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
