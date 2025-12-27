import json
import os
from typing import AsyncGenerator

import redis.asyncio as redis

from ..types.provider import BaseProvider


class RedisProvider(BaseProvider):
    """
    The Scrapy redis provider
    """

    def __init__(self) -> None:
        self._host = os.getenv("REDIS_HOST", "localhost")
        self._port = int(os.getenv("REDIS_PORT", 6379))

        self._client = redis.Redis(
            host=self._host, port=self._port, decode_responses=True
        )

    @property
    def client(self) -> redis.Redis:
        return self._client

    async def stream_progress(self, user_id: str) -> AsyncGenerator:
        async with self._client.pubsub() as pubsub:
            # Subscribe to user stream
            await pubsub.subscribe(f"user:{user_id}")

            # Get initial state
            first_message = await self._client.hgetall(f"user:{user_id}")  # type: ignore
            yield f"data: {json.dumps(first_message)}\n\n"

            try:
                # Yield messages
                async for message in pubsub.listen():
                    if message["type"] == "message":
                        yield f"data: {message['data']}\n\n"
            finally:
                await pubsub.unsubscribe(f"user:{user_id}")

    async def set_progress(self, user_id: str, url: str, value: str) -> None:
        # Set progress in hashset
        await self._client.hset(
            f"user:{user_id}", mapping={"url": url, "progress": value}
        )  # type: ignore

        # Publish progress updates to consumer
        await self._client.publish(
            f"user:{user_id}", json.dumps({"url": url, "progress": value})
        )

    async def expire_progress(self, user_id: str, url: str) -> None:
        # Set 10 seconds expiry on the key
        await self._client.hexpire(f"user:{user_id}", 10, url)  # type: ignore
