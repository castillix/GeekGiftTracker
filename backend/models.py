from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
import datetime
import enum
from database import Base

class RequestStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    READY_FOR_PICKUP = "ready_for_pickup"
    COMPLETED = "completed"

class GeekGiftRequest(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    recipient_name = Column(String, index=True)
    contact_info = Column(String, nullable=True) # Deprecated
    requestor_contact = Column(String, nullable=True) # Requestor contact info
    client_contact = Column(String, nullable=True) # Client contact info
    description = Column(String, nullable=True) # Reason for request or specs needed
    status = Column(Enum(RequestStatus), default=RequestStatus.NOT_STARTED)
    technician = Column(String, nullable=True) # Name of tech assigned
    filename = Column(String, nullable=True)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    comments = relationship("Comment", back_populates="request", cascade="all, delete-orphan")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id"))
    content = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    request = relationship("GeekGiftRequest", back_populates="comments")
