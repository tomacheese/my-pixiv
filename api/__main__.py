import uvicorn as uvicorn
from fastapi import FastAPI
from starlette.exceptions import HTTPException
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from starlette.staticfiles import StaticFiles

from api.endpoints import router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
app.include_router(router)
app.mount("/", StaticFiles(directory="view", html=True), name="view")


@app.exception_handler(HTTPException)
async def http_exception_handler(_req, exc):
    return JSONResponse({
        "status": False,
        "message": exc.detail
    }, status_code=exc.status_code)


if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=80)
