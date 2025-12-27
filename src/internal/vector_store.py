import asyncio
import os
from typing import Optional

from llama_index.core import Document, Settings, VectorStoreIndex
from llama_index.core.node_parser import SimpleNodeParser
from llama_index.core.vector_stores import MetadataFilter, MetadataFilters
from llama_index.vector_stores.qdrant import QdrantVectorStore
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams

from ..types.provider import BaseProvider
from .embeddings import EmbeddingProvider
from .llm import LLMProvider
from .redis import RedisProvider


class VectorStoreProvider(BaseProvider):
    """
    The Scrapy vector store provider based on Qdrant
    """

    def __init__(self) -> None:
        self._initialized = False
        self._init_lock = asyncio.Lock()

        # Initialize dependent providers
        self._llm = LLMProvider()
        self._embed_model = EmbeddingProvider()
        self._redis = RedisProvider()

        Settings.llm = self._llm.client
        Settings.embed_model = self._embed_model.client

        # Qdrant
        self._endpoint = os.getenv("QDRANT_ENDPOINT", "localhost")
        self._collection = os.getenv("QDRANT_COLLECTION", "scrapy")

        self._parser = SimpleNodeParser.from_defaults(chunk_size=768, chunk_overlap=16)

        self._client = AsyncQdrantClient(url=self._endpoint, prefer_grpc=True)
        self._store = QdrantVectorStore(
            aclient=self._client,
            collection_name=self._collection,
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

            await self._ensure_collection_exists(self._collection)
            self._initialized = True

    @property
    def client(self):
        return self._client

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

    async def ingest(
        self, user_id: str, url: str, text: str, metadata: dict[str, str] = {}
    ) -> None:
        # Add user_id and url to metadata
        metadata["user_id"] = user_id
        metadata["url"] = url

        docs = [Document(text=text, metadata=metadata)]
        nodes = self._parser.get_nodes_from_documents(docs)
        total_nodes = len(nodes)

        # Set initial progress
        await self._redis.set_progress(user_id, url, f"{0 / total_nodes:.2f}")

        for n, node in enumerate(nodes, start=1):
            node.embedding = await self._embed_model.get_embeddings(node.get_content())

            # Update progress
            await self._redis.set_progress(user_id, url, f"{n / total_nodes:.2f}")

        # Insert all nodes
        await self._index.ainsert_nodes(nodes)

        # Delete progress data from redis
        await self._redis.delete_progress(user_id, url)

    async def query(
        self,
        text: str,
        filter: Optional[dict[str, str]] = None,
        top_k: int = 3,
    ):
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
