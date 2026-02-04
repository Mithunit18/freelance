"""
Configuration management for the Creator Recommendation API.
"""

import os
import sys

# Add parent directory to path to import from config
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from config.env import settings as main_settings


class Settings:
    """Application settings that pulls from main app settings."""

    # Groq API Configuration
    GROQ_API_KEY: str = main_settings.GROQ_API_KEY
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # Session Configuration
    SESSION_TIMEOUT_MINUTES: int = 30
    MAX_CONVERSATION_LENGTH: int = 100

    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    LOG_LEVEL: str = "info"

    # CORS Configuration
    CORS_ORIGINS: list = ["*"]

    # Database Configuration
    DATABASE_PATH: str = "data/dev/database.json"


# Global settings instance
settings = Settings()
