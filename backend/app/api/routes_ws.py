from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.api.websocket import broadcaster

router = APIRouter()

@router.websocket("/runs/{run_id}/stream")
async def websocket_run_stream(websocket: WebSocket, run_id: str):
    await broadcaster.connect(run_id, websocket)
    try:
        while True:
            # Client can send keepalive pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        await broadcaster.disconnect(run_id, websocket)
