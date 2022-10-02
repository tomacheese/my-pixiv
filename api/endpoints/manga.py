from fastapi import APIRouter

from api import get_pixiv_item

router = APIRouter(prefix="/manga")


@router.get("/{item_id}")
def get_manga_req(item_id: str):
    return get_pixiv_item("manga", item_id)
