import asyncio
import os
from typing import Optional

from llama_index.core import Document, Settings, VectorStoreIndex
from llama_index.core.node_parser import SimpleNodeParser
from llama_index.core.vector_stores import MetadataFilter, MetadataFilters
from llama_index.vector_stores.qdrant import QdrantVectorStore
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams

from ..types.provider import ScrapyBaseProvider
from .embeddings import ScrapyEmbeddingProvider
from .llm import ScrapyLLMProvider


class ScrapyVectorStoreProvider(ScrapyBaseProvider):
    """
    The Scrapy vector store provider based on Qdrant
    """

    def __init__(self) -> None:
        self._initialized = False
        self._init_lock = asyncio.Lock()

        # LLM & embeddings
        self._llm = ScrapyLLMProvider()
        self._embed_model = ScrapyEmbeddingProvider()

        Settings.llm = self._llm.client
        Settings.embed_model = self._embed_model.client

        # Qdrant
        self.endpoint = os.environ["QDRANT_ENDPOINT"]
        self.collection = os.environ["QDRANT_COLLECTION"]

        self._parser = SimpleNodeParser.from_defaults(chunk_size=768, chunk_overlap=16)

        self._client = AsyncQdrantClient(url=self.endpoint, prefer_grpc=True)
        self._store = QdrantVectorStore(
            aclient=self._client,
            collection_name=self.collection,
        )
        self._index = VectorStoreIndex.from_vector_store(
            vector_store=self._store,
            use_async=True,
        )

        self._query_engine = self._index.as_query_engine(use_async=True)

    async def init(self) -> None:
        async with self._init_lock:
            if self._initialized:
                return

            await self._ensure_collection_exists(self.collection)
            self._initialized = True

    @property
    def client(self):
        return self._client

    @property
    def store(self):
        return self._store

    @property
    def query_engine(self):
        return self._query_engine

    @property
    def llm(self):
        return self._llm

    @property
    def embed(self):
        return self._embed_model

    async def _ensure_collection_exists(self, collection_name: str) -> None:
        try:
            await self._client.get_collection(collection_name)
        except Exception:
            await self._client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=768,
                    distance=Distance.COSINE,
                ),
            )

    async def ingest(self, text: str, metadata: dict[str, str]) -> None:
        await self.init()

        docs = [Document(text=text, metadata=metadata)]
        nodes = self._parser.get_nodes_from_documents(docs)

        for node in nodes:
            node.embedding = await self.embed.get_embeddings(node.get_content())

        await self._index.ainsert_nodes(nodes)

    async def query(
        self,
        text: str,
        filter: Optional[dict[str, str]] = None,
        top_k: int = 3,
    ):
        await self.init()

        metadata_filters = None
        if filter:
            metadata_filters = MetadataFilters(
                filters=[MetadataFilter(key=k, value=v) for k, v in filter.items()]
            )

        engine = self._index.as_query_engine(
            use_async=True,
            filters=metadata_filters,
            similarity_top_k=top_k,
        )

        return await engine.aquery(text)
