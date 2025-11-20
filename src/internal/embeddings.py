import os
from typing import Optional

from llama_index.core.base.embeddings.base import Embedding
from llama_index.embeddings.ollama import OllamaEmbedding

from ..types.provider import ScrapyBaseProvider


class ScrapyEmbeddingProvider(ScrapyBaseProvider):
    """
    The Scrapy Embedding provider
    """

    __embed_model: Optional[OllamaEmbedding] = None

    def __init__(self) -> None:
        """
        Initialize the embedding model
        """
        # Default settings
        __embedding_model = os.environ["OLLAMA_EMBEDDING_MODEL"]
        __api_endpoint = os.environ["OLLAMA_ENDPOINT"]

        self.__embed_model = OllamaEmbedding(
            base_url=__api_endpoint, model_name=__embedding_model
        )

    @property
    def client(self) -> OllamaEmbedding:
        """
        Returns the underlying embedding client
        """
        if not self.__embed_model:
            raise Exception("Class not initialized")
        return self.__embed_model

    async def get_embeddings(self, text: str) -> Embedding:
        """
        Returns the embeddings for input text
        """
        if not self.__embed_model:
            raise
        return await self.__embed_model.aget_text_embedding(text)

    async def get_batch_embeddings(self, text: list[str]) -> list[Embedding]:
        """
        Returns the batch embeddings for input text
        """
        if not self.__embed_model:
            raise
        return await self.__embed_model.aget_text_embedding_batch(text)
