import api from "@/utils/axiosInstance";
import type { CreateSessionResponse, ChatMessageResponse, ChatError } from "@/types/chat";

const API_PREFIX = "/api/v1";

// Error handler utility
const handleApiError = (error: any, context: string): ChatError => {
  console.error(`[${context}] Error:`, error);
  console.error(`[${context}] Response Status:`, error.response?.status);
  console.error(`[${context}] Code:`, error.code);

  // Handle timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      code: "SERVER_ERROR",
      message: "Request timeout. The server is taking too long to respond. Please try again.",
      recoverable: true,
    };
  }

  if (error.response?.status === 401 || error.response?.status === 403) {
    return {
      code: "SESSION_EXPIRED",
      message: "Your session has expired. Please start over.",
      recoverable: false,
    };
  }

  if (error.response?.status === 404) {
    return {
      code: "SERVER_ERROR",
      message: "Endpoint not found. Server may not be running.",
      recoverable: false,
    };
  }

  if (error.response?.status === 400) {
    return {
      code: "INVALID_INPUT",
      message: error.response?.data?.message || "Invalid message format.",
      recoverable: true,
    };
  }

  if (error.response?.status === 429) {
    return {
      code: "RATE_LIMITED",
      message: "Too many requests. Please wait a moment before sending another message.",
      recoverable: true,
    };
  }

  if (error.response?.status >= 500) {
    return {
      code: "SERVER_ERROR",
      message: "Server error. Please try again later.",
      recoverable: true,
    };
  }

  return {
    code: "SERVER_ERROR",
    message: error.message || "An unexpected error occurred.",
    recoverable: true,
  };
};

export const createSession = async (): Promise<CreateSessionResponse> => {
  try {
    const response = await api.post<CreateSessionResponse>(
      `${API_PREFIX}/session/create`
    );
    
    if (!response.data.session_id) {
      throw new Error("No session ID returned from server");
    }
    
    return response.data;
  } catch (error) {
    const chatError = handleApiError(error, "createSession");
    throw chatError;
  }
};

export const sendChatMessage = async (
  sessionId: string,
  message: string
): Promise<ChatMessageResponse> => {
  try {
    // Validate input
    if (!sessionId || !sessionId.trim()) {
      throw {
        code: "INVALID_INPUT",
        message: "Session ID is missing.",
        recoverable: false,
      };
    }

    if (!message || !message.trim()) {
      throw {
        code: "INVALID_INPUT",
        message: "Message cannot be empty.",
        recoverable: true,
      };
    }

    const response = await api.post<ChatMessageResponse>(
      `${API_PREFIX}/session/${sessionId}/chat`,
      { message: message.trim() }
    );

    const data = response.data;

    // Check session status
    if (data.session_status === "closed" || data.session_status === "expired") {
      throw {
        code: "SESSION_EXPIRED",
        message: "Session has ended. Please start a new conversation.",
        recoverable: false,
      };
    }

    // Normalize response - backend returns agent_response, frontend expects message
    if (data.agent_response) {
      data.message = data.agent_response;
    }
    return data;
  } catch (error: any) {
    // If error is already a ChatError type, re-throw it
    if (error.code && error.message && error.hasOwnProperty("recoverable")) {
      throw error;
    }
    
    const chatError = handleApiError(error, "sendChatMessage");
    throw chatError;
  }
};

export const getSessionInfo = async (sessionId: string) => {
  try {
    if (!sessionId || !sessionId.trim()) {
      throw {
        code: "INVALID_INPUT",
        message: "Session ID is required.",
        recoverable: false,
      };
    }

    const response = await api.get(`${API_PREFIX}/session/${sessionId}`);
    return response.data;
  } catch (error) {
    const chatError = handleApiError(error, "getSessionInfo");
    throw chatError;
  }
};

export const deleteSession = async (sessionId: string) => {
  try {
    if (!sessionId || !sessionId.trim()) {
      console.warn("Cannot delete session: invalid session ID");
      return null;
    }

    const response = await api.delete(`${API_PREFIX}/session/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete session:", error);
    // Don't throw - session deletion failure shouldn't block user actions
    return null;
  }
};
