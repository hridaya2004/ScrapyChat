import logging
import os
from enum import Enum

from llama_index.core.base.llms.types import (
    CompletionResponse,
    CompletionResponseAsyncGen,
)
from llama_index.llms.google_genai import GoogleGenAI
from llama_index.llms.ollama import Ollama
from pydantic import BaseModel, Field

from ..types.provider import BaseProvider

logger = logging.getLogger("internal.llm")


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

    def client(self):
        """
        Returns LLM client for the provider
        """

        match self.provider:
            case ExternalLLM.GOOGLE_GENAI:
                return GoogleGenAI(self.model, self.api_key)


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
