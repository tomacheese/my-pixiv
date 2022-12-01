from starlette.websockets import WebSocket

from api import get_pixiv_item


class PingPongApi:
    @staticmethod
    async def execute(client: WebSocket, data: dict):
        await client.send_json({
            "status": True,
            "rid": data["rid"],
            "type": data["type"],
            "message": "pong"
        })
