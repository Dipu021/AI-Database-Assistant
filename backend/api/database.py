from fastapi import APIRouter, HTTPException
from models import ConnectionRequest
from database.connection import connect_db

router = APIRouter()

@router.post("/connect")
async def connect(request: ConnectionRequest):
    try:
        print("Received connection request:", request.dict())  # Debug
        conn_data = request.dict()
        conn_id, message = connect_db(conn_data)
        if conn_id:
            print("Connection successful:", conn_id)
            return {"status": "success", "connection_id": conn_id, "message": message}
        else:
            print("Connection failed:", message)
            raise HTTPException(400, message)
    except Exception as e:
        print("ERROR in connect:", str(e))   # <--- This will show in terminal
        import traceback
        traceback.print_exc()
        raise HTTPException(500, str(e))