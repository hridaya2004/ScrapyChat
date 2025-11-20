import uvicorn
from fastapi import FastAPI

from .internal.vector_store import ScrapyVectorStoreProvider
from .routers.chat import router as chat_router
from .routers.scrape import router as scraper_router

sv_store = ScrapyVectorStoreProvider()


app = FastAPI(
    title="ScrapyChat",
    description="Backend Application for ScrapyChat",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)


@app.get("/health")
async def health():
    return {"status": "ok"}


app.include_router(scraper_router, prefix="/scrape")
app.include_router(chat_router, prefix="/chat")

if __name__ == "__main__":
    uvicorn.run("src.main:app", host="0.0.0.0", port=8080, reload=True)
