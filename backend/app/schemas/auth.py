"""
Pydantic schemas for authentication endpoints.
"""

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=8, max_length=128)


class RegisterResponse(BaseModel):
    id: str
    email: str
    username: str
    message: str = "Registration successful"


class LoginRequest(BaseModel):
    # Accepts email address OR username in the same field
    identifier: str = Field(min_length=3, max_length=255, description="Email address or username")
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds
    username: str = ""
    email: str = ""
    user_id: str = ""
