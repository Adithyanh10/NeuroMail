// ─── Auth ────────────────────────────────────────────────────────────────────
export interface RegisterPayload { email: string; username: string; password: string; }
export interface LoginPayload { identifier: string; password: string; }
export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  username: string;
  email: string;
  user_id: string;
}
export interface RegisterResponse { id: string; email: string; username: string; message: string; }

// ─── Email Core ───────────────────────────────────────────────────────────────
export type Tone = "professional" | "formal" | "friendly";
export type Priority = "Low" | "Medium" | "High";
export type Sentiment = "positive" | "negative" | "neutral";
export type Emotion = "angry" | "urgent" | "happy" | "frustrated" | "neutral";
export type RiskLevel = "low" | "medium" | "high";
export type ReplyGrade = "A" | "B" | "C" | "D";

export interface ReplyScores {
  professionalism: number; clarity: number; confidence: number;
  politeness: number; grammar_quality: number;
}
export interface MultiReplies {
  short_reply: string; detailed_reply: string; persuasive_reply: string;
}
export interface ActionItem { task: string; priority: string; assignee: string; }

export interface GenerateReplyPayload {
  email_content: string; tone: Tone; subject?: string;
}

export interface GenerateReplyResponse {
  // Core
  reply: string; tone: Tone; confidence: number;
  predicted_category: string; predicted_priority: Priority;
  sentiment: Sentiment; is_urgent: boolean; model_version: string; history_id: string;
  // Feature 1 — Intent
  intent: string; intent_confidence: number;
  // Feature 2 — Emotion
  emotion: Emotion; emotion_intensity: number;
  // Feature 3 — Tone
  recommended_tone: string; tone_style: string;
  // Feature 5 — Scoring
  reply_scores: ReplyScores; reply_grade: ReplyGrade; ai_confidence_pct: number;
  // Feature 6 — Multi-Reply
  multi_replies: MultiReplies;
  // Feature 7 — Summary
  email_summary: string; key_points: string[]; action_items_summary: string[];
  deadlines: string[]; entities: string[];
  // Feature 11 — Signature
  signature: string;
  // Feature 12 — Spam
  is_suspicious: boolean; risk_level: RiskLevel; risk_score: number; spam_warnings: string[];
  // Feature 13 — Language
  detected_language: string; language_confidence: number;
  // Feature 14 — Meeting
  is_meeting_request: boolean; meeting_dates: string[];
  meeting_times: string[]; meeting_participants: string[];
  // Feature 15 — Tasks
  extracted_tasks: ActionItem[]; total_tasks: number;
}

export interface EmailHistoryItem {
  id: string; original_email: string; generated_reply: string; tone: string;
  subject: string | null; predicted_category: string | null; predicted_priority: string | null;
  sentiment: string | null; emotion: string | null; intent: string | null;
  reply_grade: string | null; ai_confidence_pct: number | null;
  is_urgent: boolean | null; is_suspicious: boolean | null; risk_level: string | null;
  detected_language: string | null; is_meeting_request: boolean | null;
  total_tasks: number | null; user_rating: number | null; s3_key: string | null; created_at: string;
}
export interface HistoryResponse { items: EmailHistoryItem[]; total: number; page: number; page_size: number; }

// ─── Analytics ───────────────────────────────────────────────────────────────
export interface CategoryStat { category: string; count: number; percentage: number; }
export interface AnalyticsResponse {
  total_replies: number; category_breakdown: CategoryStat[]; priority_breakdown: CategoryStat[];
  tone_breakdown: CategoryStat[]; intent_breakdown: CategoryStat[]; emotion_breakdown: CategoryStat[];
  avg_confidence: number; avg_reply_score: number; urgent_count: number;
  suspicious_count: number; meeting_requests_count: number; languages_detected: string[];
}

// ─── Feature 8 — Grammar ─────────────────────────────────────────────────────
export interface GrammarCorrectionResponse {
  corrected_text: string; corrections_count: number;
  corrections: Array<{from: string; to: string}>; formality_score: number; improvement_pct: number;
}

// ─── Feature 9 — Writing Style ────────────────────────────────────────────────
export interface WritingStyleProfile {
  user_id: string; preferred_tone: string; avg_reply_length: number;
  common_phrases: string[]; formality_level: number; total_replies_analyzed: number;
}

// ─── Feature 19 — Feedback ───────────────────────────────────────────────────
export interface FeedbackPayload { history_id: string; rating: number; comment?: string; }
export interface FeedbackResponse { message: string; history_id: string; rating: number; }

export interface ApiError { detail: string; }
