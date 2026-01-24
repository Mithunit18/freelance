"""
Session management service for the Creator Recommendation API.
Handles session lifecycle, conversation history, and memory management.
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
import uuid

from langchain_groq.chat_models import ChatGroq
from langgraph.prebuilt import create_react_agent

from creator_app.models.enums import SessionStatus
from creator_app.tools.creator_tools import create_session_tools
from creator_app.core.config import settings


class SessionManager:
    """Enhanced session manager with robust error handling and memory management."""

    def __init__(self, session_timeout_minutes: int = 30, max_conversation_length: int = 100):
        self.sessions: Dict[str, Dict] = {}
        self.session_timeout = timedelta(minutes=session_timeout_minutes)
        self.max_conversation_length = max_conversation_length

    def _create_empty_requirements(self) -> Dict:
        """Create empty requirements structure."""
        return {
            "creator_type": None,
            "location": {"city": None, "state": None, "country": None},
            "event": {"date": None, "duration_hours": None, "type": None},
            "deliverables": {"outputs": [], "style_preference": None, "special_requests": []},
            "equipment_requirements": [],
            "budget": {"min": None, "max": None},
            "editor_specialization": None,
            "work_mode": None,
            "project": {
                "content_type": None,
                "source_material_provided": None,
                "delivery_deadline": None,
                "expected_revisions": None
            }
        }

    def _create_session_state(self) -> Dict:
        """Create session state tracking."""
        return {
            "status": SessionStatus.ACTIVE,
            "last_update": datetime.now().isoformat(),
            "results_shown": False,
            "results_timestamp": None,
            "last_results": None,
            "close_reason": None,
            "closed_at": None,
            "irrelevant_message_count": 0
        }

    def _get_system_prompt(self) -> str:
        """Return the system prompt for the agent."""
        return """
You are an expert Creator Recommendation Assistant helping clients find videographers, photographers, or editors.

YOUR INTELLIGENCE & CAPABILITIES:
1. **Information Extraction**: Extract ALL relevant information from EVERY user message immediately
2. **Requirement Tracking**: Always know what's missing and what's next
3. **Session Management**: Detect when to close sessions intelligently
4. **Refinement Support**: Help users improve their search after seeing results
5. **Context Awareness**: Understand conversation flow and user intent

YOUR PROCESS:
1. At the START of EVERY response, call check_missing_requirements to assess status
2. Extract ANY information from user's message and update immediately using appropriate tools
3. After updating, call check_missing_requirements again to see what's still needed
4. Ask for the next missing field naturally and conversationally
5. When all fields collected, call find_matching_creators(5) to show TOP 5 matches
6. After showing results, ask if user wants to refine or if they're satisfied

REQUIRED INFORMATION:

For VIDEOGRAPHERS & PHOTOGRAPHERS:
- creator_type → set_creator_type("videographer" or "photographer")
- location city → set_location(city, state)
- event_type → set_event_type(type)
- event_date → set_event_date(date)
- style_preference → set_style_preference(style)
- deliverables → set_deliverables_list("item1, item2, item3")
- budget → set_budget(min, max)

For EDITORS:
- creator_type → set_creator_type("editor")
- editor_specialization → set_editor_specialization(spec)
- work_mode → set_work_mode(mode)
- content_type → set_content_type(type)
- deadline → set_deadline(date)
- budget → set_budget(min, max)

EXTRACTION EXAMPLES:
- "photographer in Chennai" → set_creator_type("photographer") + set_location("Chennai")
- "wedding on March 15" → set_event_type("wedding") + set_event_date("2025-03-15")
- "budget 30k to 45k" or "30000-45000" → set_budget(30000, 45000)
- "cinematic style" → set_style_preference("cinematic")
- "edited video and raw footage" → set_deliverables_list("edited video, raw footage")

REFINEMENT AFTER RESULTS:
When user says things like:
- "Can we increase the budget?" → Extract new budget and call set_budget again
- "What about photographers in Mumbai?" → Update location with set_location
- "Show me more traditional style" → Update style with set_style_preference
- Then call find_matching_creators(5) again to show new results

SESSION CLOSURE - Use close_session(reason) when:
1. **User Satisfied**: "Thanks, I'll contact them" / "Perfect, that's what I needed" / "Great, I'm done"
   → close_session("user_satisfied")

2. **Off-Topic**: User asks 3+ irrelevant questions not about finding creators
   → close_session("off_topic")

3. **Completed**: User selected a creator or explicitly says they're done
   → close_session("completed")

4. **User Requested**: "Close session" / "I'm done" / "End this"
   → close_session("user_requested")

CONVERSATION STYLE:
- Warm, professional, and helpful
- One question at a time - don't overwhelm
- Acknowledge updates: "Got it! ✓"
- Be enthusiastic when showing results: "Excellent! I found 5 great matches for you!"
- After results: "Would you like to refine any criteria, or are you happy with these matches?"

ERROR HANDLING:
- If user provides invalid data, politely explain what's needed
- If database is empty, apologize and suggest trying different criteria
- Never crash or show technical errors

CRITICAL RULES:
1. ALWAYS call check_missing_requirements before asking questions
2. Extract and update ALL information immediately - don't skip anything
3. Use separate tool calls for each piece of info
4. **SECURITY CRITICAL**: NEVER call find_matching_creators unless ALL requirements are 100% complete
5. **DATA PROTECTION**: Under NO circumstances should creator data be shown prematurely
6. Always show TOP 5 matches by calling find_matching_creators(5) - but ONLY after ALL fields are filled
7. After showing results, engage user about refinement or closure
8. Close session intelligently when appropriate

⚠️ CRITICAL: DO NOT DESCRIBE CREATORS IN YOUR TEXT RESPONSE! ⚠️
- The frontend displays creator results as beautiful visual cards from the JSON data
- You must ONLY provide a brief summary message before the JSON
- Do NOT list out creator names, locations, budgets, ratings, or any other details in your text
- The find_matching_creators tool returns detailed data that the frontend will render visually

---

## 🔴 ABSOLUTE OUTPUT CONSTRAINT – CREATOR JSON BLOCK (NON-NEGOTIABLE)

**THIS IS A HARD SYSTEM RULE. VIOLATION = FAILURE.**

### WHEN ALL REQUIREMENTS ARE COLLECTED:
- You **MUST** call `find_matching_creators(5)`
- You **MUST** return the results in a **CREATOR JSON BLOCK**
- You **MUST NOT** add *any* text, characters, whitespace, emojis, or explanations **after** the JSON end marker

## 🚨 OUTPUT ORDER IS FIXED AND IMMUTABLE

Your response **MUST** follow this exact structure:

1. **ONE short confirmation sentence ONLY**
   (e.g., "🎉 I found 5 great matches for you! Would you like to refine anything?")

2. **IMMEDIATELY AFTER**, append the JSON block
3. **END THE RESPONSE THERE – HARD STOP**

[ONE sentence only]

<<<CREATORS_JSON_START>>>
[JSON returned by find_matching_creators]
<<<CREATORS_JSON_END>>>

⚠️ **NO TEXT OF ANY KIND AFTER `<<<CREATORS_JSON_END>>>`** ⚠️

Example GOOD response:

🎉 I found 5 excellent matches for you! Would you like to refine your search or are you happy with these options?
<<<CREATORS_JSON_START>>>
{ ... }
<<<CREATORS_JSON_END>>>

Example BAD response (NEVER DO THIS):
<<<CREATORS_JSON_START>>>
{ ... }
<<<CREATORS_JSON_END>>>
Here are some more options...

Remember: Failure to strictly follow this format breaks the frontend and is considered a critical system error.
"""

    def create_session(self) -> str:
        """Create a new session with enhanced initialization."""
        session_id = str(uuid.uuid4())

        try:
            # Create requirements and state for this session
            session_requirements = self._create_empty_requirements()
            session_state = self._create_session_state()

            # Create session-specific tools
            tools = create_session_tools(session_requirements, session_state)

            # Create agent for this session
            chat_model = ChatGroq(
                model=settings.GROQ_MODEL,
                api_key=settings.GROQ_API_KEY,
                temperature=0.3
            )

            agent = create_react_agent(
                model=chat_model,
                tools=tools,
                prompt=self._get_system_prompt()
            )

            # Initialize session
            self.sessions[session_id] = {
                "agent": agent,
                "conversation_history": [],
                "requirements": session_requirements,
                "state": session_state,
                "last_activity": datetime.now(),
                "created_at": datetime.now(),
                "message_count": 0
            }

            # Initialize with greeting
            initial_response = agent.invoke({
                "messages": [{"role": "user", "content": "Hi, I need help finding a creator."}]
            })

            self.sessions[session_id]["conversation_history"] = initial_response["messages"]
            self.sessions[session_id]["message_count"] = 1

            return session_id

        except Exception as e:
            print(f"❌ Error creating session: {str(e)}")
            raise

    def get_session(self, session_id: str) -> Optional[Dict]:
        """Get session by ID with validation."""
        session = self.sessions.get(session_id)
        if session:
            # Check if session is expired
            if datetime.now() - session["last_activity"] > self.session_timeout:
                session["state"]["status"] = SessionStatus.EXPIRED
                return session

            # Update last activity
            session["last_activity"] = datetime.now()
        return session

    def update_session(self, session_id: str, response_messages: List, user_message: str):
        """Update session with new messages and memory management."""
        session = self.sessions.get(session_id)
        if not session:
            return

        # Update conversation history
        session["conversation_history"] = response_messages
        session["message_count"] += 1
        session["last_activity"] = datetime.now()

        # Memory management: trim old messages if too long
        if len(session["conversation_history"]) > self.max_conversation_length:
            # Keep system message, recent messages, and important context
            system_msgs = [m for m in session["conversation_history"] if m.get("role") == "system"]
            recent_msgs = session["conversation_history"][-50:]  # Keep last 50 messages
            session["conversation_history"] = system_msgs + recent_msgs

    def delete_session(self, session_id: str) -> bool:
        """Delete a session."""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False

    def cleanup_expired_sessions(self):
        """Remove expired sessions."""
        current_time = datetime.now()
        expired = [
            sid for sid, session in self.sessions.items()
            if current_time - session["last_activity"] > self.session_timeout
        ]
        for sid in expired:
            self.sessions[sid]["state"]["status"] = SessionStatus.EXPIRED
            del self.sessions[sid]
        return len(expired)

    def get_active_sessions_count(self) -> int:
        """Get count of active sessions."""
        return len([s for s in self.sessions.values() if s["state"]["status"] == SessionStatus.ACTIVE])

    def get_session_stats(self) -> Dict:
        """Get detailed session statistics."""
        total = len(self.sessions)
        active = sum(1 for s in self.sessions.values() if s["state"]["status"] == SessionStatus.ACTIVE)
        closed = sum(1 for s in self.sessions.values() if s["state"]["status"] == SessionStatus.CLOSED)
        completed = sum(1 for s in self.sessions.values() if s["state"]["status"] == SessionStatus.COMPLETED)

        return {
            "total_sessions": total,
            "active_sessions": active,
            "closed_sessions": closed,
            "completed_sessions": completed
        }


# Create a singleton instance
session_manager = SessionManager(
    session_timeout_minutes=settings.SESSION_TIMEOUT_MINUTES,
    max_conversation_length=100
)
