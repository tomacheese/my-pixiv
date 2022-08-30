from fastapi import APIRouter

from api.endpoints import illust, images, like, manga, novel, tweet, viewed

router = APIRouter(prefix="/api")


@router.get("/")
def get_root():
    return {"message": "my-pixiv api"}


router.include_router(illust.router)
router.include_router(images.router)
router.include_router(like.router)
router.include_router(manga.router)
router.include_router(novel.router)
router.include_router(tweet.router)
router.include_router(viewed.router)
