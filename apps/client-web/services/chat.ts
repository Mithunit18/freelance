import api from "@/utils/axiosInstance";
import type { CreateSessionResponse, ChatMessageResponse } from "@/types/chat";

const API_PREFIX = "/api/v1";

export const createSession = async (): Promise<CreateSessionResponse> => {
  const response = await api.post<CreateSessionResponse>(`${API_PREFIX}/session/create`);
  return response.data;
};

export const sendChatMessage = async (
  sessionId: string,
  message: string
): Promise<ChatMessageResponse> => {
  const response = await api.post<ChatMessageResponse>(
    `${API_PREFIX}/session/${sessionId}/chat`,
    { message }
  );
  return response.data;
};

export const getSessionInfo = async (sessionId: string) => {
  const response = await api.get(`${API_PREFIX}/session/${sessionId}`);
  return response.data;
};

export const deleteSession = async (sessionId: string) => {
  const response = await api.delete(`${API_PREFIX}/session/${sessionId}`);
  return response.data;
};
