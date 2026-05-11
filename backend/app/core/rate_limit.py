"""
Simple in-memory rate limiter using a sliding window counter.
For production, replace with Redis-backed slowapi.
"""

import time
from collections import defaultdict, deque
from threading import Lock
from typing import Deque

from fastapi import HTTPException, Request, status

# { client_ip: deque of request timestamps }
_request_log: dict[str, Deque[float]] = defaultdict(deque)
_lock = Lock()


def rate_limit(max_requests: int = 30, window_seconds: int = 60):
    """
    FastAPI dependency factory.

    Usage:
        @router.post("/generate-reply", dependencies=[Depends(rate_limit(10, 60))])
    """

    async def _check(request: Request) -> None:
        client_ip = request.client.host if request.client else "unknown"
        now = time.monotonic()
        cutoff = now - window_seconds

        with _lock:
            log = _request_log[client_ip]

            # Remove timestamps outside the window
            while log and log[0] < cutoff:
                log.popleft()

            if len(log) >= max_requests:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Max {max_requests} requests per {window_seconds}s.",
                    headers={"Retry-After": str(window_seconds)},
                )

            log.append(now)

    return _check
