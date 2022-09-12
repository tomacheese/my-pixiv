from fastapi import APIRouter

from api import get_pixiv_recommended

router = APIRouter(prefix="/recommended")


@router.get("/illust")
def get_recommended_illusts_req():
    return get_pixiv_recommended("illusts")["illusts"]


@router.get("/novel")
def get_recommended_novels_req():
    return get_pixiv_recommended("novels")["novels"]
