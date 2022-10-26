from starlette.websockets import WebSocket

clients: dict[str, WebSocket] = {}
