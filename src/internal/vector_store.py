import os
from typing import Optional

from llama_index.core import Document, Settings, VectorStoreIndex
from llama_index.core.node_parser import SimpleNodeParser
from llama_index.core.vector_stores import MetadataFilter, MetadataFilters
from llama_index.vector_stores.qdrant import QdrantVectorStore
from qdrant_client import AsyncQdrantClient

from ..types.provider import ScrapyBaseProvider
from .embeddings import ScrapyEmbeddingProvider
from .llm import ScrapyLLMProvider


class ScrapyVectorStoreProvider(ScrapyBaseProvider):
    """
    The Scrapy vector store provider based on Qdrant
    """

    def __init__(self) -> None:
        # Initialize embeddings model and LLM
        self.__llm = ScrapyLLMProvider()
        self.__embed_model = ScrapyEmbeddingProvider()

        Settings.llm = self.__llm.client
        Settings.embed_model = self.__embed_model.client

        # Initialize Qdrant client and index
        endpoint = os.environ["QDRANT_ENDPOINT"]
        collection = os.environ["QDRANT_COLLECTION"]

        self.parser = SimpleNodeParser.from_defaults(chunk_size=768, chunk_overlap=16)

        self.__client = AsyncQdrantClient(url=endpoint, prefer_grpc=True)
        self.__store = QdrantVectorStore(
            aclient=self.__client,
            collection_name=collection,
        )
        self.__index = VectorStoreIndex.from_vector_store(
            vector_store=self.__store, use_async=True
        )
        self.__query_engine = self.__index.as_query_engine(use_async=True)

    @property
    def client(self):
        return self.__client

    @property
    def store(self):
        return self.__store

    @property
    def query_engine(self):
        return self.__query_engine

    async def ingest(self, text: str, metadata: dict[str, str]) -> None:
        """
        Ingests a list of text documents into QdrantVectorStore
        """

        docs = [Document(text=text, metadata=metadata)]
        nodes = self.parser.get_nodes_from_documents(docs)
        for node in nodes:
            node.embedding = await self.__embed_model.get_embeddings(node.get_content())

        await self.__index.ainsert_nodes(nodes)

    async def query(self, text: str, filter: Optional[dict[str, str]] = None):
        """
        Performs vector search query with metadata filtering
        """
        metadata_filters = None

        if filter:
            filters_list: list[MetadataFilter | MetadataFilters] = [
                MetadataFilter(key=key, value=value) for key, value in filter.items()
            ]

            metadata_filters = MetadataFilters(filters=filters_list)

        engine = self.__index.as_query_engine(use_async=True, filters=metadata_filters)

        return await engine.aquery(text)
