from fastapi import APIRouter

from api.endpoints import illust, manga, novel, search, images, like, recommended, settings_sync, tweet, user, viewed, itemMutes

router = APIRouter(prefix="/api")


@router.get("/")
def get_root():
    return {"message": "my-pixiv api"}


router.include_router(search.router)
router.include_router(illust.router)
router.include_router(manga.router)
router.include_router(novel.router)
router.include_router(images.router)
router.include_router(user.router)
router.include_router(like.router)
router.include_router(tweet.router)
router.include_router(viewed.router)
router.include_router(settings_sync.router)
router.include_router(recommended.router)
router.include_router(itemMutes.router)
