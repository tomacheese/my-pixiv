from fastapi import APIRouter

from api import get_pixiv_item

router = APIRouter(prefix="/novel")


@router.get("/{item_id}")
def get_novel_req(item_id: str):
    return get_pixiv_item("novel", item_id)
