import json
import traceback

from fastapi import APIRouter, Depends, HTTPException
from starlette.websockets import WebSocket

from api import get_hashed_password, sha512
from api.endpoints.websocket import clients
from api.endpoints.websocket.illust_event import AddIllustLikeApi, GetIllustApi, RecommendedIllustApi, SearchIllustApi
from api.endpoints.websocket.item_mute_event import AddItemMuteApi, GetItemMuteApi, RemoveItemMuteApi
from api.endpoints.websocket.manga_event import AddMangaLikeApi, GetMangaApi, RecommendedMangaApi, SearchMangaApi
from api.endpoints.websocket.novel_event import GetNovelApi, RecommendedNovelApi, SearchNovelApi
from api.endpoints.websocket.series_event import GetNovelSeriesApi
from api.endpoints.websocket.twitter_event import AddTweetLikeApi, CheckShadowBanApi, GetTweetsLikeApi, \
    RemoveTweetLikeApi, SearchTweetApi
from api.endpoints.websocket.user_event import GetUserApi
from api.endpoints.websocket.viewed_event import AddViewedApi, GetViewedApi

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
    "getNovelSeries": GetNovelSeriesApi(),
    "getUser": GetUserApi(),
    "searchTweet": SearchTweetApi(),
    "checkShadowBan": CheckShadowBanApi(),
    "getTweetsLike": GetTweetsLikeApi(),
    "addTweetLike": AddTweetLikeApi(),
    "removeTweetLike": RemoveTweetLikeApi(),
    "getViewed": GetViewedApi(),
    "addViewed": AddViewedApi(),
    "getItemMute": GetItemMuteApi(),
    "addItemMute": AddItemMuteApi(),
    "removeItemMute": RemoveItemMuteApi(),
}


async def execute(ws: WebSocket, text: str):
    data = None
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
                "rid": data["rid"],
                "status": False,
                "message": f"Unknown type: {data_type}"
            })
    except HTTPException as e:
        await ws.send_json({
            "status": False,
            "rid": data["rid"] if data is not None and "rid" in data else None,
            "type": data_type,
            "code": e.status_code,
            "message": e.detail
        })
    except Exception as e:
        traceback.print_exc()
        await ws.send_json({
            "status": False,
            "rid": data["rid"] if data is not None and "rid" in data else None,
            "type": data_type,
            "message": str(e)
        })


@router.websocket("")
async def on_websocket(ws: WebSocket):
    protocol = ws.headers.get("sec-websocket-protocol")
    await ws.accept(protocol)

    # 認証フェーズ
    hashed_password = get_hashed_password()
    if hashed_password is not None:
        if protocol is None:
            await ws.close(1002, "Protocol required")
            return
        if sha512(protocol) != hashed_password:
            await ws.close(1002, "Invalid password")
            return

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
