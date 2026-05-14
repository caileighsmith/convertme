from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class OnboardingRequest(BaseModel):
    journey_stage: str
    tradition: str
    hebrew_level: int


class UserResponse(BaseModel):
    id: int
    email: str
    is_admin: bool = False
    journey_stage: str | None = None
    tradition: str | None = None
    hebrew_level: int | None = None

    model_config = {"from_attributes": True}
