import os.path

import requests
from fastapi import APIRouter
from starlette.responses import FileResponse, StreamingResponse

from api import get_illusts, get_novels

router = APIRouter(prefix="/api")


@router.get("/")
def get_root():
    return {"message": "my-pixiv api"}


@router.get("/illusts/{word}")
def get_illusts_req(word: str):
    return get_illusts(word)


@router.get("/novels/{word}")
def get_novels_req(word: str):
    return get_novels(word)


@router.get("/images")
def get_image(url: str):
    response = requests.get(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
                      "Chrome/80.0.3987.149 Safari/537.36",
        "Referer": "https://www.pixiv.net/"
    }, stream=True)

    if not os.path.exists("/cache"):
        os.mkdir("/cache")

    path = "/cache/" + url.split("/")[-1]
    if not os.path.exists(path):
        with open(path, "wb") as f:
            for chunk in response.iter_content(chunk_size=1024):
                f.write(chunk)

    return FileResponse(path, media_type="image/png")
