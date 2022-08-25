import os.path
from pprint import pprint

import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from starlette.responses import FileResponse, StreamingResponse

from api import get_illust_screen_names, get_illusts, get_image, get_match_tweets, get_novels, get_search_tweets, \
    init_pixiv_api, \
    init_twitter_api

router = APIRouter(prefix="/api")


@router.get("/")
def get_root():
    return {"message": "my-pixiv api"}


@router.get("/illusts/{word}")
def get_illusts_req(word: str):
    return get_illusts(word)


@router.get("/novels/{word}")
def get_novels_req(word: str):
    return get_novels(word)


@router.get("/images/{illust_id}")
def get_image_req(illust_id: str, url: str):
    return get_image(url, illust_id)


@router.get("/tweet/{illust_id}")
def search_tweet(illust_id: str):
    return get_search_tweets(illust_id)
