"""
LangChain tools for creator recommendation system.
Session-specific tools that operate on requirements and state.
"""

from typing import Dict
from datetime import datetime
import json
from langchain_core.tools import tool

from core.database import DATABASE
from models.enums import SessionStatus


def create_session_tools(session_requirements: Dict, session_state: Dict):
    """Create tools that operate on a specific session's requirements and state."""

    @tool
    def set_creator_type(creator_type: str) -> str:
        """Update the type of creator the user wants to hire.

        Args:
            creator_type: Must be one of: 'videographer', 'photographer', 'editor'
        """
        valid_types = ['videographer', 'photographer', 'editor']
        creator_type = creator_type.lower().strip()

        if creator_type not in valid_types:
            return f"❌ Invalid creator type. Must be one of: {', '.join(valid_types)}"

        session_requirements["creator_type"] = creator_type
        session_state["last_update"] = datetime.now().isoformat()
        return f"✓ Creator type set to: {creator_type}"

    @tool
    def set_location(city: str, state: str = None, country: str = "India") -> str:
        """Update the location for the event or work.

        Args:
            city: City name (required)
            state: State name (optional)
            country: Country name (default: India)
        """
        if not city or not city.strip():
            return "❌ City name cannot be empty"

        session_requirements["location"]["city"] = city.strip()
        if state:
            session_requirements["location"]["state"] = state.strip()
        if country:
            session_requirements["location"]["country"] = country.strip()

        location_str = city
        if state:
            location_str += f", {state}"

        session_state["last_update"] = datetime.now().isoformat()
        return f"✓ Location set to: {location_str}"

    @tool
    def set_event_type(event_type: str) -> str:
        """Update the type of event.

        Args:
            event_type: Type of event (e.g., 'Wedding', 'Corporate Event', 'Product Launch', 'Birthday Party')
        """
        if not event_type or not event_type.strip():
            return "❌ Event type cannot be empty"

        session_requirements["event"]["type"] = event_type.strip()
        session_state["last_update"] = datetime.now().isoformat()
        return f"✓ Event type set to: {event_type}"

    @tool
    def set_event_date(date: str) -> str:
        """Update the event date.

        Args:
            date: Event date in YYYY-MM-DD format or natural format like 'March 15, 2025'
        """
        if not date or not date.strip():
            return "❌ Date cannot be empty"

        session_requirements["event"]["date"] = date.strip()
        session_state["last_update"] = datetime.now().isoformat()
        return f"✓ Event date set to: {date}"

    @tool
    def set_event_duration(duration_hours: int) -> str:
        """Update the event duration in hours.

        Args:
            duration_hours: Expected duration in hours (e.g., 4, 6, 8)
        """
        if duration_hours <= 0:
            return "❌ Duration must be positive"

        session_requirements["event"]["duration_hours"] = duration_hours
        session_state["last_update"] = datetime.now().isoformat()
        return f"✓ Event duration set to: {duration_hours} hours"

    @tool
    def set_style_preference(style: str) -> str:
        """Update the style preference.

        Args:
            style: Style preference (e.g., 'Cinematic', 'Candid', 'Documentary', 'Traditional', 'Corporate', 'Minimal')
        """
        if not style or not style.strip():
            return "❌ Style cannot be empty"

        session_requirements["deliverables"]["style_preference"] = style.strip()
        session_state["last_update"] = datetime.now().isoformat()
        return f"✓ Style preference set to: {style}"

    @tool
    def set_deliverables_list(outputs: str) -> str:
        """Update the list of required outputs/deliverables.

        Args:
            outputs: Comma-separated list of required outputs (e.g., "Edited video, Raw footage, Instagram reels")
        """
        if not outputs or not outputs.strip():
            return "❌ Deliverables cannot be empty"

        deliverables_list = [o.strip() for o in outputs.split(',') if o.strip()]
        if not deliverables_list:
            return "❌ Please provide at least one deliverable"

        session_requirements["deliverables"]["outputs"] = deliverables_list
        session_state["last_update"] = datetime.now().isoformat()
        return f"✓ Deliverables set to: {', '.join(deliverables_list)}"

    @tool
    def set_budget(min_budget: int, max_budget: int) -> str:
        """Update the budget range.

        Args:
            min_budget: Minimum budget in INR (e.g., 25000, 30000)
            max_budget: Maximum budget in INR (e.g., 40000, 50000)
        """
        if min_budget <= 0 or max_budget <= 0:
            return "❌ Budget values must be positive"

        if min_budget >= max_budget:
            return "❌ Maximum budget must be greater than minimum budget"

        session_requirements["budget"]["min"] = min_budget
        session_requirements["budget"]["max"] = max_budget
        session_state["last_update"] = datetime.now().isoformat()
        return f"✓ Budget set to: ₹{min_budget:,} - ₹{max_budget:,}"

    @tool
    def set_editor_specialization(specialization: str) -> str:
        """Update editor specialization (only for editors).

        Args:
            specialization: Type of editor ('video_editor', 'graphic_designer', 'motion_designer')
        """
        valid_specs = ['video_editor', 'graphic_designer', 'motion_designer']
        specialization = specialization.lower().strip()

        if specialization not in valid_specs:
            return f"❌ Invalid specialization. Must be one of: {', '.join(valid_specs)}"

        session_requirements["editor_specialization"] = specialization
        session_state["last_update"] = datetime.now().isoformat()
        return f"✓ Editor specialization set to: {specialization.replace('_', ' ').title()}"

    @tool
    def set_work_mode(work_mode: str) -> str:
        """Update work mode preference (only for editors).

        Args:
            work_mode: Work mode ('remote', 'onsite', 'hybrid')
        """
        valid_modes = ['remote', 'onsite', 'hybrid']
        work_mode = work_mode.lower().strip()

        if work_mode not in valid_modes:
            return f"❌ Invalid work mode. Must be one of: {', '.join(valid_modes)}"

        session_requirements["work_mode"] = work_mode
        session_state["last_update"] = datetime.now().isoformat()
        return f"✓ Work mode set to: {work_mode.title()}"

    @tool
    def set_content_type(content_type: str) -> str:
        """Update content type for editors.

        Args:
            content_type: Type of content (e.g., "YouTube videos", "Instagram reels", "Corporate videos")
        """
        if not content_type or not content_type.strip():
            return "❌ Content type cannot be empty"

        session_requirements["project"]["content_type"] = content_type.strip()
        session_state["last_update"] = datetime.now().isoformat()
        return f"✓ Content type set to: {content_type}"

    @tool
    def set_deadline(deadline: str) -> str:
        """Update project deadline for editors.

        Args:
            deadline: Delivery deadline in YYYY-MM-DD format or natural format
        """
        if not deadline or not deadline.strip():
            return "❌ Deadline cannot be empty"

        session_requirements["project"]["delivery_deadline"] = deadline.strip()
        session_state["last_update"] = datetime.now().isoformat()
        return f"✓ Deadline set to: {deadline}"

    @tool
    def check_missing_requirements() -> str:
        """Check which required fields are still missing and return what needs to be asked next."""
        missing = []

        creator_type = session_requirements.get("creator_type")

        # Common required fields
        if not creator_type:
            return "Missing: creator_type - Ask user what type of creator they need (videographer/photographer/editor)"

        if not session_requirements["budget"]["min"] or not session_requirements["budget"]["max"]:
            missing.append("budget")

        # Creator-specific requirements
        if creator_type in ["videographer", "photographer"]:
            if not session_requirements["location"]["city"]:
                missing.append("location")
            if not session_requirements["event"]["type"]:
                missing.append("event_type")
            if not session_requirements["event"]["date"]:
                missing.append("event_date")
            if not session_requirements["deliverables"]["outputs"]:
                missing.append("deliverables")
            if not session_requirements["deliverables"]["style_preference"]:
                missing.append("style_preference")

        elif creator_type == "editor":
            if not session_requirements["editor_specialization"]:
                missing.append("editor_specialization")
            if not session_requirements["work_mode"]:
                missing.append("work_mode")
            if not session_requirements["project"]["content_type"]:
                missing.append("content_type")
            if not session_requirements["project"]["delivery_deadline"]:
                missing.append("deadline")

        if missing:
            return f"Still missing: {', '.join(missing)}"

        return "All required fields collected! Ready to find matches."

    @tool
    def find_matching_creators(top_n: int = 5) -> str:
        """Find and rank the top N matching creators based on collected requirements.
        Only call this when all required fields are collected.

        Args:
            top_n: Number of top matches to return (default: 5)
        """
        # CRITICAL SECURITY: Validate ALL requirements before returning any creator data
        creator_type = session_requirements.get("creator_type")

        if not creator_type:
            return "❌ Error: Creator type not set. Cannot search for creators."

        # STRICT VALIDATION: Check ALL required fields based on creator type
        missing_fields = []

        # Common required fields
        if not session_requirements["budget"].get("min") or not session_requirements["budget"].get("max"):
            missing_fields.append("budget")

        # Creator-specific requirements validation
        if creator_type in ["videographer", "photographer"]:
            if not session_requirements["location"].get("city"):
                missing_fields.append("location")
            if not session_requirements["event"].get("type"):
                missing_fields.append("event_type")
            if not session_requirements["event"].get("date"):
                missing_fields.append("event_date")
            if not session_requirements["deliverables"].get("outputs"):
                missing_fields.append("deliverables")
            if not session_requirements["deliverables"].get("style_preference"):
                missing_fields.append("style_preference")

        elif creator_type == "editor":
            if not session_requirements.get("editor_specialization"):
                missing_fields.append("editor_specialization")
            if not session_requirements.get("work_mode"):
                missing_fields.append("work_mode")
            if not session_requirements["project"].get("content_type"):
                missing_fields.append("content_type")
            if not session_requirements["project"].get("delivery_deadline"):
                missing_fields.append("deadline")

        # ENFORCE: If ANY field is missing, refuse to return creator data
        if missing_fields:
            return f"❌ Cannot show creators yet. Missing required information: {', '.join(missing_fields)}. Please provide all details first."

        # Get the appropriate creator list
        if creator_type == "videographer":
            creators = DATABASE.get("videographers", [])
            plural = "Videographers"
        elif creator_type == "photographer":
            creators = DATABASE.get("photographers", [])
            plural = "Photographers"
        elif creator_type == "editor":
            creators = DATABASE.get("editors", [])
            plural = "Editors"
        else:
            return "❌ Error: Invalid creator type"

        if not creators:
            return f"❌ No {plural.lower()} found in database."

        # Score each creator
        scored_creators = []
        for creator in creators:
            if not creator.get("available"):
                continue

            score = 0
            reasons = []

            # Location match (if specified)
            user_city = session_requirements["location"].get("city")
            if user_city and creator.get("location"):
                if creator["location"].get("city", "").lower() == user_city.lower():
                    score += 30
                    reasons.append(f"Located in {user_city}")

            # Budget match - Handle None values properly
            user_min = session_requirements["budget"].get("min")
            user_max = session_requirements["budget"].get("max")
            creator_min = creator.get("budget_range", {}).get("min")
            creator_max = creator.get("budget_range", {}).get("max")

            # Only check budget overlap if both user and creator budgets are available
            if user_min is not None and user_max is not None and creator_min is not None and creator_max is not None:
                # Check budget overlap
                if creator_min <= user_max and creator_max >= user_min:
                    # Calculate overlap percentage
                    overlap_start = max(creator_min, user_min)
                    overlap_end = min(creator_max, user_max)
                    overlap_range = overlap_end - overlap_start
                    user_range = user_max - user_min
                    overlap_percent = (overlap_range / user_range) * 100 if user_range > 0 else 0

                    score += min(25, int(overlap_percent / 4))
                    reasons.append("Budget compatible")

            # Rating bonus
            rating = creator.get("rating", 0)
            score += rating * 5

            # Style/Deliverables match
            if creator_type in ["videographer", "photographer"]:
                user_style = session_requirements["deliverables"].get("style_preference", "").lower()
                creator_styles = [s.lower() for s in creator.get("styles", [])]

                if user_style and any(user_style in cs for cs in creator_styles):
                    score += 15
                    reasons.append(f"Matches {user_style} style")

                # Deliverables match
                user_deliverables = [d.lower() for d in session_requirements["deliverables"].get("outputs", [])]
                creator_deliverables = [d.lower() for d in creator.get("deliverables", [])]

                matches = sum(1 for ud in user_deliverables if any(ud in cd for cd in creator_deliverables))
                if matches > 0:
                    score += matches * 10
                    reasons.append(f"Provides {matches}/{len(user_deliverables)} deliverables")

            elif creator_type == "editor":
                # Specialization match
                user_spec = session_requirements.get("editor_specialization", "").lower()
                creator_spec = creator.get("editor_specialization", "").lower()

                if user_spec and user_spec == creator_spec:
                    score += 20
                    reasons.append(f"Specialization: {creator_spec.replace('_', ' ').title()}")

                # Work mode match
                user_mode = session_requirements.get("work_mode", "").lower()
                creator_mode = creator.get("work_mode", "").lower()

                if user_mode and user_mode == creator_mode:
                    score += 15
                    reasons.append(f"Work mode: {creator_mode.title()}")

            scored_creators.append({
                "creator": creator,
                "score": score,
                "reasons": reasons
            })

        # Sort by score and get top N
        scored_creators.sort(key=lambda x: x["score"], reverse=True)
        top_matches = scored_creators[:top_n]

        # Format results
        if not top_matches:
            return "❌ No matching creators found. Please adjust your requirements."

        # Store results in session state
        session_state["last_results"] = top_matches
        session_state["results_shown"] = True
        session_state["results_timestamp"] = datetime.now().isoformat()

        # Create JSON structure for frontend
        results_json = []
        for item in top_matches:
            creator = item["creator"].copy()
            creator["match_score"] = round(item["score"], 1)
            creator["match_reasons"] = item["reasons"]
            results_json.append(creator)

        # Return ONLY the JSON with markers - LLM will add its own message
        # The frontend parses these markers to render beautiful cards
        result = f"Found {len(top_matches)} matching {plural.lower()}!\n\n"
        result += f"<<<CREATORS_JSON_START>>>\n"
        result += json.dumps(results_json, indent=2)
        result += f"\n<<<CREATORS_JSON_END>>>\n"
        result += "\nInclude the JSON block above in your response exactly as shown. Ask user if they want to refine."

        return result

    @tool
    def close_session(reason: str) -> str:
        """Close the current session with a reason.
        Use this when: user is satisfied, conversation is off-topic, or task is complete.

        Args:
            reason: Reason for closing (e.g., "user_satisfied", "off_topic", "completed", "user_requested")
        """
        session_state["status"] = SessionStatus.CLOSED
        session_state["close_reason"] = reason
        session_state["closed_at"] = datetime.now().isoformat()

        messages = {
            "user_satisfied": "Great! I'm glad I could help you find the perfect creator. Feel free to start a new session anytime! 👋",
            "off_topic": "I notice we've moved away from finding creators. If you need help with creator recommendations, please start a new session. 👋",
            "completed": "Your creator search is complete! If you need anything else, feel free to start a new session. 👋",
            "user_requested": "Session closed as requested. Thank you for using our service! 👋"
        }

        return f"🔒 SESSION CLOSED: {messages.get(reason, 'Session has been closed. Thank you!')}"

    @tool
    def refine_requirements(field: str, new_value: str) -> str:
        """Refine/update existing requirements after seeing results.
        Use this when user wants to modify their search criteria.

        Args:
            field: Field to update (e.g., 'budget', 'location', 'style', etc.)
            new_value: New value for the field
        """
        field = field.lower().strip()

        refinement_map = {
            'budget': 'Use set_budget tool',
            'location': 'Use set_location tool',
            'city': 'Use set_location tool',
            'style': 'Use set_style_preference tool',
            'deliverables': 'Use set_deliverables_list tool',
            'event_type': 'Use set_event_type tool',
            'date': 'Use set_event_date tool',
            'specialization': 'Use set_editor_specialization tool',
            'work_mode': 'Use set_work_mode tool',
            'content_type': 'Use set_content_type tool',
            'deadline': 'Use set_deadline tool'
        }

        if field in refinement_map:
            return f"✓ Ready to refine {field}. {refinement_map[field]} with the new value."

        return f"❌ Unknown field '{field}'. Available fields: {', '.join(refinement_map.keys())}"

    return [
        set_creator_type,
        set_location,
        set_event_type,
        set_event_date,
        set_event_duration,
        set_style_preference,
        set_deliverables_list,
        set_budget,
        set_editor_specialization,
        set_work_mode,
        set_content_type,
        set_deadline,
        check_missing_requirements,
        find_matching_creators,
        close_session,
        refine_requirements
    ]
