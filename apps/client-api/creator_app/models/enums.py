"""
Enums for the Creator Recommendation API.
"""

from enum import Enum


class SessionStatus(str, Enum):
    """Session status enumeration."""
    ACTIVE = "active"
    COMPLETED = "completed"
    CLOSED = "closed"
    EXPIRED = "expired"


class MessageType(str, Enum):
    """Message type enumeration."""
    AGENT = "agent"
    USER = "user"
    SYSTEM = "system"
    RESULTS = "results"
