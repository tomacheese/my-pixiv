import json
import os
import traceback

from fastapi import APIRouter
from starlette.websockets import WebSocket

router = APIRouter(prefix="/settings-sync")
clients: dict[str, WebSocket] = {}


async def action_sync(client: WebSocket, data: dict):
    key = client.headers.get('sec-websocket-key')
    # Check if the action is valid
    if "action" not in data or data["action"] != "sync":
        return

    # Check if the data is valid
    if "data" not in data:
        return

    send_count = 0
    for index, client in clients.items():
        if index == key:
            continue

        await client.send_text(json.dumps({
            "action": "sync",
            "data": data["data"]
        }))
        send_count += 1

    await client.send_text(json.dumps({
        "action": "synced",
        "data": send_count
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

            await action_sync(ws, data)
    except Exception as e:
        print(f"{key} disconnected")
        print(e)
        print(traceback.format_exc())
        del clients[key]
