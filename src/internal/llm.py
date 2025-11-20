import os
from typing import Optional

from llama_index.core.base.llms.types import (
    CompletionResponse,
    CompletionResponseAsyncGen,
)
from llama_index.llms.google_genai import GoogleGenAI

from ..types.provider import ScrapyBaseProvider


class ScrapyLLMProvider(ScrapyBaseProvider):
    """
    The Scrapy LLM provider based on GoogleGenAI
    """

    __llm: Optional[GoogleGenAI] = None

    def __init__(
        self,
        google_genai_model: Optional[str] = None,
    ) -> None:
        """
        Initialize the LLM model
        """
        # Return if the class is initialized
        if self.client is not None:
            return

        # Default settings
        google_genai_model = google_genai_model or os.environ["GOOGLE_GENAI_MODEL"]

        # Clients
        self.__llm = GoogleGenAI(model=google_genai_model)

    @property
    def client(self):
        """
        Returns the underlying embedding client
        """
        return self.__llm

    async def query(self, prompt: str) -> CompletionResponse:
        """
        Returns the query response from the LLM
        """
        if not self.__llm:
            raise
        return await self.__llm.acomplete(prompt)

    async def stream_query(self, prompt: str) -> CompletionResponseAsyncGen:
        """
        Returns the streamed query response from the LLM
        """
        if not self.__llm:
            raise
        return await self.__llm.astream_complete(prompt)
