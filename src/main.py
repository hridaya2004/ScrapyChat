from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI

from .internal.VectorStore import ScrapyQdrantVectorStore

sqv_store = ScrapyQdrantVectorStore()


@asynccontextmanager
async def lifespan(app: FastAPI):
    sqv_store.connect()
    yield


app = FastAPI(
    title="ScrapyChat",
    description="Backend Application for ScrapyChat",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
    lifespan=lifespan,
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/")
async def nothing():
    texts = [
        "Python is a popular programming language.",
        "FastAPI is great for building async APIs.",
    ]
    metadata = [{"source": "wiki"}, {"source": "docs"}]
    await sqv_store.ingest(texts, metadata)

    result = await sqv_store.query("What's a good thing to build APIs in python?")
    print(result)
    return {"message": "worked"}


if __name__ == "__main__":
    uvicorn.run("src.main:app", host="0.0.0.0", port=8080, reload=True)
