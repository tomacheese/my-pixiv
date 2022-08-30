from fastapi import APIRouter

from api import get_pixiv

router = APIRouter(prefix="/illust")


@router.get("/{word}")
def get_illusts_req(word: str):
    return get_pixiv("illust", word)
