import uvicorn
from fastapi import FastAPI

from .internal.vector_store import ScrapyVectorStoreProvider

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


if __name__ == "__main__":
    uvicorn.run("src.main:app", host="0.0.0.0", port=8080)
