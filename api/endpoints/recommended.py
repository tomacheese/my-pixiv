from fastapi import APIRouter

from api import get_pixiv_recommended

router = APIRouter(prefix="/recommended")


@router.get("/illust")
def get_recommended_illusts_req():
    result = get_pixiv_recommended("illusts")
    result["data"] = result["illusts"]
    del result["illusts"]
    return result


@router.get("/novel")
def get_recommended_novels_req():
    result = get_pixiv_recommended("novels")
    result["data"] = result["novels"]
    del result["novels"]
    return result
