from fastapi import APIRouter

from api import get_pixiv

router = APIRouter(prefix="/novel")


@router.get("/{word}")
def get_novels_req(word: str):
    return get_pixiv("novel", word)
