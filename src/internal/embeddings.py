import os

from llama_index.core.base.embeddings.base import Embedding
from llama_index.embeddings.ollama import OllamaEmbedding

from ..types.provider import BaseProvider


class EmbeddingProvider(BaseProvider):
    """
    The Scrapy Embedding provider
    """

    def __init__(self) -> None:
        """
        Initialize the embedding model
        """

        self._embedding_model = os.environ["OLLAMA_EMBEDDING_MODEL"]
        self._api_endpoint = os.environ["OLLAMA_ENDPOINT"]

        self._embed_model = OllamaEmbedding(
            base_url=self._api_endpoint,
            model_name=self._embedding_model,
        )

    @property
    def client(self) -> OllamaEmbedding:
        """
        The underlying embedding client
        """
        return self._embed_model

    async def get_embeddings(self, text: str) -> Embedding:
        """
        The embeddings for input text
        """
        return await self._embed_model.aget_text_embedding(text)

    async def get_batch_embeddings(self, text: list[str]) -> list[Embedding]:
        """
        The batch embeddings for input text
        """
        return await self._embed_model.aget_text_embedding_batch(text)
