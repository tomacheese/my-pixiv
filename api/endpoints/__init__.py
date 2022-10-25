from fastapi import APIRouter

from api.endpoints import images, settings_sync, ws

router = APIRouter(prefix="/api")


@router.get("/")
def get_root():
    return {"message": "my-pixiv api"}


router.include_router(ws.router)
router.include_router(images.router)
router.include_router(settings_sync.router)
