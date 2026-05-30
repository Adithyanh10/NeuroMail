import { apiClient, saveToken } from "./apiClient";
import type {
  AnalyticsResponse, AuthResponse, EmailHistoryItem, FeedbackPayload, FeedbackResponse,
  GenerateReplyPayload, GenerateReplyResponse, GrammarCorrectionResponse,
  HistoryResponse, LoginPayload, RegisterPayload, RegisterResponse, WritingStyleProfile,
} from "@/types";

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const { data } = await apiClient.post<RegisterResponse>("/api/v1/register", payload);
  return data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/api/v1/login", {
    identifier: payload.identifier,
    password: payload.password,
  });
  saveToken(data.access_token, data.expires_in);
  return data;
}

export async function generateReply(payload: GenerateReplyPayload): Promise<GenerateReplyResponse> {
  const { data } = await apiClient.post<GenerateReplyResponse>("/api/v1/generate-reply", payload);
  return data;
}

export async function getHistory(
  page = 1,
  pageSize = 20,
  filters?: { category?: string; priority?: string; tone?: string; intent?: string; emotion?: string }
): Promise<HistoryResponse> {
  const { data } = await apiClient.get<HistoryResponse>("/api/v1/history", {
    params: { page, page_size: pageSize, ...filters },
  });
  return data;
}

export async function getHistoryItem(id: string): Promise<EmailHistoryItem> {
  const { data } = await apiClient.get<EmailHistoryItem>(`/api/v1/history/${id}`);
  return data;
}

export async function getAnalytics(): Promise<AnalyticsResponse> {
  const { data } = await apiClient.get<AnalyticsResponse>("/api/v1/analytics");
  return data;
}

export async function correctGrammar(text: string): Promise<GrammarCorrectionResponse> {
  const { data } = await apiClient.post<GrammarCorrectionResponse>("/api/v1/correct-grammar", { text });
  return data;
}

export async function summarizeEmail(text: string): Promise<Record<string, unknown>> {
  const { data } = await apiClient.post("/api/v1/summarize", { text });
  return data;
}

export async function submitFeedback(payload: FeedbackPayload): Promise<FeedbackResponse> {
  const { data } = await apiClient.post<FeedbackResponse>("/api/v1/feedback", payload);
  return data;
}

export async function getWritingStyle(): Promise<WritingStyleProfile> {
  const { data } = await apiClient.get<WritingStyleProfile>("/api/v1/writing-style");
  return data;
}

export async function uploadEmail(file: File): Promise<{ s3_key: string; url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post("/api/v1/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
