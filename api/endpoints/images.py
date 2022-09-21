from fastapi import APIRouter

from api import get_image

router = APIRouter(prefix="/images")


@router.get("/{item_type}/{item_id}")
def get_image_req(item_type: str, item_id: str, url: str):
    return get_image(url, item_type, item_id)
