from fastapi import APIRouter

from api import get_image

router = APIRouter(prefix="/images")


@router.get("/{illust_id}")
def get_image_req(illust_id: str, url: str):
    return get_image(url, illust_id)
