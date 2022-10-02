from fastapi import APIRouter

from api import get_pixiv_item

router = APIRouter(prefix="/illust")


@router.get("/{item_id}")
def get_illust_req(item_id: str):
    return get_pixiv_item("illust", item_id)
