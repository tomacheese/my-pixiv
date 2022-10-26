import json
import os

from starlette.websockets import WebSocket

from api import VIEWED_FILE
from api.endpoints.websocket import clients


def get_viewed(item_type: str):
    if os.path.exists(VIEWED_FILE):
        with open(VIEWED_FILE, "r") as f:
            data = json.load(f)
    else:
        data = {}

    if item_type not in data:
        return []
    return data[item_type]


def add_viewed(item_type: str, item_id: str):
    if os.path.exists(VIEWED_FILE):
        with open(VIEWED_FILE, "r") as f:
            data = json.load(f)
    else:
        data = {}

    if item_type not in data:
        data[item_type] = []

    if item_id in data[item_type]:
        return

    data[item_type].append(item_id)

    with open(VIEWED_FILE, "w") as f:
        json.dump(data, f)


class GetViewedApi:
    @staticmethod
    async def execute(client: WebSocket, data: dict):
        item_type = data.get("item_type")
        if item_type is None:
            await client.send_json({
                "status": False,
                "rid": data["rid"],
                "type": data["type"],
                "message": "type is required"
            })
            return
        viewed = get_viewed(item_type)
        await client.send_json({
            "status": True,
            "rid": data["rid"],
            "type": data["type"],
            "item_ids": viewed
        })


class AddViewedApi:
    @staticmethod
    async def execute(client: WebSocket, data: dict):
        item = data.get("item")
        if item is None:
            await client.send_json({
                "status": False,
                "rid": data["rid"],
                "type": data["type"],
                "message": "item is required"
            })
            return

        item_type = item.get("type")
        item_id = item.get("id")
        if item_type is None or item_id is None:
            await client.send_json({
                "status": False,
                "rid": data["rid"],
                "type": data["type"],
                "message": "item.type and item.id is required"
            })
            return

        add_viewed(item_type, item_id)

        await client.send_json({
            "status": True,
            "rid": data["rid"],
            "type": data["type"]
        })

        for index, c in clients.items():
            if index == client.headers.get('sec-websocket-key'):
                continue
            try:
                await c.send_json({
                    "status": True,
                    "rid": data["rid"],
                    "type": "shareAddViewed",
                    "item": item
                })
            except RuntimeError:
                pass
