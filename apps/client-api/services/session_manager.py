"""
DEBUG VERSION: Session management service for the Creator Recommendation API.
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
import uuid
import json  # Added for debug logging

from langchain_groq.chat_models import ChatGroq
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage

from models.enums import SessionStatus
from tools.creator_tools import create_session_tools
from core.config import settings


class SessionManager:
    """Enhanced session manager with DEBUG logging."""

    def __init__(self, session_timeout_minutes: int = 30, max_conversation_length: int = 20):
        self.sessions: Dict[str, Dict] = {}
        self.session_timeout = timedelta(minutes=session_timeout_minutes)
        self.max_conversation_length = max_conversation_length

    def _create_empty_requirements(self) -> Dict:
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
        return """
You are an expert Creator Recommendation Assistant.

### 🎯 YOUR GOAL
Collect requirements one by one. Once you have (1) Creator Type, (2) Location, and (3) Budget, show the results.

### 🚫 ANTI-PARROT RULES (CRITICAL)
1. **NEVER repeat the user's answer back to them.**
   - ❌ User: "Photographer" -> AI: "Photographer" (WRONG)
   - ✅ User: "Photographer" -> AI: "Great! Which city are you looking in?" (CORRECT)

2. **ALWAYS end your turn with a QUESTION.**
   - After you successfully save data with a tool, your text response must ask for the *next* missing piece of information.

### 🛠️ INSTRUCTIONS
1. **Listen**: Read the user's input.
2. **Act**: IMMEDIATELY call the relevant tool to save the info (e.g., `set_creator_type`, `set_location`).
3. **Ask**: After the tool runs, ask for the NEXT missing item.

### 🏁 SHOWING RESULTS
ONLY when all items are collected, call `find_matching_creators(5)`.
Then, output the results in this EXACT format:

[One summary sentence]
<<<CREATORS_JSON_START>>>
[JSON data]
<<<CREATORS_JSON_END>>>
"""

    def create_session(self) -> str:
        session_id = str(uuid.uuid4())
        print(f"🛠️ [DEBUG] Creating session: {session_id}")

        try:
            session_requirements = self._create_empty_requirements()
            session_state = self._create_session_state()
            tools = create_session_tools(session_requirements, session_state)

            # Debug: Verify tools are loaded
            print(f"🛠️ [DEBUG] Tools loaded: {[t.name for t in tools]}")

            chat_model = ChatGroq(
                model=settings.GROQ_MODEL,
                api_key=settings.GROQ_API_KEY,
                temperature=0.2
            )

            agent = create_react_agent(
                model=chat_model,
                tools=tools,
                prompt=self._get_system_prompt()
            )

            self.sessions[session_id] = {
                "agent": agent,
                "conversation_history": [],
                "requirements": session_requirements,
                "state": session_state,
                "last_activity": datetime.now(),
                "created_at": datetime.now(),
                "message_count": 0
            }

            # Auto-init
            print(f"🛠️ [DEBUG] Auto-initializing session {session_id}...")
            initial_message = {
                "role": "user", 
                "content": "Start the session. Ask me: 'Hi! Are you looking for a videographer, photographer, or editor?'"
            }
            
            try:
                initial_response = agent.invoke({"messages": [initial_message]})
                self.sessions[session_id]["conversation_history"] = initial_response["messages"][1:] 
                self.sessions[session_id]["message_count"] = 1
                print(f"🛠️ [DEBUG] Auto-init success. Initial reply: {initial_response['messages'][-1].content}")
            except Exception as e:
                print(f"❌ [DEBUG] Auto-init FAILED: {str(e)}")
                self.sessions[session_id]["conversation_history"] = []

            return session_id

        except Exception as e:
            print(f"❌ [DEBUG] Error creating session: {str(e)}")
            raise

    def get_session(self, session_id: str) -> Optional[Dict]:
        session = self.sessions.get(session_id)
        if session:
            if datetime.now() - session["last_activity"] > self.session_timeout:
                session["state"]["status"] = SessionStatus.EXPIRED
                return session
            session["last_activity"] = datetime.now()
        return session

    def update_session(self, session_id: str, response_messages: List, user_message: str):
        """Update session with DEBUG logging."""
        session = self.sessions.get(session_id)
        if not session:
            print(f"❌ [DEBUG] Session {session_id} not found during update!")
            return

        print(f"\n--- 🔍 DEBUG SESSION UPDATE {session_id} ---")
        print(f"👤 User Message: {user_message}")
        print(f"🤖 Response Message Count: {len(response_messages)}")

        # Inspect the response messages to see if tool calls happened
        for i, msg in enumerate(response_messages):
            if isinstance(msg, AIMessage):
                print(f"   [Msg {i} - AI]: {msg.content}")
                if msg.tool_calls:
                    print(f"   >>> 🛠️ AI TRIED TO CALL TOOL: {msg.tool_calls}")
                else:
                    print(f"   >>> ⚠️ NO TOOL CALL DETECTED in this message.")
            
            elif isinstance(msg, ToolMessage):
                print(f"   [Msg {i} - TOOL OUTPUT]: {msg.content}")
            
            elif isinstance(msg, HumanMessage):
                print(f"   [Msg {i} - HUMAN]: {msg.content}")

        # Check if requirements actually updated
        print(f"📊 [DEBUG] Current Requirements State:")
        print(json.dumps(session["requirements"], indent=2))
        print("--------------------------------------------\n")

        session["conversation_history"] = response_messages
        session["message_count"] += 1
        session["last_activity"] = datetime.now()

        if len(session["conversation_history"]) > self.max_conversation_length:
            recent_msgs = session["conversation_history"][-self.max_conversation_length:]
            session["conversation_history"] = recent_msgs

    def delete_session(self, session_id: str) -> bool:
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False

    def cleanup_expired_sessions(self):
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
        return len([s for s in self.sessions.values() if s["state"]["status"] == SessionStatus.ACTIVE])

    def get_session_stats(self) -> Dict:
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
    max_conversation_length=20
)