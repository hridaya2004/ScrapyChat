from abc import ABCMeta, abstractmethod
from typing import Any


class SingletonMeta(ABCMeta):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            if cls not in cls._instances:
                cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]


class ScrapyBaseProvider(metaclass=SingletonMeta):
    """
    The Scrapy abstract base provider
    """

    @abstractmethod
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)

    @abstractmethod
    async def init(self) -> None:
        pass

    @property
    @abstractmethod
    def client(self) -> Any:
        pass
