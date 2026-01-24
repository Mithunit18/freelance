"""
Database loading utilities.
"""

import json
from pathlib import Path


def load_database(database_path: str = "data/dev/database.json"):
    """Load database with error handling."""
    try:
        # Try relative to creator_app folder first
        db_path = Path(__file__).parent.parent.parent / database_path
        if not db_path.exists():
            # Try relative to project root
            db_path = Path(__file__).parent.parent.parent.parent / database_path

        with open(db_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"⚠️  Database file not found at {database_path}. Using empty database.")
        return {"videographers": [], "photographers": [], "editors": []}
    except json.JSONDecodeError:
        print("⚠️  Invalid JSON in database. Using empty database.")
        return {"videographers": [], "photographers": [], "editors": []}


# Load database on module import
DATABASE = load_database()
