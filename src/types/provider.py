from abc import ABCMeta, abstractmethod
from typing import Any


class SingletonMeta(ABCMeta):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(SingletonMeta, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


class ScrapyBaseProvider(metaclass=SingletonMeta):
    """
    The Scrapy abstract base provider
    """

    @abstractmethod
    def __init__(self) -> None:
        pass

    @property
    @abstractmethod
    def client(self) -> Any:
        pass
