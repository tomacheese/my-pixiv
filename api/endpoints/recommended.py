from fastapi import APIRouter

from api import get_pixiv_recommended, init_pixiv_api

router = APIRouter(prefix="/recommended")


@router.get("/illust")
def get_recommended_illusts_req():
    api = init_pixiv_api()
    return api.illust_recommended(content_type="illust")["illusts"]


@router.get("/novel")
def get_recommended_novels_req():
    return get_pixiv_recommended("novels")["novels"]
