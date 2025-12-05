from fastapi import APIRouter, UploadFile, File, HTTPException, Request
import shutil
import os
import uuid
from typing import List

router = APIRouter()

# Use absolute path relative to the project root (assuming backend is one level deep)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

@router.post("/")
def upload_file(request: Request, file: UploadFile = File(...)):
    try:
        # Validate file extension
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Invalid file type. Only jpg, jpeg, png, and webp are allowed.")

        # Generate a unique filename
        new_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, new_filename)

        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Construct the URL
        # Assuming the server is running on localhost:8000 or similar
        # request.base_url will give the base scheme and netloc
        # e.g., http://localhost:8000/
        base_url = str(request.base_url).rstrip("/")
        file_url = f"{base_url}/uploads/{new_filename}"

        return {"url": file_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not upload file: {str(e)}")
