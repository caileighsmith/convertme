from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    sefaria_base_url: str = "https://www.sefaria.org/api"
    frontend_url: str = "http://localhost:3000"
    environment: str = "development"

    # Database
    database_url: str = "postgresql+asyncpg://convertme:convertme@db:5432/convertme"

    admin_email: str = ""

    # JWT
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days

    class Config:
        env_file = ".env"


settings = Settings()
