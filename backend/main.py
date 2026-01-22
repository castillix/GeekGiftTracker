from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os
import datetime
from fastapi.responses import FileResponse
from sqlalchemy import case
import models, schemas, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:5173", # Vite dev server
    "http://127.0.0.1:5173",
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:80",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory to serve PDFs
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/requests/", response_model=schemas.GeekGiftRequest)
async def create_request(
    recipient_name: str = Form(...),
    contact_info: Optional[str] = Form(None), # Deprecated, keep for compatibility if needed or removed
    requestor_contact: Optional[str] = Form(None),
    client_contact: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    technician: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    filename = None
    if file:
        filename = f"{file.filename}"
        file_location = f"uploads/{filename}"
        # Ensure unique filename if needed, for now simple overwrite check or just save
        # To avoid overwrite issues in prod we'd append timestamp/uuid, but keeping simple for now
        with open(file_location, "wb+") as buffer:
            shutil.copyfileobj(file.file, buffer)
    
    db_request = models.GeekGiftRequest(
        recipient_name=recipient_name,
        contact_info=contact_info,
        requestor_contact=requestor_contact,
        client_contact=client_contact,
        description=description,
        technician=technician,
        filename=filename
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@app.get("/requests/", response_model=List[schemas.GeekGiftRequest])
def read_requests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    requests = db.query(models.GeekGiftRequest).order_by(models.GeekGiftRequest.created_at.desc()).offset(skip).limit(limit).all()
    return requests

@app.get("/requests/{request_id}", response_model=schemas.GeekGiftRequest)
def read_request(request_id: int, db: Session = Depends(get_db)):
    db_request = db.query(models.GeekGiftRequest).filter(models.GeekGiftRequest.id == request_id).first()
    if db_request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return db_request

@app.put("/requests/{request_id}", response_model=schemas.GeekGiftRequest)
def update_request(request_id: int, request_update: schemas.RequestUpdate, db: Session = Depends(get_db)):
    db_request = db.query(models.GeekGiftRequest).filter(models.GeekGiftRequest.id == request_id).first()
    if db_request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    
    update_data = request_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_request, key, value)
    
    db.commit()
    db.refresh(db_request)
    return db_request

@app.post("/requests/{request_id}/comments/", response_model=schemas.Comment)
def create_comment(request_id: int, comment: schemas.CommentCreate, db: Session = Depends(get_db)):
    db_request = db.query(models.GeekGiftRequest).filter(models.GeekGiftRequest.id == request_id).first()
    if db_request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    
    db_comment = models.Comment(content=comment.content, request_id=request_id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@app.delete("/requests/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_request(request_id: int, db: Session = Depends(get_db)):
    db_request = db.query(models.GeekGiftRequest).filter(models.GeekGiftRequest.id == request_id).first()
    if db_request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # If there is a file associated, we might want to delete it from disk too
    # For now, we'll just remove the DB record which cascades to comments
    if db_request.filename:
        file_path = os.path.join("uploads", db_request.filename)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except OSError:
                pass # logging would be good here

    db.delete(db_request)
    db.commit()
    return None
