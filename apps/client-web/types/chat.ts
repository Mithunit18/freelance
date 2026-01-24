export type Creator = {
  id: string;
  name: string;
  type?: string;
  location?: string;
  budget_range?: string;
  rating?: number;
  styles?: string[];
  deliverables?: string[];
  equipment?: string[];
  editor_specialization?: string;
  work_mode?: string;
  content_types?: string[];
  match_score?: number;
  match_reasons?: string[];
  available?: boolean;
};

export type Message = {
  id: string;
  type: "user" | "bot" | "system";
  content: string;
  timestamp: Date;
  creators?: Creator[];
  isError?: boolean;
};

export type SessionStatus = "active" | "closed" | "expired" | "completed";

export type Stage = "landing" | "chat";

export interface CreateSessionResponse {
  session_id: string;
  message: string;
  greeting?: string;
}

export interface ChatMessageResponse {
  message: string;
  agent_response?: string;
  session_status: string;
}
