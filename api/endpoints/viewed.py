import json
import os
import traceback

from fastapi import APIRouter
from starlette.websockets import WebSocket

from api import VIEWED_FILE

router = APIRouter(prefix="/viewed")
clients: dict[str, WebSocket] = {}


def add_viewed(item_type: str, item_id: str):
    if os.path.exists(VIEWED_FILE):
        with open(VIEWED_FILE, "r") as f:
            data = json.load(f)
    else:
        data = {}

    if item_type not in data:
        data[item_type] = []
    if item_id not in data[item_type]:
        data[item_type].append(item_id)

    with open(VIEWED_FILE, "w") as f:
        json.dump(data, f)


def get_viewed(item_type: str):
    if os.path.exists(VIEWED_FILE):
        with open(VIEWED_FILE, "r") as f:
            data = json.load(f)
    else:
        data = {}

    if item_type not in data:
        return []
    return data[item_type]


async def action_add_viewed(client: WebSocket, data: dict):
    key = client.headers.get('sec-websocket-key')
    # Check if the action is valid
    if "action" not in data or data["action"] != "add-viewed":
        return

    # Check if the data is valid
    if "type" not in data or "itemId" not in data:
        return

    # Check if the data is for illust or novel
    if data["type"] == "illust":
        add_viewed("illust", data["itemId"])
    elif data["type"] == "novel":
        add_viewed("novel", data["itemId"])
    else:
        return

    for index, client in clients.items():
        if index == key:
            continue

        await client.send_text(json.dumps({
            "action": "add-viewed",
            "type": data["type"],
            "itemId": data["itemId"]
        }))


async def action_get_all_viewed(client: WebSocket, data: dict):
    # Check if the action is valid
    if "action" not in data or data["action"] != "get-all-viewed":
        return

    # Check if the data is valid
    if "type" not in data:
        return

    # Check if the data is for illust or novel
    if data["type"] == "illust":
        result = get_viewed("illust")
    elif data["type"] == "novel":
        result = get_viewed("novel")
    else:
        return

    await client.send_text(json.dumps({
        "action": "get-all-viewed",
        "type": data["type"],
        "itemIds": result
    }))


@router.websocket("")
async def ws_viewed(ws: WebSocket):
    await ws.accept()

    key = ws.headers.get('sec-websocket-key')
    clients[key] = ws
    print(f"{key} connected")
    try:
        while True:
            data = json.loads(await ws.receive_text())

            await action_add_viewed(ws, data)
            await action_get_all_viewed(ws, data)
    except Exception as e:
        print(f"{key} disconnected")
        print(e)
        print(traceback.format_exc())
        del clients[key]
