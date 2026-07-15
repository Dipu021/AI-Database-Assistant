from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class ConnectionRequest(BaseModel):
    db_type: str
    host: Optional[str] = None
    port: Optional[int] = None
    database: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    file_path: Optional[str] = None
    uri: Optional[str] = None

class QueryRequest(BaseModel):
    question: str
    connection_id: str  # Simple session based

class QueryResponse(BaseModel):
    sql: str
    result: List[Dict[str, Any]]
    summary: str
    error: Optional[str] = None