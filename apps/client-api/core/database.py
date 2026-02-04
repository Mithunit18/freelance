"""
Database loading utilities.
"""

import json
from pathlib import Path


def load_database(database_path: str = "data/dev/database.json"):
    """Load database with error handling."""
    try:
        # Try multiple path resolutions
        paths_to_try = [
            Path(database_path),  # Relative to current working directory
            Path(__file__).parent.parent.parent / database_path,  # Relative to core/ -> client-api/
            Path(__file__).parent.parent.parent.parent / database_path,  # Relative to core/ -> client-api/ -> vision-match-v5/
        ]
        
        db_path = None
        for p in paths_to_try:
            if p.exists():
                db_path = p
                break
        
        if db_path is None:
            print(f"⚠️  Database file not found at {database_path}. Tried: {[str(p) for p in paths_to_try]}")
            return {"videographers": [], "photographers": [], "editors": []}

        with open(db_path, 'r') as f:
            data = json.load(f)
            print(f"✓ Database loaded from: {db_path}")
            return data
    except json.JSONDecodeError:
        print("⚠️  Invalid JSON in database. Using empty database.")
        return {"videographers": [], "photographers": [], "editors": []}
    except Exception as e:
        print(f"⚠️  Error loading database: {str(e)}. Using empty database.")
        return {"videographers": [], "photographers": [], "editors": []}


# Load database on module import
DATABASE = load_database()
