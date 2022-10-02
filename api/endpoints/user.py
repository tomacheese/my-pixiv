from fastapi import APIRouter

from api import get_pixiv_item

router = APIRouter(prefix="/user")


@router.get("/{item_id}")
def get_user_req(item_id: str):
    return get_pixiv_item("user", item_id)
