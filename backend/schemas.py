from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from models import RequestStatus

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    request_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class RequestBase(BaseModel):
    recipient_name: str
    contact_info: Optional[str] = None # Deprecated
    requestor_contact: Optional[str] = None
    client_contact: Optional[str] = None
    description: Optional[str] = None
    technician: Optional[str] = None
    due_date: Optional[datetime] = None

class RequestCreate(RequestBase):
    pass

class RequestUpdate(BaseModel):
    recipient_name: Optional[str] = None
    contact_info: Optional[str] = None
    requestor_contact: Optional[str] = None
    client_contact: Optional[str] = None
    description: Optional[str] = None
    technician: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[RequestStatus] = None

class GeekGiftRequest(RequestBase):
    id: int
    status: RequestStatus
    filename: Optional[str] = None
    due_date: Optional[datetime] = None
    created_at: datetime
    comments: List[Comment] = []

    class Config:
        from_attributes = True
