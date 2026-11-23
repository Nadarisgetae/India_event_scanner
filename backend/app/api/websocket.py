import json
import asyncio
from typing import Dict, List, Set, Any
from fastapi import WebSocket

class RunBroadcaster:
    """
    Manages active WebSocket connections subscribed to reasoning runs.
    Maintains an in-memory event buffer so late-joining clients catch up.
    """
    def __init__(self):
        self._connections: Dict[str, Set[WebSocket]] = {}
        self._history: Dict[str, List[Dict[str, Any]]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, run_id: str, websocket: WebSocket):
        await websocket.accept()
        async with self._lock:
            if run_id not in self._connections:
                self._connections[run_id] = set()
            self._connections[run_id].add(websocket)

            # Replay historical steps if any
            if run_id in self._history:
                for msg in self._history[run_id]:
                    await websocket.send_text(json.dumps(msg))

    async def disconnect(self, run_id: str, websocket: WebSocket):
        async with self._lock:
            if run_id in self._connections and websocket in self._connections[run_id]:
                self._connections[run_id].remove(websocket)
                if not self._connections[run_id]:
                    del self._connections[run_id]

    async def broadcast(self, run_id: str, message: Dict[str, Any]):
        async with self._lock:
            if run_id not in self._history:
                self._history[run_id] = []
            self._history[run_id].append(message)

            targets = list(self._connections.get(run_id, []))

        dead = []
        for ws in targets:
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                dead.append(ws)

        if dead:
            async with self._lock:
                for d in dead:
                    if run_id in self._connections and d in self._connections[run_id]:
                        self._connections[run_id].remove(d)

broadcaster = RunBroadcaster()
