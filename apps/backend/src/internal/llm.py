import logging
import os
from enum import Enum

from httpx import AsyncClient
from llama_index.core.base.llms.types import (
    CompletionResponse,
    CompletionResponseAsyncGen,
)
from llama_index.core.llms.llm import LLM
from llama_index.llms.google_genai import GoogleGenAI
from llama_index.llms.ollama import Ollama
from pydantic import BaseModel, Field

from ..types.provider import BaseProvider
from .redis import RedisProvider

logger = logging.getLogger("internal.llm")
redis = RedisProvider()


class ExternalLLM(Enum):
    """
    Enum representing available external LLM providers
    """

    GOOGLE_GENAI = "google_genai"


class LLMConfig(BaseModel):
    """
    Model representing an external LLM configuration
    """

    provider: ExternalLLM = Field(
        ..., description="The name of the external LLM provider"
    )
    model: str = Field(..., description="The name of the particular model")
    api_key: str = Field(
        ..., description="The API key for the particular provider and model"
    )

    async def get_decrypted_key(self, token: str) -> str:
        """
        Returns decrypted token from express/redis
        """

        # Retrieve decrypted key from cache
        cached_key = await redis.client.get(f"key:{self.api_key}")
        if cached_key is not None:
            return cached_key

        # Get the decrypted key from express auth server
        async with AsyncClient() as client:
            res = await client.post(
                url=os.environ["FRONTEND_URL"] + "/api/api-keys/decrypt",
                json={"apiKey": self.api_key},
                headers={"Authorization": token},
            )

            res.raise_for_status()
            decrypted_key = res.json()["api_key"]

            # Cache decrypted key for a week
            await redis.client.set(
                f"key:{self.api_key}",
                decrypted_key,
                ex=(7 * 24 * 60 * 60),  # 7 days
            )

            return decrypted_key

    async def client(self, token: str) -> LLM:
        """
        Returns LLM client for the provider
        """

        # Get decrypted key
        decrypted_key = await self.get_decrypted_key(token)

        match self.provider:
            case ExternalLLM.GOOGLE_GENAI:
                return GoogleGenAI(self.model, decrypted_key)


class LLMProvider(BaseProvider):
    """
    The Scrapy LLM provider based on GoogleGenAI
    """

    def __init__(self) -> None:
        """
        Initialize the LLM model
        """

        self._ollama_model = os.environ["OLLAMA_LLM_MODEL"]
        self._api_endpoint = os.environ["OLLAMA_ENDPOINT"]

        self._llm = Ollama(
            base_url=self._api_endpoint,
            model=self._ollama_model,
            request_timeout=120.0,
            context_window=8000,
        )

    @property
    def client(self):
        """
        The underlying embedding client
        """
        return self._llm

    async def query(self, prompt: str) -> CompletionResponse:
        """
        The query response from the LLM
        """
        return await self._llm.acomplete(prompt)

    async def stream_query(self, prompt: str) -> CompletionResponseAsyncGen:
        """
        The streamed query response from the LLM
        """
        return await self._llm.astream_complete(prompt)
