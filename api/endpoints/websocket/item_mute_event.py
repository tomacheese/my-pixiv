import json
import os

from starlette.websockets import WebSocket

from api import ITEM_MUTES_FILE
from api.endpoints.websocket import clients


def get_mutes():
    if os.path.exists(ITEM_MUTES_FILE):
        with open(ITEM_MUTES_FILE, "r") as f:
            mutes = json.load(f)
    else:
        mutes = []

    return mutes


class GetItemMuteApi:
    @staticmethod
    async def execute(client: WebSocket, data: dict):
        mutes = get_mutes()
        await client.send_json({
            "status": True,
            "rid": data["rid"],
            "type": data["type"],
            "items": mutes
        })


class AddItemMuteApi:
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

        mutes = get_mutes()

        if any(x["type"] == item_type and x["id"] == item_id for x in mutes):
            return

        mutes.append({
            "type": item_type,
            "id": item_id
        })

        with open(ITEM_MUTES_FILE, "w") as f:
            json.dump(mutes, f)

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
                    "type": "shareAddItemMute",
                    "item": item
                })
            except RuntimeError:
                pass


class RemoveItemMuteApi:
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

        mutes = get_mutes()
        mutes = list(filter(lambda x: not (x["type"] == item_type and x["id"] == item_id), mutes))

        with open(ITEM_MUTES_FILE, "w") as f:
            json.dump(mutes, f)

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
                    "type": "shareRemoveItemMute",
                    "item": item
                })
            except RuntimeError:
                pass
