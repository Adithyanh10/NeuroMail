"""
AWS S3 upload / download helpers.
"""

import uuid
from typing import Optional

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION,
)


def _build_s3_key(user_id: str, filename: str) -> str:
    """Generate a unique S3 object key scoped to the user."""
    unique_id = uuid.uuid4().hex
    return f"uploads/{user_id}/{unique_id}_{filename}"


def upload_file(file: UploadFile, user_id: str) -> dict:
    """
    Upload *file* to S3 and return the object key and presigned URL.

    Raises:
        HTTPException 500 on S3 errors.
    """
    s3_key = _build_s3_key(user_id, file.filename or "email.txt")

    try:
        s3_client.upload_fileobj(
            file.file,
            settings.S3_BUCKET_NAME,
            s3_key,
            ExtraArgs={"ContentType": file.content_type or "text/plain"},
        )
    except (BotoCoreError, ClientError) as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"S3 upload failed: {str(exc)}",
        )

    url = generate_presigned_url(s3_key)
    return {"s3_key": s3_key, "url": url}


def generate_presigned_url(s3_key: str, expiry: int = 3600) -> str:
    """
    Generate a presigned GET URL for *s3_key* valid for *expiry* seconds.

    Raises:
        HTTPException 500 on S3 errors.
    """
    try:
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.S3_BUCKET_NAME, "Key": s3_key},
            ExpiresIn=expiry,
        )
        return url
    except (BotoCoreError, ClientError) as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate presigned URL: {str(exc)}",
        )


def delete_file(s3_key: str) -> None:
    """Delete an object from S3 by key."""
    try:
        s3_client.delete_object(Bucket=settings.S3_BUCKET_NAME, Key=s3_key)
    except (BotoCoreError, ClientError) as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"S3 delete failed: {str(exc)}",
        )
