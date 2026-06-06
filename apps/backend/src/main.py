import os
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .internal.vector_store import VectorStoreProvider
from .routers.chat import router as chat_router
from .routers.scrape import router as scraper_router

origins = os.getenv("ALLOWED_ORIGINS", "").split("|")

vector_store_provider = VectorStoreProvider()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup
    await vector_store_provider.init()

    yield


app = FastAPI(
    title="ScrapyChat",
    description="Backend Application for ScrapyChat",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/version")
async def version():
    return {"version": os.getenv("APP_VERSION")}


app.include_router(scraper_router, prefix="/api/scrape")
app.include_router(chat_router, prefix="/api/chat")

if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8080,
        reload=(os.getenv("HOT_RELOAD", "false").lower() == "true"),
    )
