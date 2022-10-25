import json
import traceback

from fastapi import APIRouter, HTTPException
from starlette.websockets import WebSocket

from api.endpoints.websocket import clients
from api.endpoints.websocket.illust_event import AddIllustLikeApi, GetIllustApi, RecommendedIllustApi, SearchIllustApi
from api.endpoints.websocket.manga_event import AddMangaLikeApi, GetMangaApi, RecommendedMangaApi, SearchMangaApi
from api.endpoints.websocket.novel_event import GetNovelApi, RecommendedNovelApi, SearchNovelApi
from api.endpoints.websocket.twitter_event import AddTweetLikeApi, CheckShadowBanApi, GetTweetLikeApi, \
    RemoveTweetLikeApi, SearchTweetApi
from api.endpoints.websocket.user_event import GetUserApi

router = APIRouter(prefix="/ws")

webSocketEndPoints = {
    "getIllust": GetIllustApi(),
    "searchIllust": SearchIllustApi(),
    "recommendedIllust": RecommendedIllustApi(),
    "addIllustLike": AddIllustLikeApi(),
    "getManga": GetMangaApi(),
    "searchManga": SearchMangaApi(),
    "recommendedManga": RecommendedMangaApi(),
    "addMangaLike": AddMangaLikeApi(),
    "getNovel": GetNovelApi(),
    "searchNovel": SearchNovelApi(),
    "recommendedNovel": RecommendedNovelApi(),
    "getUser": GetUserApi(),
    "searchTweet": SearchTweetApi(),
    "checkShadowBan": CheckShadowBanApi(),
    "getTweetLike": GetTweetLikeApi(),
    "addTweetLike": AddTweetLikeApi(),
    "removeTweetLike": RemoveTweetLikeApi(),
}


async def execute(ws: WebSocket, text: str):
    data_type = None
    try:
        data = json.loads(text)
        if "type" not in data:
            return

        data_type = data["type"]
        if data_type in webSocketEndPoints:
            await webSocketEndPoints[data_type].execute(ws, data)
        else:
            print(f"Unknown type: {data_type}")
            await ws.send_json({
                "type": "error",
                "status": False,
                "message": f"Unknown type: {data_type}"
            })
    except HTTPException as e:
        await ws.send_json({
            "status": False,
            "type": data_type,
            "code": e.status_code,
            "message": e.detail
        })


@router.websocket("")
async def on_websocket(ws: WebSocket):
    await ws.accept()

    key = ws.headers.get('sec-websocket-key')
    clients[key] = ws
    print(f"{key} connected")
    try:
        while True:
            await execute(ws, await ws.receive_text())
    except Exception as e:
        print(f"{key} disconnected")
        print(e)
        print(traceback.format_exc())
        await ws.send_json({
            "status": False,
            "type": "---ERROR---",
            "message": str(e)
        })
        del clients[key]
