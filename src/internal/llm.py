import os

from llama_index.core.base.llms.types import (
    CompletionResponse,
    CompletionResponseAsyncGen,
)
from llama_index.llms.ollama import Ollama

from ..types.provider import BaseProvider


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
