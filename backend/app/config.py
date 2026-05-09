from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    sefaria_base_url: str = "https://www.sefaria.org/api"
    frontend_url: str = "http://localhost:3000"
    environment: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()
