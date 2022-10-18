import json
import os
import traceback

from fastapi import APIRouter
from starlette.websockets import WebSocket

from api import ITEM_MUTES_FILE

router = APIRouter(prefix="/itemMutes")
clients: dict[str, WebSocket] = {}


def add_mute(item_type: str, item_id: str):
    if os.path.exists(ITEM_MUTES_FILE):
        with open(ITEM_MUTES_FILE, "r") as f:
            data = json.load(f)
    else:
        data = []

    if any(x["type"] == item_type and x["id"] == item_id for x in data):
        return

    data.append({
        "type": item_type,
        "id": item_id
    })

    with open(ITEM_MUTES_FILE, "w") as f:
        json.dump(data, f)


def remove_mute(item_type: str, item_id: str):
    if os.path.exists(ITEM_MUTES_FILE):
        with open(ITEM_MUTES_FILE, "r") as f:
            data = json.load(f)
    else:
        data = []

    data = list(filter(lambda x: not (x["type"] == item_type and x["id"] == item_id), data))

    with open(ITEM_MUTES_FILE, "w") as f:
        json.dump(data, f)


def get_mutes():
    if os.path.exists(ITEM_MUTES_FILE):
        with open(ITEM_MUTES_FILE, "r") as f:
            data = json.load(f)
    else:
        data = []

    return data


async def action_add_mute(client: WebSocket, data: dict):
    key = client.headers.get('sec-websocket-key')
    # Check if the action is valid
    if "action" not in data or data["action"] != "add-mute":
        return

    # Check if the data is valid
    if "item" not in data:
        return
    if "type" not in data["item"]:
        return
    if "id" not in data["item"]:
        return

    add_mute(data["item"]["type"], data["item"]["id"])

    for index, client in clients.items():
        if index == key:
            continue

        await client.send_text(json.dumps({
            "action": "add-mute",
            "item": {
                "type": data["item"]["type"],
                "id": data["item"]["id"]
            }
        }))


async def action_remove_mute(client: WebSocket, data: dict):
    key = client.headers.get('sec-websocket-key')
    # Check if the action is valid
    if "action" not in data or data["action"] != "remove-mute":
        return

    # Check if the data is valid
    if "item" not in data:
        return
    if "type" not in data["item"]:
        return
    if "id" not in data["item"]:
        return

    remove_mute(data["item"]["type"], data["item"]["id"])

    for index, client in clients.items():
        if index == key:
            continue

        await client.send_text(json.dumps({
            "action": "remove-mute",
            "item": {
                "type": data["item"]["type"],
                "id": data["item"]["id"]
            }
        }))


async def action_get_all_mutes(client: WebSocket, data: dict):
    # Check if the action is valid
    if "action" not in data or data["action"] != "get-all-mutes":
        return

    await client.send_text(json.dumps({
        "action": "get-all-mutes",
        "items": get_mutes()
    }))


@router.websocket("")
async def ws_item_mutes(ws: WebSocket):
    await ws.accept()

    key = ws.headers.get('sec-websocket-key')
    clients[key] = ws
    print(f"{key} connected")
    try:
        while True:
            data = json.loads(await ws.receive_text())

            await action_add_mute(ws, data)
            await action_remove_mute(ws, data)
            await action_get_all_mutes(ws, data)
    except Exception as e:
        print(f"{key} disconnected")
        print(e)
        print(traceback.format_exc())
        del clients[key]
