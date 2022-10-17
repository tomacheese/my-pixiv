import json
import os
import traceback

from fastapi import APIRouter
from starlette.websockets import WebSocket

from api import GLOBAL_SETTING_FILE

router = APIRouter(prefix="/sync")
clients: dict[str, WebSocket] = {}


def get_settings():
    path = GLOBAL_SETTING_FILE
    if not os.path.exists(path):
        return None
    try:
        with open(path, "r") as f:
            return json.load(f)
    except:
        traceback.print_exc()
        return None


def save_settings(settings: dict):
    path = GLOBAL_SETTING_FILE
    with open(path, "w") as f:
        json.dump(settings, f)


async def action_get(client: WebSocket, data: dict):
    # Check if the action is valid
    if "action" not in data or data["action"] != "get":
        return

    await client.send_text(json.dumps({
        "action": "get",
        "value": get_settings()
    }))


async def action_put(client: WebSocket, data: dict):
    key = client.headers.get('sec-websocket-key')
    # Check if the action is valid
    if "action" not in data or data["action"] != "put":
        return

    # Check if the value is valid
    if "value" not in data:
        return

    # Server save
    settings = data["value"]
    save_settings(settings)

    send_count = 0
    for index, client in clients.items():
        if index == key:
            continue

        await client.send_text(json.dumps({
            "action": "put",
            "value": settings
        }))
        send_count += 1

    await client.send_text(json.dumps({
        "action": "put-sent",
        "value": send_count
    }))


async def action_patch(client: WebSocket, data: dict):
    key = client.headers.get('sec-websocket-key')
    # Check if the action is valid
    if "action" not in data or data["action"] != "patch":
        return

    # Check if the key and value is valid
    if "key" not in data:
        return
    if "value" not in data:
        return

    # Server save
    settings = get_settings()
    settings[data["key"]] = data["value"]
    save_settings(settings)

    send_count = 0
    for index, client in clients.items():
        if index == key:
            continue

        await client.send_text(json.dumps({
            "action": "patch",
            "key": data["key"],
            "value": data["value"]
        }))
        send_count += 1

    await client.send_text(json.dumps({
        "action": "patch-sent",
        "value": send_count
    }))


@router.websocket("")
async def ws_settings_sync(ws: WebSocket):
    await ws.accept()

    key = ws.headers.get('sec-websocket-key')
    clients[key] = ws
    print(f"{key} connected")
    try:
        while True:
            data = json.loads(await ws.receive_text())

            await action_get(ws, data)
            await action_put(ws, data)
            await action_patch(ws, data)
    except Exception as e:
        print(f"{key} disconnected")
        print(e)
        print(traceback.format_exc())
        del clients[key]
