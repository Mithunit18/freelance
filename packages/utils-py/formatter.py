from datetime import datetime
from typing import Optional

def format_date(date: datetime, format: str = "%Y-%m-%d") -> str:
    """Format a datetime object to string"""
    return date.strftime(format)

def format_currency(amount: float, currency: str = "USD") -> str:
    """Format amount as currency"""
    symbols = {"USD": "$", "EUR": "€", "GBP": "£"}
    symbol = symbols.get(currency, currency)
    return f"{symbol}{amount:,.2f}"

def truncate_text(text: str, max_length: int) -> str:
    """Truncate text to max length"""
    if len(text) <= max_length:
        return text
    return text[:max_length] + "..."