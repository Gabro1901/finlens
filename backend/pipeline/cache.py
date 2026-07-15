import time
from typing import Any, Dict

class PipelineCache:
    def __init__(self, ttl_seconds: int = 900):
        # Default TTL is 15 minutes
        self.ttl = ttl_seconds
        self._cache: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Any:
        if key in self._cache:
            entry = self._cache[key]
            if time.time() - entry["timestamp"] < self.ttl:
                return entry["data"]
            else:
                del self._cache[key]
        return None

    def set(self, key: str, data: Any):
        self._cache[key] = {
            "timestamp": time.time(),
            "data": data
        }

# Global cache instance for collectors
collector_cache = PipelineCache(ttl_seconds=900)
