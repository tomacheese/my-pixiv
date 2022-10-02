from fastapi import APIRouter

from api import search_pixiv

router = APIRouter(prefix="/search")


@router.get("/illust/{word}")
def get_illusts_req(word: str):
    return search_pixiv("illust", word)


@router.get("/novel/{word}")
def get_novels_req(word: str):
    return search_pixiv("novel", word)


@router.get("/manga/{word}")
def get_manga_req(word: str):
    return search_pixiv("manga", word)
